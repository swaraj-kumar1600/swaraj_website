// External Module
const express = require('express');
const portfolioRouter = express.Router();

// Local Module
const portfolioController = require('../controllers/portfolioController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

portfolioRouter.get('/', portfolioController.getIndex);
portfolioRouter.get('/about', portfolioController.getAbout);
portfolioRouter.get('/skills', portfolioController.getSkills);
portfolioRouter.get('/portfolio', portfolioController.getPortfolio);
portfolioRouter.get('/contact', portfolioController.getContact);
portfolioRouter.post('/contact', portfolioController.postContact);

// Semester results require login. Only admins can upload.
portfolioRouter.get('/results', requireAuth, portfolioController.getResults);
portfolioRouter.post(
  '/results/upload',
  requireAdmin,
  portfolioController.uploadMarksheet,
  portfolioController.postUploadMarksheet
);

portfolioRouter.use('/results/upload', (err, req, res, next) => {
  console.log('Marksheet upload rejected:', err.message);
  res.redirect('/results?error=file');
});

module.exports = portfolioRouter;
