const mongoose = require('mongoose');

const enforcementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['warning', 'mute', 'upload_block', 'vote_limit', 'ban', 'shadow_ban', 'content_removal'],
    required: true,
    index: true
  },
  scope: {
    type: String,
    enum: ['global', 'battles', 'uploads', 'votes', 'comments', 'profile'],
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  appeal: {
    submittedAt: {
      type: Date,
      default: null
    },
    reason: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewNote: {
      type: String,
      default: null
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
enforcementSchema.index({ userId: 1, isActive: 1 });
enforcementSchema.index({ type: 1, isActive: 1 });
enforcementSchema.index({ scope: 1, isActive: 1 });
enforcementSchema.index({ expiresAt: 1, isActive: 1 });
enforcementSchema.index({ 'appeal.status': 1 });

// Method to check if enforcement is active
enforcementSchema.methods.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  if (!this.expiresAt) return true;
  return new Date() < this.expiresAt;
};

// Method to deactivate enforcement
enforcementSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Method to extend enforcement
enforcementSchema.methods.extend = function(newExpiresAt) {
  this.expiresAt = newExpiresAt;
  return this.save();
};

// Method to submit appeal
enforcementSchema.methods.submitAppeal = function(reason) {
  this.appeal = {
    submittedAt: new Date(),
    reason,
    status: 'pending'
  };
  return this.save();
};

// Method to review appeal
enforcementSchema.methods.reviewAppeal = function(approved, reviewedBy, reviewNote = null) {
  this.appeal.status = approved ? 'approved' : 'rejected';
  this.appeal.reviewedBy = reviewedBy;
  this.appeal.reviewedAt = new Date();
  this.appeal.reviewNote = reviewNote;
  
  if (approved) {
    this.isActive = false;
  }
  
  return this.save();
};

// Method to get enforcement summary
enforcementSchema.methods.getSummary = function() {
  return {
    id: this._id,
    userId: this.userId,
    type: this.type,
    scope: this.scope,
    reason: this.reason,
    details: this.details,
    expiresAt: this.expiresAt,
    isActive: this.isActive,
    isCurrentlyActive: this.isCurrentlyActive(),
    createdBy: this.createdBy,
    appeal: this.appeal,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get active enforcements for user
enforcementSchema.statics.getActiveEnforcements = function(userId) {
  return this.find({
    userId,
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to get enforcements by type
enforcementSchema.statics.getEnforcementsByType = function(type, limit = 50) {
  return this.find({ type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username phone')
    .populate('createdById', 'username');
};

// Static method to get enforcements by scope
enforcementSchema.statics.getEnforcementsByScope = function(scope, limit = 50) {
  return this.find({ scope })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username phone')
    .populate('createdById', 'username');
};

// Static method to get pending appeals
enforcementSchema.statics.getPendingAppeals = function(limit = 50) {
  return this.find({ 'appeal.status': 'pending' })
    .sort({ 'appeal.submittedAt': 1 })
    .limit(limit)
    .populate('userId', 'username phone')
    .populate('createdById', 'username');
};

// Static method to get expired enforcements
enforcementSchema.statics.getExpiredEnforcements = function() {
  return this.find({
    isActive: true,
    expiresAt: { $lt: new Date() }
  });
};

// Static method to get enforcement statistics
enforcementSchema.statics.getEnforcementStatistics = function(startDate, endDate) {
  const pipeline = [
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
          type: '$type',
          scope: '$scope'
        },
        count: { $sum: 1 },
        activeCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  '$isActive',
                  {
                    $or: [
                      { $eq: ['$expiresAt', null] },
                      { $gt: ['$expiresAt', new Date()] }
                    ]
                  }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        scopes: {
          $push: {
            scope: '$_id.scope',
            count: '$count',
            activeCount: '$activeCount'
          }
        },
        total: { $sum: '$count' },
        totalActive: { $sum: '$activeCount' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get appeal statistics
enforcementSchema.statics.getAppealStatistics = function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        'appeal.submittedAt': {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$appeal.status',
        count: { $sum: 1 }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to create enforcement
enforcementSchema.statics.createEnforcement = function(userId, type, scope, reason, details = null, expiresAt = null, createdBy, createdById = null) {
  return this.create({
    userId,
    type,
    scope,
    reason,
    details,
    expiresAt,
    createdBy,
    createdById
  });
};

// Static method to get user enforcement history
enforcementSchema.statics.getUserEnforcementHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdById', 'username');
};

// Static method to check if user has active enforcement
enforcementSchema.statics.hasActiveEnforcement = function(userId, type, scope = null) {
  const query = {
    userId,
    isActive: true,
    type,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  if (scope) {
    query.scope = scope;
  }
  
  return this.findOne(query);
};

// Static method to get enforcements by creator
enforcementSchema.statics.getEnforcementsByCreator = function(createdById, limit = 50) {
  return this.find({ createdById })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username phone');
};

// Static method to get recent enforcements
enforcementSchema.statics.getRecentEnforcements = function(hours = 24, limit = 100) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    createdAt: { $gte: since }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username phone')
    .populate('createdById', 'username');
};

// Static method to get enforcement types
enforcementSchema.statics.getEnforcementTypes = function() {
  return [
    { key: 'warning', name: 'Warning', description: 'Formal warning to user' },
    { key: 'mute', name: 'Mute', description: 'Prevent user from commenting' },
    { key: 'upload_block', name: 'Upload Block', description: 'Prevent user from uploading content' },
    { key: 'vote_limit', name: 'Vote Limit', description: 'Limit user voting capabilities' },
    { key: 'ban', name: 'Ban', description: 'Temporary or permanent ban' },
    { key: 'shadow_ban', name: 'Shadow Ban', description: 'Hide user content from others' },
    { key: 'content_removal', name: 'Content Removal', description: 'Remove specific content' }
  ];
};

// Static method to get enforcement scopes
enforcementSchema.statics.getEnforcementScopes = function() {
  return [
    { key: 'global', name: 'Global', description: 'Applies to all features' },
    { key: 'battles', name: 'Battles', description: 'Applies to battle features only' },
    { key: 'uploads', name: 'Uploads', description: 'Applies to upload features only' },
    { key: 'votes', name: 'Votes', description: 'Applies to voting features only' },
    { key: 'comments', name: 'Comments', description: 'Applies to comments only' },
    { key: 'profile', name: 'Profile', description: 'Applies to profile features only' }
  ];
};

module.exports = mongoose.model('Enforcement', enforcementSchema);
