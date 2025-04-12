const User = require('../models/User');
// Badge thresholds
const BADGE_THRESHOLDS = {
    BEGINNER: 3,  // 3 days streak
    INTERMEDIATE: 7, // 7 days streak
    ADVANCED: 30, // 30 days streak
    MASTER: 100   // 100 days streak
};
// Check and award badges based on streaks
exports.checkAndAwardBadges = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;
        const badges = [...user.badges];
        let badgeAwarded = false;
        // Check for streak badges
        if (user.streaks >= BADGE_THRESHOLDS.MASTER && !badges.includes('Master')) {
            badges.push('Master');
            badgeAwarded = true;
        } else if (user.streaks >= BADGE_THRESHOLDS.ADVANCED && !badges.includes('Advanced')) {
            badges.push('Advanced');
            badgeAwarded = true;
        } else if (user.streaks >= BADGE_THRESHOLDS.INTERMEDIATE && !badges.includes('Intermediate')) {
            badges.push('Intermediate');
            badgeAwarded = true;
        } else if (user.streaks >= BADGE_THRESHOLDS.BEGINNER && !badges.includes('Beginner')) {
            badges.push('Beginner');
            badgeAwarded = true;
        }
        // Update user badges if any awarded
        if (badgeAwarded) {
            await User.findByIdAndUpdate(userId, { badges });
        }
        return badgeAwarded;
    } catch (err) {
        console.error('Badge awarding error:', err);
    }
}