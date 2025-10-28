const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const commentController = require('../controllers/commentController');

// All routes require authentication
router.use(authenticateToken);

// Get comments for a video
router.get('/:videoId', [
  check('videoId', 'Video ID is required').isMongoId(),
  check('sort', 'Invalid sort').optional().isIn(['top', 'newest']),
  check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 50 }),
  check('skip', 'Invalid skip').optional().isInt({ min: 0 }),
], commentController.getComments);

// Get replies for a comment
router.get('/:commentId/replies', [
  check('commentId', 'Comment ID is required').isMongoId(),
  check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 20 }),
], commentController.getReplies);

// Create a new comment
router.post('/', [
  check('videoId', 'Video ID is required').isMongoId(),
  check('text', 'Comment text is required').isString().isLength({ min: 1, max: 200 }),
  check('parentId', 'Parent ID must be valid').optional().isMongoId(),
], commentController.createComment);

// Like/unlike a comment
router.post('/:commentId/like', [
  check('commentId', 'Comment ID is required').isMongoId(),
], commentController.toggleLike);

// Report a comment
router.post('/:commentId/report', [
  check('commentId', 'Comment ID is required').isMongoId(),
  check('reason', 'Report reason is required').isString().notEmpty(),
], commentController.reportComment);

// Pin a comment (for creators/admins)
router.post('/:commentId/pin', [
  check('commentId', 'Comment ID is required').isMongoId(),
], commentController.pinComment);

// Unpin a comment (for creators/admins)
router.post('/:commentId/unpin', [
  check('commentId', 'Comment ID is required').isMongoId(),
], commentController.unpinComment);

// Delete a comment
router.delete('/:commentId', [
  check('commentId', 'Comment ID is required').isMongoId(),
], commentController.deleteComment);

module.exports = router;
