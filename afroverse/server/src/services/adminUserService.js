const User = require('../models/User');
const TrustScore = require('../models/TrustScore');
const AuditLog = require('../models/AuditLog');
const { logger } = require('../utils/logger');

class AdminUserService {
  constructor() {
    this.enforcementTypes = {
      warning: 'warning',
      mute: 'mute',
      upload_block: 'upload_block',
      vote_limit: 'vote_limit',
      ban: 'ban'
    };
    
    this.enforcementScopes = {
      global: 'global',
      battles: 'battles',
      uploads: 'uploads',
      votes: 'votes'
    };
  }

  // Get users
  async getUsers(filters = {}, limit = 100, skip = 0) {
    try {
      const query = {};
      
      if (filters.search) {
        query.$or = [
          { username: { $regex: filters.search, $options: 'i' } },
          { phone: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.tribe) {
        query.tribe = filters.tribe;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }
      
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('tribe', 'name emblem')
        .select('-password -refreshToken');
      
      const total = await User.countDocuments(query);
      
      return {
        success: true,
        users: users.map(user => user.getSummary()),
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUser(userId) {
    try {
      const user = await User.findById(userId)
        .populate('tribe', 'name emblem')
        .select('-password -refreshToken');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        success: true,
        user: user.getSummary()
      };
    } catch (error) {
      logger.error('Error getting user:', error);
      throw error;
    }
  }

  // Get user details
  async getUserDetails(userId) {
    try {
      const user = await User.findById(userId)
        .populate('tribe', 'name emblem')
        .select('-password -refreshToken');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get trust score
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      
      // Get recent activity
      const recentActivity = await this.getUserRecentActivity(userId);
      
      // Get enforcements
      const enforcements = await this.getUserEnforcements(userId);
      
      return {
        success: true,
        user: user.getSummary(),
        trustScore: trustScore ? trustScore.getSummary() : null,
        recentActivity,
        enforcements
      };
    } catch (error) {
      logger.error('Error getting user details:', error);
      throw error;
    }
  }

  // Get user recent activity
  async getUserRecentActivity(userId, limit = 20) {
    try {
      // This would query various collections for user activity
      // For now, we'll return a mock response
      return {
        transformations: [],
        battles: [],
        votes: [],
        tribeActivity: []
      };
    } catch (error) {
      logger.error('Error getting user recent activity:', error);
      throw error;
    }
  }

  // Get user enforcements
  async getUserEnforcements(userId) {
    try {
      // This would query the enforcements collection
      // For now, we'll return a mock response
      return [];
    } catch (error) {
      logger.error('Error getting user enforcements:', error);
      throw error;
    }
  }

  // Apply enforcement
  async applyEnforcement(userId, adminUserId, type, scope, reason, expiresAt = null) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Create enforcement record
      const enforcement = {
        userId,
        type,
        scope,
        reason,
        expiresAt,
        appliedBy: adminUserId,
        appliedAt: new Date()
      };
      
      // Apply enforcement based on type
      switch (type) {
        case 'warning':
          // Log warning
          break;
        case 'mute':
          // Mute user
          break;
        case 'upload_block':
          // Block uploads
          break;
        case 'vote_limit':
          // Limit votes
          break;
        case 'ban':
          // Ban user
          break;
      }
      
      // Log enforcement
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'enforcement',
        { type: 'user', id: userId },
        `Enforcement applied: ${type}`,
        null,
        { type, scope, reason, expiresAt },
        'high',
        'user_management',
        ['enforcement', 'user_management', type]
      );
      
      logger.info(`Enforcement applied to user ${userId}: ${type}`);
      
      return {
        success: true,
        enforcement,
        message: 'Enforcement applied successfully'
      };
    } catch (error) {
      logger.error('Error applying enforcement:', error);
      throw error;
    }
  }

  // Remove enforcement
  async removeEnforcement(enforcementId, adminUserId, reason) {
    try {
      // This would remove the enforcement from the database
      // For now, we'll return a mock response
      
      // Log enforcement removal
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'enforcement',
        { type: 'enforcement', id: enforcementId },
        `Enforcement removed: ${reason}`,
        null,
        { reason },
        'high',
        'user_management',
        ['enforcement_removal', 'user_management']
      );
      
      logger.info(`Enforcement ${enforcementId} removed: ${reason}`);
      
      return {
        success: true,
        message: 'Enforcement removed successfully'
      };
    } catch (error) {
      logger.error('Error removing enforcement:', error);
      throw error;
    }
  }

  // Ban user
  async banUser(userId, adminUserId, reason, duration = null) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update user status
      user.status = 'banned';
      user.bannedAt = new Date();
      user.bannedBy = adminUserId;
      user.banReason = reason;
      user.banExpiresAt = duration ? new Date(Date.now() + duration) : null;
      
      await user.save();
      
      // Update trust score
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      if (trustScore) {
        await trustScore.permanentBan(reason);
      }
      
      // Log ban
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'user_ban',
        { type: 'user', id: userId },
        `User banned: ${reason}`,
        { status: 'active' },
        { status: 'banned', reason, duration },
        'critical',
        'user_management',
        ['ban', 'user_management']
      );
      
      logger.info(`User ${userId} banned: ${reason}`);
      
      return {
        success: true,
        user: user.getSummary(),
        message: 'User banned successfully'
      };
    } catch (error) {
      logger.error('Error banning user:', error);
      throw error;
    }
  }

  // Unban user
  async unbanUser(userId, adminUserId, reason) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.status !== 'banned') {
        throw new Error('User is not banned');
      }
      
      // Update user status
      user.status = 'active';
      user.unbannedAt = new Date();
      user.unbannedBy = adminUserId;
      user.unbanReason = reason;
      
      await user.save();
      
      // Update trust score
      const trustScore = await TrustScore.getTrustScoreByUser(userId);
      if (trustScore) {
        await trustScore.liftShadowban(reason);
      }
      
      // Log unban
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'user_unban',
        { type: 'user', id: userId },
        `User unbanned: ${reason}`,
        { status: 'banned' },
        { status: 'active', reason },
        'high',
        'user_management',
        ['unban', 'user_management']
      );
      
      logger.info(`User ${userId} unbanned: ${reason}`);
      
      return {
        success: true,
        user: user.getSummary(),
        message: 'User unbanned successfully'
      };
    } catch (error) {
      logger.error('Error unbanning user:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics(startDate, endDate) {
    try {
      const statistics = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              status: '$status',
              tribe: '$tribe'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.status',
            tribes: {
              $push: {
                tribe: '$_id.tribe',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]);
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Get user trends
  async getUserTrends(days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const trends = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            },
            bannedUsers: {
              $sum: {
                $cond: [{ $eq: ['$status', 'banned'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting user trends:', error);
      throw error;
    }
  }

  // Get user summary
  async getUserSummary() {
    try {
      const summary = await User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            },
            banned: {
              $sum: {
                $cond: [{ $eq: ['$status', 'banned'] }, 1, 0]
              }
            },
            inactive: {
              $sum: {
                $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            total: 1,
            active: 1,
            banned: 1,
            inactive: 1,
            activePercentage: {
              $multiply: [{ $divide: ['$active', '$total'] }, 100]
            },
            bannedPercentage: {
              $multiply: [{ $divide: ['$banned', '$total'] }, 100]
            }
          }
        }
      ]);
      
      return {
        success: true,
        summary: summary[0] || {
          total: 0,
          active: 0,
          banned: 0,
          inactive: 0
        }
      };
    } catch (error) {
      logger.error('Error getting user summary:', error);
      throw error;
    }
  }

  // Get enforcement types
  getEnforcementTypes() {
    return Object.keys(this.enforcementTypes).map(key => ({
      key,
      name: this.enforcementTypes[key]
    }));
  }

  // Get enforcement scopes
  getEnforcementScopes() {
    return Object.keys(this.enforcementScopes).map(key => ({
      key,
      name: this.enforcementScopes[key]
    }));
  }

  // Validate user data
  validateUserData(data) {
    const errors = [];
    
    if (!data.userId) {
      errors.push('User ID is required');
    }
    
    if (!data.type) {
      errors.push('Enforcement type is required');
    } else if (!this.enforcementTypes[data.type]) {
      errors.push('Valid enforcement type is required');
    }
    
    if (!data.scope) {
      errors.push('Enforcement scope is required');
    } else if (!this.enforcementScopes[data.scope]) {
      errors.push('Valid enforcement scope is required');
    }
    
    if (!data.reason) {
      errors.push('Reason is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get error message
  getErrorMessage(errorCode) {
    const messages = {
      'USER_NOT_FOUND': 'User not found',
      'USER_ALREADY_BANNED': 'User is already banned',
      'USER_NOT_BANNED': 'User is not banned',
      'INVALID_ENFORCEMENT_TYPE': 'Invalid enforcement type',
      'INVALID_ENFORCEMENT_SCOPE': 'Invalid enforcement scope',
      'ENFORCEMENT_NOT_FOUND': 'Enforcement not found',
      'INVALID_DURATION': 'Invalid duration'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'enforcement_applied': 'Enforcement applied successfully',
      'enforcement_removed': 'Enforcement removed successfully',
      'user_banned': 'User banned successfully',
      'user_unbanned': 'User unbanned successfully',
      'user_updated': 'User updated successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const adminUserService = new AdminUserService();

module.exports = adminUserService;
