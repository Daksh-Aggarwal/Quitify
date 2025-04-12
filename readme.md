# Quitify

A community-driven platform to help users overcome addictions and break bad habits through peer support, engagement, and motivation.

## Overview

Quitify is a web application designed to create a supportive environment where users can track their progress, share experiences, and motivate each other on their journey to breaking bad habits. The platform emphasizes privacy, community engagement, and positive reinforcement through gamification elements.

## Features

### User Authentication & Profiles
- Secure signup/login system
- Personalized user profiles
- Privacy controls and anonymity options
- Progress tracking and streak monitoring

### Community Support
- Habit-specific support groups
- Experience sharing through posts
- Success stories section
- Comment and reaction system

### Reward System
- Achievement badges for milestones
- Points for community engagement
- Global and habit-specific leaderboards
- Streak visualization

### Habit Tracking
- Daily progress logging
- Streak maintenance
- Calendar-based visualization
- Motivational messaging

## Technology Stack

### Frontend
- Vanilla HTML, CSS, and JavaScript

### Backend
- Node.js with Express
- RESTful API architecture

### Database
- MongoDB Atlas for data storage

### Authentication
- JWT (JSON Web Tokens) for secure authentication

## API Endpoints

### Authentication
- POST /api/auth/signup - Register a new user
- POST /api/auth/login - Authenticate user
- POST /api/auth/logout - Log out user

### User Management
- GET /api/users - Get all users
- GET /api/users/:id - Get user profile
- PUT /api/users/:id - Update user profile

### Community Posts
- GET /api/posts - Get all posts
- POST /api/posts - Create a new post
- GET /api/posts/:id - Get specific post
- DELETE /api/posts/:id - Delete a post

### Leaderboards
- GET /api/leaderboard - Get user rankings

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account

### Installation

1. Clone the repository

git clone https://github.com/yourusername/quitify.git
cd quitify


2. Install dependencies

npm install


3. Configure environment variables
Create a .env file in the root directory with:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


4. Start the development server

npm run dev

## Contributors

- manvi-smaran
- Raghav-28-Gupta

Developed during ByteVerse 7.0 2025