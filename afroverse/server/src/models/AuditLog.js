const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: {
      type: String,
      enum: ['admin', 'system'],
      required: true,
      index: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null
    },
    email: {
      type: String,
      default: null
    }
  },
  action: {
    type: String,
    enum: [
      'moderation_decision',
      'enforcement',
      'tribe_edit',
      'leaderboard_adjust',
      'entitlement_change',
      'config_update',
      'user_ban',
      'user_unban',
      'fraud_action',
      'appeal_resolution',
      'admin_login',
      'admin_logout',
      'role_change',
      'permission_change',
      'system_event'
    ],
    required: true,
    index: true
  },
  target: {
    type: {
      type: String,
      enum: ['user', 'battle', 'transform', 'tribe', 'leaderboard', 'config', 'admin', 'system'],
      required: true,
      index: true
    },
    id: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      default: null
    }
  },
  before: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  after: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  reason: {
    type: String,
    required: true
  },
  metadata: {
    ip: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    sessionId: {
      type: String,
      default: null
    },
    requestId: {
      type: String,
      default: null
    },
    additional: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  category: {
    type: String,
    enum: ['moderation', 'fraud', 'user_management', 'tribe_management', 'system', 'security'],
    required: true,
    index: true
  },
  tags: [{
    type: String,
    index: true
  }],
  isReversible: {
    type: Boolean,
    default: false
  },
  reversedAt: {
    type: Date,
    default: null
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null
  },
  reversedReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
auditLogSchema.index({ 'actor.type': 1, 'actor.id': 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ 'target.type': 1, 'target.id': 1 });
auditLogSchema.index({ category: 1, severity: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ tags: 1 });

// Method to reverse action
auditLogSchema.methods.reverse = function(reversedBy, reason) {
  this.isReversible = false;
  this.reversedAt = new Date();
  this.reversedBy = reversedBy;
  this.reversedReason = reason;
  return this.save();
};

// Method to get audit summary
auditLogSchema.methods.getSummary = function() {
  return {
    id: this._id,
    actor: this.actor,
    action: this.action,
    target: this.target,
    reason: this.reason,
    severity: this.severity,
    category: this.category,
    tags: this.tags,
    isReversible: this.isReversible,
    reversedAt: this.reversedAt,
    createdAt: this.createdAt
  };
};

// Method to get audit details
auditLogSchema.methods.getDetails = function() {
  return {
    id: this._id,
    actor: this.actor,
    action: this.action,
    target: this.target,
    before: this.before,
    after: this.after,
    reason: this.reason,
    metadata: this.metadata,
    severity: this.severity,
    category: this.category,
    tags: this.tags,
    isReversible: this.isReversible,
    reversedAt: this.reversedAt,
    reversedBy: this.reversedBy,
    reversedReason: this.reversedReason,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to create audit log
auditLogSchema.statics.createAuditLog = function(actor, action, target, reason, before = null, after = null, metadata = {}, severity = 'medium', category = 'system', tags = []) {
  return this.create({
    actor,
    action,
    target,
    before,
    after,
    reason,
    metadata,
    severity,
    category,
    tags
  });
};

// Static method to get audit logs by actor
auditLogSchema.statics.getAuditLogsByActor = function(actorType, actorId, limit = 100) {
  return this.find({
    'actor.type': actorType,
    'actor.id': actorId
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor.id', 'email name role');
};

// Static method to get audit logs by target
auditLogSchema.statics.getAuditLogsByTarget = function(targetType, targetId, limit = 100) {
  return this.find({
    'target.type': targetType,
    'target.id': targetId
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor.id', 'email name role');
};

// Static method to get audit logs by action
auditLogSchema.statics.getAuditLogsByAction = function(action, limit = 100) {
  return this.find({ action })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor.id', 'email name role');
};

// Static method to get audit logs by category
auditLogSchema.statics.getAuditLogsByCategory = function(category, limit = 100) {
  return this.find({ category })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor.id', 'email name role');
};

// Static method to get audit logs by severity
auditLogSchema.statics.getAuditLogsBySeverity = function(severity, limit = 100) {
  return this.find({ severity })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor.id', 'email name role');
};

// Static method to get audit logs by date range
auditLogSchema.statics.getAuditLogsByDateRange = function(startDate, endDate, limit = 100) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor.id', 'email name role');
};

// Static method to get audit logs by tag
auditLogSchema.statics.getAuditLogsByTag = function(tag, limit = 100) {
  return this.find({ tags: tag })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor.id', 'email name role');
};

// Static method to get audit log statistics
auditLogSchema.statics.getAuditLogStatistics = function(startDate, endDate) {
  return this.aggregate([
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
          action: '$action',
          category: '$category'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        actions: {
          $push: {
            action: '$_id.action',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

// Static method to get audit log trends
auditLogSchema.statics.getAuditLogTrends = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
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
        totalActions: { $sum: 1 },
        moderationActions: {
          $sum: {
            $cond: [{ $eq: ['$category', 'moderation'] }, 1, 0]
          }
        },
        fraudActions: {
          $sum: {
            $cond: [{ $eq: ['$category', 'fraud'] }, 1, 0]
          }
        },
        userManagementActions: {
          $sum: {
            $cond: [{ $eq: ['$category', 'user_management'] }, 1, 0]
          }
        },
        systemActions: {
          $sum: {
            $cond: [{ $eq: ['$category', 'system'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get audit log performance
auditLogSchema.statics.getAuditLogPerformance = function(startDate, endDate) {
  return this.aggregate([
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
        _id: '$action',
        total: { $sum: 1 },
        reversed: {
          $sum: {
            $cond: [{ $ne: ['$reversedAt', null] }, 1, 0]
          }
        },
        avgSeverity: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ['$severity', 'low'] }, then: 1 },
                { case: { $eq: ['$severity', 'medium'] }, then: 2 },
                { case: { $eq: ['$severity', 'high'] }, then: 3 },
                { case: { $eq: ['$severity', 'critical'] }, then: 4 }
              ],
              default: 2
            }
          }
        }
      }
    },
    {
      $project: {
        action: '$_id',
        total: 1,
        reversed: 1,
        avgSeverity: { $round: ['$avgSeverity', 2] },
        reversalRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$reversed', '$total'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get audit log actions
auditLogSchema.statics.getAuditLogActions = function() {
  return [
    { key: 'moderation_decision', name: 'Moderation Decision', description: 'Content moderation decision' },
    { key: 'enforcement', name: 'Enforcement', description: 'User enforcement action' },
    { key: 'tribe_edit', name: 'Tribe Edit', description: 'Tribe modification' },
    { key: 'leaderboard_adjust', name: 'Leaderboard Adjust', description: 'Leaderboard adjustment' },
    { key: 'entitlement_change', name: 'Entitlement Change', description: 'User entitlement change' },
    { key: 'config_update', name: 'Config Update', description: 'System configuration update' },
    { key: 'user_ban', name: 'User Ban', description: 'User ban action' },
    { key: 'user_unban', name: 'User Unban', description: 'User unban action' },
    { key: 'fraud_action', name: 'Fraud Action', description: 'Fraud prevention action' },
    { key: 'appeal_resolution', name: 'Appeal Resolution', description: 'Appeal resolution' },
    { key: 'admin_login', name: 'Admin Login', description: 'Admin user login' },
    { key: 'admin_logout', name: 'Admin Logout', description: 'Admin user logout' },
    { key: 'role_change', name: 'Role Change', description: 'Admin role change' },
    { key: 'permission_change', name: 'Permission Change', description: 'Permission change' },
    { key: 'system_event', name: 'System Event', description: 'System event' }
  ];
};

// Static method to get audit log categories
auditLogSchema.statics.getAuditLogCategories = function() {
  return [
    { key: 'moderation', name: 'Moderation', description: 'Content moderation actions' },
    { key: 'fraud', name: 'Fraud', description: 'Fraud detection and prevention' },
    { key: 'user_management', name: 'User Management', description: 'User management actions' },
    { key: 'tribe_management', name: 'Tribe Management', description: 'Tribe management actions' },
    { key: 'system', name: 'System', description: 'System actions' },
    { key: 'security', name: 'Security', description: 'Security actions' }
  ];
};

// Static method to get audit log severities
auditLogSchema.statics.getAuditLogSeverities = function() {
  return [
    { key: 'low', name: 'Low', description: 'Low severity action' },
    { key: 'medium', name: 'Medium', description: 'Medium severity action' },
    { key: 'high', name: 'High', description: 'High severity action' },
    { key: 'critical', name: 'Critical', description: 'Critical severity action' }
  ];
};

// Static method to get audit log summary
auditLogSchema.statics.getAuditLogSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        moderation: {
          $sum: {
            $cond: [{ $eq: ['$category', 'moderation'] }, 1, 0]
          }
        },
        fraud: {
          $sum: {
            $cond: [{ $eq: ['$category', 'fraud'] }, 1, 0]
          }
        },
        userManagement: {
          $sum: {
            $cond: [{ $eq: ['$category', 'user_management'] }, 1, 0]
          }
        },
        tribeManagement: {
          $sum: {
            $cond: [{ $eq: ['$category', 'tribe_management'] }, 1, 0]
          }
        },
        system: {
          $sum: {
            $cond: [{ $eq: ['$category', 'system'] }, 1, 0]
          }
        },
        security: {
          $sum: {
            $cond: [{ $eq: ['$category', 'security'] }, 1, 0]
          }
        },
        reversible: {
          $sum: {
            $cond: [{ $eq: ['$isReversible', true] }, 1, 0]
          }
        },
        reversed: {
          $sum: {
            $cond: [{ $ne: ['$reversedAt', null] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        moderation: 1,
        fraud: 1,
        userManagement: 1,
        tribeManagement: 1,
        system: 1,
        security: 1,
        reversible: 1,
        reversed: 1,
        reversalRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$reversed', '$total'] }, 100] }
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
