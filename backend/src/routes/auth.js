const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Since JWT is stateless, just tell client it was successful
  res.json({ message: 'Logout successful' });
});

module.exports = router;