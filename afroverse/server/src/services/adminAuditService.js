const AuditLog = require('../models/AuditLog');
const AdminUser = require('../models/AdminUser');
const { logger } = require('../utils/logger');

class AdminAuditService {
  constructor() {
    this.actions = {
      moderation_decision: 'moderation_decision',
      enforcement: 'enforcement',
      tribe_edit: 'tribe_edit',
      leaderboard_adjust: 'leaderboard_adjust',
      entitlement_change: 'entitlement_change',
      config_update: 'config_update',
      user_ban: 'user_ban',
      user_unban: 'user_unban',
      fraud_action: 'fraud_action',
      appeal_resolution: 'appeal_resolution',
      admin_login: 'admin_login',
      admin_logout: 'admin_logout',
      role_change: 'role_change',
      permission_change: 'permission_change',
      system_event: 'system_event'
    };
    
    this.categories = {
      moderation: 'moderation',
      fraud: 'fraud',
      user_management: 'user_management',
      tribe_management: 'tribe_management',
      system: 'system',
      security: 'security'
    };
    
    this.severities = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical'
    };
  }

  // Get audit logs
  async getAuditLogs(filters = {}, limit = 100, skip = 0) {
    try {
      const query = {};
      
      if (filters.actor) {
        query['actor.id'] = filters.actor;
      }
      
      if (filters.action) {
        query.action = filters.action;
      }
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.severity) {
        query.severity = filters.severity;
      }
      
      if (filters.targetType) {
        query['target.type'] = filters.targetType;
      }
      
      if (filters.targetId) {
        query['target.id'] = filters.targetId;
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
      
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      
      const auditLogs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor.id', 'email name role')
        .populate('reversedBy', 'email name role');
      
      const total = await AuditLog.countDocuments(query);
      
      return {
        success: true,
        auditLogs: auditLogs.map(log => log.getSummary()),
        total,
        hasMore: skip + limit < total
      };
    } catch (error) {
      logger.error('Error getting audit logs:', error);
      throw error;
    }
  }

  // Get audit log by ID
  async getAuditLog(auditLogId) {
    try {
      const auditLog = await AuditLog.findById(auditLogId)
        .populate('actor.id', 'email name role')
        .populate('reversedBy', 'email name role');
      
      if (!auditLog) {
        throw new Error('Audit log not found');
      }
      
      return {
        success: true,
        auditLog: auditLog.getDetails()
      };
    } catch (error) {
      logger.error('Error getting audit log:', error);
      throw error;
    }
  }

  // Get audit logs by actor
  async getAuditLogsByActor(actorType, actorId, limit = 100) {
    try {
      const auditLogs = await AuditLog.getAuditLogsByActor(actorType, actorId, limit);
      
      return {
        success: true,
        auditLogs: auditLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting audit logs by actor:', error);
      throw error;
    }
  }

  // Get audit logs by target
  async getAuditLogsByTarget(targetType, targetId, limit = 100) {
    try {
      const auditLogs = await AuditLog.getAuditLogsByTarget(targetType, targetId, limit);
      
      return {
        success: true,
        auditLogs: auditLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting audit logs by target:', error);
      throw error;
    }
  }

  // Get audit logs by action
  async getAuditLogsByAction(action, limit = 100) {
    try {
      const auditLogs = await AuditLog.getAuditLogsByAction(action, limit);
      
      return {
        success: true,
        auditLogs: auditLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting audit logs by action:', error);
      throw error;
    }
  }

  // Get audit logs by category
  async getAuditLogsByCategory(category, limit = 100) {
    try {
      const auditLogs = await AuditLog.getAuditLogsByCategory(category, limit);
      
      return {
        success: true,
        auditLogs: auditLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting audit logs by category:', error);
      throw error;
    }
  }

  // Get audit logs by severity
  async getAuditLogsBySeverity(severity, limit = 100) {
    try {
      const auditLogs = await AuditLog.getAuditLogsBySeverity(severity, limit);
      
      return {
        success: true,
        auditLogs: auditLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting audit logs by severity:', error);
      throw error;
    }
  }

  // Get audit logs by date range
  async getAuditLogsByDateRange(startDate, endDate, limit = 100) {
    try {
      const auditLogs = await AuditLog.getAuditLogsByDateRange(startDate, endDate, limit);
      
      return {
        success: true,
        auditLogs: auditLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting audit logs by date range:', error);
      throw error;
    }
  }

  // Get audit logs by tag
  async getAuditLogsByTag(tag, limit = 100) {
    try {
      const auditLogs = await AuditLog.getAuditLogsByTag(tag, limit);
      
      return {
        success: true,
        auditLogs: auditLogs.map(log => log.getSummary())
      };
    } catch (error) {
      logger.error('Error getting audit logs by tag:', error);
      throw error;
    }
  }

  // Reverse audit log
  async reverseAuditLog(auditLogId, adminUserId, reason) {
    try {
      const auditLog = await AuditLog.findById(auditLogId);
      
      if (!auditLog) {
        throw new Error('Audit log not found');
      }
      
      if (!auditLog.isReversible) {
        throw new Error('Audit log is not reversible');
      }
      
      if (auditLog.reversedAt) {
        throw new Error('Audit log is already reversed');
      }
      
      await auditLog.reverse(adminUserId, reason);
      
      // Log reversal
      await AuditLog.createAuditLog(
        { type: 'admin', id: adminUserId },
        'system_event',
        { type: 'audit', id: auditLogId },
        `Audit log reversed: ${reason}`,
        null,
        { reason },
        'high',
        'system',
        ['reversal', 'audit']
      );
      
      logger.info(`Audit log ${auditLogId} reversed by admin ${adminUserId}: ${reason}`);
      
      return {
        success: true,
        auditLog: auditLog.getSummary(),
        message: 'Audit log reversed successfully'
      };
    } catch (error) {
      logger.error('Error reversing audit log:', error);
      throw error;
    }
  }

  // Get audit statistics
  async getAuditStatistics(startDate, endDate) {
    try {
      const statistics = await AuditLog.getAuditLogStatistics(startDate, endDate);
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting audit statistics:', error);
      throw error;
    }
  }

  // Get audit trends
  async getAuditTrends(days = 30) {
    try {
      const trends = await AuditLog.getAuditLogTrends(days);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting audit trends:', error);
      throw error;
    }
  }

  // Get audit performance
  async getAuditPerformance(startDate, endDate) {
    try {
      const performance = await AuditLog.getAuditLogPerformance(startDate, endDate);
      
      return {
        success: true,
        performance
      };
    } catch (error) {
      logger.error('Error getting audit performance:', error);
      throw error;
    }
  }

  // Get audit summary
  async getAuditSummary() {
    try {
      const summary = await AuditLog.getAuditLogSummary();
      
      return {
        success: true,
        summary: summary[0] || {
          total: 0,
          moderation: 0,
          fraud: 0,
          userManagement: 0,
          tribeManagement: 0,
          system: 0,
          security: 0,
          reversible: 0,
          reversed: 0
        }
      };
    } catch (error) {
      logger.error('Error getting audit summary:', error);
      throw error;
    }
  }

  // Get audit log actions
  getAuditLogActions() {
    return Object.keys(this.actions).map(key => ({
      key,
      name: this.actions[key]
    }));
  }

  // Get audit log categories
  getAuditLogCategories() {
    return Object.keys(this.categories).map(key => ({
      key,
      name: this.categories[key]
    }));
  }

  // Get audit log severities
  getAuditLogSeverities() {
    return Object.keys(this.severities).map(key => ({
      key,
      name: this.severities[key]
    }));
  }

  // Get audit log target types
  getAuditLogTargetTypes() {
    return [
      { key: 'user', name: 'User', description: 'User-related actions' },
      { key: 'battle', name: 'Battle', description: 'Battle-related actions' },
      { key: 'transform', name: 'Transform', description: 'Transform-related actions' },
      { key: 'tribe', name: 'Tribe', description: 'Tribe-related actions' },
      { key: 'leaderboard', name: 'Leaderboard', description: 'Leaderboard-related actions' },
      { key: 'config', name: 'Config', description: 'Configuration-related actions' },
      { key: 'admin', name: 'Admin', description: 'Admin-related actions' },
      { key: 'system', name: 'System', description: 'System-related actions' }
    ];
  }

  // Get audit log tags
  getAuditLogTags() {
    return [
      { key: 'login', name: 'Login', description: 'Login-related actions' },
      { key: 'logout', name: 'Logout', description: 'Logout-related actions' },
      { key: 'moderation', name: 'Moderation', description: 'Moderation-related actions' },
      { key: 'fraud', name: 'Fraud', description: 'Fraud-related actions' },
      { key: 'enforcement', name: 'Enforcement', description: 'Enforcement-related actions' },
      { key: 'tribe', name: 'Tribe', description: 'Tribe-related actions' },
      { key: 'user_management', name: 'User Management', description: 'User management actions' },
      { key: 'system', name: 'System', description: 'System-related actions' },
      { key: 'security', name: 'Security', description: 'Security-related actions' },
      { key: 'reversal', name: 'Reversal', description: 'Reversal-related actions' }
    ];
  }

  // Validate audit data
  validateAuditData(data) {
    const errors = [];
    
    if (!data.auditLogId) {
      errors.push('Audit log ID is required');
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
      'AUDIT_LOG_NOT_FOUND': 'Audit log not found',
      'AUDIT_LOG_NOT_REVERSIBLE': 'Audit log is not reversible',
      'AUDIT_LOG_ALREADY_REVERSED': 'Audit log is already reversed',
      'INVALID_AUDIT_LOG_ID': 'Invalid audit log ID',
      'INVALID_REASON': 'Invalid reason'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'audit_log_reversed': 'Audit log reversed successfully',
      'audit_log_created': 'Audit log created successfully',
      'audit_log_updated': 'Audit log updated successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const adminAuditService = new AdminAuditService();

module.exports = adminAuditService;
