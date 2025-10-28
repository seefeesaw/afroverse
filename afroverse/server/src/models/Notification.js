const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'battle_challenge',
      'battle_live',
      'battle_vote',
      'battle_result',
      'streak_reminder',
      'streak_saved',
      'tribe_alert',
      'tribe_weekly_reset',
      'daily_challenge',
      'coin_earned',
      'coin_low',
      'referral_join',
      'system_update',
      'moderation_action'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 200
  },
  actionUrl: {
    type: String,
    required: false
  },
  channel: {
    type: String,
    enum: ['push', 'inapp', 'whatsapp', 'email'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sentAt: {
    type: Date,
    index: true
  },
  readAt: {
    type: Date,
    index: true
  },
  deliveredAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index for auto-cleanup
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
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ channel: 1, status: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.retryCount += 1;
  this.updatedAt = new Date();
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    userId,
    status: { $in: ['sent', 'delivered'] }
  });
};

notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    type = null,
    status = null,
    channel = null
  } = options;

  const query = { userId };
  if (type) query.type = type;
  if (status) query.status = status;
  if (channel) query.channel = channel;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username avatar');
};

notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, status: { $in: ['sent', 'delivered'] } },
    { 
      status: 'read', 
      readAt: new Date(),
      updatedAt: new Date()
    }
  );
};

notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);