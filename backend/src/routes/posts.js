const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// GET /api/posts
router.get('/', postController.getAllPosts);

// POST /api/posts
router.post('/', auth, postController.createPost);

// GET /api/posts/:id
router.get('/:id', postController.getPost);

// DELETE /api/posts/:id
router.delete('/:id', auth, postController.deletePost);

module.exports = router;