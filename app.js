// Core Module
const path = require('path');

// External Module
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


// Local Module
const portfolioRouter = require('./routes/portfolioRouter');
const authRouter = require('./routes/authRouter');
const rootDir = require('./utils/pathUtil');
const errorsController = require('./controllers/errors');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-session-secret-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Make authentication state available to every EJS view.
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/auth', authRouter);
app.use(portfolioRouter);
app.use(express.static(path.join(rootDir, 'public')));
app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3003;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI environment variable is not set. Refusing to start.');
  process.exit(1);
}

async function ensureAdmin() {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  if (!adminEmail || !adminPassword) {
    console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set. No admin account was seeded.');
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
    }
    return;
  }

  if (adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await User.create({
    name: process.env.ADMIN_NAME || 'Administrator',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
  });

  console.log(`Admin account created for ${adminEmail}`);
}

async function startServer() {
  try {
    await mongoose.connect(uri);
    console.log("Successfully connected to the 'college' database!");
    await ensureAdmin();

    app.listen(PORT, () => {
      console.log(`server got started at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

startServer();
