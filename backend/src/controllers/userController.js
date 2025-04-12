const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { username, badges, isAnonymous } = req.body;

        // Build update object
        const updateFields = {};
        if (username) updateFields.username = username;
        if (badges) updateFields.badges = badges;
        if (isAnonymous !== undefined) updateFields.isAnonymous = isAnonymous;

        // Update user
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        ).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};