const mongoose = require('mongoose');

const userCosmeticSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipped: {
    frameKey: {
      type: String,
      default: null
    },
    titleKey: {
      type: String,
      default: null
    },
    confettiKey: {
      type: String,
      default: null
    }
  },
  cosmetics: [{
    key: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['frame', 'title', 'confetti', 'badge'],
      required: true
    },
    acquiredAt: {
      type: Date,
      default: Date.now
    },
    acquiredBy: {
      type: {
        type: String,
        enum: ['achievement', 'purchase', 'admin', 'weekly', 'seasonal'],
        required: true
      },
      ref: {
        type: String,
        required: true
      }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  temporary: [{
    key: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['frame', 'title', 'confetti', 'badge'],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    acquiredAt: {
      type: Date,
      default: Date.now
    },
    acquiredBy: {
      type: {
        type: String,
        enum: ['achievement', 'purchase', 'admin', 'weekly', 'seasonal'],
        required: true
      },
      ref: {
        type: String,
        required: true
      }
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
userCosmeticSchema.index({ _id: 1 });
userCosmeticSchema.index({ 'temporary.expiresAt': 1 });

// Method to equip cosmetic
userCosmeticSchema.methods.equipCosmetic = function(slot, key) {
  // Check if user owns this cosmetic
  const owned = this.cosmetics.find(c => c.key === key);
  const temporary = this.temporary.find(c => c.key === key && new Date() < c.expiresAt);
  
  if (!owned && !temporary) {
    throw new Error('Cosmetic not owned');
  }
  
  // Check if temporary cosmetic is expired
  if (temporary && new Date() >= temporary.expiresAt) {
    throw new Error('Temporary cosmetic expired');
  }
  
  // Equip the cosmetic
  this.equipped[slot] = key;
  this.lastUpdatedAt = new Date();
  
  return true;
};

// Method to unequip cosmetic
userCosmeticSchema.methods.unequipCosmetic = function(slot) {
  this.equipped[slot] = null;
  this.lastUpdatedAt = new Date();
  
  return true;
};

// Method to add cosmetic
userCosmeticSchema.methods.addCosmetic = function(cosmetic) {
  const newCosmetic = {
    key: cosmetic.key,
    type: cosmetic.type,
    acquiredAt: new Date(),
    acquiredBy: cosmetic.acquiredBy,
    metadata: cosmetic.metadata || {}
  };
  
  this.cosmetics.push(newCosmetic);
  this.lastUpdatedAt = new Date();
  
  return newCosmetic;
};

// Method to add temporary cosmetic
userCosmeticSchema.methods.addTemporaryCosmetic = function(cosmetic) {
  const newCosmetic = {
    key: cosmetic.key,
    type: cosmetic.type,
    expiresAt: cosmetic.expiresAt,
    acquiredAt: new Date(),
    acquiredBy: cosmetic.acquiredBy,
    metadata: cosmetic.metadata || {}
  };
  
  this.temporary.push(newCosmetic);
  this.lastUpdatedAt = new Date();
  
  return newCosmetic;
};

// Method to check if user owns cosmetic
userCosmeticSchema.methods.ownsCosmetic = function(key) {
  const owned = this.cosmetics.find(c => c.key === key);
  const temporary = this.temporary.find(c => c.key === key && new Date() < c.expiresAt);
  
  return !!(owned || temporary);
};

// Method to get owned cosmetics
userCosmeticSchema.methods.getOwnedCosmetics = function() {
  const owned = this.cosmetics.map(c => ({
    key: c.key,
    type: c.type,
    acquiredAt: c.acquiredAt,
    acquiredBy: c.acquiredBy,
    metadata: c.metadata
  }));
  
  const temporary = this.temporary
    .filter(c => new Date() < c.expiresAt)
    .map(c => ({
      key: c.key,
      type: c.type,
      expiresAt: c.expiresAt,
      acquiredAt: c.acquiredAt,
      acquiredBy: c.acquiredBy,
      metadata: c.metadata
    }));
  
  return { owned, temporary };
};

// Method to get equipped cosmetics
userCosmeticSchema.methods.getEquippedCosmetics = function() {
  return {
    frame: this.equipped.frameKey,
    title: this.equipped.titleKey,
    confetti: this.equipped.confettiKey
  };
};

// Method to get cosmetics by type
userCosmeticSchema.methods.getCosmeticsByType = function(type) {
  const owned = this.cosmetics.filter(c => c.type === type);
  const temporary = this.temporary.filter(c => c.type === type && new Date() < c.expiresAt);
  
  return { owned, temporary };
};

// Method to clean expired temporary cosmetics
userCosmeticSchema.methods.cleanExpiredCosmetics = function() {
  const now = new Date();
  let cleaned = 0;
  
  // Remove expired temporary cosmetics
  const expired = this.temporary.filter(c => now >= c.expiresAt);
  this.temporary = this.temporary.filter(c => now < c.expiresAt);
  cleaned += expired.length;
  
  // Unequip expired cosmetics
  if (this.equipped.frameKey) {
    const frameExpired = this.temporary.find(c => c.key === this.equipped.frameKey && now >= c.expiresAt);
    if (frameExpired) {
      this.equipped.frameKey = null;
      cleaned++;
    }
  }
  
  if (this.equipped.titleKey) {
    const titleExpired = this.temporary.find(c => c.key === this.equipped.titleKey && now >= c.expiresAt);
    if (titleExpired) {
      this.equipped.titleKey = null;
      cleaned++;
    }
  }
  
  if (this.equipped.confettiKey) {
    const confettiExpired = this.temporary.find(c => c.key === this.equipped.confettiKey && now >= c.expiresAt);
    if (confettiExpired) {
      this.equipped.confettiKey = null;
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    this.lastUpdatedAt = new Date();
  }
  
  return cleaned;
};

// Method to get cosmetic statistics
userCosmeticSchema.methods.getCosmeticStatistics = function() {
  const ownedCount = this.cosmetics.length;
  const temporaryCount = this.temporary.filter(c => new Date() < c.expiresAt).length;
  const equippedCount = Object.values(this.equipped).filter(v => v !== null).length;
  
  return {
    ownedCount,
    temporaryCount,
    equippedCount,
    totalCount: ownedCount + temporaryCount
  };
};

// Method to get cosmetic display info
userCosmeticSchema.methods.getCosmeticDisplayInfo = function() {
  return {
    equipped: this.equipped,
    owned: this.cosmetics.map(c => c.key),
    temporary: this.temporary
      .filter(c => new Date() < c.expiresAt)
      .map(c => ({ key: c.key, expiresAt: c.expiresAt }))
  };
};

// Static method to get user cosmetics
userCosmeticSchema.statics.getUserCosmetics = function(userId) {
  return this.findById(userId);
};

// Static method to create or update user cosmetics
userCosmeticSchema.statics.createOrUpdate = function(userId, updates = {}) {
  return this.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...updates,
        lastUpdatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

// Static method to equip cosmetic
userCosmeticSchema.statics.equipCosmetic = function(userId, slot, key) {
  return this.findByIdAndUpdate(
    userId,
    {
      $set: {
        [`equipped.${slot}`]: key,
        lastUpdatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

// Static method to unequip cosmetic
userCosmeticSchema.statics.unequipCosmetic = function(userId, slot) {
  return this.findByIdAndUpdate(
    userId,
    {
      $set: {
        [`equipped.${slot}`]: null,
        lastUpdatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

// Static method to add cosmetic
userCosmeticSchema.statics.addCosmetic = function(userId, cosmetic) {
  return this.findByIdAndUpdate(
    userId,
    {
      $push: {
        cosmetics: {
          key: cosmetic.key,
          type: cosmetic.type,
          acquiredAt: new Date(),
          acquiredBy: cosmetic.acquiredBy,
          metadata: cosmetic.metadata || {}
        }
      },
      $set: {
        lastUpdatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

// Static method to add temporary cosmetic
userCosmeticSchema.statics.addTemporaryCosmetic = function(userId, cosmetic) {
  return this.findByIdAndUpdate(
    userId,
    {
      $push: {
        temporary: {
          key: cosmetic.key,
          type: cosmetic.type,
          expiresAt: cosmetic.expiresAt,
          acquiredAt: new Date(),
          acquiredBy: cosmetic.acquiredBy,
          metadata: cosmetic.metadata || {}
        }
      },
      $set: {
        lastUpdatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
};

// Static method to clean expired cosmetics
userCosmeticSchema.statics.cleanExpiredCosmetics = function() {
  const now = new Date();
  
  return this.updateMany(
    {},
    {
      $pull: {
        temporary: { expiresAt: { $lte: now } }
      },
      $set: {
        lastUpdatedAt: new Date()
      }
    }
  );
};

// Static method to get cosmetic statistics
userCosmeticSchema.statics.getCosmeticStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalOwned: { $sum: { $size: '$cosmetics' } },
        totalTemporary: { $sum: { $size: '$temporary' } },
        averageOwned: { $avg: { $size: '$cosmetics' } }
      }
    }
  ]);
};

// Static method to get top cosmetic collectors
userCosmeticSchema.statics.getTopCollectors = function(limit = 10) {
  return this.aggregate([
    {
      $addFields: {
        totalCosmetics: {
          $add: [
            { $size: '$cosmetics' },
            { $size: '$temporary' }
          ]
        }
      }
    },
    {
      $sort: { totalCosmetics: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        userId: '$_id',
        username: '$user.username',
        totalCosmetics: 1,
        ownedCount: { $size: '$cosmetics' },
        temporaryCount: { $size: '$temporary' }
      }
    }
  ]);
};

module.exports = mongoose.model('UserCosmetic', userCosmeticSchema);
