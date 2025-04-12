const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    mood: String,
    notes: String
});

const GoalSchema = new mongoose.Schema({
    addictionType: String,
    otherAddiction: String,
    startDate: Date,
    motivationLevel: Number,
    recoveryGoal: String
});

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    streaks: {
        type: Number,
        default: 0
    },
    badges: [String],
    isAnonymous: {
        type: Boolean,
        default: false
    },
    goal: GoalSchema,
    checkIns: [CheckInSchema],
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);