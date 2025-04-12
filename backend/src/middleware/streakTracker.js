const User = require('../models/User');
const {checkAndAwardBadges} = require('../utils/badgeSystem');

module.exports = async function (req, res, next) {
    if (!req.user) {
        return next();
    }
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next();

        const lastActivity = user.lastActivity || new Date(0);
        const today = new Date();

        // Check if last activity was yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActivity.toDateString() === yesterday.toDateString()) {
            // Increment streak as user was active yesterday
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { streaks: 1 },
                lastActivity: today
            });
        } else if (lastActivity.toDateString() !== today.toDateString()) {
            // Reset streak as there was a gap in activity
            await User.findByIdAndUpdate(req.user.id, {
                streaks: 1,
                lastActivity: today
            });
        }
        
        await checkAndAwardBadges(req.user.id);

        next();
    } catch (err) {
        console.error('Streak tracking error:', err);
        next();
    }
};