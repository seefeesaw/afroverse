const moderationService = require('../services/moderationService');
const { logger } = require('../utils/logger');

/**
 * Middleware to moderate image uploads
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {Function} next - Next middleware function
 */
const moderateImageUpload = async (req, res, next) => {
  try {
    // Check if file exists
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user.id;
    const imageBuffer = req.file.buffer;

    // Moderate the image
    const moderationResult = await moderationService.moderateImageUpload(imageBuffer, userId);

    // If not allowed, return error
    if (!moderationResult.allowed) {
      return res.status(400).json({
        success: false,
        message: moderationResult.reason,
        violations: moderationResult.violations,
        warnings: moderationResult.warnings,
        processingTime: moderationResult.processingTime
      });
    }

    // Add moderation result to request for downstream use
    req.moderationResult = moderationResult;

    // Continue to next middleware
    next();

  } catch (error) {
    logger.error('Error in image moderation middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Image moderation failed'
    });
  }
};

/**
 * Middleware to moderate text content
 * @param {string} fieldName - Name of the field containing text
 * @param {string} contentType - Type of content being moderated
 * @returns {Function} Middleware function
 */
const moderateTextContent = (fieldName, contentType = 'text') => {
  return async (req, res, next) => {
    try {
      const text = req.body[fieldName];
      
      // Skip if no text provided
      if (!text) {
        return next();
      }

      const userId = req.user.id;

      // Moderate the text
      const moderationResult = await moderationService.moderateTextContent(
        text,
        userId,
        contentType
      );

      // If not allowed, return error
      if (!moderationResult.allowed) {
        return res.status(400).json({
          success: false,
          message: moderationResult.reason,
          violations: moderationResult.violations,
          warnings: moderationResult.warnings,
          sanitized: moderationResult.sanitized,
          processingTime: moderationResult.processingTime
        });
      }

      // Replace original text with sanitized version if needed
      if (moderationResult.sanitized !== text) {
        req.body[fieldName] = moderationResult.sanitized;
      }

      // Add moderation result to request
      req.moderationResult = moderationResult;

      // Continue to next middleware
      next();

    } catch (error) {
      logger.error('Error in text moderation middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Text moderation failed'
      });
    }
  };
};

/**
 * Middleware to check if user is blocked
 * @param {string} targetUserIdParam - Parameter name containing target user ID
 * @returns {Function} Middleware function
 */
const checkUserBlock = (targetUserIdParam = 'userId') => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const targetUserId = req.params[targetUserIdParam] || req.body[targetUserIdParam];

      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'Target user ID is required'
        });
      }

      // Check if user is blocked
      const isBlocked = await moderationService.isUserBlocked(userId, targetUserId);

      if (isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'You cannot interact with this user'
        });
      }

      // Continue to next middleware
      next();

    } catch (error) {
      logger.error('Error in user block check middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check user block status'
      });
    }
  };
};

/**
 * Middleware to validate username
 * @returns {Function} Middleware function
 */
const validateUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return next();
    }

    const userId = req.user.id;

    // Moderate the username
    const moderationResult = await moderationService.moderateTextContent(
      username,
      userId,
      'username'
    );

    // If not allowed, return error
    if (!moderationResult.allowed) {
      return res.status(400).json({
        success: false,
        message: moderationResult.reason,
        violations: moderationResult.violations,
        warnings: moderationResult.warnings,
        sanitized: moderationResult.sanitized
      });
    }

    // Replace with sanitized username if needed
    if (moderationResult.sanitized !== username) {
      req.body.username = moderationResult.sanitized;
    }

    // Add moderation result to request
    req.moderationResult = moderationResult;

    // Continue to next middleware
    next();

  } catch (error) {
    logger.error('Error in username validation middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Username validation failed'
    });
  }
};

/**
 * Middleware to validate tribe name
 * @returns {Function} Middleware function
 */
const validateTribeName = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return next();
    }

    const userId = req.user.id;

    // Moderate the tribe name
    const moderationResult = await moderationService.moderateTextContent(
      name,
      userId,
      'tribe_name'
    );

    // If not allowed, return error
    if (!moderationResult.allowed) {
      return res.status(400).json({
        success: false,
        message: moderationResult.reason,
        violations: moderationResult.violations,
        warnings: moderationResult.warnings,
        sanitized: moderationResult.sanitized
      });
    }

    // Replace with sanitized tribe name if needed
    if (moderationResult.sanitized !== name) {
      req.body.name = moderationResult.sanitized;
    }

    // Add moderation result to request
    req.moderationResult = moderationResult;

    // Continue to next middleware
    next();

  } catch (error) {
    logger.error('Error in tribe name validation middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Tribe name validation failed'
    });
  }
};

/**
 * Middleware to check user moderation status
 * @returns {Function} Middleware function
 */
const checkModerationStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user has active moderation actions
    const ModerationLog = require('../models/ModerationLog');
    const activeActions = await ModerationLog.getActiveModerationActions(userId);

    // Check for restrictions
    for (const action of activeActions) {
      const cooldownPeriods = {
        'soft_block': 24 * 60 * 60 * 1000, // 24 hours
        'hard_ban': 7 * 24 * 60 * 60 * 1000, // 7 days
        'user_banned': Infinity
      };

      const cooldownPeriod = cooldownPeriods[action.action] || 0;
      const timeSinceAction = Date.now() - action.createdAt.getTime();

      if (timeSinceAction < cooldownPeriod) {
        return res.status(403).json({
          success: false,
          message: `Your account is currently restricted due to: ${action.reason}`,
          restriction: {
            action: action.action,
            reason: action.reason,
            expiresAt: new Date(action.createdAt.getTime() + cooldownPeriod)
          }
        });
      }
    }

    // Continue to next middleware
    next();

  } catch (error) {
    logger.error('Error in moderation status check middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check moderation status'
    });
  }
};

module.exports = {
  moderateImageUpload,
  moderateTextContent,
  checkUserBlock,
  validateUsername,
  validateTribeName,
  checkModerationStatus
};