const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['image', 'battle', 'profile', 'transformation', 'comment', 'message'],
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: [
      'inappropriate_content',
      'harassment',
      'spam',
      'fake_profile',
      'underage',
      'violence',
      'hate_speech',
      'nudity',
      'scam',
      'copyright_violation',
      'other'
    ],
    required: true,
    index: true
  },
  description: {
    type: String,
    maxlength: 1000,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  assignedModerator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolution: {
    action: {
      type: String,
      enum: [
        'no_action',
        'warning_issued',
        'content_removed',
        'user_muted',
        'user_suspended',
        'user_banned',
        'false_report'
      ]
    },
    notes: {
      type: String,
      maxlength: 1000
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  evidence: {
    screenshots: [{
      url: String,
      uploadedAt: Date
    }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null
  },
  duplicateCount: {
    type: Number,
    default: 0
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
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ targetUserId: 1, status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ assignedModerator: 1, status: 1 });
reportSchema.index({ duplicateOf: 1 });

// Instance methods
reportSchema.methods.assignToModerator = function(moderatorId) {
  this.assignedModerator = moderatorId;
  this.status = 'reviewing';
  this.updatedAt = new Date();
  return this.save();
};

reportSchema.methods.resolve = function(action, notes, resolvedBy) {
  this.status = 'resolved';
  this.resolution = {
    action,
    notes,
    resolvedAt: new Date(),
    resolvedBy
  };
  this.updatedAt = new Date();
  return this.save();
};

reportSchema.methods.dismiss = function(notes, resolvedBy) {
  this.status = 'dismissed';
  this.resolution = {
    action: 'false_report',
    notes,
    resolvedAt: new Date(),
    resolvedBy
  };
  this.updatedAt = new Date();
  return this.save();
};

reportSchema.methods.markAsDuplicate = function(originalReportId) {
  this.duplicateOf = originalReportId;
  this.status = 'dismissed';
  this.resolution = {
    action: 'false_report',
    notes: 'Duplicate report',
    resolvedAt: new Date()
  };
  this.updatedAt = new Date();
  return this.save();
};

// Static methods
reportSchema.statics.getPendingReports = function(options = {}) {
  const {
    limit = 20,
    skip = 0,
    priority = null,
    targetType = null
  } = options;

  const query = { status: 'pending' };
  if (priority) query.priority = priority;
  if (targetType) query.targetType = targetType;

  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('reporterId', 'username avatar')
    .populate('targetUserId', 'username avatar')
    .populate('assignedModerator', 'username');
};

reportSchema.statics.getReportsByUser = function(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    status = null,
    asReporter = false
  } = options;

  const query = asReporter ? { reporterId: userId } : { targetUserId: userId };
  if (status) query.status = status;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('reporterId', 'username avatar')
    .populate('targetUserId', 'username avatar')
    .populate('assignedModerator', 'username');
};

reportSchema.statics.getReportStats = function(timeframe = '7d') {
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
          status: '$status',
          reason: '$reason',
          priority: '$priority'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.status',
        totalCount: { $sum: '$count' },
        reasons: {
          $push: {
            reason: '$_id.reason',
            count: '$count',
            priority: '$_id.priority'
          }
        }
      }
    }
  ]);
};

reportSchema.statics.checkDuplicateReport = function(reporterId, targetUserId, targetType, targetId) {
  return this.findOne({
    reporterId,
    targetUserId,
    targetType,
    targetId,
    status: { $in: ['pending', 'reviewing'] }
  });
};

reportSchema.statics.getDuplicateReports = function(targetUserId, targetType, targetId) {
  return this.find({
    targetUserId,
    targetType,
    targetId,
    status: { $in: ['pending', 'reviewing'] }
  }).populate('reporterId', 'username');
};

reportSchema.statics.autoResolveDuplicateReports = async function(targetUserId, targetType, targetId, threshold = 5) {
  const reports = await this.getDuplicateReports(targetUserId, targetType, targetId);
  
  if (reports.length >= threshold) {
    // Keep the first report, mark others as duplicates
    const [originalReport, ...duplicates] = reports.sort((a, b) => a.createdAt - b.createdAt);
    
    for (const duplicate of duplicates) {
      await duplicate.markAsDuplicate(originalReport._id);
    }
    
    // Update duplicate count
    originalReport.duplicateCount = duplicates.length;
    await originalReport.save();
    
    return { originalReport, duplicatesResolved: duplicates.length };
  }
  
  return { originalReport: null, duplicatesResolved: 0 };
};

module.exports = mongoose.model('Report', reportSchema);