const mongoose = require('mongoose');

const chatSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  tribeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tribe',
    required: true,
    index: true,
  },
  isMuted: {
    type: Boolean,
    default: false,
    index: true,
  },
  mutedUntil: {
    type: Date,
    default: null,
  },
  mutedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  muteReason: {
    type: String,
    default: null,
  },
  isShadowbanned: {
    type: Boolean,
    default: false,
    index: true,
  },
  shadowbanUntil: {
    type: Date,
    default: null,
  },
  shadowbanReason: {
    type: String,
    default: null,
  },
  lastMessageAt: {
    type: Date,
    default: null,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  violationCount: {
    type: Number,
    default: 0,
  },
  lastViolationAt: {
    type: Date,
    default: null,
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  notificationSettings: {
    tribeChat: {
      type: Boolean,
      default: true,
    },
    mentions: {
      type: Boolean,
      default: true,
    },
    dms: {
      type: Boolean,
      default: true,
    },
    announcements: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

// Indexes for performance
chatSettingsSchema.index({ tribeId: 1, isMuted: 1 });
chatSettingsSchema.index({ tribeId: 1, isShadowbanned: 1 });
chatSettingsSchema.index({ lastMessageAt: -1 });

// Method to mute user
chatSettingsSchema.methods.muteUser = function(durationHours = 24, mutedBy, reason = 'Violation of chat rules') {
  this.isMuted = true;
  this.mutedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  this.mutedBy = mutedBy;
  this.muteReason = reason;
  return this.save();
};

// Method to unmute user
chatSettingsSchema.methods.unmuteUser = function() {
  this.isMuted = false;
  this.mutedUntil = null;
  this.mutedBy = null;
  this.muteReason = null;
  return this.save();
};

// Method to shadowban user
chatSettingsSchema.methods.shadowbanUser = function(durationHours = 168, reason = 'Spam or toxic behavior') {
  this.isShadowbanned = true;
  this.shadowbanUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  this.shadowbanReason = reason;
  return this.save();
};

// Method to lift shadowban
chatSettingsSchema.methods.liftShadowban = function() {
  this.isShadowbanned = false;
  this.shadowbanUntil = null;
  this.shadowbanReason = null;
  return this.save();
};

// Method to check if user can send messages
chatSettingsSchema.methods.canSendMessage = function() {
  const now = new Date();
  
  // Check if muted and mute hasn't expired
  if (this.isMuted && this.mutedUntil && this.mutedUntil > now) {
    return false;
  }
  
  // Check if shadowbanned and shadowban hasn't expired
  if (this.isShadowbanned && this.shadowbanUntil && this.shadowbanUntil > now) {
    return false;
  }
  
  return true;
};

// Method to record violation
chatSettingsSchema.methods.recordViolation = function() {
  this.violationCount += 1;
  this.lastViolationAt = new Date();
  
  // Auto-mute after 3 violations
  if (this.violationCount >= 3) {
    this.muteUser(24, null, 'Automatic mute after multiple violations');
  }
  
  return this.save();
};

// Method to reset violation count
chatSettingsSchema.methods.resetViolations = function() {
  this.violationCount = 0;
  this.lastViolationAt = null;
  return this.save();
};

module.exports = mongoose.model('ChatSettings', chatSettingsSchema);
