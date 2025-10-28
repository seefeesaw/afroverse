const mongoose = require('mongoose');

const fraudDetectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['vote_fraud', 'multi_account', 'nsfw_content', 'spam_battle', 'ai_abuse', 'suspicious_activity'],
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    deviceId: String,
    ipAddress: String,
    userAgent: String,
    geoLocation: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    sessionId: String,
    fingerprint: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'confirmed', 'false_positive', 'resolved'],
    default: 'pending',
    index: true
  },
  action: {
    type: String,
    enum: ['none', 'warning', 'shadowban', 'temporary_ban', 'permanent_ban', 'content_removal'],
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
  notes: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
fraudDetectionSchema.index({ userId: 1, type: 1 });
fraudDetectionSchema.index({ status: 1, severity: 1 });
fraudDetectionSchema.index({ createdAt: -1 });
fraudDetectionSchema.index({ 'metadata.ipAddress': 1 });
fraudDetectionSchema.index({ 'metadata.deviceId': 1 });

// Method to mark as reviewed
fraudDetectionSchema.methods.markAsReviewed = function(reviewedBy, action, notes = null) {
  this.status = 'reviewed';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.action = action;
  this.notes = notes;
  return this.save();
};

// Method to mark as confirmed
fraudDetectionSchema.methods.markAsConfirmed = function(reviewedBy, action, notes = null) {
  this.status = 'confirmed';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.action = action;
  this.notes = notes;
  return this.save();
};

// Method to mark as false positive
fraudDetectionSchema.methods.markAsFalsePositive = function(reviewedBy, notes = null) {
  this.status = 'false_positive';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.action = 'none';
  this.notes = notes;
  return this.save();
};

// Method to resolve
fraudDetectionSchema.methods.resolve = function(reviewedBy, notes = null) {
  this.status = 'resolved';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.notes = notes;
  return this.save();
};

// Method to deactivate
fraudDetectionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Method to get fraud summary
fraudDetectionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    userId: this.userId,
    type: this.type,
    severity: this.severity,
    description: this.description,
    status: this.status,
    action: this.action,
    createdAt: this.createdAt,
    reviewedAt: this.reviewedAt,
    isActive: this.isActive
  };
};

// Static method to create fraud detection
fraudDetectionSchema.statics.createFraudDetection = function(userId, type, severity, description, evidence = {}, metadata = {}) {
  return this.create({
    userId,
    type,
    severity,
    description,
    evidence,
    metadata
  });
};

// Static method to get fraud detections by user
fraudDetectionSchema.statics.getFraudDetectionsByUser = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('reviewedBy', 'username');
};

// Static method to get pending fraud detections
fraudDetectionSchema.statics.getPendingFraudDetections = function(limit = 100) {
  return this.find({
    status: 'pending',
    isActive: true
  })
    .sort({ severity: 1, createdAt: 1 })
    .limit(limit)
    .populate('userId', 'username phone')
    .populate('reviewedBy', 'username');
};

// Static method to get fraud detections by type
fraudDetectionSchema.statics.getFraudDetectionsByType = function(type, limit = 50) {
  return this.find({ type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username phone')
    .populate('reviewedBy', 'username');
};

// Static method to get fraud detection statistics
fraudDetectionSchema.statics.getFraudDetectionStatistics = function(startDate, endDate) {
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
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

// Static method to get fraud detection trends
fraudDetectionSchema.statics.getFraudDetectionTrends = function(days = 30) {
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
        totalDetections: { $sum: 1 },
        confirmedDetections: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
          }
        },
        falsePositives: {
          $sum: {
            $cond: [{ $eq: ['$status', 'false_positive'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get fraud detection performance
fraudDetectionSchema.statics.getFraudDetectionPerformance = function(startDate, endDate) {
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
        _id: '$type',
        total: { $sum: 1 },
        confirmed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
          }
        },
        falsePositives: {
          $sum: {
            $cond: [{ $eq: ['$status', 'false_positive'] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        type: '$_id',
        total: 1,
        confirmed: 1,
        falsePositives: 1,
        pending: 1,
        accuracyRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$confirmed', '$total'] }, 100] }
          ]
        },
        falsePositiveRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$falsePositives', '$total'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get fraud detection types
fraudDetectionSchema.statics.getFraudDetectionTypes = function() {
  return [
    { key: 'vote_fraud', name: 'Vote Fraud', description: 'Suspicious voting patterns' },
    { key: 'multi_account', name: 'Multi Account', description: 'Multiple accounts from same user' },
    { key: 'nsfw_content', name: 'NSFW Content', description: 'Inappropriate content detected' },
    { key: 'spam_battle', name: 'Spam Battle', description: 'Spam or low-quality battles' },
    { key: 'ai_abuse', name: 'AI Abuse', description: 'Misuse of AI transformation features' },
    { key: 'suspicious_activity', name: 'Suspicious Activity', description: 'General suspicious behavior' }
  ];
};

// Static method to get fraud detection severities
fraudDetectionSchema.statics.getFraudDetectionSeverities = function() {
  return [
    { key: 'low', name: 'Low', description: 'Minor violation, warning sufficient' },
    { key: 'medium', name: 'Medium', description: 'Moderate violation, temporary restriction' },
    { key: 'high', name: 'High', description: 'Serious violation, shadowban or temporary ban' },
    { key: 'critical', name: 'Critical', description: 'Severe violation, permanent ban required' }
  ];
};

// Static method to get fraud detection statuses
fraudDetectionSchema.statics.getFraudDetectionStatuses = function() {
  return [
    { key: 'pending', name: 'Pending', description: 'Awaiting review' },
    { key: 'reviewed', name: 'Reviewed', description: 'Under review' },
    { key: 'confirmed', name: 'Confirmed', description: 'Fraud confirmed' },
    { key: 'false_positive', name: 'False Positive', description: 'Not fraud' },
    { key: 'resolved', name: 'Resolved', description: 'Case closed' }
  ];
};

// Static method to get fraud detection actions
fraudDetectionSchema.statics.getFraudDetectionActions = function() {
  return [
    { key: 'none', name: 'None', description: 'No action taken' },
    { key: 'warning', name: 'Warning', description: 'User warned' },
    { key: 'shadowban', name: 'Shadowban', description: 'Silent restriction' },
    { key: 'temporary_ban', name: 'Temporary Ban', description: 'Temporary account suspension' },
    { key: 'permanent_ban', name: 'Permanent Ban', description: 'Permanent account suspension' },
    { key: 'content_removal', name: 'Content Removal', description: 'Remove violating content' }
  ];
};

// Static method to get fraud detection summary
fraudDetectionSchema.statics.getFraudDetectionSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        confirmed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
          }
        },
        falsePositives: {
          $sum: {
            $cond: [{ $eq: ['$status', 'false_positive'] }, 1, 0]
          }
        },
        active: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        pending: 1,
        confirmed: 1,
        falsePositives: 1,
        active: 1,
        accuracyRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$confirmed', '$total'] }, 100] }
          ]
        },
        falsePositiveRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$falsePositives', '$total'] }, 100] }
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('FraudDetection', fraudDetectionSchema);
