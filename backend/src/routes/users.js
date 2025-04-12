const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// GET /api/users/:id
router.get('/:id', userController.getUserProfile);

// PUT /api/users/:id
router.put('/:id', auth, userController.updateUserProfile);

module.exports = router