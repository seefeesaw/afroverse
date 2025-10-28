const ModerationLog = require('../models/ModerationLog');
const Report = require('../models/Report');
const BlockedUser = require('../models/BlockedUser');
const faceDetectionService = require('./faceDetectionService');
const nsfwDetectionService = require('./nsfwDetectionService');
const textModerationService = require('./textModerationService');
const moderationRulesEngine = require('./moderationRulesEngine');
const { logger } = require('../utils/logger');

class ModerationService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      this.initialized = true;
      logger.info('Moderation service initialized');
    } catch (error) {
      logger.error('Failed to initialize moderation service:', error);
      this.initialized = false;
    }
  }

  /**
   * Moderate image upload
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} userId - User ID
   * @param {object} options - Moderation options
   * @returns {Promise<object>} Moderation result
   */
  async moderateImageUpload(imageBuffer, userId, options = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Moderation service not initialized');
      }

      const startTime = Date.now();
      const moderationResult = {
        allowed: false,
        reason: null,
        confidence: 0,
        violations: [],
        warnings: [],
        processingTime: 0
      };

      // Step 1: Validate image format and size
      const imageValidation = await faceDetectionService.validateImage(imageBuffer);
      if (!imageValidation.valid) {
        moderationResult.reason = 'Invalid image format or size';
        moderationResult.violations = imageValidation.errors;
        moderationResult.processingTime = Date.now() - startTime;
        return moderationResult;
      }

      // Step 2: Detect faces
      const faceDetection = await faceDetectionService.detectFaces(imageBuffer, {
        requireFace: true,
        maxFaces: 1
      });

      // Step 3: Detect NSFW content
      const nsfwDetection = await nsfwDetectionService.detectNSFW(imageBuffer, {
        minConfidence: 0.7,
        strictMode: true
      });

      // Step 4: Evaluate against rules
      const imageData = {
        faceCount: faceDetection.faceCount,
        faces: faceDetection.faces,
        nsfwConfidence: nsfwDetection.confidence,
        violenceConfidence: nsfwDetection.categories.find(c => c.category === 'violence')?.confidence || 0,
        weaponsConfidence: nsfwDetection.categories.find(c => c.category === 'weapons')?.confidence || 0,
        width: imageValidation.metadata.width,
        height: imageValidation.metadata.height,
        format: imageValidation.metadata.format
      };

      const ruleEvaluation = moderationRulesEngine.evaluateImage(imageData);

      // Determine final result
      moderationResult.allowed = ruleEvaluation.allowed && faceDetection.success && nsfwDetection.safe;
      moderationResult.violations = [
        ...faceDetection.validation.errors,
        ...ruleEvaluation.violations
      ];
      moderationResult.warnings = [
        ...faceDetection.validation.warnings,
        ...ruleEvaluation.warnings,
        ...imageValidation.warnings
      ];
      moderationResult.confidence = Math.max(
        faceDetection.validation.valid ? 1.0 : 0.0,
        nsfwDetection.confidence,
        ruleEvaluation.allowed ? 1.0 : 0.0
      );
      moderationResult.processingTime = Date.now() - startTime;

      if (!moderationResult.allowed) {
        moderationResult.reason = moderationResult.violations[0] || 'Content violates community guidelines';
        
        // Log moderation action
        await this.logModerationAction(userId, 'image', null, 'blocked_image', {
          violations: moderationResult.violations,
          confidence: moderationResult.confidence,
          processingTime: moderationResult.processingTime
        });
      }

      return moderationResult;

    } catch (error) {
      logger.error('Error moderating image upload:', error);
      return {
        allowed: false,
        reason: 'Image moderation failed',
        confidence: 0,
        violations: ['Moderation service error'],
        warnings: [],
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Moderate text content
   * @param {string} text - Text to moderate
   * @param {string} userId - User ID
   * @param {string} contentType - Type of content (username, tribe_name, comment, etc.)
   * @param {object} options - Moderation options
   * @returns {Promise<object>} Moderation result
   */
  async moderateTextContent(text, userId, contentType = 'text', options = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Moderation service not initialized');
      }

      const startTime = Date.now();
      const moderationResult = {
        allowed: false,
        reason: null,
        confidence: 0,
        violations: [],
        warnings: [],
        sanitized: text,
        processingTime: 0
      };

      // Step 1: Perform text moderation
      const textModeration = await textModerationService.moderateText(text, {
        strictMode: options.strictMode !== false,
        checkToxicity: true,
        checkBannedWords: true,
        checkSpam: true
      });

      // Step 2: Evaluate against rules based on content type
      let ruleEvaluation;
      const textData = {
        length: text.length,
        toxicityConfidence: textModeration.confidence,
        spamConfidence: textModeration.categories.includes('spam') ? 0.8 : 0,
        hateSpeechConfidence: textModeration.categories.includes('hate_speech') ? 0.8 : 0,
        harassmentConfidence: textModeration.categories.includes('harassment') ? 0.8 : 0,
        bannedWordsConfidence: textModeration.categories.includes('banned_words') ? 0.8 : 0,
        hasUrls: /(https?:\/\/[^\s]+)/gi.test(text),
        capsRatio: (text.match(/[A-Z]/g) || []).length / text.length,
        punctuationRatio: (text.match(/[!@#$%^&*()_+={}[\]|\\:";'<>?,./]/g) || []).length / text.length
      };

      switch (contentType) {
        case 'username':
          ruleEvaluation = moderationRulesEngine.evaluateUsername(text, textData);
          break;
        case 'tribe_name':
          ruleEvaluation = moderationRulesEngine.evaluateTribeName(text, textData);
          break;
        default:
          ruleEvaluation = moderationRulesEngine.evaluateText(textData);
      }

      // Determine final result
      moderationResult.allowed = textModeration.safe && ruleEvaluation.allowed;
      moderationResult.violations = [
        ...textModeration.violations,
        ...ruleEvaluation.violations
      ];
      moderationResult.warnings = [
        ...ruleEvaluation.warnings
      ];
      moderationResult.confidence = Math.min(textModeration.confidence, ruleEvaluation.allowed ? 1.0 : 0.0);
      moderationResult.processingTime = Date.now() - startTime;

      // Sanitize text if needed
      if (!moderationResult.allowed && options.sanitize !== false) {
        moderationResult.sanitized = textModerationService.sanitizeText(text);
      }

      if (!moderationResult.allowed) {
        moderationResult.reason = moderationResult.violations[0] || 'Content violates community guidelines';
        
        // Log moderation action
        await this.logModerationAction(userId, contentType, null, 'blocked_text', {
          violations: moderationResult.violations,
          confidence: moderationResult.confidence,
          originalText: text,
          sanitizedText: moderationResult.sanitized
        });
      }

      return moderationResult;

    } catch (error) {
      logger.error('Error moderating text content:', error);
      return {
        allowed: false,
        reason: 'Text moderation failed',
        confidence: 0,
        violations: ['Moderation service error'],
        warnings: [],
        sanitized: text,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Submit a report
   * @param {string} reporterId - Reporter user ID
   * @param {string} targetUserId - Target user ID
   * @param {string} targetType - Type of target (image, battle, profile, etc.)
   * @param {string} targetId - Target ID
   * @param {string} reason - Report reason
   * @param {string} description - Report description
   * @param {object} options - Additional options
   * @returns {Promise<object>} Report result
   */
  async submitReport(reporterId, targetUserId, targetType, targetId, reason, description, options = {}) {
    try {
      // Check for duplicate reports
      const existingReport = await Report.checkDuplicateReport(
        reporterId, targetUserId, targetType, targetId
      );

      if (existingReport) {
        return {
          success: false,
          message: 'You have already reported this content',
          reportId: existingReport._id
        };
      }

      // Create new report
      const report = new Report({
        reporterId,
        targetUserId,
        targetType,
        targetId,
        reason,
        description,
        priority: this.determineReportPriority(reason, description)
      });

      await report.save();

      // Check for auto-resolution based on duplicate reports
      const duplicateResult = await Report.autoResolveDuplicateReports(
        targetUserId, targetType, targetId, 5
      );

      if (duplicateResult.originalReport) {
        // Auto-escalate to high priority
        report.priority = 'high';
        await report.save();
      }

      logger.info(`Report submitted: ${report._id} by ${reporterId} against ${targetUserId}`);

      return {
        success: true,
        message: 'Report submitted successfully',
        reportId: report._id,
        autoResolved: duplicateResult.duplicatesResolved > 0
      };

    } catch (error) {
      logger.error('Error submitting report:', error);
      return {
        success: false,
        message: 'Failed to submit report'
      };
    }
  }

  /**
   * Block a user
   * @param {string} blockerId - User blocking
   * @param {string} blockedUserId - User being blocked
   * @param {string} reason - Block reason
   * @param {string} description - Block description
   * @returns {Promise<object>} Block result
   */
  async blockUser(blockerId, blockedUserId, reason, description) {
    try {
      const result = await BlockedUser.blockUser(blockerId, blockedUserId, reason, description);

      logger.info(`User ${blockerId} blocked user ${blockedUserId}`);

      return {
        success: true,
        message: 'User blocked successfully',
        mutual: result.mutual
      };

    } catch (error) {
      logger.error('Error blocking user:', error);
      return {
        success: false,
        message: error.message || 'Failed to block user'
      };
    }
  }

  /**
   * Unblock a user
   * @param {string} blockerId - User unblocking
   * @param {string} blockedUserId - User being unblocked
   * @returns {Promise<object>} Unblock result
   */
  async unblockUser(blockerId, blockedUserId) {
    try {
      await BlockedUser.unblockUser(blockerId, blockedUserId);

      logger.info(`User ${blockerId} unblocked user ${blockedUserId}`);

      return {
        success: true,
        message: 'User unblocked successfully'
      };

    } catch (error) {
      logger.error('Error unblocking user:', error);
      return {
        success: false,
        message: 'Failed to unblock user'
      };
    }
  }

  /**
   * Check if user is blocked
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Promise<boolean>} Is blocked
   */
  async isUserBlocked(userId1, userId2) {
    try {
      const block = await BlockedUser.isBlocked(userId1, userId2);
      return !!block;
    } catch (error) {
      logger.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Log moderation action
   * @param {string} userId - User ID
   * @param {string} targetType - Target type
   * @param {string} targetId - Target ID
   * @param {string} action - Action taken
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Log result
   */
  async logModerationAction(userId, targetType, targetId, action, metadata = {}) {
    try {
      const log = new ModerationLog({
        userId,
        targetType,
        targetId,
        action,
        reason: metadata.reason || 'Automated moderation',
        severity: this.getSeverityFromAction(action),
        category: this.getCategoryFromAction(action),
        automated: true,
        confidence: metadata.confidence || 1.0,
        metadata
      });

      await log.save();

      // Check if user should receive a strike
      if (this.isStrikeAction(action)) {
        const strikeAction = await moderationRulesEngine.determineStrikeAction(
          userId, action, metadata
        );

        // Update log with strike information
        log.metadata.strikeAction = strikeAction;
        await log.save();

        logger.info(`User ${userId} received strike: ${strikeAction.action}`);
      }

      return log;

    } catch (error) {
      logger.error('Error logging moderation action:', error);
      throw error;
    }
  }

  /**
   * Get user moderation history
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<Array>} Moderation history
   */
  async getUserModerationHistory(userId, options = {}) {
    try {
      return await ModerationLog.getUserModerationHistory(userId, options);
    } catch (error) {
      logger.error('Error getting user moderation history:', error);
      return [];
    }
  }

  /**
   * Get pending reports
   * @param {object} options - Query options
   * @returns {Promise<Array>} Pending reports
   */
  async getPendingReports(options = {}) {
    try {
      return await Report.getPendingReports(options);
    } catch (error) {
      logger.error('Error getting pending reports:', error);
      return [];
    }
  }

  /**
   * Determine report priority
   * @param {string} reason - Report reason
   * @param {string} description - Report description
   * @returns {string} Priority level
   */
  determineReportPriority(reason, description) {
    const highPriorityReasons = [
      'violence',
      'hate_speech',
      'harassment',
      'underage',
      'scam'
    ];

    if (highPriorityReasons.includes(reason)) {
      return 'high';
    }

    if (description && description.length > 100) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get severity from action
   * @param {string} action - Action type
   * @returns {string} Severity level
   */
  getSeverityFromAction(action) {
    const severityMap = {
      'warning': 'low',
      'soft_block': 'medium',
      'hard_ban': 'high',
      'user_banned': 'critical',
      'blocked_image': 'medium',
      'blocked_text': 'low'
    };

    return severityMap[action] || 'medium';
  }

  /**
   * Get category from action
   * @param {string} action - Action type
   * @returns {string} Category
   */
  getCategoryFromAction(action) {
    const categoryMap = {
      'blocked_image': 'nsfw',
      'blocked_text': 'hate_speech',
      'warning': 'other',
      'soft_block': 'harassment',
      'hard_ban': 'violence',
      'user_banned': 'violence'
    };

    return categoryMap[action] || 'other';
  }

  /**
   * Check if action is a strike
   * @param {string} action - Action type
   * @returns {boolean} Is strike action
   */
  isStrikeAction(action) {
    const strikeActions = ['warning', 'soft_block', 'hard_ban', 'user_banned'];
    return strikeActions.includes(action);
  }

  /**
   * Get moderation statistics
   * @param {string} timeframe - Timeframe for stats
   * @returns {Promise<object>} Moderation stats
   */
  async getModerationStats(timeframe = '7d') {
    try {
      const [logStats, reportStats] = await Promise.all([
        ModerationLog.getModerationStats(timeframe),
        Report.getReportStats(timeframe)
      ]);

      return {
        logs: logStats,
        reports: reportStats,
        timeframe
      };

    } catch (error) {
      logger.error('Error getting moderation stats:', error);
      return {
        logs: [],
        reports: [],
        timeframe
      };
    }
  }

  /**
   * Get service status
   * @returns {object} Service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      services: {
        faceDetection: faceDetectionService.getStatus(),
        nsfwDetection: nsfwDetectionService.getStatus(),
        textModeration: textModerationService.getStatus(),
        rulesEngine: moderationRulesEngine.getStats()
      }
    };
  }
}

module.exports = new ModerationService();