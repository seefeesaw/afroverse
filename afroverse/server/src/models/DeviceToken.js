const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['web', 'android', 'ios'],
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    default: null,
    index: true
  },
  userAgent: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
deviceTokenSchema.index({ userId: 1, isActive: 1 });
deviceTokenSchema.index({ platform: 1, isActive: 1 });
deviceTokenSchema.index({ lastUsedAt: -1 });

// Method to mark as used
deviceTokenSchema.methods.markAsUsed = function() {
  this.lastUsedAt = new Date();
  return this.save();
};

// Method to deactivate
deviceTokenSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Method to check if token is valid
deviceTokenSchema.methods.isValid = function() {
  return this.isActive && this.lastUsedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
};

// Method to get token summary
deviceTokenSchema.methods.getSummary = function() {
  return {
    id: this._id,
    userId: this.userId,
    platform: this.platform,
    deviceId: this.deviceId,
    isActive: this.isActive,
    lastUsedAt: this.lastUsedAt,
    isValid: this.isValid(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to create device token
deviceTokenSchema.statics.createDeviceToken = function(userId, token, platform, deviceId = null, userAgent = null, metadata = {}) {
  return this.create({
    userId,
    token,
    platform,
    deviceId,
    userAgent,
    metadata
  });
};

// Static method to get device token by token
deviceTokenSchema.statics.getDeviceTokenByToken = function(token) {
  return this.findOne({ token, isActive: true });
};

// Static method to get device tokens by user
deviceTokenSchema.statics.getDeviceTokensByUser = function(userId) {
  return this.find({ userId, isActive: true });
};

// Static method to get device tokens by platform
deviceTokenSchema.statics.getDeviceTokensByPlatform = function(platform) {
  return this.find({ platform, isActive: true });
};

// Static method to get active device tokens
deviceTokenSchema.statics.getActiveDeviceTokens = function() {
  return this.find({ isActive: true });
};

// Static method to get device token statistics
deviceTokenSchema.statics.getDeviceTokenStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          platform: '$platform',
          isActive: '$isActive'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.platform',
        active: {
          $sum: {
            $cond: [{ $eq: ['$_id.isActive', true] }, '$count', 0]
          }
        },
        inactive: {
          $sum: {
            $cond: [{ $eq: ['$_id.isActive', false] }, '$count', 0]
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

// Static method to get device token trends
deviceTokenSchema.statics.getDeviceTokenTrends = function(days = 30) {
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
        totalTokens: { $sum: 1 },
        activeTokens: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get device token performance
deviceTokenSchema.statics.getDeviceTokenPerformance = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$platform',
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        lastUsed: {
          $max: '$lastUsedAt'
        }
      }
    },
    {
      $project: {
        platform: '$_id',
        total: 1,
        active: 1,
        lastUsed: 1,
        activeRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$active', '$total'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get device token summary
deviceTokenSchema.statics.getDeviceTokenSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        inactive: {
          $sum: {
            $cond: [{ $eq: ['$isActive', false] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        active: 1,
        inactive: 1,
        activeRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$active', '$total'] }, 100] }
          ]
        }
      }
    }
  ]);
};

// Static method to get device token platforms
deviceTokenSchema.statics.getDeviceTokenPlatforms = function() {
  return [
    { key: 'web', name: 'Web', description: 'Web browser push notifications' },
    { key: 'android', name: 'Android', description: 'Android mobile app push notifications' },
    { key: 'ios', name: 'iOS', description: 'iOS mobile app push notifications' }
  ];
};

// Static method to get device token statuses
deviceTokenSchema.statics.getDeviceTokenStatuses = function() {
  return [
    { key: 'active', name: 'Active', description: 'Active device token' },
    { key: 'inactive', name: 'Inactive', description: 'Inactive device token' }
  ];
};

// Static method to get device token types
deviceTokenSchema.statics.getDeviceTokenTypes = function() {
  return [
    { key: 'fcm', name: 'Firebase Cloud Messaging', description: 'FCM push notification token' },
    { key: 'apns', name: 'Apple Push Notification Service', description: 'APNS push notification token' },
    { key: 'web', name: 'Web Push', description: 'Web push notification token' }
  ];
};

// Static method to get device token validation rules
deviceTokenSchema.statics.getDeviceTokenValidationRules = function() {
  return [
    { key: 'token_required', name: 'Token Required', description: 'Device token is required' },
    { key: 'platform_required', name: 'Platform Required', description: 'Platform is required' },
    { key: 'token_unique', name: 'Token Unique', description: 'Device token must be unique' },
    { key: 'platform_valid', name: 'Platform Valid', description: 'Platform must be valid' }
  ];
};

// Static method to get device token error messages
deviceTokenSchema.statics.getDeviceTokenErrorMessages = function() {
  return {
    'TOKEN_REQUIRED': 'Device token is required',
    'PLATFORM_REQUIRED': 'Platform is required',
    'TOKEN_NOT_UNIQUE': 'Device token already exists',
    'PLATFORM_INVALID': 'Invalid platform',
    'TOKEN_NOT_FOUND': 'Device token not found',
    'TOKEN_INACTIVE': 'Device token is inactive',
    'TOKEN_EXPIRED': 'Device token has expired'
  };
};

// Static method to get device token success messages
deviceTokenSchema.statics.getDeviceTokenSuccessMessages = function() {
  return {
    'TOKEN_CREATED': 'Device token created successfully',
    'TOKEN_UPDATED': 'Device token updated successfully',
    'TOKEN_DELETED': 'Device token deleted successfully',
    'TOKEN_ACTIVATED': 'Device token activated successfully',
    'TOKEN_DEACTIVATED': 'Device token deactivated successfully'
  };
};

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
