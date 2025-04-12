const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// GET /api/posts - Get all posts with optional filters
router.get('/', postController.getAllPosts);

// POST /api/posts - Create a new post
router.post('/', auth, postController.createPost);

// GET /api/posts/:id - Get a single post by ID
router.get('/:id', postController.getPost);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', auth, postController.deletePost);

// POST /api/posts/:id/comments - Add a comment to a post
router.post('/:id/comments', auth, postController.addComment);

// POST /api/posts/:id/react - React to a post
router.post('/:id/react', auth, postController.reactToPost);

// POST /api/posts/:postId/comments/:commentId/react - React to a comment
router.post('/:postId/comments/:commentId/react', auth, postController.reactToComment);

// GET /api/posts/groups/support - Get support groups
router.get('/groups/support', postController.getSupportGroups);

// GET /api/posts/stories/success - Get success stories
router.get('/stories/success', postController.getSuccessStories);

// POST /api/posts/:id/feature - Feature a success story (admin/moderator only)
router.post('/:id/feature', auth, postController.featureSuccessStory);

module.exports = router;