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

// Get user's addiction recovery goal
exports.getUserGoal = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('goal');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.goal) {
            return res.status(404).json({ message: 'No goal found' });
        }
        
        res.json(user.goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Create user's addiction recovery goal
exports.createUserGoal = async (req, res) => {
    try {
        const { addictionType, otherAddiction, startDate, motivationLevel, recoveryGoal } = req.body;
        
        // Validate required fields
        if (!addictionType || !startDate) {
            return res.status(400).json({ message: 'Addiction type and start date are required' });
        }
        
        // Build goal object
        const goalFields = {
            addictionType,
            startDate: new Date(startDate),
            motivationLevel: motivationLevel || 5
        };
        
        if (addictionType === 'Other' && otherAddiction) {
            goalFields.otherAddiction = otherAddiction;
        }
        
        if (recoveryGoal) {
            goalFields.recoveryGoal = recoveryGoal;
        }
        
        // Find user and update
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Set the goal and update last activity
        user.goal = goalFields;
        user.lastActivity = Date.now();
        
        await user.save();
        res.json(user.goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update user's addiction recovery goal
exports.updateUserGoal = async (req, res) => {
    try {
        const { addictionType, otherAddiction, startDate, motivationLevel, recoveryGoal } = req.body;
        
        // Validate required fields
        if (!addictionType || !startDate) {
            return res.status(400).json({ message: 'Addiction type and start date are required' });
        }
        
        // Build goal object
        const goalFields = {
            addictionType,
            startDate: new Date(startDate),
            motivationLevel: motivationLevel || 5
        };
        
        if (addictionType === 'Other' && otherAddiction) {
            goalFields.otherAddiction = otherAddiction;
        }
        
        if (recoveryGoal) {
            goalFields.recoveryGoal = recoveryGoal;
        }
        
        // Find user and update
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update the goal
        user.goal = goalFields;
        user.lastActivity = Date.now();
        
        await user.save();
        res.json(user.goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get user's check-ins
exports.getUserCheckIns = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('checkIns');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user.checkIns || []);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Create a new check-in
exports.createUserCheckIn = async (req, res) => {
    try {
        const { mood, notes } = req.body;
        
        if (!mood) {
            return res.status(400).json({ message: 'Mood is required for check-in' });
        }
        
        const newCheckIn = {
            date: new Date(),
            mood,
            notes: notes || ''
        };
        
        // Find user and update
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Add check-in to beginning of array
        if (!user.checkIns) {
            user.checkIns = [];
        }
        
        user.checkIns.unshift(newCheckIn);
        
        // Update streaks based on consecutive check-ins
        if (user.checkIns.length > 1) {
            const lastCheckInDate = new Date(user.checkIns[1].date);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // If last check-in was yesterday, increment streak
            if (lastCheckInDate.toDateString() === yesterday.toDateString()) {
                user.streaks = (user.streaks || 0) + 1;
            }
        } else {
            // First check-in, set streak to 1
            user.streaks = 1;
        }
        
        user.lastActivity = Date.now();
        await user.save();
        
        res.json(newCheckIn);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};