const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const auth = require('../middleware/auth')
const streakTracker = require('../middleware/streakTracker');
const dotenv = require('dotenv');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.use(auth);
app.use(streakTracker);

// Define routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/posts', require('../routes/posts'));
app.use('/api/leaderboard', require('../routes/leaderboard'));

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));