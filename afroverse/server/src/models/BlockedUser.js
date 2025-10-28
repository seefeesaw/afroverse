const mongoose = require('mongoose');

const blockedUserSchema = new mongoose.Schema({
  blockerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  blockedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: [
      'harassment',
      'spam',
      'inappropriate_content',
      'unwanted_contact',
      'fake_profile',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    maxlength: 500,
    required: false
  },
  mutual: {
    type: Boolean,
    default: false
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

// Compound indexes
blockedUserSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });
blockedUserSchema.index({ blockedUserId: 1, createdAt: -1 });

// Instance methods
blockedUserSchema.methods.unblock = function() {
  return this.deleteOne();
};

// Static methods
blockedUserSchema.statics.isBlocked = function(blockerId, blockedUserId) {
  return this.findOne({
    $or: [
      { blockerId, blockedUserId },
      { blockerId: blockedUserId, blockedUserId: blockerId, mutual: true }
    ]
  });
};

blockedUserSchema.statics.getBlockedUsers = function(userId) {
  return this.find({ blockerId: userId })
    .populate('blockedUserId', 'username avatar')
    .sort({ createdAt: -1 });
};

blockedUserSchema.statics.getBlockers = function(userId) {
  return this.find({ blockedUserId: userId })
    .populate('blockerId', 'username avatar')
    .sort({ createdAt: -1 });
};

blockedUserSchema.statics.blockUser = async function(blockerId, blockedUserId, reason, description) {
  // Check if already blocked
  const existingBlock = await this.isBlocked(blockerId, blockedUserId);
  if (existingBlock) {
    throw new Error('User is already blocked');
  }

  // Check if mutual block exists
  const mutualBlock = await this.findOne({
    blockerId: blockedUserId,
    blockedUserId: blockerId
  });

  const blockData = {
    blockerId,
    blockedUserId,
    reason,
    description
  };

  if (mutualBlock) {
    // Make it mutual
    mutualBlock.mutual = true;
    await mutualBlock.save();
    
    blockData.mutual = true;
  }

  return this.create(blockData);
};

blockedUserSchema.statics.unblockUser = function(blockerId, blockedUserId) {
  return this.findOneAndDelete({
    blockerId,
    blockedUserId
  });
};

blockedUserSchema.statics.getBlockStats = function(userId) {
  return Promise.all([
    this.countDocuments({ blockerId: userId }),
    this.countDocuments({ blockedUserId: userId }),
    this.countDocuments({ blockerId: userId, mutual: true })
  ]).then(([blockedCount, blockedByCount, mutualCount]) => ({
    blockedCount,
    blockedByCount,
    mutualCount
  }));
};

module.exports = mongoose.model('BlockedUser', blockedUserSchema);
