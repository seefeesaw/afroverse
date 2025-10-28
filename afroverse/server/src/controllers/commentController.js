const commentService = require('../services/commentService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const commentController = {
  /**
   * GET /api/comments/:videoId
   * Get comments for a video
   */
  async getComments(req, res) {
    try {
      const { videoId } = req.params;
      const { sort = 'top', limit = 20, skip = 0 } = req.query;

      const comments = await commentService.getComments(
        videoId,
        sort,
        parseInt(limit),
        parseInt(skip)
      );

      res.status(200).json({
        success: true,
        ...comments
      });

    } catch (error) {
      logger.error('Error getting comments:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get comments'
      });
    }
  },

  /**
   * GET /api/comments/:commentId/replies
   * Get replies for a comment
   */
  async getReplies(req, res) {
    try {
      const { commentId } = req.params;
      const { limit = 10 } = req.query;

      const replies = await commentService.getReplies(commentId, parseInt(limit));

      res.status(200).json({
        success: true,
        replies
      });

    } catch (error) {
      logger.error('Error getting replies:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get replies'
      });
    }
  },

  /**
   * POST /api/comments
   * Create a new comment
   */
  async createComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { videoId, text, parentId } = req.body;
      const userId = req.user.id;

      const comment = await commentService.createComment(userId, videoId, text, parentId);

      res.status(201).json({
        success: true,
        comment
      });

    } catch (error) {
      logger.error('Error creating comment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create comment'
      });
    }
  },

  /**
   * POST /api/comments/:commentId/like
   * Like/unlike a comment
   */
  async toggleLike(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const result = await commentService.toggleLike(userId, commentId);

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error toggling like:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to toggle like'
      });
    }
  },

  /**
   * POST /api/comments/:commentId/report
   * Report a comment
   */
  async reportComment(req, res) {
    try {
      const { commentId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const result = await commentService.reportComment(userId, commentId, reason);

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error reporting comment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to report comment'
      });
    }
  },

  /**
   * DELETE /api/comments/:commentId
   * Delete a comment
   */
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const result = await commentService.deleteComment(userId, commentId);

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete comment'
      });
    }
  },

  /**
   * POST /api/comments/:commentId/pin
   * Pin a comment (for creators/admins)
   */
  async pinComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const result = await commentService.pinComment(userId, commentId);

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error pinning comment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to pin comment'
      });
    }
  },

  /**
   * POST /api/comments/:commentId/unpin
   * Unpin a comment (for creators/admins)
   */
  async unpinComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const comment = await require('../models/Comment').findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Get video owner
      const Video = require('../models/Video');
      const video = await Video.findById(comment.videoId).select('ownerId');
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Check if user is video owner or admin
      if (video.ownerId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to unpin this comment'
        });
      }

      await comment.unpinComment();

      // Broadcast unpin
      const { io } = require('../sockets/socketService');
      io.emit('comments:pin', { commentId, pinned: false });

      res.status(200).json({
        success: true,
        pinned: false
      });

    } catch (error) {
      logger.error('Error unpinning comment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to unpin comment'
      });
    }
  },
};

module.exports = commentController;
