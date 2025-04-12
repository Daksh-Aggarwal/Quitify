const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./db');
const streakTracker = require('../middleware/streakTracker');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Root route for API info
app.get('/', (req, res) => {
  res.json({
    message: 'Addiction Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      leaderboard: '/api/leaderboard'
    }
  });
});

// Only apply streak tracker middleware to relevant routes
// app.use(streakTracker);

// Define routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/posts', require('../routes/posts'));
app.use('/api/leaderboard', require('../routes/leaderboard'));

// Define port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));