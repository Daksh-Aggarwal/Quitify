const Post = require('../models/Post');
const User = require('../models/User');

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const { habitCategory, postType } = req.query;
        let query = {};
        
        // Filter by habit category if provided
        if (habitCategory) {
            query.habitCategory = habitCategory;
        }
        
        // Filter by post type if provided
        if (postType) {
            query.postType = postType;
        }
        
        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .populate('authorId', 'username avatar')
            .populate('comments.authorId', 'username avatar');
            
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Create a post
exports.createPost = async (req, res) => {
    try {
        const { content, title, postType, habitCategory, milestoneAchieved, mediaUrl } = req.body;
        
        const newPost = new Post({
            authorId: req.user.id,
            content,
            title,
            postType: postType || 'general',
            habitCategory,
            milestoneAchieved,
            mediaUrl,
            reactions: { support: 0, helpful: 0, insightful: 0 },
            comments: []
        });
        
        const post = await newPost.save();
        
        // Populate author info before sending response
        const populatedPost = await Post.findById(post._id)
            .populate('authorId', 'username avatar');
        
        res.json(populatedPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get single post
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('authorId', 'username avatar')
            .populate('comments.authorId', 'username avatar');
            
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Check if user owns the post
        if (post.authorId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await post.deleteOne();
        res.json({ message: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const { content } = req.body;
        const newComment = {
            authorId: req.user.id,
            content,
            createdAt: Date.now(),
            reactions: { support: 0, helpful: 0, insightful: 0 },
            reactedBy: []
        };
        
        post.comments.push(newComment);
        await post.save();
        
        // Get updated post with populated fields
        const updatedPost = await Post.findById(req.params.id)
            .populate('authorId', 'username avatar')
            .populate('comments.authorId', 'username avatar');
            
        const addedComment = updatedPost.comments[updatedPost.comments.length - 1];
        
        res.json(addedComment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add reaction to a post
exports.reactToPost = async (req, res) => {
    try {
        const { reactionType } = req.body;
        if (!['support', 'helpful', 'insightful'].includes(reactionType)) {
            return res.status(400).json({ message: 'Invalid reaction type' });
        }
        
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user already reacted
        const existingReaction = post.reactedBy.find(
            reaction => reaction.userId.toString() === req.user.id
        );
        
        if (existingReaction) {
            // If user reacts with the same type, remove the reaction
            if (existingReaction.reactionType === reactionType) {
                post.reactedBy = post.reactedBy.filter(
                    reaction => reaction.userId.toString() !== req.user.id
                );
                post.reactions[reactionType] -= 1;
            } else {
                // If user reacts with a different type, update the reaction type
                post.reactions[existingReaction.reactionType] -= 1;
                post.reactions[reactionType] += 1;
                existingReaction.reactionType = reactionType;
            }
        } else {
            // Add new reaction
            post.reactedBy.push({
                userId: req.user.id,
                reactionType
            });
            post.reactions[reactionType] += 1;
        }
        
        await post.save();
        res.json({ reactions: post.reactions });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// React to a comment
exports.reactToComment = async (req, res) => {
    try {
        const { reactionType } = req.body;
        if (!['support', 'helpful', 'insightful'].includes(reactionType)) {
            return res.status(400).json({ message: 'Invalid reaction type' });
        }
        
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check if user already reacted
        const existingReaction = comment.reactedBy.find(
            reaction => reaction.userId.toString() === req.user.id
        );
        
        if (existingReaction) {
            // If user reacts with the same type, remove the reaction
            if (existingReaction.reactionType === reactionType) {
                comment.reactedBy = comment.reactedBy.filter(
                    reaction => reaction.userId.toString() !== req.user.id
                );
                comment.reactions[reactionType] -= 1;
            } else {
                // If user reacts with a different type, update the reaction type
                comment.reactions[existingReaction.reactionType] -= 1;
                comment.reactions[reactionType] += 1;
                existingReaction.reactionType = reactionType;
            }
        } else {
            // Add new reaction
            comment.reactedBy.push({
                userId: req.user.id,
                reactionType
            });
            comment.reactions[reactionType] += 1;
        }
        
        await post.save();
        res.json({ reactions: comment.reactions });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get success stories
exports.getSuccessStories = async (req, res) => {
    try {
        const successStories = await Post.find({ 
            postType: 'success_story',
            featuredSuccess: req.query.featured === 'true' ? true : { $in: [true, false] }
        })
        .sort({ createdAt: -1 })
        .populate('authorId', 'username avatar')
        .limit(req.query.limit ? parseInt(req.query.limit) : 10);
        
        res.json(successStories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get support groups by habit category
exports.getSupportGroups = async (req, res) => {
    try {
        // Get unique habit categories with post counts
        const habitGroups = await Post.aggregate([
            { $match: { habitCategory: { $exists: true, $ne: null } } },
            { $group: { _id: '$habitCategory', postCount: { $sum: 1 } } },
            { $sort: { postCount: -1 } }
        ]);
        
        // For each habit category, get the most recent post
        const supportGroups = await Promise.all(
            habitGroups.map(async (group) => {
                const recentPost = await Post.findOne({ habitCategory: group._id })
                    .sort({ createdAt: -1 })
                    .populate('authorId', 'username avatar')
                    .limit(1);
                    
                return {
                    habitCategory: group._id,
                    postCount: group.postCount,
                    latestPost: recentPost
                };
            })
        );
        
        res.json(supportGroups);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Feature a success story
exports.featureSuccessStory = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Only allow admins or moderators to feature posts
        if (!req.user.isAdmin && !req.user.isModerator) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        if (post.postType !== 'success_story') {
            return res.status(400).json({ message: 'Only success stories can be featured' });
        }
        
        post.featuredSuccess = !post.featuredSuccess;
        await post.save();
        
        res.json({ featured: post.featuredSuccess });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
