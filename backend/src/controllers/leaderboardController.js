const User = require('../models/User');
// Get leaderboard
exports.getLeaderboard = async (req, res) => {
try {
    const users = await User.find()
        .sort({ streaks: -1 })
        .select('username streaks badges')
        .limit(10);
    res.json(users);
} catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
}
};