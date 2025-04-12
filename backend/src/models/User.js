const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    streaks: Number,
    badges: [String],
    isAnonymous: Boolean,
});