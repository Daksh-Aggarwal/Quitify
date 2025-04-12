const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup controller
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Create new user
        user = new User({
            username,
            email,
            passwordHash,
            streaks: 0,
            badges: [],
            isAnonymous: false
        });
        await user.save();
        
        // Create JWT token
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            
            // Return token and user data (excluding password)
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                streaks: user.streaks,
                badges: user.badges,
                isAnonymous: user.isAnonymous
            };
            
            res.json({ 
                token,
                user: userData,
                message: 'Registration successful!'
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

// Login controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create JWT token
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            
            // Return token and user data (excluding password)
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                streaks: user.streaks,
                badges: user.badges,
                isAnonymous: user.isAnonymous,
                goal: user.goal
            };
            
            res.json({ 
                token,
                user: userData,
                message: 'Login successful!'
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};