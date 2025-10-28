const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  tribeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tribe',
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 280, // Twitter-style limit
    trim: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
    index: true,
  },
  type: {
    type: String,
    enum: ['message', 'announcement', 'system'],
    default: 'message',
    index: true,
  },
  reactions: [{
    emoji: {
      type: String,
      enum: ['❤️', '🔥', '😂', '👍'], // MVP reactions only
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes for performance
messageSchema.index({ tribeId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ 'reactions.userId': 1 });
messageSchema.index({ mentions: 1 });

// Virtual for reaction counts
messageSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  return counts;
});

// Method to add reaction
messageSchema.methods.addReaction = function(emoji, userId) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({ emoji, userId, createdAt: new Date() });
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(emoji, userId) {
  this.reactions = this.reactions.filter(r => 
    !(r.userId.toString() === userId.toString() && r.emoji === emoji)
  );
  return this.save();
};

// Method to check if user has reacted
messageSchema.methods.hasUserReacted = function(userId, emoji = null) {
  if (emoji) {
    return this.reactions.some(r => r.userId.toString() === userId.toString() && r.emoji === emoji);
  }
  return this.reactions.some(r => r.userId.toString() === userId.toString());
};

module.exports = mongoose.model('Message', messageSchema);
