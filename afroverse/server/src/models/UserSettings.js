const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  notifications: {
    // Push notification settings
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      battle: {
        type: Boolean,
        default: true
      },
      streak: {
        type: Boolean,
        default: true
      },
      tribe: {
        type: Boolean,
        default: true
      },
      daily: {
        type: Boolean,
        default: true
      },
      coin: {
        type: Boolean,
        default: true
      },
      system: {
        type: Boolean,
        default: true
      }
    },
    // WhatsApp notification settings
    whatsapp: {
      enabled: {
        type: Boolean,
        default: true
      },
      battle: {
        type: Boolean,
        default: true
      },
      streak: {
        type: Boolean,
        default: true
      },
      tribe: {
        type: Boolean,
        default: true
      }
    },
    // In-app notification settings
    inapp: {
      enabled: {
        type: Boolean,
        default: true
      },
      banner: {
        type: Boolean,
        default: true
      },
      sound: {
        type: Boolean,
        default: true
      },
      vibration: {
        type: Boolean,
        default: true
      }
    },
    // Email notification settings
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      weekly: {
        type: Boolean,
        default: false
      },
      system: {
        type: Boolean,
        default: true
      }
    }
  },
  // Timing preferences
  timing: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String,
        default: '22:00'
      },
      end: {
        type: String,
        default: '08:00'
      }
    },
    dailyReminder: {
      enabled: {
        type: Boolean,
        default: true
      },
      time: {
        type: String,
        default: '19:00'
      }
    },
    streakReminder: {
      enabled: {
        type: Boolean,
        default: true
      },
      time: {
        type: String,
        default: '23:00'
      }
    }
  },
  // Frequency controls
  frequency: {
    maxPerDay: {
      type: Number,
      default: 10
    },
    cooldownMinutes: {
      type: Number,
      default: 30
    },
    batchSimilar: {
      type: Boolean,
      default: true
    }
  },
  // Device tokens for push notifications
  deviceTokens: [{
    token: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // WhatsApp phone number
  whatsappPhone: {
    type: String,
    sparse: true,
    index: true
  },
  // Last notification sent (for cooldown)
  lastNotificationSent: {
    type: Date
  },
  // Notification statistics
  stats: {
    totalReceived: {
      type: Number,
      default: 0
    },
    totalRead: {
      type: Number,
      default: 0
    },
    lastReadAt: {
      type: Date
    },
    avgReadTime: {
      type: Number, // in seconds
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Instance methods
userSettingsSchema.methods.canReceiveNotification = function(type, channel) {
  const settings = this.notifications[channel];
  if (!settings || !settings.enabled) return false;
  
  // Check specific type setting
  if (settings[type] !== undefined) {
    return settings[type];
  }
  
  // Check if in quiet hours
  if (this.timing.quietHours.enabled) {
    const now = new Date();
    const userTime = new Date(now.toLocaleString("en-US", {timeZone: this.timing.timezone}));
    const currentTime = userTime.getHours() * 60 + userTime.getMinutes();
    
    const startTime = this.parseTime(this.timing.quietHours.start);
    const endTime = this.parseTime(this.timing.quietHours.end);
    
    if (startTime <= endTime) {
      // Same day quiet hours (e.g., 22:00 to 08:00)
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    }
  }
  
  // Check cooldown
  if (this.lastNotificationSent) {
    const cooldownMs = this.frequency.cooldownMinutes * 60 * 1000;
    if (Date.now() - this.lastNotificationSent.getTime() < cooldownMs) {
      return false;
    }
  }
  
  return true;
};

userSettingsSchema.methods.parseTime = function(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

userSettingsSchema.methods.addDeviceToken = function(token, platform) {
  // Remove existing token for this platform
  this.deviceTokens = this.deviceTokens.filter(dt => dt.platform !== platform);
  
  // Add new token
  this.deviceTokens.push({
    token,
    platform,
    lastUsed: new Date(),
    createdAt: new Date()
  });
  
  return this.save();
};

userSettingsSchema.methods.removeDeviceToken = function(token) {
  this.deviceTokens = this.deviceTokens.filter(dt => dt.token !== token);
  return this.save();
};

userSettingsSchema.methods.updateNotificationStats = function(readTime) {
  this.stats.totalReceived += 1;
  if (readTime) {
    this.stats.totalRead += 1;
    this.stats.lastReadAt = new Date();
    
    // Update average read time
    const currentAvg = this.stats.avgReadTime;
    const totalRead = this.stats.totalRead;
    this.stats.avgReadTime = ((currentAvg * (totalRead - 1)) + readTime) / totalRead;
  }
  
  this.lastNotificationSent = new Date();
  return this.save();
};

// Static methods
userSettingsSchema.statics.getOrCreate = async function(userId) {
  let settings = await this.findOne({ userId });
  if (!settings) {
    settings = new this({ userId });
    await settings.save();
  }
  return settings;
};

userSettingsSchema.statics.getUsersForNotification = function(type, channel) {
  return this.find({
    [`notifications.${channel}.enabled`]: true,
    [`notifications.${channel}.${type}`]: true
  }).populate('userId', 'username email phone');
};

module.exports = mongoose.model('UserSettings', userSettingsSchema);
