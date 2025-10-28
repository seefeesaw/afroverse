const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['image', 'text', 'profile', 'battle', 'transformation', 'comment'],
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'warning',
      'soft_block',
      'hard_ban',
      'blocked_image',
      'blocked_text',
      'content_removed',
      'user_muted',
      'user_suspended',
      'user_banned',
      'appeal_approved',
      'appeal_rejected'
    ],
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  category: {
    type: String,
    enum: [
      'nsfw',
      'violence',
      'hate_speech',
      'harassment',
      'spam',
      'scam',
      'fake_content',
      'copyright',
      'minor_safety',
      'weapons',
      'drugs',
      'self_harm',
      'other'
    ],
    required: true,
    index: true
  },
  moderatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means automated action
  },
  automated: {
    type: Boolean,
    default: true,
    index: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  appealable: {
    type: Boolean,
    default: true
  },
  appealDeadline: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
moderationLogSchema.index({ userId: 1, createdAt: -1 });
moderationLogSchema.index({ targetType: 1, targetId: 1 });
moderationLogSchema.index({ action: 1, severity: 1, createdAt: -1 });
moderationLogSchema.index({ automated: 1, resolvedAt: 1 });
moderationLogSchema.index({ appealable: 1, appealDeadline: 1 });

// Instance methods
moderationLogSchema.methods.resolve = function() {
  this.resolvedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

moderationLogSchema.methods.canAppeal = function() {
  return this.appealable && 
         this.appealDeadline > new Date() && 
         !this.resolvedAt;
};

moderationLogSchema.methods.isActive = function() {
  return !this.resolvedAt;
};

// Static methods
moderationLogSchema.statics.getUserModerationHistory = function(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    action = null,
    severity = null,
    category = null
  } = options;

  const query = { userId };
  if (action) query.action = action;
  if (severity) query.severity = severity;
  if (category) query.category = category;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('moderatorId', 'username')
    .populate('targetId');
};

moderationLogSchema.statics.getActiveModerationActions = function(userId) {
  return this.find({
    userId,
    resolvedAt: { $exists: false }
  }).sort({ createdAt: -1 });
};

moderationLogSchema.statics.getModerationStats = function(timeframe = '7d') {
  const timeframes = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  };
  
  const days = timeframes[timeframe] || 7;
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
          action: '$action',
          category: '$category',
          automated: '$automated'
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      }
    },
    {
      $group: {
        _id: '$_id.action',
        totalCount: { $sum: '$count' },
        categories: {
          $push: {
            category: '$_id.category',
            count: '$count',
            automated: '$_id.automated',
            avgConfidence: '$avgConfidence'
          }
        }
      }
    }
  ]);
};

moderationLogSchema.statics.getUserStrikeCount = function(userId) {
  return this.countDocuments({
    userId,
    action: { $in: ['warning', 'soft_block', 'hard_ban'] },
    resolvedAt: { $exists: false }
  });
};

moderationLogSchema.statics.shouldBanUser = function(userId) {
  return this.getUserStrikeCount(userId).then(strikeCount => {
    const banThresholds = {
      1: 'warning',
      2: 'soft_block', // 24-hour mute
      3: 'hard_ban',   // 7-day suspension
      4: 'user_banned' // permanent ban
    };
    
    return banThresholds[strikeCount] || null;
  });
};

module.exports = mongoose.model('ModerationLog', moderationLogSchema);