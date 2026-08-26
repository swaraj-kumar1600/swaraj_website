const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const Message = require('../models/message');
const Semester = require('../models/semester');
const rootDir = require('../utils/pathUtil');

const profile = {
  name: 'Swaraj',
  fullName: 'Swaraj Kumar',
  role: 'Aspiring Software Developer · Gen AI & Data Science',
  email: 'sk.swaraj48raj@gmail.com',
  location: 'Sonepat, India',
  intro:
    "CS undergrad at IIIT Sonepat, aspiring software developer with a growing focus on Generative AI and data science — building across backend development, machine learning, and competitive programming, currently ranked 2nd in my cohort with a 9.5 SGPA.",
  photo: '/images/profile.jpg',
  resume: '/resume.pdf',
  stats: [
    { value: '9.5', label: 'SGPA' },
    { value: '400+', label: 'DSA Problems Solved' },
    { value: '2nd', label: 'Rank, First Year' },
  ],
  social: [
    { name: 'GitHub', href: 'https://github.com/swaraj-kumar1600', icon: 'fa-brands fa-github' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/swaraj-kumar-020980379', icon: 'fa-brands fa-linkedin' },
    { name: 'LeetCode', href: 'https://leetcode.com/u/swaraj_kumar1000/', icon: 'fa-solid fa-code' },
    { name: 'Email', href: 'mailto:sk.swaraj48raj@gmail.com', icon: 'fa-solid fa-envelope' },
  ],
  education: [
    {
      school: 'Indian Institute of Information Technology (IIIT) Sonepat',
      degree: 'B.Tech, Computer Science & Engineering',
      period: '2025 – Present',
      detail: 'SGPA: 9.5/10 · Rank: 2nd Position in First Year',
    },
    {
      school: 'Mount Litera Zee School, Bihta (CBSE)',
      degree: 'Class XII & Class X',
      period: '2023 – 2025',
      detail: 'Class XII: 90.2% (2025) · Class X: 92.0% (2023)',
    },
  ],
  skills: {
    Languages: ['C++', 'Python', 'JavaScript', 'SQL'],
    'Web Development': ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express.js'],
    'ML & Data Science': ['NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Plotly', 'Scikit-learn'],
    'Core CS': ['DSA', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks'],
    Tools: ['Git', 'GitHub', 'VS Code', 'Jupyter Notebook'],
  },
  achievements: [
    'Solved 400+ Data Structures & Algorithms problems on LeetCode.',
    'Secured 2nd Rank in the first year of B.Tech with a 9.5 SGPA.',
    'Built a strong ML foundation through mathematical derivations and hands-on implementations.',
  ],
  certifications: [
    'Data Science & Machine Learning (In Progress)',
    'Web Development (In Progress)',
  ],
};

const projects = [
  {
    title: 'Machine Learning Algorithms Playground',
    tag: 'Python / Scikit-learn',
    summary:
      'Implemented regression, classification, ensemble, clustering, and SVM algorithms from scratch — including Linear/Logistic Regression, Decision Tree, Random Forest, KNN, AdaBoost, Gradient Boosting, XGBoost, DBSCAN, and K-Means — with a focus on the underlying math and hyperparameter tuning.',
  },
  {
    title: 'Exploratory Data Analysis Dashboard',
    tag: 'Pandas / Seaborn / Plotly',
    summary:
      'Cleaned, preprocessed, and engineered features on real-world datasets, then built interactive and static visualizations to surface statistical insights.',
  },
  {
    title: 'Node.js Backend Practice Projects',
    tag: 'Node.js / Express.js',
    summary:
      'A set of backend applications covering routing, middleware, REST APIs, query/URL parameters, and file handling — built alongside Git workflows like branching, merging, and conflict resolution.',
  },
];

exports.getIndex = (req, res) => {
  res.render('portfolio/index', {
    pageTitle: `${profile.name} — ${profile.role}`,
    currentPage: 'home',
    profile,
    projects: projects.slice(0, 3),
  });
};

exports.getAbout = (req, res) => {
  res.render('portfolio/about', {
    pageTitle: 'About',
    currentPage: 'about',
    profile,
  });
};

exports.getSkills = (req, res) => {
  res.render('portfolio/skills', {
    pageTitle: 'Skills',
    currentPage: 'skills',
    profile,
  });
};

exports.getPortfolio = (req, res) => {
  res.render('portfolio/portfolio', {
    pageTitle: 'Portfolio',
    currentPage: 'portfolio',
    projects,
  });
};

exports.getContact = (req, res) => {
  res.render('portfolio/contact', {
    pageTitle: 'Contact',
    currentPage: 'contact',
  });
};

exports.postContact = (req, res) => {
  const { name, email, subject, body } = req.body;

  // If no database is configured, just log the message so the form still works.
  if (mongoose.connection.readyState !== 1) {
    console.log('Contact form submission (no DB configured):', { name, email, subject, body });
    return res.redirect('/contact?sent=1');
  }

  const message = new Message({ name, email, subject, body });
  message
    .save()
    .then(() => res.redirect('/contact?sent=1'))
    .catch((err) => {
      console.log('Error saving message: ', err);
      res.redirect('/contact?sent=0');
    });
};

// ---------- Semester Results ----------

// Marksheets are saved to public/uploads/marksheets so they can be served
// as static files and linked/viewed directly in the browser.
const uploadDir = path.join(rootDir, 'public', 'uploads', 'marksheets');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeSemester = (req.body.semester || 'sem')
      .trim()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'sem';
    cb(null, `${Date.now()}-${safeSemester}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

exports.uploadMarksheet = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error('Only PDF, JPG, and PNG files are allowed.'));
    }
    cb(null, true);
  },
}).single('marksheet');

const localSemesters = [];

exports.getResults = (req, res) => {
  const render = (semesters) =>
    res.render('portfolio/results', {
      pageTitle: 'Semester Results',
      currentPage: 'results',
      semesters,
      uploaded: req.query.uploaded,
      error: req.query.error,
    });

  Semester.find()
    .sort({ semester: 1 })
    .then((semesters) => render(semesters))
    .catch((err) => {
      console.log('Error fetching semesters: ', err);
      // Database is required by app.js, so this is only a defensive fallback.
      render(localSemesters);
    });
};

exports.postUploadMarksheet = async (req, res) => {
  if (!req.file) {
    return res.redirect('/results?error=file');
  }

  const semester = String(req.body.semester || '').trim();
  const sgpa = String(req.body.sgpa || '').trim();

  if (semester.length < 2 || semester.length > 40) {
    fs.unlink(req.file.path, () => {});
    return res.redirect('/results?error=validation');
  }

  if (sgpa && !/^(10(?:\\.0)?|[0-9](?:\\.[0-9]{1,2})?)$/.test(sgpa)) {
    fs.unlink(req.file.path, () => {});
    return res.redirect('/results?error=validation');
  }

  const filePath = `/uploads/marksheets/${req.file.filename}`;

  try {
    await Semester.create({ semester, sgpa, filePath });
    return res.redirect('/results?uploaded=1');
  } catch (err) {
    console.log('Error saving semester result:', err);
    fs.unlink(req.file.path, () => {});
    return res.redirect('/results?error=save');
  }
};
