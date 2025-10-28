const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastMessage: {
    text: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  blockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Ensure participants array has exactly 2 users
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }
  
  // Sort participants to ensure consistent ordering
  this.participants.sort();
  next();
});

// Indexes for performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ isActive: 1, lastMessageAt: -1 });

// Compound index for finding conversations between two users
conversationSchema.index({ 
  participants: 1, 
  isActive: 1 
}, { 
  unique: true,
  partialFilterExpression: { isActive: true }
});

// Method to get the other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

// Method to update last message
conversationSchema.methods.updateLastMessage = function(text, senderId) {
  this.lastMessage = { text, senderId };
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to increment unread count
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Method to reset unread count
conversationSchema.methods.resetUnreadCount = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Method to block user
conversationSchema.methods.blockUser = function(userId) {
  if (!this.blockedBy.includes(userId)) {
    this.blockedBy.push(userId);
    this.isActive = false;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to unblock user
conversationSchema.methods.unblockUser = function(userId) {
  this.blockedBy = this.blockedBy.filter(id => id.toString() !== userId.toString());
  if (this.blockedBy.length === 0) {
    this.isActive = true;
  }
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
