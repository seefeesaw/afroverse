const creatorService = require('../services/creatorService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const creatorController = {
  /**
   * GET /api/profile/:username
   * Get creator profile by username
   */
  async getCreatorProfile(req, res) {
    try {
      const { username } = req.params;
      const viewerId = req.user?.id;

      const profile = await creatorService.getCreatorProfile(username, viewerId);

      res.status(200).json({
        success: true,
        profile
      });

    } catch (error) {
      logger.error('Error getting creator profile:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get creator profile' 
      });
    }
  },

  /**
   * GET /api/profile/:username/feed
   * Get creator's content feed
   */
  async getCreatorFeed(req, res) {
    try {
      const { username } = req.params;
      const { cursor, limit = 20 } = req.query;

      // Get user ID from username
      const User = require('../models/User');
      const user = await User.findOne({ username }).select('_id');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Creator not found' 
        });
      }

      const feed = await creatorService.getCreatorFeed(
        user._id, 
        cursor, 
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        feed
      });

    } catch (error) {
      logger.error('Error getting creator feed:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get creator feed' 
      });
    }
  },

  /**
   * POST /api/follow/:userId
   * Follow a creator
   */
  async followCreator(req, res) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;

      const result = await creatorService.followCreator(followerId, userId);

      res.status(200).json({
        success: true,
        message: 'Successfully followed creator',
        ...result
      });

    } catch (error) {
      logger.error('Error following creator:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to follow creator' 
      });
    }
  },

  /**
   * DELETE /api/follow/:userId
   * Unfollow a creator
   */
  async unfollowCreator(req, res) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;

      const result = await creatorService.unfollowCreator(followerId, userId);

      res.status(200).json({
        success: true,
        message: 'Successfully unfollowed creator',
        ...result
      });

    } catch (error) {
      logger.error('Error unfollowing creator:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to unfollow creator' 
      });
    }
  },

  /**
   * GET /api/followers/:userId
   * Get list of followers for a creator
   */
  async getFollowers(req, res) {
    try {
      const { userId } = req.params;
      const { cursor, limit = 20 } = req.query;

      const result = await creatorService.getFollowers(
        userId, 
        cursor, 
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error getting followers:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get followers' 
      });
    }
  },

  /**
   * GET /api/following/:userId
   * Get list of users that a creator is following
   */
  async getFollowing(req, res) {
    try {
      const { userId } = req.params;
      const { cursor, limit = 20 } = req.query;

      const result = await creatorService.getFollowing(
        userId, 
        cursor, 
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error getting following:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get following' 
      });
    }
  },

  /**
   * PUT /api/profile
   * Update creator profile
   */
  async updateCreatorProfile(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const updates = req.body;

      const profile = await creatorService.updateCreatorProfile(userId, updates);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile
      });

    } catch (error) {
      logger.error('Error updating creator profile:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to update profile' 
      });
    }
  },

  /**
   * GET /api/creators/top
   * Get top creators for discovery
   */
  async getTopCreators(req, res) {
    try {
      const { cursor, limit = 20, tribeId } = req.query;

      const result = await creatorService.getTopCreators(
        cursor, 
        parseInt(limit), 
        tribeId
      );

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Error getting top creators:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get top creators' 
      });
    }
  },

  /**
   * GET /api/profile/:username/stats
   * Get creator stats
   */
  async getCreatorStats(req, res) {
    try {
      const { username } = req.params;

      // Get user ID from username
      const User = require('../models/User');
      const user = await User.findOne({ username }).select('_id');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Creator not found' 
        });
      }

      const stats = await creatorService.getCreatorStats(user._id);

      res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      logger.error('Error getting creator stats:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get creator stats' 
      });
    }
  },

  /**
   * GET /api/public/profile/:username
   * Get public share page (no authentication required)
   */
  async getPublicSharePage(req, res) {
    try {
      const { username } = req.params;

      const profile = await creatorService.getPublicSharePage(username);

      res.status(200).json({
        success: true,
        profile
      });

    } catch (error) {
      logger.error('Error getting public share page:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get public profile' 
      });
    }
  },

  /**
   * POST /api/profile/promote-to-creator
   * Promote user to creator status (admin only)
   */
  async promoteToCreator(req, res) {
    try {
      const { userId } = req.body;
      
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      await user.promoteToCreator();

      res.status(200).json({
        success: true,
        message: 'User promoted to creator successfully'
      });

    } catch (error) {
      logger.error('Error promoting user to creator:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to promote user' 
      });
    }
  },

  /**
   * GET /api/profile/:username/follow-status
   * Check if current user follows a creator
   */
  async getFollowStatus(req, res) {
    try {
      const { username } = req.params;
      const currentUserId = req.user.id;

      // Get user ID from username
      const User = require('../models/User');
      const user = await User.findOne({ username }).select('_id');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Creator not found' 
        });
      }

      const Follow = require('../models/Follow');
      const follow = await Follow.findOne({
        followerId: currentUserId,
        followingId: user._id
      });

      res.status(200).json({
        success: true,
        isFollowing: !!follow
      });

    } catch (error) {
      logger.error('Error getting follow status:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get follow status' 
      });
    }
  },
};

module.exports = creatorController;
