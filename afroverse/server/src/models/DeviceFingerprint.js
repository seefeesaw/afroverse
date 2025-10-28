const mongoose = require('mongoose');

const deviceFingerprintSchema = new mongoose.Schema({
  fingerprint: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  deviceInfo: {
    userAgent: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['web', 'android', 'ios'],
      required: true
    },
    screenResolution: {
      type: String,
      default: null
    },
    timezone: {
      type: String,
      default: null
    },
    language: {
      type: String,
      default: null
    },
    browser: {
      type: String,
      default: null
    },
    os: {
      type: String,
      default: null
    }
  },
  ipAddresses: [{
    address: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: null
    },
    region: {
      type: String,
      default: null
    },
    city: {
      type: String,
      default: null
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    isp: {
      type: String,
      default: null
    },
    firstSeen: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  sessions: [{
    sessionId: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  activity: {
    totalVotes: {
      type: Number,
      default: 0
    },
    totalBattles: {
      type: Number,
      default: 0
    },
    totalTransformations: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  flags: {
    isSuspicious: {
      type: Boolean,
      default: false,
      index: true
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true
    },
    isMultiAccount: {
      type: Boolean,
      default: false,
      index: true
    },
    isBot: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
deviceFingerprintSchema.index({ fingerprint: 1 });
deviceFingerprintSchema.index({ 'userIds': 1 });
deviceFingerprintSchema.index({ 'flags.isSuspicious': 1 });
deviceFingerprintSchema.index({ 'flags.isBlocked': 1 });
deviceFingerprintSchema.index({ 'flags.isMultiAccount': 1 });
deviceFingerprintSchema.index({ riskScore: -1 });
deviceFingerprintSchema.index({ 'activity.lastActivity': -1 });

// Method to add user
deviceFingerprintSchema.methods.addUser = function(userId) {
  if (!this.userIds.includes(userId)) {
    this.userIds.push(userId);
    
    // Check if this makes it multi-account
    if (this.userIds.length > 1) {
      this.flags.isMultiAccount = true;
      this.riskScore = Math.min(100, this.riskScore + 20);
    }
  }
  
  return this.save();
};

// Method to remove user
deviceFingerprintSchema.methods.removeUser = function(userId) {
  this.userIds = this.userIds.filter(id => id.toString() !== userId.toString());
  
  // Update multi-account flag
  if (this.userIds.length <= 1) {
    this.flags.isMultiAccount = false;
    this.riskScore = Math.max(0, this.riskScore - 20);
  }
  
  return this.save();
};

// Method to add IP address
deviceFingerprintSchema.methods.addIPAddress = function(ipAddress, geoData = {}) {
  const existingIP = this.ipAddresses.find(ip => ip.address === ipAddress);
  
  if (existingIP) {
    existingIP.lastSeen = new Date();
  } else {
    this.ipAddresses.push({
      address: ipAddress,
      country: geoData.country || null,
      region: geoData.region || null,
      city: geoData.city || null,
      coordinates: geoData.coordinates || null,
      isp: geoData.isp || null,
      firstSeen: new Date(),
      lastSeen: new Date()
    });
    
    // Increase risk score for multiple IPs
    if (this.ipAddresses.length > 3) {
      this.riskScore = Math.min(100, this.riskScore + 10);
    }
  }
  
  return this.save();
};

// Method to add session
deviceFingerprintSchema.methods.addSession = function(sessionId, userId) {
  this.sessions.push({
    sessionId,
    userId,
    startTime: new Date(),
    isActive: true
  });
  
  return this.save();
};

// Method to end session
deviceFingerprintSchema.methods.endSession = function(sessionId) {
  const session = this.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.endTime = new Date();
    session.isActive = false;
  }
  
  return this.save();
};

// Method to update activity
deviceFingerprintSchema.methods.updateActivity = function(activityType) {
  this.activity.lastActivity = new Date();
  
  switch (activityType) {
    case 'vote':
      this.activity.totalVotes++;
      break;
    case 'battle':
      this.activity.totalBattles++;
      break;
    case 'transformation':
      this.activity.totalTransformations++;
      break;
  }
  
  return this.save();
};

// Method to mark as suspicious
deviceFingerprintSchema.methods.markAsSuspicious = function(reason) {
  this.flags.isSuspicious = true;
  this.riskScore = Math.min(100, this.riskScore + 30);
  
  if (this.metadata.suspiciousReasons) {
    this.metadata.suspiciousReasons.push({
      reason,
      timestamp: new Date()
    });
  } else {
    this.metadata.suspiciousReasons = [{
      reason,
      timestamp: new Date()
    }];
  }
  
  return this.save();
};

// Method to mark as blocked
deviceFingerprintSchema.methods.markAsBlocked = function(reason) {
  this.flags.isBlocked = true;
  this.riskScore = 100;
  
  if (this.metadata.blockReasons) {
    this.metadata.blockReasons.push({
      reason,
      timestamp: new Date()
    });
  } else {
    this.metadata.blockReasons = [{
      reason,
      timestamp: new Date()
    }];
  }
  
  return this.save();
};

// Method to mark as bot
deviceFingerprintSchema.methods.markAsBot = function(reason) {
  this.flags.isBot = true;
  this.riskScore = Math.min(100, this.riskScore + 50);
  
  if (this.metadata.botReasons) {
    this.metadata.botReasons.push({
      reason,
      timestamp: new Date()
    });
  } else {
    this.metadata.botReasons = [{
      reason,
      timestamp: new Date()
    }];
  }
  
  return this.save();
};

// Method to calculate risk score
deviceFingerprintSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Multi-account penalty
  if (this.flags.isMultiAccount) {
    score += 20;
  }
  
  // Multiple IP addresses
  if (this.ipAddresses.length > 3) {
    score += 10;
  }
  
  // Suspicious activity
  if (this.flags.isSuspicious) {
    score += 30;
  }
  
  // Bot detection
  if (this.flags.isBot) {
    score += 50;
  }
  
  // High activity patterns
  if (this.activity.totalVotes > 100) {
    score += 15;
  }
  
  // Geographic anomalies
  const countries = new Set(this.ipAddresses.map(ip => ip.country));
  if (countries.size > 2) {
    score += 10;
  }
  
  this.riskScore = Math.min(100, score);
  return this.save();
};

// Method to get device summary
deviceFingerprintSchema.methods.getSummary = function() {
  return {
    id: this._id,
    fingerprint: this.fingerprint,
    userIds: this.userIds,
    deviceInfo: this.deviceInfo,
    ipCount: this.ipAddresses.length,
    sessionCount: this.sessions.length,
    activity: this.activity,
    flags: this.flags,
    riskScore: this.riskScore,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to create device fingerprint
deviceFingerprintSchema.statics.createDeviceFingerprint = function(fingerprint, userId, deviceInfo, ipAddress, geoData = {}) {
  return this.create({
    fingerprint,
    userIds: [userId],
    deviceInfo,
    ipAddresses: [{
      address: ipAddress,
      country: geoData.country || null,
      region: geoData.region || null,
      city: geoData.city || null,
      coordinates: geoData.coordinates || null,
      isp: geoData.isp || null,
      firstSeen: new Date(),
      lastSeen: new Date()
    }]
  });
};

// Static method to get device fingerprint by fingerprint
deviceFingerprintSchema.statics.getDeviceFingerprintByFingerprint = function(fingerprint) {
  return this.findOne({ fingerprint });
};

// Static method to get device fingerprints by user
deviceFingerprintSchema.statics.getDeviceFingerprintsByUser = function(userId) {
  return this.find({ userIds: userId });
};

// Static method to get suspicious devices
deviceFingerprintSchema.statics.getSuspiciousDevices = function(limit = 100) {
  return this.find({
    'flags.isSuspicious': true,
    'flags.isBlocked': false
  })
    .sort({ riskScore: -1 })
    .limit(limit)
    .populate('userIds', 'username phone');
};

// Static method to get multi-account devices
deviceFingerprintSchema.statics.getMultiAccountDevices = function(limit = 100) {
  return this.find({
    'flags.isMultiAccount': true
  })
    .sort({ riskScore: -1 })
    .limit(limit)
    .populate('userIds', 'username phone');
};

// Static method to get blocked devices
deviceFingerprintSchema.statics.getBlockedDevices = function(limit = 100) {
  return this.find({
    'flags.isBlocked': true
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('userIds', 'username phone');
};

// Static method to get device fingerprint statistics
deviceFingerprintSchema.statics.getDeviceFingerprintStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        suspicious: {
          $sum: {
            $cond: [{ $eq: ['$flags.isSuspicious', true] }, 1, 0]
          }
        },
        blocked: {
          $sum: {
            $cond: [{ $eq: ['$flags.isBlocked', true] }, 1, 0]
          }
        },
        multiAccount: {
          $sum: {
            $cond: [{ $eq: ['$flags.isMultiAccount', true] }, 1, 0]
          }
        },
        bot: {
          $sum: {
            $cond: [{ $eq: ['$flags.isBot', true] }, 1, 0]
          }
        },
        avgRiskScore: { $avg: '$riskScore' }
      }
    },
    {
      $project: {
        total: 1,
        suspicious: 1,
        blocked: 1,
        multiAccount: 1,
        bot: 1,
        avgRiskScore: { $round: ['$avgRiskScore', 2] },
        suspiciousPercentage: {
          $multiply: [{ $divide: ['$suspicious', '$total'] }, 100]
        },
        blockedPercentage: {
          $multiply: [{ $divide: ['$blocked', '$total'] }, 100]
        }
      }
    }
  ]);
};

// Static method to get device fingerprint trends
deviceFingerprintSchema.statics.getDeviceFingerprintTrends = function(days = 30) {
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
        totalDevices: { $sum: 1 },
        suspiciousDevices: {
          $sum: {
            $cond: [{ $eq: ['$flags.isSuspicious', true] }, 1, 0]
          }
        },
        multiAccountDevices: {
          $sum: {
            $cond: [{ $eq: ['$flags.isMultiAccount', true] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get device fingerprint platforms
deviceFingerprintSchema.statics.getDeviceFingerprintPlatforms = function() {
  return [
    { key: 'web', name: 'Web', description: 'Web browser' },
    { key: 'android', name: 'Android', description: 'Android mobile app' },
    { key: 'ios', name: 'iOS', description: 'iOS mobile app' }
  ];
};

// Static method to get device fingerprint flags
deviceFingerprintSchema.statics.getDeviceFingerprintFlags = function() {
  return [
    { key: 'isSuspicious', name: 'Suspicious', description: 'Device shows suspicious behavior' },
    { key: 'isBlocked', name: 'Blocked', description: 'Device is blocked' },
    { key: 'isMultiAccount', name: 'Multi Account', description: 'Device used by multiple accounts' },
    { key: 'isBot', name: 'Bot', description: 'Device identified as bot' }
  ];
};

// Static method to get device fingerprint summary
deviceFingerprintSchema.statics.getDeviceFingerprintSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        suspicious: {
          $sum: {
            $cond: [{ $eq: ['$flags.isSuspicious', true] }, 1, 0]
          }
        },
        blocked: {
          $sum: {
            $cond: [{ $eq: ['$flags.isBlocked', true] }, 1, 0]
          }
        },
        multiAccount: {
          $sum: {
            $cond: [{ $eq: ['$flags.isMultiAccount', true] }, 1, 0]
          }
        },
        bot: {
          $sum: {
            $cond: [{ $eq: ['$flags.isBot', true] }, 1, 0]
          }
        },
        avgRiskScore: { $avg: '$riskScore' }
      }
    },
    {
      $project: {
        total: 1,
        suspicious: 1,
        blocked: 1,
        multiAccount: 1,
        bot: 1,
        avgRiskScore: { $round: ['$avgRiskScore', 2] }
      }
    }
  ]);
};

module.exports = mongoose.model('DeviceFingerprint', deviceFingerprintSchema);
