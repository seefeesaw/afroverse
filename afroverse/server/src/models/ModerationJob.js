const mongoose = require('mongoose');

const moderationJobSchema = new mongoose.Schema({
  subject: {
    type: {
      type: String,
      enum: ['upload', 'transform', 'battle', 'profile', 'comment', 'message'],
      required: true,
      index: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'passed', 'blocked', 'flagged', 'quarantined', 'needs_review', 'appealed', 'resolved'],
    default: 'pending',
    index: true
  },
  labels: [{
    type: String,
    index: true
  }],
  scores: {
    nsfw: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    violence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    hate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    anomaly: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },
  action: {
    type: String,
    enum: ['allow', 'block', 'blur', 'age_gate', 'hold_publish'],
    default: null
  },
  appeal: {
    open: {
      type: Boolean,
      default: false,
      index: true
    },
    message: {
      type: String,
      default: null
    },
    openedAt: {
      type: Date,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null
    },
    resolution: {
      type: String,
      enum: ['upheld', 'overturned', 'dismissed'],
      default: null
    }
  },
  escalation: {
    reason: {
      type: String,
      default: null
    },
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal',
      index: true
    },
    escalatedAt: {
      type: Date,
      default: null
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null,
    index: true
  },
  assignedAt: {
    type: Date,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  decision: {
    type: String,
    enum: ['allow', 'block', 'blur', 'age_gate', 'hold_publish', 'escalate'],
    default: null
  },
  decisionReason: {
    type: String,
    default: null
  },
  decisionNotes: {
    type: String,
    default: null
  },
  notifyUser: {
    type: Boolean,
    default: true
  },
  userNotification: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date,
      default: null
    },
    message: {
      type: String,
      default: null
    }
  },
  audit: [{
    at: {
      type: Date,
      default: Date.now
    },
    actor: {
      type: String,
      required: true
    },
    change: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: null
    }
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
moderationJobSchema.index({ 'subject.type': 1, 'subject.id': 1 });
moderationJobSchema.index({ 'subject.userId': 1 });
moderationJobSchema.index({ status: 1, createdAt: -1 });
moderationJobSchema.index({ assignedTo: 1, status: 1 });
moderationJobSchema.index({ 'escalation.priority': 1 });
moderationJobSchema.index({ 'appeal.open': 1 });
moderationJobSchema.index({ reviewedAt: -1 });

// Method to assign to moderator
moderationJobSchema.methods.assignTo = function(adminUserId) {
  this.assignedTo = adminUserId;
  this.assignedAt = new Date();
  this.status = 'needs_review';
  
  this.audit.push({
    actor: `admin:${adminUserId}`,
    change: 'assigned',
    note: 'Job assigned to moderator'
  });
  
  return this.save();
};

// Method to escalate
moderationJobSchema.methods.escalate = function(adminUserId, reason, priority = 'high') {
  this.escalation = {
    reason,
    priority,
    escalatedAt: new Date(),
    escalatedBy: adminUserId
  };
  
  this.status = 'needs_review';
  this.assignedTo = null;
  this.assignedAt = null;
  
  this.audit.push({
    actor: `admin:${adminUserId}`,
    change: 'escalated',
    note: `Escalated: ${reason}`
  });
  
  return this.save();
};

// Method to make decision
moderationJobSchema.methods.makeDecision = function(adminUserId, decision, reason, notes = null) {
  this.reviewedBy = adminUserId;
  this.reviewedAt = new Date();
  this.decision = decision;
  this.decisionReason = reason;
  this.decisionNotes = notes;
  
  if (decision === 'allow') {
    this.status = 'passed';
    this.action = 'allow';
  } else if (decision === 'block') {
    this.status = 'blocked';
    this.action = 'block';
  } else if (decision === 'blur') {
    this.status = 'passed';
    this.action = 'blur';
  } else if (decision === 'age_gate') {
    this.status = 'passed';
    this.action = 'age_gate';
  } else if (decision === 'hold_publish') {
    this.status = 'quarantined';
    this.action = 'hold_publish';
  } else if (decision === 'escalate') {
    this.escalation = {
      reason: reason,
      priority: 'high',
      escalatedAt: new Date(),
      escalatedBy: adminUserId
    };
    this.status = 'needs_review';
  }
  
  this.audit.push({
    actor: `admin:${adminUserId}`,
    change: 'decision',
    note: `Decision: ${decision} - ${reason}`
  });
  
  return this.save();
};

// Method to open appeal
moderationJobSchema.methods.openAppeal = function(message) {
  this.appeal = {
    open: true,
    message,
    openedAt: new Date()
  };
  
  this.status = 'appealed';
  
  this.audit.push({
    actor: 'user',
    change: 'appeal_opened',
    note: 'User opened appeal'
  });
  
  return this.save();
};

// Method to resolve appeal
moderationJobSchema.methods.resolveAppeal = function(adminUserId, resolution, reason) {
  this.appeal.resolvedAt = new Date();
  this.appeal.resolvedBy = adminUserId;
  this.appeal.resolution = resolution;
  this.appeal.open = false;
  
  if (resolution === 'overturned') {
    this.status = 'passed';
    this.action = 'allow';
  } else if (resolution === 'upheld') {
    this.status = 'blocked';
    this.action = 'block';
  } else if (resolution === 'dismissed') {
    this.status = 'resolved';
  }
  
  this.audit.push({
    actor: `admin:${adminUserId}`,
    change: 'appeal_resolved',
    note: `Appeal ${resolution}: ${reason}`
  });
  
  return this.save();
};

// Method to add audit entry
moderationJobSchema.methods.addAuditEntry = function(actor, change, note = null) {
  this.audit.push({
    actor,
    change,
    note
  });
  
  return this.save();
};

// Method to get moderation summary
moderationJobSchema.methods.getSummary = function() {
  return {
    id: this._id,
    subject: this.subject,
    status: this.status,
    labels: this.labels,
    scores: this.scores,
    action: this.action,
    decision: this.decision,
    decisionReason: this.decisionReason,
    assignedTo: this.assignedTo,
    reviewedBy: this.reviewedBy,
    reviewedAt: this.reviewedAt,
    appeal: this.appeal,
    escalation: this.escalation,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to get moderation details
moderationJobSchema.methods.getDetails = function() {
  return {
    id: this._id,
    subject: this.subject,
    status: this.status,
    labels: this.labels,
    scores: this.scores,
    action: this.action,
    decision: this.decision,
    decisionReason: this.decisionReason,
    decisionNotes: this.decisionNotes,
    assignedTo: this.assignedTo,
    assignedAt: this.assignedAt,
    reviewedBy: this.reviewedBy,
    reviewedAt: this.reviewedAt,
    appeal: this.appeal,
    escalation: this.escalation,
    userNotification: this.userNotification,
    audit: this.audit,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to create moderation job
moderationJobSchema.statics.createModerationJob = function(subject, labels = [], scores = {}, metadata = {}) {
  return this.create({
    subject,
    labels,
    scores,
    metadata
  });
};

// Static method to get pending moderation jobs
moderationJobSchema.statics.getPendingModerationJobs = function(limit = 100) {
  return this.find({
    status: 'pending',
    isActive: true
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('subject.userId', 'username phone')
    .populate('assignedTo', 'email name role')
    .populate('reviewedBy', 'email name role');
};

// Static method to get assigned moderation jobs
moderationJobSchema.statics.getAssignedModerationJobs = function(adminUserId, limit = 100) {
  return this.find({
    assignedTo: adminUserId,
    status: 'needs_review',
    isActive: true
  })
    .sort({ assignedAt: 1 })
    .limit(limit)
    .populate('subject.userId', 'username phone')
    .populate('assignedTo', 'email name role')
    .populate('reviewedBy', 'email name role');
};

// Static method to get escalated moderation jobs
moderationJobSchema.statics.getEscalatedModerationJobs = function(limit = 100) {
  return this.find({
    'escalation.priority': { $in: ['high', 'urgent'] },
    status: 'needs_review',
    isActive: true
  })
    .sort({ 'escalation.escalatedAt': 1 })
    .limit(limit)
    .populate('subject.userId', 'username phone')
    .populate('assignedTo', 'email name role')
    .populate('reviewedBy', 'email name role')
    .populate('escalation.escalatedBy', 'email name role');
};

// Static method to get appealed moderation jobs
moderationJobSchema.statics.getAppealedModerationJobs = function(limit = 100) {
  return this.find({
    'appeal.open': true,
    isActive: true
  })
    .sort({ 'appeal.openedAt': 1 })
    .limit(limit)
    .populate('subject.userId', 'username phone')
    .populate('assignedTo', 'email name role')
    .populate('reviewedBy', 'email name role')
    .populate('appeal.resolvedBy', 'email name role');
};

// Static method to get moderation jobs by user
moderationJobSchema.statics.getModerationJobsByUser = function(userId, limit = 100) {
  return this.find({
    'subject.userId': userId
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('subject.userId', 'username phone')
    .populate('assignedTo', 'email name role')
    .populate('reviewedBy', 'email name role');
};

// Static method to get moderation jobs by status
moderationJobSchema.statics.getModerationJobsByStatus = function(status, limit = 100) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('subject.userId', 'username phone')
    .populate('assignedTo', 'email name role')
    .populate('reviewedBy', 'email name role');
};

// Static method to get moderation job statistics
moderationJobSchema.statics.getModerationJobStatistics = function(startDate, endDate) {
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
          status: '$status',
          subjectType: '$subject.type'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.subjectType',
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

// Static method to get moderation job trends
moderationJobSchema.statics.getModerationJobTrends = function(days = 30) {
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
        totalJobs: { $sum: 1 },
        pendingJobs: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        resolvedJobs: {
          $sum: {
            $cond: [{ $in: ['$status', ['passed', 'blocked', 'resolved']] }, 1, 0]
          }
        },
        appealedJobs: {
          $sum: {
            $cond: [{ $eq: ['$appeal.open', true] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get moderation job performance
moderationJobSchema.statics.getModerationJobPerformance = function(startDate, endDate) {
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
        _id: '$reviewedBy',
        totalReviewed: { $sum: 1 },
        avgReviewTime: {
          $avg: {
            $subtract: ['$reviewedAt', '$createdAt']
          }
        },
        decisions: {
          $push: '$decision'
        }
      }
    },
    {
      $lookup: {
        from: 'adminusers',
        localField: '_id',
        foreignField: '_id',
        as: 'admin'
      }
    },
    {
      $unwind: {
        path: '$admin',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        adminId: '$_id',
        adminEmail: '$admin.email',
        adminName: '$admin.name',
        totalReviewed: 1,
        avgReviewTime: { $round: ['$avgReviewTime', 2] },
        decisions: 1
      }
    },
    {
      $sort: { totalReviewed: -1 }
    }
  ]);
};

// Static method to get moderation job statuses
moderationJobSchema.statics.getModerationJobStatuses = function() {
  return [
    { key: 'pending', name: 'Pending', description: 'Awaiting review' },
    { key: 'passed', name: 'Passed', description: 'Content approved' },
    { key: 'blocked', name: 'Blocked', description: 'Content blocked' },
    { key: 'flagged', name: 'Flagged', description: 'Content flagged' },
    { key: 'quarantined', name: 'Quarantined', description: 'Content quarantined' },
    { key: 'needs_review', name: 'Needs Review', description: 'Assigned for review' },
    { key: 'appealed', name: 'Appealed', description: 'User appealed decision' },
    { key: 'resolved', name: 'Resolved', description: 'Case resolved' }
  ];
};

// Static method to get moderation job decisions
moderationJobSchema.statics.getModerationJobDecisions = function() {
  return [
    { key: 'allow', name: 'Allow', description: 'Allow content' },
    { key: 'block', name: 'Block', description: 'Block content' },
    { key: 'blur', name: 'Blur', description: 'Blur content' },
    { key: 'age_gate', name: 'Age Gate', description: 'Age gate content' },
    { key: 'hold_publish', name: 'Hold Publish', description: 'Hold publishing' },
    { key: 'escalate', name: 'Escalate', description: 'Escalate for review' }
  ];
};

// Static method to get moderation job summary
moderationJobSchema.statics.getModerationJobSummary = function() {
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
        passed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'passed'] }, 1, 0]
          }
        },
        blocked: {
          $sum: {
            $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0]
          }
        },
        quarantined: {
          $sum: {
            $cond: [{ $eq: ['$status', 'quarantined'] }, 1, 0]
          }
        },
        needsReview: {
          $sum: {
            $cond: [{ $eq: ['$status', 'needs_review'] }, 1, 0]
          }
        },
        appealed: {
          $sum: {
            $cond: [{ $eq: ['$appeal.open', true] }, 1, 0]
          }
        },
        resolved: {
          $sum: {
            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        pending: 1,
        passed: 1,
        blocked: 1,
        quarantined: 1,
        needsReview: 1,
        appealed: 1,
        resolved: 1,
        approvalRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$passed', '$total'] }, 100] }
          ]
        },
        blockRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$blocked', '$total'] }, 100] }
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('ModerationJob', moderationJobSchema);