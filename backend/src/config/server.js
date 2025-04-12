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

// Configure CORS properly to fix cross-origin errors
// This will allow requests from both localhost:3000 and 127.0.0.1:3000
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:5500',  // For VS Code Live Server
    'http://127.0.0.1:5500'   // For VS Code Live Server
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// Middleware
app.use(express.json({ extended: false }));

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

// Handle options requests for preflight
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// No route found handler 
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;