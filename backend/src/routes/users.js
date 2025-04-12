const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// Goals and check-ins routes - all require authentication
// GET /api/users/goals - Get current user's goals
router.get('/goals', auth, userController.getUserGoal);

// POST /api/users/goals - Create a new goal
router.post('/goals', auth, userController.createUserGoal);

// PUT /api/users/goals - Update existing goal
router.put('/goals', auth, userController.updateUserGoal);

// GET /api/users/checkins - Get user's check-ins
router.get('/checkins', auth, userController.getUserCheckIns);

// POST /api/users/checkins - Create a new check-in
router.post('/checkins', auth, userController.createUserCheckIn);

// GET /api/users/:id - Must come after specific routes
router.get('/:id', userController.getUserProfile);

// PUT /api/users/:id
router.put('/:id', auth, userController.updateUserProfile);

module.exports = router;