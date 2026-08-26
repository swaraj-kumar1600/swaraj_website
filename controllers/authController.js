const bcrypt = require('bcryptjs');
const User = require('../models/user');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validationError = (req, res, message, form = {}) =>
  res.status(400).render('auth/signup', {
    pageTitle: 'Create Account',
    currentPage: 'signup',
    error: message,
    form,
  });

exports.getSignup = (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/signup', {
    pageTitle: 'Create Account',
    currentPage: 'signup',
    error: req.query.error,
    form: {},
  });
};

exports.postSignup = async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const confirmPassword = String(req.body.confirmPassword || '');

  if (name.length < 2 || name.length > 50) {
    return validationError(req, res, 'Name must be between 2 and 50 characters.', { name, email });
  }

  if (!emailRegex.test(email) || email.length > 120) {
    return validationError(req, res, 'Please enter a valid email address.', { name, email });
  }

  if (password.length < 8 || password.length > 72) {
    return validationError(req, res, 'Password must be 8–72 characters long.', { name, email });
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return validationError(
      req,
      res,
      'Password must contain an uppercase letter, lowercase letter, and number.',
      { name, email }
    );
  }

  if (password !== confirmPassword) {
    return validationError(req, res, 'Passwords do not match.', { name, email });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return validationError(req, res, 'An account with this email already exists.', { name, email });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Public signup can create users only. Admin accounts are created from
    // the ADMIN_EMAIL/ADMIN_PASSWORD environment variables at server startup.
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    res.redirect('/auth/login?created=1');
  } catch (error) {
    console.error('Signup error:', error);
    return validationError(req, res, 'Unable to create your account right now.', { name, email });
  }
};

exports.getLogin = (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', {
    pageTitle: 'Sign In',
    currentPage: 'login',
    error: req.query.error,
    created: req.query.created,
  });
};

exports.postLogin = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!emailRegex.test(email) || !password) {
    return res.status(400).render('auth/login', {
      pageTitle: 'Sign In',
      currentPage: 'login',
      error: 'Please enter a valid email and password.',
      created: null,
    });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render('auth/login', {
        pageTitle: 'Sign In',
        currentPage: 'login',
        error: 'Invalid email or password.',
        created: null,
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).render('auth/login', {
          pageTitle: 'Sign In',
          currentPage: 'login',
          error: 'Unable to sign you in right now.',
          created: null,
        });
      }

      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).render('auth/login', {
            pageTitle: 'Sign In',
            currentPage: 'login',
            error: 'Unable to sign you in right now.',
            created: null,
          });
        }

        res.redirect(user.role === 'admin' ? '/results' : '/results');
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('auth/login', {
      pageTitle: 'Sign In',
      currentPage: 'login',
      error: 'Unable to sign you in right now.',
      created: null,
    });
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
