const fraudDetectionService = require('../services/fraudDetectionService');
const trustScoreService = require('../services/trustScoreService');
const aiModerationService = require('../services/aiModerationService');
const deviceFingerprintService = require('../services/deviceFingerprintService');
const { logger } = require('../utils/logger');

// Get fraud detections by user
const getFraudDetectionsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;
    
    const result = await fraudDetectionService.getFraudDetectionsByUser(userId, parseInt(limit));
    
    res.json({
      success: true,
      fraudDetections: result.fraudDetections
    });
  } catch (error) {
    logger.error('Error getting fraud detections by user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fraud detections'
    });
  }
};

// Get pending fraud detections
const getPendingFraudDetections = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const result = await fraudDetectionService.getPendingFraudDetections(parseInt(limit));
    
    res.json({
      success: true,
      fraudDetections: result.fraudDetections
    });
  } catch (error) {
    logger.error('Error getting pending fraud detections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending fraud detections'
    });
  }
};

// Get fraud detection statistics
const getFraudDetectionStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const result = await fraudDetectionService.getFraudDetectionStatistics(start, end);
    
    res.json({
      success: true,
      statistics: result.statistics
    });
  } catch (error) {
    logger.error('Error getting fraud detection statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fraud detection statistics'
    });
  }
};

// Get fraud detection trends
const getFraudDetectionTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await fraudDetectionService.getFraudDetectionTrends(parseInt(days));
    
    res.json({
      success: true,
      trends: result.trends
    });
  } catch (error) {
    logger.error('Error getting fraud detection trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fraud detection trends'
    });
  }
};

// Get fraud detection performance
const getFraudDetectionPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const result = await fraudDetectionService.getFraudDetectionPerformance(start, end);
    
    res.json({
      success: true,
      performance: result.performance
    });
  } catch (error) {
    logger.error('Error getting fraud detection performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fraud detection performance'
    });
  }
};

// Get trust score by user
const getTrustScoreByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await trustScoreService.getTrustScoreByUser(userId);
    
    res.json({
      success: true,
      trustScore: result.trustScore
    });
  } catch (error) {
    logger.error('Error getting trust score by user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trust score'
    });
  }
};

// Update trust score
const updateTrustScore = async (req, res) => {
  try {
    const { userId, points, reason, action, metadata } = req.body;
    
    if (!userId || !points || !reason || !action) {
      return res.status(400).json({
        success: false,
        message: 'User ID, points, reason, and action are required'
      });
    }
    
    const result = await trustScoreService.updateTrustScore(userId, points, reason, action, metadata);
    
    res.json({
      success: true,
      trustScore: result.trustScore,
      message: 'Trust score updated successfully'
    });
  } catch (error) {
    logger.error('Error updating trust score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trust score'
    });
  }
};

// Shadowban user
const shadowbanUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    if (!userId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID and reason are required'
      });
    }
    
    const result = await trustScoreService.shadowbanUser(userId, reason);
    
    res.json({
      success: true,
      trustScore: result.trustScore,
      message: 'User shadowbanned successfully'
    });
  } catch (error) {
    logger.error('Error shadowbanning user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to shadowban user'
    });
  }
};

// Lift shadowban
const liftShadowban = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    if (!userId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID and reason are required'
      });
    }
    
    const result = await trustScoreService.liftShadowban(userId, reason);
    
    res.json({
      success: true,
      trustScore: result.trustScore,
      message: 'Shadowban lifted successfully'
    });
  } catch (error) {
    logger.error('Error lifting shadowban:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lift shadowban'
    });
  }
};

// Temporarily ban user
const temporaryBanUser = async (req, res) => {
  try {
    const { userId, duration, reason } = req.body;
    
    if (!userId || !duration || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID, duration, and reason are required'
      });
    }
    
    const result = await trustScoreService.temporaryBanUser(userId, duration, reason);
    
    res.json({
      success: true,
      trustScore: result.trustScore,
      message: 'User temporarily banned successfully'
    });
  } catch (error) {
    logger.error('Error temporarily banning user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to temporarily ban user'
    });
  }
};

// Permanently ban user
const permanentBanUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    if (!userId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID and reason are required'
      });
    }
    
    const result = await trustScoreService.permanentBanUser(userId, reason);
    
    res.json({
      success: true,
      trustScore: result.trustScore,
      message: 'User permanently banned successfully'
    });
  } catch (error) {
    logger.error('Error permanently banning user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently ban user'
    });
  }
};

// Get low trust users
const getLowTrustUsers = async (req, res) => {
  try {
    const { threshold = 30, limit = 100 } = req.query;
    
    const result = await trustScoreService.getLowTrustUsers(parseInt(threshold), parseInt(limit));
    
    res.json({
      success: true,
      users: result.users
    });
  } catch (error) {
    logger.error('Error getting low trust users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low trust users'
    });
  }
};

// Get shadowbanned users
const getShadowbannedUsers = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const result = await trustScoreService.getShadowbannedUsers(parseInt(limit));
    
    res.json({
      success: true,
      users: result.users
    });
  } catch (error) {
    logger.error('Error getting shadowbanned users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shadowbanned users'
    });
  }
};

// Get trust score statistics
const getTrustScoreStatistics = async (req, res) => {
  try {
    const result = await trustScoreService.getTrustScoreStatistics();
    
    res.json({
      success: true,
      statistics: result.statistics
    });
  } catch (error) {
    logger.error('Error getting trust score statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trust score statistics'
    });
  }
};

// Get trust score summary
const getTrustScoreSummary = async (req, res) => {
  try {
    const result = await trustScoreService.getTrustScoreSummary();
    
    res.json({
      success: true,
      summary: result.summary
    });
  } catch (error) {
    logger.error('Error getting trust score summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trust score summary'
    });
  }
};

// Get moderation logs by user
const getModerationLogsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;
    
    const result = await aiModerationService.getModerationLogsByUser(userId, parseInt(limit));
    
    res.json({
      success: true,
      moderationLogs: result.moderationLogs
    });
  } catch (error) {
    logger.error('Error getting moderation logs by user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation logs'
    });
  }
};

// Get pending moderation logs
const getPendingModerationLogs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const result = await aiModerationService.getPendingModerationLogs(parseInt(limit));
    
    res.json({
      success: true,
      moderationLogs: result.moderationLogs
    });
  } catch (error) {
    logger.error('Error getting pending moderation logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending moderation logs'
    });
  }
};

// Get moderation statistics
const getModerationStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const result = await aiModerationService.getModerationStatistics(start, end);
    
    res.json({
      success: true,
      statistics: result.statistics
    });
  } catch (error) {
    logger.error('Error getting moderation statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation statistics'
    });
  }
};

// Get device fingerprints by user
const getDeviceFingerprintsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await deviceFingerprintService.getDeviceFingerprintsByUser(userId);
    
    res.json({
      success: true,
      deviceFingerprints: result.deviceFingerprints
    });
  } catch (error) {
    logger.error('Error getting device fingerprints by user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device fingerprints'
    });
  }
};

// Get suspicious devices
const getSuspiciousDevices = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const result = await deviceFingerprintService.getSuspiciousDevices(parseInt(limit));
    
    res.json({
      success: true,
      devices: result.devices
    });
  } catch (error) {
    logger.error('Error getting suspicious devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suspicious devices'
    });
  }
};

// Get multi-account devices
const getMultiAccountDevices = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const result = await deviceFingerprintService.getMultiAccountDevices(parseInt(limit));
    
    res.json({
      success: true,
      devices: result.devices
    });
  } catch (error) {
    logger.error('Error getting multi-account devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get multi-account devices'
    });
  }
};

// Get device fingerprint statistics
const getDeviceFingerprintStatistics = async (req, res) => {
  try {
    const result = await deviceFingerprintService.getDeviceFingerprintStatistics();
    
    res.json({
      success: true,
      statistics: result.statistics
    });
  } catch (error) {
    logger.error('Error getting device fingerprint statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device fingerprint statistics'
    });
  }
};

// Get fraud detection options
const getFraudDetectionOptions = async (req, res) => {
  try {
    const options = {
      types: fraudDetectionService.getFraudDetectionTypes(),
      severities: fraudDetectionService.getFraudDetectionSeverities(),
      actions: fraudDetectionService.getFraudDetectionActions(),
      trustLevels: trustScoreService.getTrustScoreLevels(),
      trustActions: trustScoreService.getTrustScoreActions(),
      violationTypes: aiModerationService.getViolationTypes(),
      detectionMethods: aiModerationService.getDetectionMethods(),
      platforms: deviceFingerprintService.getPlatforms(),
      flags: deviceFingerprintService.getFlags()
    };
    
    res.json({
      success: true,
      options
    });
  } catch (error) {
    logger.error('Error getting fraud detection options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fraud detection options'
    });
  }
};

// Test fraud detection
const testFraudDetection = async (req, res) => {
  try {
    const { type, userId, data } = req.body;
    
    if (!type || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Type and user ID are required'
      });
    }
    
    let result;
    
    switch (type) {
      case 'vote_fraud':
        result = await fraudDetectionService.detectVoteFraud(userId, data.battleId, data.deviceId, data.ipAddress, data.geoData);
        break;
      case 'multi_account':
        result = await fraudDetectionService.detectMultiAccount(userId, data.deviceId, data.ipAddress, data.geoData);
        break;
      case 'nsfw_content':
        result = await fraudDetectionService.detectNSFWContent(userId, data.imageUrl, data.contentType, data.contentId);
        break;
      case 'spam_battle':
        result = await fraudDetectionService.detectSpamBattle(userId, data.battleData);
        break;
      case 'ai_abuse':
        result = await fraudDetectionService.detectAIAbuse(userId, data.prompt, data.style, data.imageUrl);
        break;
      case 'suspicious_activity':
        result = await fraudDetectionService.detectSuspiciousActivity(userId, data.activityType, data.metadata);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid fraud detection type'
        });
    }
    
    res.json({
      success: true,
      result,
      message: 'Fraud detection test completed'
    });
  } catch (error) {
    logger.error('Error testing fraud detection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test fraud detection'
    });
  }
};

module.exports = {
  getFraudDetectionsByUser,
  getPendingFraudDetections,
  getFraudDetectionStatistics,
  getFraudDetectionTrends,
  getFraudDetectionPerformance,
  getTrustScoreByUser,
  updateTrustScore,
  shadowbanUser,
  liftShadowban,
  temporaryBanUser,
  permanentBanUser,
  getLowTrustUsers,
  getShadowbannedUsers,
  getTrustScoreStatistics,
  getTrustScoreSummary,
  getModerationLogsByUser,
  getPendingModerationLogs,
  getModerationStatistics,
  getDeviceFingerprintsByUser,
  getSuspiciousDevices,
  getMultiAccountDevices,
  getDeviceFingerprintStatistics,
  getFraudDetectionOptions,
  testFraudDetection
};
