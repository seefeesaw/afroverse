const mongoose = require('mongoose');

const trustScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    default: 50,
    min: 0,
    max: 100,
    index: true
  },
  level: {
    type: String,
    enum: ['trusted', 'normal', 'suspicious', 'banned'],
    default: 'normal',
    index: true
  },
  flags: {
    isShadowBanned: {
      type: Boolean,
      default: false,
      index: true
    },
    isTemporarilyBanned: {
      type: Boolean,
      default: false,
      index: true
    },
    isPermanentlyBanned: {
      type: Boolean,
      default: false,
      index: true
    },
    canVote: {
      type: Boolean,
      default: true,
      index: true
    },
    canCreateBattles: {
      type: Boolean,
      default: true,
      index: true
    },
    canTransform: {
      type: Boolean,
      default: true,
      index: true
    },
    canJoinTribe: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  history: [{
    action: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  violations: [{
    type: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastDecay: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
trustScoreSchema.index({ userId: 1 });
trustScoreSchema.index({ score: -1 });
trustScoreSchema.index({ level: 1 });
trustScoreSchema.index({ 'flags.isShadowBanned': 1 });
trustScoreSchema.index({ lastUpdated: -1 });

// Method to add points
trustScoreSchema.methods.addPoints = function(points, reason, action, metadata = {}) {
  this.score = Math.min(100, this.score + points);
  this.history.push({
    action,
    points,
    reason,
    metadata,
    createdAt: new Date()
  });
  this.lastUpdated = new Date();
  this.updateLevel();
  return this.save();
};

// Method to subtract points
trustScoreSchema.methods.subtractPoints = function(points, reason, action, metadata = {}) {
  this.score = Math.max(0, this.score - points);
  this.history.push({
    action,
    points: -points,
    reason,
    metadata,
    createdAt: new Date()
  });
  this.lastUpdated = new Date();
  this.updateLevel();
  return this.save();
};

// Method to add violation
trustScoreSchema.methods.addViolation = function(type, severity, description, points) {
  this.violations.push({
    type,
    severity,
    description,
    points,
    createdAt: new Date()
  });
  
  // Subtract points for violation
  this.subtractPoints(points, `Violation: ${description}`, 'violation', { type, severity });
  
  return this.save();
};

// Method to update level based on score
trustScoreSchema.methods.updateLevel = function() {
  if (this.score >= 80) {
    this.level = 'trusted';
  } else if (this.score >= 50) {
    this.level = 'normal';
  } else if (this.score >= 20) {
    this.level = 'suspicious';
  } else {
    this.level = 'banned';
  }
  
  // Update flags based on level
  this.updateFlags();
};

// Method to update flags based on level
trustScoreSchema.methods.updateFlags = function() {
  if (this.level === 'banned') {
    this.flags.isShadowBanned = true;
    this.flags.canVote = false;
    this.flags.canCreateBattles = false;
    this.flags.canTransform = false;
    this.flags.canJoinTribe = false;
  } else if (this.level === 'suspicious') {
    this.flags.isShadowBanned = true;
    this.flags.canVote = false;
    this.flags.canCreateBattles = true;
    this.flags.canTransform = true;
    this.flags.canJoinTribe = true;
  } else {
    this.flags.isShadowBanned = false;
    this.flags.canVote = true;
    this.flags.canCreateBattles = true;
    this.flags.canTransform = true;
    this.flags.canJoinTribe = true;
  }
};

// Method to shadowban
trustScoreSchema.methods.shadowban = function(reason) {
  this.flags.isShadowBanned = true;
  this.flags.canVote = false;
  this.addViolation('shadowban', 'high', reason, 30);
  return this.save();
};

// Method to lift shadowban
trustScoreSchema.methods.liftShadowban = function(reason) {
  this.flags.isShadowBanned = false;
  this.flags.canVote = true;
  this.addPoints(20, `Shadowban lifted: ${reason}`, 'shadowban_lifted');
  return this.save();
};

// Method to temporarily ban
trustScoreSchema.methods.temporaryBan = function(duration, reason) {
  this.flags.isTemporarilyBanned = true;
  this.flags.canVote = false;
  this.flags.canCreateBattles = false;
  this.flags.canTransform = false;
  this.flags.canJoinTribe = false;
  this.addViolation('temporary_ban', 'high', reason, 40);
  
  // Set expiration
  setTimeout(() => {
    this.liftTemporaryBan('Ban period expired');
  }, duration);
  
  return this.save();
};

// Method to lift temporary ban
trustScoreSchema.methods.liftTemporaryBan = function(reason) {
  this.flags.isTemporarilyBanned = false;
  this.flags.canVote = true;
  this.flags.canCreateBattles = true;
  this.flags.canTransform = true;
  this.flags.canJoinTribe = true;
  this.addPoints(10, `Temporary ban lifted: ${reason}`, 'temporary_ban_lifted');
  return this.save();
};

// Method to permanently ban
trustScoreSchema.methods.permanentBan = function(reason) {
  this.flags.isPermanentlyBanned = true;
  this.flags.canVote = false;
  this.flags.canCreateBattles = false;
  this.flags.canTransform = false;
  this.flags.canJoinTribe = false;
  this.addViolation('permanent_ban', 'critical', reason, 50);
  return this.save();
};

// Method to apply daily decay
trustScoreSchema.methods.applyDailyDecay = function() {
  const now = new Date();
  const daysSinceLastDecay = Math.floor((now - this.lastDecay) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastDecay > 0) {
    // Decay 1 point per day for inactive users
    this.score = Math.max(0, this.score - daysSinceLastDecay);
    this.lastDecay = now;
    this.updateLevel();
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to get trust summary
trustScoreSchema.methods.getSummary = function() {
  return {
    id: this._id,
    userId: this.userId,
    score: this.score,
    level: this.level,
    flags: this.flags,
    violations: this.violations.length,
    history: this.history.length,
    lastUpdated: this.lastUpdated,
    createdAt: this.createdAt
  };
};

// Method to get recent history
trustScoreSchema.methods.getRecentHistory = function(limit = 10) {
  return this.history
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

// Method to get recent violations
trustScoreSchema.methods.getRecentViolations = function(limit = 10) {
  return this.violations
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

// Static method to create trust score
trustScoreSchema.statics.createTrustScore = function(userId, initialScore = 50) {
  return this.create({
    userId,
    score: initialScore
  });
};

// Static method to get trust score by user
trustScoreSchema.statics.getTrustScoreByUser = function(userId) {
  return this.findOne({ userId });
};

// Static method to get low trust users
trustScoreSchema.statics.getLowTrustUsers = function(threshold = 30, limit = 100) {
  return this.find({
    score: { $lt: threshold },
    'flags.isPermanentlyBanned': false
  })
    .sort({ score: 1 })
    .limit(limit)
    .populate('userId', 'username phone');
};

// Static method to get shadowbanned users
trustScoreSchema.statics.getShadowbannedUsers = function(limit = 100) {
  return this.find({
    'flags.isShadowBanned': true,
    'flags.isPermanentlyBanned': false
  })
    .sort({ lastUpdated: -1 })
    .limit(limit)
    .populate('userId', 'username phone');
};

// Static method to get trust score statistics
trustScoreSchema.statics.getTrustScoreStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
        minScore: { $min: '$score' },
        maxScore: { $max: '$score' }
      }
    },
    {
      $project: {
        level: '$_id',
        count: 1,
        avgScore: { $round: ['$avgScore', 2] },
        minScore: 1,
        maxScore: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get trust score trends
trustScoreSchema.statics.getTrustScoreTrends = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        lastUpdated: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$lastUpdated' },
          month: { $month: '$lastUpdated' },
          day: { $dayOfMonth: '$lastUpdated' }
        },
        totalUpdates: { $sum: 1 },
        avgScore: { $avg: '$score' },
        trustedUsers: {
          $sum: {
            $cond: [{ $eq: ['$level', 'trusted'] }, 1, 0]
          }
        },
        suspiciousUsers: {
          $sum: {
            $cond: [{ $eq: ['$level', 'suspicious'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get trust score levels
trustScoreSchema.statics.getTrustScoreLevels = function() {
  return [
    { key: 'trusted', name: 'Trusted', description: 'High trust score (80-100)', minScore: 80, maxScore: 100 },
    { key: 'normal', name: 'Normal', description: 'Normal trust score (50-79)', minScore: 50, maxScore: 79 },
    { key: 'suspicious', name: 'Suspicious', description: 'Low trust score (20-49)', minScore: 20, maxScore: 49 },
    { key: 'banned', name: 'Banned', description: 'Very low trust score (0-19)', minScore: 0, maxScore: 19 }
  ];
};

// Static method to get trust score actions
trustScoreSchema.statics.getTrustScoreActions = function() {
  return [
    { key: 'daily_activity', name: 'Daily Activity', description: 'User active daily', points: 5 },
    { key: 'challenge_accepted', name: 'Challenge Accepted', description: 'User accepted battle challenge', points: 10 },
    { key: 'transformation_created', name: 'Transformation Created', description: 'User created transformation', points: 5 },
    { key: 'battle_won', name: 'Battle Won', description: 'User won a battle', points: 3 },
    { key: 'tribe_joined', name: 'Tribe Joined', description: 'User joined a tribe', points: 2 },
    { key: 'referral_successful', name: 'Referral Successful', description: 'User successfully referred someone', points: 15 },
    { key: 'violation_nsfw', name: 'NSFW Violation', description: 'User attempted NSFW content', points: -70 },
    { key: 'violation_vote_fraud', name: 'Vote Fraud', description: 'User engaged in vote fraud', points: -40 },
    { key: 'violation_multi_account', name: 'Multi Account', description: 'User created multiple accounts', points: -50 },
    { key: 'violation_spam', name: 'Spam', description: 'User engaged in spam behavior', points: -30 }
  ];
};

// Static method to get trust score summary
trustScoreSchema.statics.getTrustScoreSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        trusted: {
          $sum: {
            $cond: [{ $eq: ['$level', 'trusted'] }, 1, 0]
          }
        },
        normal: {
          $sum: {
            $cond: [{ $eq: ['$level', 'normal'] }, 1, 0]
          }
        },
        suspicious: {
          $sum: {
            $cond: [{ $eq: ['$level', 'suspicious'] }, 1, 0]
          }
        },
        banned: {
          $sum: {
            $cond: [{ $eq: ['$level', 'banned'] }, 1, 0]
          }
        },
        shadowbanned: {
          $sum: {
            $cond: [{ $eq: ['$flags.isShadowBanned', true] }, 1, 0]
          }
        },
        avgScore: { $avg: '$score' }
      }
    },
    {
      $project: {
        total: 1,
        trusted: 1,
        normal: 1,
        suspicious: 1,
        banned: 1,
        shadowbanned: 1,
        avgScore: { $round: ['$avgScore', 2] },
        trustedPercentage: {
          $multiply: [{ $divide: ['$trusted', '$total'] }, 100]
        },
        suspiciousPercentage: {
          $multiply: [{ $divide: ['$suspicious', '$total'] }, 100]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('TrustScore', trustScoreSchema);
