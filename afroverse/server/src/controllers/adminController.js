const adminAuthService = require('../services/adminAuthService');
const adminModerationService = require('../services/adminModerationService');
const adminFraudService = require('../services/adminFraudService');
const adminUserService = require('../services/adminUserService');
const adminTribeService = require('../services/adminTribeService');
const adminAuditService = require('../services/adminAuditService');
const { logger } = require('../utils/logger');

// Admin authentication controllers
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const result = await adminAuthService.login(email, password, req.ip, req.headers['user-agent']);
    
    res.json(result);
  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

const loginWithMagicLink = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Magic link token is required'
      });
    }
    
    const result = await adminAuthService.loginWithMagicLink(token, req.ip, req.headers['user-agent']);
    
    res.json(result);
  } catch (error) {
    logger.error('Admin magic link login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Magic link login failed'
    });
  }
};

const verifyTwoFA = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: '2FA token is required'
      });
    }
    
    const result = await adminAuthService.verifyTwoFA(req.admin._id, token);
    
    res.json(result);
  } catch (error) {
    logger.error('2FA verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message || '2FA verification failed'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    const result = await adminAuthService.refreshToken(refreshToken);
    
    res.json(result);
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed'
    });
  }
};

const logout = async (req, res) => {
  try {
    const result = await adminAuthService.logout(req.admin._id, req.ip, req.headers['user-agent']);
    
    res.json(result);
  } catch (error) {
    logger.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Logout failed'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await adminAuthService.getProfile(req.admin._id);
    
    res.json(result);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const result = await adminAuthService.updateProfile(req.admin._id, req.body);
    
    res.json(result);
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// Admin moderation controllers
const getModerationQueue = async (req, res) => {
  try {
    const result = await adminModerationService.getModerationQueue(req.query, req.query.limit, req.query.skip);
    
    res.json(result);
  } catch (error) {
    logger.error('Get moderation queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation queue'
    });
  }
};

const getModerationJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const result = await adminModerationService.getModerationJob(jobId);
    
    res.json(result);
  } catch (error) {
    logger.error('Get moderation job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get moderation job'
    });
  }
};

const assignModerationJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const result = await adminModerationService.assignModerationJob(jobId, req.admin._id);
    
    res.json(result);
  } catch (error) {
    logger.error('Assign moderation job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign moderation job'
    });
  }
};

const makeModerationDecision = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { decision, reason, notes } = req.body;
    
    if (!decision || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Decision and reason are required'
      });
    }
    
    const result = await adminModerationService.makeModerationDecision(jobId, req.admin._id, decision, reason, notes);
    
    res.json(result);
  } catch (error) {
    logger.error('Make moderation decision error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to make moderation decision'
    });
  }
};

const escalateModerationJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason, priority } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }
    
    const result = await adminModerationService.escalateModerationJob(jobId, req.admin._id, reason, priority);
    
    res.json(result);
  } catch (error) {
    logger.error('Escalate moderation job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to escalate moderation job'
    });
  }
};

const resolveAppeal = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { resolution, reason } = req.body;
    
    if (!resolution || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Resolution and reason are required'
      });
    }
    
    const result = await adminModerationService.resolveAppeal(jobId, req.admin._id, resolution, reason);
    
    res.json(result);
  } catch (error) {
    logger.error('Resolve appeal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve appeal'
    });
  }
};

// Admin fraud controllers
const getFraudDetections = async (req, res) => {
  try {
    const result = await adminFraudService.getFraudDetections(req.query, req.query.limit, req.query.skip);
    
    res.json(result);
  } catch (error) {
    logger.error('Get fraud detections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fraud detections'
    });
  }
};

const getFraudDetection = async (req, res) => {
  try {
    const { fraudDetectionId } = req.params;
    
    const result = await adminFraudService.getFraudDetection(fraudDetectionId);
    
    res.json(result);
  } catch (error) {
    logger.error('Get fraud detection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get fraud detection'
    });
  }
};

const reviewFraudDetection = async (req, res) => {
  try {
    const { fraudDetectionId } = req.params;
    const { action, notes } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }
    
    const result = await adminFraudService.reviewFraudDetection(fraudDetectionId, req.admin._id, action, notes);
    
    res.json(result);
  } catch (error) {
    logger.error('Review fraud detection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to review fraud detection'
    });
  }
};

const shadowbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }
    
    const result = await adminFraudService.shadowbanUser(userId, req.admin._id, reason);
    
    res.json(result);
  } catch (error) {
    logger.error('Shadowban user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to shadowban user'
    });
  }
};

const liftShadowban = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }
    
    const result = await adminFraudService.liftShadowban(userId, req.admin._id, reason);
    
    res.json(result);
  } catch (error) {
    logger.error('Lift shadowban error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to lift shadowban'
    });
  }
};

// Admin user management controllers
const getUsers = async (req, res) => {
  try {
    const result = await adminUserService.getUsers(req.query, req.query.limit, req.query.skip);
    
    res.json(result);
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await adminUserService.getUser(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user'
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await adminUserService.getUserDetails(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user details'
    });
  }
};

const applyEnforcement = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, scope, reason, expiresAt } = req.body;
    
    if (!type || !scope || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Type, scope, and reason are required'
      });
    }
    
    const result = await adminUserService.applyEnforcement(userId, req.admin._id, type, scope, reason, expiresAt);
    
    res.json(result);
  } catch (error) {
    logger.error('Apply enforcement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply enforcement'
    });
  }
};

const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }
    
    const result = await adminUserService.banUser(userId, req.admin._id, reason, duration);
    
    res.json(result);
  } catch (error) {
    logger.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to ban user'
    });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }
    
    const result = await adminUserService.unbanUser(userId, req.admin._id, reason);
    
    res.json(result);
  } catch (error) {
    logger.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unban user'
    });
  }
};

// Admin tribe management controllers
const getTribes = async (req, res) => {
  try {
    const result = await adminTribeService.getTribes(req.query, req.query.limit, req.query.skip);
    
    res.json(result);
  } catch (error) {
    logger.error('Get tribes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tribes'
    });
  }
};

const getTribe = async (req, res) => {
  try {
    const { tribeId } = req.params;
    
    const result = await adminTribeService.getTribe(tribeId);
    
    res.json(result);
  } catch (error) {
    logger.error('Get tribe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tribe'
    });
  }
};

const updateTribe = async (req, res) => {
  try {
    const { tribeId } = req.params;
    
    const result = await adminTribeService.updateTribe(tribeId, req.admin._id, req.body);
    
    res.json(result);
  } catch (error) {
    logger.error('Update tribe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update tribe'
    });
  }
};

const changeTribeCaptain = async (req, res) => {
  try {
    const { tribeId } = req.params;
    const { newCaptainId, reason } = req.body;
    
    if (!newCaptainId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'New captain ID and reason are required'
      });
    }
    
    const result = await adminTribeService.changeTribeCaptain(tribeId, req.admin._id, newCaptainId, reason);
    
    res.json(result);
  } catch (error) {
    logger.error('Change tribe captain error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change tribe captain'
    });
  }
};

// Admin audit controllers
const getAuditLogs = async (req, res) => {
  try {
    const result = await adminAuditService.getAuditLogs(req.query, req.query.limit, req.query.skip);
    
    res.json(result);
  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs'
    });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const { auditLogId } = req.params;
    
    const result = await adminAuditService.getAuditLog(auditLogId);
    
    res.json(result);
  } catch (error) {
    logger.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get audit log'
    });
  }
};

const reverseAuditLog = async (req, res) => {
  try {
    const { auditLogId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }
    
    const result = await adminAuditService.reverseAuditLog(auditLogId, req.admin._id, reason);
    
    res.json(result);
  } catch (error) {
    logger.error('Reverse audit log error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reverse audit log'
    });
  }
};

// Admin dashboard controllers
const getDashboard = async (req, res) => {
  try {
    // Get various statistics for dashboard
    const [
      moderationSummary,
      fraudSummary,
      userSummary,
      tribeSummary,
      auditSummary
    ] = await Promise.all([
      adminModerationService.getModerationJobSummary(),
      adminFraudService.getFraudSummary(),
      adminUserService.getUserSummary(),
      adminTribeService.getTribeSummary(),
      adminAuditService.getAuditSummary()
    ]);
    
    const dashboard = {
      moderation: moderationSummary.summary,
      fraud: fraudSummary.summary,
      users: userSummary.summary,
      tribes: tribeSummary.summary,
      audit: auditSummary.summary,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      dashboard
    });
  } catch (error) {
    logger.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
};

module.exports = {
  // Authentication
  login,
  loginWithMagicLink,
  verifyTwoFA,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  
  // Moderation
  getModerationQueue,
  getModerationJob,
  assignModerationJob,
  makeModerationDecision,
  escalateModerationJob,
  resolveAppeal,
  
  // Fraud
  getFraudDetections,
  getFraudDetection,
  reviewFraudDetection,
  shadowbanUser,
  liftShadowban,
  
  // User Management
  getUsers,
  getUser,
  getUserDetails,
  applyEnforcement,
  banUser,
  unbanUser,
  
  // Tribe Management
  getTribes,
  getTribe,
  updateTribe,
  changeTribeCaptain,
  
  // Audit
  getAuditLogs,
  getAuditLog,
  reverseAuditLog,
  
  // Dashboard
  getDashboard
};
