const mongoose = require('mongoose');

const boostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    default: null,
    index: true,
  },
  tribeId: {
    type: String,
    default: null,
    index: true,
  },
  type: {
    type: String,
    enum: ['video', 'tribe'],
    required: true,
    index: true,
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold'],
    required: true,
  },
  multiplier: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  stats: {
    viewsBefore: {
      type: Number,
      default: 0,
    },
    viewsAfter: {
      type: Number,
      default: 0,
    },
    viewsIncrease: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound indexes
boostSchema.index({ type: 1, isActive: 1, expiresAt: 1 });
boostSchema.index({ videoId: 1, isActive: 1 });
boostSchema.index({ tribeId: 1, isActive: 1 });

// Pre-save middleware
boostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-expire if past expiresAt
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isActive = false;
  }
  
  next();
});

// Methods
boostSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

boostSchema.methods.getTimeRemaining = function() {
  if (!this.isActive) return 0;
  const remaining = this.expiresAt - Date.now();
  return Math.max(0, remaining);
};

boostSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Static methods
boostSchema.statics.getActiveVideoBoosts = function(videoId) {
  return this.find({
    videoId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ multiplier: -1 });
};

boostSchema.statics.getActiveTribeBoosts = function(tribeId) {
  return this.find({
    tribeId,
    type: 'tribe',
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ multiplier: -1 });
};

boostSchema.statics.getUserBoosts = function(userId, limit = 10) {
  return this.find({
    userId,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('videoId', 'cdn stats')
    .populate('userId', 'username');
};

boostSchema.statics.createBoost = async function(data) {
  const { userId, videoId, tribeId, type, tier } = data;
  
  // Define boost tiers
  const tiers = {
    bronze: { multiplier: 2, duration: 60 * 60 * 1000, cost: 20 }, // 1 hour, 20 coins
    silver: { multiplier: 4, duration: 6 * 60 * 60 * 1000, cost: 50 }, // 6 hours, 50 coins
    gold: { multiplier: 8, duration: 24 * 60 * 60 * 1000, cost: 100 }, // 24 hours, 100 coins
  };
  
  const config = tiers[tier];
  if (!config) {
    throw new Error(`Invalid boost tier: ${tier}`);
  }
  
  const expiresAt = new Date(Date.now() + config.duration);
  
  // Deactivate any existing active boost for this video/tribe
  if (type === 'video') {
    await this.updateMany({ videoId, isActive: true }, { isActive: false });
  } else if (type === 'tribe') {
    await this.updateMany({ tribeId, type: 'tribe', isActive: true }, { isActive: false });
  }
  
  // Create boost
  const boost = new this({
    userId,
    videoId: type === 'video' ? videoId : null,
    tribeId: type === 'tribe' ? tribeId : null,
    type,
    tier,
    multiplier: config.multiplier,
    cost: config.cost,
    expiresAt,
  });
  
  await boost.save();
  return boost;
};

module.exports = mongoose.model('Boost', boostSchema);
