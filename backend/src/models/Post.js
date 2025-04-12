const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reactions: {
        support: {
            type: Number,
            default: 0
        },
        helpful: {
            type: Number,
            default: 0
        },
        insightful: {
            type: Number,
            default: 0
        }
    },
    reactedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reactionType: String
    }]
});

const PostSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    },
    postType: {
        type: String,
        enum: ['experience', 'question', 'success_story', 'general'],
        default: 'general'
    },
    habitCategory: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reactions: {
        support: {
            type: Number,
            default: 0
        },
        helpful: {
            type: Number,
            default: 0
        },
        insightful: {
            type: Number,
            default: 0
        }
    },
    reactedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reactionType: String
    }],
    comments: [CommentSchema],
    featuredSuccess: {
        type: Boolean,
        default: false
    },
    milestoneAchieved: {
        type: String,
        required: false
    },
    mediaUrl: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Post', PostSchema);