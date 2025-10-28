const mongoose = require('mongoose');

const tribeAggregateSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tribe',
    required: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  displayName: {
    type: String,
    required: true
  },
  motto: {
    type: String,
    required: true
  },
  emblem: {
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  weekly: {
    points: {
      type: Number,
      default: 0,
      index: true
    },
    rank: {
      type: Number,
      default: null,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  allTime: {
    points: {
      type: Number,
      default: 0,
      index: true
    },
    rank: {
      type: Number,
      default: null,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  members: {
    type: Number,
    default: 0
  },
  stats: {
    battlesWon: {
      type: Number,
      default: 0
    },
    battlesLost: {
      type: Number,
      default: 0
    },
    votesReceived: {
      type: Number,
      default: 0
    }
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tribeAggregateSchema.index({ _id: 1 }, { unique: true });
tribeAggregateSchema.index({ name: 1 });
tribeAggregateSchema.index({ 'weekly.points': -1 });
tribeAggregateSchema.index({ 'allTime.points': -1 });
tribeAggregateSchema.index({ 'weekly.rank': 1 });
tribeAggregateSchema.index({ 'allTime.rank': 1 });

// Method to award points
tribeAggregateSchema.methods.awardPoints = function(points, period = 'weekly') {
  const now = new Date();
  
  if (period === 'weekly') {
    this.weekly.points += points;
    this.weekly.updatedAt = now;
  } else {
    this.allTime.points += points;
    this.allTime.updatedAt = now;
  }
  
  // Always update all-time points
  if (period === 'weekly') {
    this.allTime.points += points;
    this.allTime.updatedAt = now;
  }
  
  this.lastActiveAt = now;
  return this.save();
};

// Method to update member count
tribeAggregateSchema.methods.updateMemberCount = function(delta) {
  this.members = Math.max(0, this.members + delta);
  return this.save();
};

// Method to reset weekly points
tribeAggregateSchema.methods.resetWeeklyPoints = function() {
  this.weekly.points = 0;
  this.weekly.rank = null;
  this.weekly.updatedAt = new Date();
  return this.save();
};

// Static method to get leaderboard
tribeAggregateSchema.statics.getWeeklyLeaderboard = async function(limit = 50) {
  const tribes = await this.find()
    .sort({ 'weekly.points': -1 })
    .limit(limit)
    .select('name displayName motto emblem weekly allTime members stats')
    .lean();

  // Update ranks
  tribes.forEach((tribe, index) => {
    const rank = index + 1;
    this.findByIdAndUpdate(tribe._id, {
      'weekly.rank': rank
    }).exec();
  });

  return tribes.map((tribe, index) => ({
    rank: index + 1,
    tribeId: tribe._id,
    name: tribe.name,
    displayName: tribe.displayName,
    motto: tribe.motto,
    emblem: tribe.emblem,
    points: tribe.weekly.points,
    members: tribe.members,
    stats: tribe.stats
  }));
};

// Static method to get all-time leaderboard
tribeAggregateSchema.statics.getAllTimeLeaderboard = async function(limit = 50) {
  const tribes = await this.find()
    .sort({ 'allTime.points': -1 })
    .limit(limit)
    .select('name displayName motto emblem weekly allTime members stats')
    .lean();

  // Update ranks
  tribes.forEach((tribe, index) => {
    const rank = index + 1;
    this.findByIdAndUpdate(tribe._id, {
      'allTime.rank': rank
    }).exec();
  });

  return tribes.map((tribe, index) => ({
    rank: index + 1,
    tribeId: tribe._id,
    name: tribe.name,
    displayName: tribe.displayName,
    motto: tribe.motto,
    emblem: tribe.emblem,
    points: tribe.allTime.points,
    members: tribe.members,
    stats: tribe.stats
  }));
};

// Static method to get tribe rank
tribeAggregateSchema.statics.getTribeRank = async function(tribeId, period = 'weekly') {
  const tribe = await this.findById(tribeId).lean();
  if (!tribe) {
    return null;
  }

  const pointsField = period === 'weekly' ? 'weekly.points' : 'allTime.points';
  const query = { [pointsField]: { $gt: tribe[period].points } };

  // Count tribes with higher points
  const higherCount = await this.countDocuments(query);

  return {
    rank: higherCount + 1,
    points: tribe[period].points,
    total: tribe[period].points
  };
};

// Static method to create or update tribe aggregate
tribeAggregateSchema.statics.createOrUpdate = async function(tribeId, tribeData) {
  const existing = await this.findById(tribeId);
  
  if (existing) {
    // Update existing
    existing.name = tribeData.name || existing.name;
    existing.displayName = tribeData.displayName || existing.displayName;
    existing.motto = tribeData.motto || existing.motto;
    existing.emblem = tribeData.emblem || existing.emblem;
    existing.members = tribeData.members || existing.members;
    existing.lastActiveAt = new Date();
    return existing.save();
  } else {
    // Create new
    return this.create({
      _id: tribeId,
      name: tribeData.name,
      displayName: tribeData.displayName,
      motto: tribeData.motto,
      emblem: tribeData.emblem,
      members: tribeData.members || 0,
      lastActiveAt: new Date()
    });
  }
};

module.exports = mongoose.model('TribeAggregate', tribeAggregateSchema);
