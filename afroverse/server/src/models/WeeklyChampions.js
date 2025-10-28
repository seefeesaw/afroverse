const mongoose = require('mongoose');

const weeklyChampionsSchema = new mongoose.Schema({
  weekStart: {
    type: Date,
    required: true,
    index: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  tribesTop: [{
    tribeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    emblem: {
      icon: String,
      color: String
    },
    points: {
      type: Number,
      required: true
    },
    members: {
      type: Number,
      required: true
    }
  }],
  usersTop: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: null
    },
    tribe: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe'
      },
      name: {
        type: String
      }
    },
    country: {
      type: String,
      default: null
    },
    points: {
      type: Number,
      required: true
    },
    streak: {
      type: Number,
      default: 0
    }
  }],
  stats: {
    totalTribes: {
      type: Number,
      required: true
    },
    totalUsers: {
      type: Number,
      required: true
    },
    totalPoints: {
      type: Number,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
weeklyChampionsSchema.index({ weekStart: 1 }, { unique: true });
weeklyChampionsSchema.index({ createdAt: -1 });

// Static method to create weekly champions snapshot
weeklyChampionsSchema.statics.createSnapshot = async function(weekStart, weekEnd) {
  try {
    // Check if snapshot already exists
    const existing = await this.findOne({ weekStart });
    if (existing) {
      return existing;
    }

    // Get top tribes for the week
    const TribeAggregate = require('./TribeAggregate');
    const UserAggregate = require('./UserAggregate');

    const topTribes = await TribeAggregate.find()
      .sort({ 'weekly.points': -1 })
      .limit(10)
      .select('name displayName emblem weekly.points members')
      .lean();

    const topUsers = await UserAggregate.find()
      .sort({ 'weekly.points': -1 })
      .limit(10)
      .select('username avatar tribe country weekly.points streak')
      .lean();

    // Calculate stats
    const totalTribes = await TribeAggregate.countDocuments();
    const totalUsers = await UserAggregate.countDocuments();
    const totalPoints = await TribeAggregate.aggregate([
      { $group: { _id: null, total: { $sum: '$weekly.points' } } }
    ]);

    const snapshot = await this.create({
      weekStart,
      weekEnd,
      tribesTop: topTribes.map(tribe => ({
        tribeId: tribe._id,
        name: tribe.name,
        displayName: tribe.displayName,
        emblem: tribe.emblem,
        points: tribe.weekly.points,
        members: tribe.members
      })),
      usersTop: topUsers.map(user => ({
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        tribe: user.tribe,
        country: user.country,
        points: user.weekly.points,
        streak: user.streak.current
      })),
      stats: {
        totalTribes,
        totalUsers,
        totalPoints: totalPoints[0]?.total || 0
      }
    });

    return snapshot;
  } catch (error) {
    console.error('Error creating weekly champions snapshot:', error);
    throw error;
  }
};

// Static method to get weekly champions
weeklyChampionsSchema.statics.getWeeklyChampions = async function(weekStart) {
  try {
    const champions = await this.findOne({ weekStart }).lean();
    return champions;
  } catch (error) {
    console.error('Error getting weekly champions:', error);
    throw error;
  }
};

// Static method to get recent champions
weeklyChampionsSchema.statics.getRecentChampions = async function(limit = 4) {
  try {
    const champions = await this.find()
      .sort({ weekStart: -1 })
      .limit(limit)
      .lean();

    return champions;
  } catch (error) {
    console.error('Error getting recent champions:', error);
    throw error;
  }
};

// Method to get formatted week string
weeklyChampionsSchema.methods.getWeekString = function() {
  const start = new Date(this.weekStart);
  const end = new Date(this.weekEnd);
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return `${startStr}–${endStr}`;
};

module.exports = mongoose.model('WeeklyChampions', weeklyChampionsSchema);
