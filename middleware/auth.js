exports.requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login?error=login');
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login?error=login');
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).render('portfolio/forbidden', {
      pageTitle: 'Access Denied',
      currentPage: 'results',
    });
  }

  next();
};
