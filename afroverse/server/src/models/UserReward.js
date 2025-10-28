const mongoose = require('mongoose');

const userRewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['voucher', 'token', 'cosmetic', 'boost', 'xp', 'title'],
      required: true
    },
    key: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      default: 1
    },
    expiresAt: {
      type: Date,
      default: null
    },
    claimed: {
      type: Boolean,
      default: false
    },
    grantedBy: {
      type: {
        type: String,
        enum: ['achievement', 'levelup', 'purchase', 'admin', 'weekly', 'seasonal'],
        required: true
      },
      ref: {
        type: String,
        required: true
      }
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    claimedAt: {
      type: Date,
      default: null
    },
    consumedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
userRewardSchema.index({ userId: 1 });
userRewardSchema.index({ 'items.claimed': 1 });
userRewardSchema.index({ 'items.expiresAt': 1 });
userRewardSchema.index({ 'items.grantedAt': -1 });

// Method to add reward
userRewardSchema.methods.addReward = function(reward) {
  const rewardId = new mongoose.Types.ObjectId().toString();
  
  const newReward = {
    id: rewardId,
    type: reward.type,
    key: reward.key,
    label: reward.label || this.deriveLabel(reward.key),
    qty: reward.qty || 1,
    expiresAt: reward.expiresAt || null,
    claimed: false,
    grantedBy: reward.grantedBy,
    grantedAt: new Date(),
    metadata: reward.metadata || {}
  };

  this.items.push(newReward);
  this.lastUpdatedAt = new Date();
  
  return rewardId;
};

// Method to claim reward
userRewardSchema.methods.claimReward = function(rewardId) {
  const reward = this.items.find(item => item.id === rewardId);
  
  if (!reward) {
    throw new Error('Reward not found');
  }
  
  if (reward.claimed) {
    throw new Error('Reward already claimed');
  }
  
  if (reward.expiresAt && new Date() > reward.expiresAt) {
    throw new Error('Reward expired');
  }
  
  reward.claimed = true;
  reward.claimedAt = new Date();
  this.lastUpdatedAt = new Date();
  
  return reward;
};

// Method to consume reward
userRewardSchema.methods.consumeReward = function(rewardId) {
  const reward = this.items.find(item => item.id === rewardId);
  
  if (!reward) {
    throw new Error('Reward not found');
  }
  
  if (!reward.claimed) {
    throw new Error('Reward not claimed');
  }
  
  if (reward.consumedAt) {
    throw new Error('Reward already consumed');
  }
  
  reward.consumedAt = new Date();
  this.lastUpdatedAt = new Date();
  
  return reward;
};

// Method to get unclaimed rewards
userRewardSchema.methods.getUnclaimedRewards = function() {
  return this.items.filter(item => 
    !item.claimed && 
    (!item.expiresAt || new Date() < item.expiresAt)
  );
};

// Method to get claimed rewards
userRewardSchema.methods.getClaimedRewards = function() {
  return this.items.filter(item => item.claimed);
};

// Method to get expired rewards
userRewardSchema.methods.getExpiredRewards = function() {
  return this.items.filter(item => 
    item.expiresAt && new Date() > item.expiresAt
  );
};

// Method to get inventory summary
userRewardSchema.methods.getInventorySummary = function() {
  const summary = {
    vouchers: {},
    tokens: {},
    boosts: [],
    cosmetics: {
      owned: [],
      temporary: []
    }
  };

  this.items.forEach(item => {
    if (item.claimed && !item.consumedAt) {
      switch (item.type) {
        case 'voucher':
          summary.vouchers[item.key] = (summary.vouchers[item.key] || 0) + item.qty;
          break;
        case 'token':
          summary.tokens[item.key] = (summary.tokens[item.key] || 0) + item.qty;
          break;
        case 'boost':
          summary.boosts.push({
            key: item.key,
            label: item.label,
            expiresAt: item.expiresAt,
            metadata: item.metadata
          });
          break;
        case 'cosmetic':
          if (item.expiresAt) {
            summary.cosmetics.temporary.push({
              key: item.key,
              label: item.label,
              expiresAt: item.expiresAt
            });
          } else {
            summary.cosmetics.owned.push(item.key);
          }
          break;
      }
    }
  });

  return summary;
};

// Method to get reward count by type
userRewardSchema.methods.getRewardCountByType = function() {
  const counts = {};
  
  this.items.forEach(item => {
    if (item.claimed && !item.consumedAt) {
      counts[item.type] = (counts[item.type] || 0) + item.qty;
    }
  });
  
  return counts;
};

// Method to derive label from key
userRewardSchema.methods.deriveLabel = function(key) {
  const labels = {
    'style_voucher': 'Premium Style Voucher',
    'freeze': 'Freeze Token',
    'xp_2x': '2× XP Boost',
    'frame_gold': 'Gold Frame',
    'frame_diamond': 'Diamond Frame',
    'frame_mythic': 'Mythic Frame',
    'title_diamond': 'Diamond Elder',
    'title_warrior': 'Warrior',
    'title_unstoppable': 'Unstoppable',
    'confetti_classic': 'Confetti Animation',
    'tribe_pin': 'Tribe Pin',
    'tribe_crown': 'Tribe Crown'
  };
  
  return labels[key] || key;
};

// Method to check if user has reward
userRewardSchema.methods.hasReward = function(key, qty = 1) {
  const reward = this.items.find(item => 
    item.key === key && 
    item.claimed && 
    !item.consumedAt &&
    (!item.expiresAt || new Date() < item.expiresAt)
  );
  
  return reward && reward.qty >= qty;
};

// Method to get reward quantity
userRewardSchema.methods.getRewardQuantity = function(key) {
  const rewards = this.items.filter(item => 
    item.key === key && 
    item.claimed && 
    !item.consumedAt &&
    (!item.expiresAt || new Date() < item.expiresAt)
  );
  
  return rewards.reduce((total, reward) => total + reward.qty, 0);
};

// Method to clean expired rewards
userRewardSchema.methods.cleanExpiredRewards = function() {
  const now = new Date();
  let cleaned = 0;
  
  this.items.forEach(item => {
    if (item.expiresAt && now > item.expiresAt && !item.claimed) {
      item.claimed = true;
      item.claimedAt = now;
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    this.lastUpdatedAt = new Date();
  }
  
  return cleaned;
};

// Static method to get user rewards
userRewardSchema.statics.getUserRewards = function(userId) {
  return this.findOne({ userId });
};

// Static method to create or update user rewards
userRewardSchema.statics.createOrUpdate = function(userId, updates = {}) {
  return this.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...updates,
        lastUpdatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

// Static method to grant reward
userRewardSchema.statics.grantReward = function(userId, reward) {
  return this.findOneAndUpdate(
    { userId },
    {
      $push: {
        items: {
          id: new mongoose.Types.ObjectId().toString(),
          type: reward.type,
          key: reward.key,
          label: reward.label || this.deriveLabel(reward.key),
          qty: reward.qty || 1,
          expiresAt: reward.expiresAt || null,
          claimed: false,
          grantedBy: reward.grantedBy,
          grantedAt: new Date(),
          metadata: reward.metadata || {}
        }
      },
      $set: {
        lastUpdatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

// Static method to claim reward
userRewardSchema.statics.claimReward = function(userId, rewardId) {
  return this.findOneAndUpdate(
    { userId, 'items.id': rewardId },
    {
      $set: {
        'items.$.claimed': true,
        'items.$.claimedAt': new Date(),
        lastUpdatedAt: new Date()
      }
    },
    { new: true }
  );
};

// Static method to consume reward
userRewardSchema.statics.consumeReward = function(userId, rewardId) {
  return this.findOneAndUpdate(
    { userId, 'items.id': rewardId },
    {
      $set: {
        'items.$.consumedAt': new Date(),
        lastUpdatedAt: new Date()
      }
    },
    { new: true }
  );
};

// Static method to get reward statistics
userRewardSchema.statics.getRewardStatistics = function() {
  return this.aggregate([
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: {
          type: '$items.type',
          key: '$items.key'
        },
        totalGranted: { $sum: '$items.qty' },
        totalClaimed: {
          $sum: {
            $cond: ['$items.claimed', '$items.qty', 0]
          }
        },
        totalConsumed: {
          $sum: {
            $cond: ['$items.consumedAt', '$items.qty', 0]
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        rewards: {
          $push: {
            key: '$_id.key',
            totalGranted: '$totalGranted',
            totalClaimed: '$totalClaimed',
            totalConsumed: '$totalConsumed'
          }
        }
      }
    }
  ]);
};

// Static method to get top reward earners
userRewardSchema.statics.getTopRewardEarners = function(limit = 10) {
  return this.aggregate([
    {
      $addFields: {
        totalRewards: {
          $sum: {
            $map: {
              input: '$items',
              as: 'item',
              in: { $cond: ['$$item.claimed', '$$item.qty', 0] }
            }
          }
        }
      }
    },
    {
      $sort: { totalRewards: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        userId: '$userId',
        username: '$user.username',
        totalRewards: 1,
        lastReward: { $arrayElemAt: ['$items.grantedAt', -1] }
      }
    }
  ]);
};

// Static method to derive label from key
userRewardSchema.statics.deriveLabel = function(key) {
  const labels = {
    'style_voucher': 'Premium Style Voucher',
    'freeze': 'Freeze Token',
    'xp_2x': '2× XP Boost',
    'frame_gold': 'Gold Frame',
    'frame_diamond': 'Diamond Frame',
    'frame_mythic': 'Mythic Frame',
    'title_diamond': 'Diamond Elder',
    'title_warrior': 'Warrior',
    'title_unstoppable': 'Unstoppable',
    'confetti_classic': 'Confetti Animation',
    'tribe_pin': 'Tribe Pin',
    'tribe_crown': 'Tribe Crown'
  };
  
  return labels[key] || key;
};

module.exports = mongoose.model('UserReward', userRewardSchema);
