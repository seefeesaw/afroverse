const moderationService = require('../services/moderationService');
const ModerationLog = require('../models/ModerationLog');
const Report = require('../models/Report');
const BlockedUser = require('../models/BlockedUser');
const { logger } = require('../utils/logger');

const moderationController = {
  /**
   * POST /api/moderation/report - Submit a report
   */
  async submitReport(req, res) {
    try {
      const reporterId = req.user.id;
      const {
        targetUserId,
        targetType,
        targetId,
        reason,
        description
      } = req.body;

      // Validate required fields
      if (!targetUserId || !targetType || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const result = await moderationService.submitReport(
        reporterId,
        targetUserId,
        targetType,
        targetId,
        reason,
        description
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Error submitting report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit report'
      });
    }
  },

  /**
   * GET /api/moderation/reasons - Get report reasons
   */
  async getReportReasons(req, res) {
    try {
      const reasons = [
        {
          value: 'inappropriate_content',
          label: 'Inappropriate Content',
          description: 'Content that violates community guidelines'
        },
        {
          value: 'harassment',
          label: 'Harassment',
          description: 'Bullying, threats, or unwanted behavior'
        },
        {
          value: 'spam',
          label: 'Spam',
          description: 'Repetitive or unwanted content'
        },
        {
          value: 'fake_profile',
          label: 'Fake Profile',
          description: 'Impersonation or fake account'
        },
        {
          value: 'underage',
          label: 'Underage User',
          description: 'User appears to be under 13 years old'
        },
        {
          value: 'violence',
          label: 'Violence',
          description: 'Content promoting or depicting violence'
        },
        {
          value: 'hate_speech',
          label: 'Hate Speech',
          description: 'Content promoting hatred or discrimination'
        },
        {
          value: 'nudity',
          label: 'Nudity',
          description: 'Sexual or inappropriate nudity'
        },
        {
          value: 'scam',
          label: 'Scam',
          description: 'Fraudulent or deceptive content'
        },
        {
          value: 'copyright_violation',
          label: 'Copyright Violation',
          description: 'Unauthorized use of copyrighted material'
        },
        {
          value: 'other',
          label: 'Other',
          description: 'Other violation not listed above'
        }
      ];

      res.status(200).json({
        success: true,
        reasons
      });

    } catch (error) {
      logger.error('Error getting report reasons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report reasons'
      });
    }
  },

  /**
   * POST /api/moderation/block - Block a user
   */
  async blockUser(req, res) {
    try {
      const blockerId = req.user.id;
      const { blockedUserId, reason, description } = req.body;

      if (!blockedUserId || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const result = await moderationService.blockUser(
        blockerId,
        blockedUserId,
        reason,
        description
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Error blocking user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to block user'
      });
    }
  },

  /**
   * DELETE /api/moderation/block - Unblock a user
   */
  async unblockUser(req, res) {
    try {
      const blockerId = req.user.id;
      const { blockedUserId } = req.body;

      if (!blockedUserId) {
        return res.status(400).json({
          success: false,
          message: 'Missing blocked user ID'
        });
      }

      const result = await moderationService.unblockUser(blockerId, blockedUserId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Error unblocking user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unblock user'
      });
    }
  },

  /**
   * GET /api/moderation/blocked-users - Get blocked users
   */
  async getBlockedUsers(req, res) {
    try {
      const userId = req.user.id;
      const blockedUsers = await BlockedUser.getBlockedUsers(userId);

      res.status(200).json({
        success: true,
        blockedUsers
      });

    } catch (error) {
      logger.error('Error getting blocked users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blocked users'
      });
    }
  },

  /**
   * GET /api/moderation/blockers - Get users who blocked this user
   */
  async getBlockers(req, res) {
    try {
      const userId = req.user.id;
      const blockers = await BlockedUser.getBlockers(userId);

      res.status(200).json({
        success: true,
        blockers
      });

    } catch (error) {
      logger.error('Error getting blockers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blockers'
      });
    }
  },

  /**
   * GET /api/moderation/history - Get user moderation history
   */
  async getModerationHistory(req, res) {
    try {
      const userId = req.user.id;
      const {
        limit = 20,
        skip = 0,
        action = null,
        severity = null,
        category = null
      } = req.query;

      const history = await moderationService.getUserModerationHistory(userId, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        action,
        severity,
        category
      });

      res.status(200).json({
        success: true,
        history,
        pagination: {
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: history.length === parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error getting moderation history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get moderation history'
      });
    }
  },

  /**
   * GET /api/moderation/reports - Get user reports (as reporter)
   */
  async getUserReports(req, res) {
    try {
      const userId = req.user.id;
      const {
        limit = 20,
        skip = 0,
        status = null
      } = req.query;

      const reports = await Report.getReportsByUser(userId, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        status,
        asReporter: true
      });

      res.status(200).json({
        success: true,
        reports,
        pagination: {
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: reports.length === parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error getting user reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user reports'
      });
    }
  },

  /**
   * GET /api/moderation/reports-against - Get reports against user
   */
  async getReportsAgainst(req, res) {
    try {
      const userId = req.user.id;
      const {
        limit = 20,
        skip = 0,
        status = null
      } = req.query;

      const reports = await Report.getReportsByUser(userId, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        status,
        asReporter: false
      });

      res.status(200).json({
        success: true,
        reports,
        pagination: {
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: reports.length === parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error getting reports against user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reports against user'
      });
    }
  },

  /**
   * POST /api/moderation/moderate-image - Moderate image upload (internal)
   */
  async moderateImage(req, res) {
    try {
      const userId = req.user.id;
      const imageBuffer = req.file.buffer;

      const result = await moderationService.moderateImageUpload(imageBuffer, userId);

      res.status(200).json(result);

    } catch (error) {
      logger.error('Error moderating image:', error);
      res.status(500).json({
        allowed: false,
        reason: 'Image moderation failed',
        confidence: 0,
        violations: ['Moderation service error'],
        warnings: [],
        processingTime: 0
      });
    }
  },

  /**
   * POST /api/moderation/moderate-text - Moderate text content
   */
  async moderateText(req, res) {
    try {
      const userId = req.user.id;
      const { text, contentType = 'text', options = {} } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text content is required'
        });
      }

      const result = await moderationService.moderateTextContent(
        text,
        userId,
        contentType,
        options
      );

      res.status(200).json(result);

    } catch (error) {
      logger.error('Error moderating text:', error);
      res.status(500).json({
        allowed: false,
        reason: 'Text moderation failed',
        confidence: 0,
        violations: ['Moderation service error'],
        warnings: [],
        sanitized: req.body.text || '',
        processingTime: 0
      });
    }
  },

  /**
   * GET /api/moderation/check-block - Check if user is blocked
   */
  async checkBlock(req, res) {
    try {
      const userId1 = req.user.id;
      const { userId2 } = req.params;

      const isBlocked = await moderationService.isUserBlocked(userId1, userId2);

      res.status(200).json({
        success: true,
        isBlocked
      });

    } catch (error) {
      logger.error('Error checking block status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check block status'
      });
    }
  },

  /**
   * GET /api/moderation/stats - Get moderation statistics
   */
  async getModerationStats(req, res) {
    try {
      const { timeframe = '7d' } = req.query;
      const stats = await moderationService.getModerationStats(timeframe);

      res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      logger.error('Error getting moderation stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get moderation stats'
      });
    }
  },

  /**
   * GET /api/moderation/status - Get moderation service status
   */
  async getModerationStatus(req, res) {
    try {
      const status = moderationService.getStatus();

      res.status(200).json({
        success: true,
        status
      });

    } catch (error) {
      logger.error('Error getting moderation status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get moderation status'
      });
    }
  }
};

module.exports = moderationController;