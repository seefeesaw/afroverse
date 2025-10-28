const mongoose = require('mongoose');

const userAggregateSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true,
    index: true
  },
  avatar: {
    type: String,
    default: null
  },
  tribe: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe',
      default: null
    },
    name: {
      type: String,
      default: null
    }
  },
  country: {
    type: String,
    default: null,
    index: true
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
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    }
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
    votesCast: {
      type: Number,
      default: 0
    },
    transformationsCreated: {
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
userAggregateSchema.index({ _id: 1 }, { unique: true });
userAggregateSchema.index({ username: 1 });
userAggregateSchema.index({ country: 1 });
userAggregateSchema.index({ 'weekly.points': -1 });
userAggregateSchema.index({ 'allTime.points': -1 });
userAggregateSchema.index({ 'weekly.rank': 1 });
userAggregateSchema.index({ 'allTime.rank': 1 });
userAggregateSchema.index({ 'tribe.id': 1 });

// Method to award points
userAggregateSchema.methods.awardPoints = function(points, period = 'weekly') {
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

// Method to update streak
userAggregateSchema.methods.updateStreak = function(newStreak) {
  this.streak.current = newStreak;
  if (newStreak > this.streak.longest) {
    this.streak.longest = newStreak;
  }
  return this.save();
};

// Method to reset weekly points
userAggregateSchema.methods.resetWeeklyPoints = function() {
  this.weekly.points = 0;
  this.weekly.rank = null;
  this.weekly.updatedAt = new Date();
  return this.save();
};

// Method to update tribe
userAggregateSchema.methods.updateTribe = function(tribeId, tribeName) {
  this.tribe.id = tribeId;
  this.tribe.name = tribeName;
  return this.save();
};

// Static method to get leaderboard
userAggregateSchema.statics.getWeeklyLeaderboard = async function(limit = 50, country = null) {
  const query = {};
  if (country) {
    query.country = country;
  }

  const users = await this.find(query)
    .sort({ 'weekly.points': -1 })
    .limit(limit)
    .select('username avatar tribe country weekly allTime streak stats')
    .lean();

  // Update ranks
  users.forEach((user, index) => {
    const rank = index + 1;
    this.findByIdAndUpdate(user._id, {
      'weekly.rank': rank
    }).exec();
  });

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user._id,
    username: user.username,
    avatar: user.avatar,
    tribe: user.tribe,
    country: user.country,
    points: user.weekly.points,
    streak: user.streak.current,
    stats: user.stats
  }));
};

// Static method to get all-time leaderboard
userAggregateSchema.statics.getAllTimeLeaderboard = async function(limit = 50, country = null) {
  const query = {};
  if (country) {
    query.country = country;
  }

  const users = await this.find(query)
    .sort({ 'allTime.points': -1 })
    .limit(limit)
    .select('username avatar tribe country weekly allTime streak stats')
    .lean();

  // Update ranks
  users.forEach((user, index) => {
    const rank = index + 1;
    this.findByIdAndUpdate(user._id, {
      'allTime.rank': rank
    }).exec();
  });

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user._id,
    username: user.username,
    avatar: user.avatar,
    tribe: user.tribe,
    country: user.country,
    points: user.allTime.points,
    streak: user.streak.current,
    stats: user.stats
  }));
};

// Static method to get user rank
userAggregateSchema.statics.getUserRank = async function(userId, period = 'weekly', country = null) {
  const user = await this.findById(userId).lean();
  if (!user) {
    return null;
  }

  const query = {};
  if (country) {
    query.country = country;
  }

  const pointsField = period === 'weekly' ? 'weekly.points' : 'allTime.points';
  const rankField = period === 'weekly' ? 'weekly.rank' : 'allTime.rank';

  // Count users with higher points
  query[pointsField] = { $gt: user[period].points };
  const higherCount = await this.countDocuments(query);

  return {
    rank: higherCount + 1,
    points: user[period].points,
    total: user[period].points
  };
};

// Static method to create or update user aggregate
userAggregateSchema.statics.createOrUpdate = async function(userId, userData) {
  const existing = await this.findById(userId);
  
  if (existing) {
    // Update existing
    existing.username = userData.username || existing.username;
    existing.avatar = userData.avatar || existing.avatar;
    existing.country = userData.country || existing.country;
    existing.tribe = userData.tribe || existing.tribe;
    existing.lastActiveAt = new Date();
    return existing.save();
  } else {
    // Create new
    return this.create({
      _id: userId,
      username: userData.username,
      avatar: userData.avatar,
      country: userData.country,
      tribe: userData.tribe,
      lastActiveAt: new Date()
    });
  }
};

module.exports = mongoose.model('UserAggregate', userAggregateSchema);
