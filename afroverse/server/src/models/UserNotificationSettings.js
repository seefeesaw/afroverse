const mongoose = require('mongoose');

const userNotificationSettingsSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channels: {
    whatsapp: {
      enabled: {
        type: Boolean,
        default: true
      },
      otpOnly: {
        type: Boolean,
        default: false
      },
      phoneNumber: {
        type: String,
        default: null
      },
      lastOptInAt: {
        type: Date,
        default: null
      }
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      tokens: [{
        token: String,
        platform: {
          type: String,
          enum: ['web', 'android', 'ios'],
          default: 'web'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }]
    },
    inapp: {
      enabled: {
        type: Boolean,
        default: true
      }
    }
  },
  categories: {
    transactional: {
      type: Boolean,
      default: true
    },
    streak: {
      type: Boolean,
      default: true
    },
    battle: {
      type: Boolean,
      default: true
    },
    tribe: {
      type: Boolean,
      default: true
    },
    leaderboard: {
      type: Boolean,
      default: true
    },
    lifecycle: {
      type: Boolean,
      default: false
    }
  },
  quietHours: {
    enabled: {
      type: Boolean,
      default: true
    },
    start: {
      type: String,
      default: '22:00'
    },
    end: {
      type: String,
      default: '07:00'
    },
    timezone: {
      type: String,
      default: 'Africa/Johannesburg'
    },
    bypassTransactional: {
      type: Boolean,
      default: true
    }
  },
  frequencyCaps: {
    perHour: {
      type: Number,
      default: 2
    },
    perDay: {
      type: Number,
      default: 6
    }
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
userNotificationSettingsSchema.index({ _id: 1 }, { unique: true });
userNotificationSettingsSchema.index({ 'channels.whatsapp.enabled': 1 });
userNotificationSettingsSchema.index({ 'channels.push.enabled': 1 });
userNotificationSettingsSchema.index({ 'channels.inapp.enabled': 1 });

// Method to check if channel is enabled
userNotificationSettingsSchema.methods.isChannelEnabled = function(channel) {
  return this.channels[channel]?.enabled || false;
};

// Method to check if category is enabled
userNotificationSettingsSchema.methods.isCategoryEnabled = function(category) {
  return this.categories[category] || false;
};

// Method to check if in quiet hours
userNotificationSettingsSchema.methods.isInQuietHours = function() {
  if (!this.quietHours.enabled) return false;
  
  const now = new Date();
  const tz = this.quietHours.timezone || 'Africa/Johannesburg';
  const localTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const currentHour = localTime.getHours();
  const currentMinute = localTime.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const startTime = this.parseTimeString(this.quietHours.start);
  const endTime = this.parseTimeString(this.quietHours.end);
  
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    // Quiet hours span midnight
    return currentTime >= startTime || currentTime < endTime;
  }
};

// Method to parse time string (HH:MM) to minutes
userNotificationSettingsSchema.methods.parseTimeString = function(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Method to check if notification should be sent
userNotificationSettingsSchema.methods.shouldSendNotification = function(channel, category, bypassQuietHours = false) {
  // Check if channel is enabled
  if (!this.isChannelEnabled(channel)) {
    return { shouldSend: false, reason: 'channel_disabled' };
  }
  
  // Check if category is enabled
  if (!this.isCategoryEnabled(category)) {
    return { shouldSend: false, reason: 'category_disabled' };
  }
  
  // Check quiet hours (unless bypassed for transactional)
  if (!bypassQuietHours && this.isInQuietHours()) {
    if (category === 'transactional' && this.quietHours.bypassTransactional) {
      // Allow transactional notifications during quiet hours
    } else {
      return { shouldSend: false, reason: 'quiet_hours' };
    }
  }
  
  return { shouldSend: true, reason: 'allowed' };
};

// Method to add push token
userNotificationSettingsSchema.methods.addPushToken = function(token, platform = 'web') {
  // Remove existing token if it exists
  this.channels.push.tokens = this.channels.push.tokens.filter(t => t.token !== token);
  
  // Add new token
  this.channels.push.tokens.push({
    token,
    platform,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to remove push token
userNotificationSettingsSchema.methods.removePushToken = function(token) {
  this.channels.push.tokens = this.channels.push.tokens.filter(t => t.token !== token);
  return this.save();
};

// Method to update settings
userNotificationSettingsSchema.methods.updateSettings = function(updates) {
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      this.set(key, updates[key]);
    }
  });
  
  this.lastUpdatedAt = new Date();
  return this.save();
};

// Static method to get or create settings
userNotificationSettingsSchema.statics.getOrCreate = async function(userId) {
  let settings = await this.findById(userId);
  
  if (!settings) {
    settings = await this.create({
      _id: userId
    });
  }
  
  return settings;
};

// Static method to get users for targeting
userNotificationSettingsSchema.statics.getUsersForTargeting = async function(targetingRules) {
  const query = {};
  
  // Build query based on targeting rules
  if (targetingRules.channels) {
    targetingRules.channels.forEach(channel => {
      query[`channels.${channel}.enabled`] = true;
    });
  }
  
  if (targetingRules.categories) {
    targetingRules.categories.forEach(category => {
      query[`categories.${category}`] = true;
    });
  }
  
  return this.find(query).lean();
};

module.exports = mongoose.model('UserNotificationSettings', userNotificationSettingsSchema);
