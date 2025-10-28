const mongoose = require('mongoose');

const tribeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
  description: {
    type: String,
    default: null
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
  stats: {
    members: {
      type: Number,
      default: 0
    },
    weeklyPoints: {
      type: Number,
      default: 0,
      index: true
    },
    totalPoints: {
      type: Number,
      default: 0
    }
  },
  rankings: {
    weeklyRank: {
      type: Number,
      default: null,
      index: true
    },
    allTimeRank: {
      type: Number,
      default: null,
      index: true
    },
    lastResetAt: {
      type: Date,
      default: null
    }
  },
  weeklyChallenge: {
    currentWeek: {
      type: Number,
      default: null,
    },
    currentYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    objective: {
      type: String,
      enum: [
        'most_battles_won',
        'most_referrals',
        'most_transformations',
        'most_votes',
        'most_activity'
      ],
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rewards: {
      multiplier: {
        type: Number,
        default: 1,
      },
      totemUnlocked: {
        type: String,
        default: null,
      },
      badgeUnlocked: {
        type: String,
        default: null,
      },
    },
  },
  clanWar: {
    currentWar: {
      weekNumber: {
        type: Number,
        default: null,
      },
      year: {
        type: Number,
        default: new Date().getFullYear(),
      },
      objective: {
        type: String,
        enum: [
          'most_battles_won',
          'most_transformations',
          'most_votes_contributed',
          'most_active_members',
          'most_referrals',
          'most_engagement'
        ],
        default: null,
      },
      score: {
        type: Number,
        default: 0,
      },
      rank: {
        type: Number,
        default: null,
      },
      lastUpdated: {
        type: Date,
        default: null,
      },
    },
    warHistory: [{
      weekNumber: Number,
      year: Number,
      objective: String,
      finalScore: Number,
      finalRank: Number,
      won: Boolean,
      rewards: {
        badge: String,
        premiumStyles: Number,
        doubleXPDuration: Number,
        crownIcon: Boolean,
      },
      completedAt: Date,
    }],
    totalWarsWon: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tribeSchema.index({ name: 1 }, { unique: true });
tribeSchema.index({ 'stats.weeklyPoints': -1 });
tribeSchema.index({ 'stats.totalPoints': -1 });
tribeSchema.index({ 'rankings.weeklyRank': 1 });
tribeSchema.index({ 'rankings.allTimeRank': 1 });

// Method to award points
tribeSchema.methods.awardPoints = function(points) {
  this.stats.weeklyPoints += points;
  this.stats.totalPoints += points;
  return this.save();
};

// Method to increment member count
tribeSchema.methods.incrementMembers = function() {
  this.stats.members += 1;
  return this.save();
};

// Method to decrement member count
tribeSchema.methods.decrementMembers = function() {
  this.stats.members = Math.max(0, this.stats.members - 1);
  return this.save();
};

// Method to reset weekly points
tribeSchema.methods.resetWeeklyPoints = function() {
  this.stats.weeklyPoints = 0;
  this.rankings.weeklyRank = null;
  this.rankings.lastResetAt = new Date();
  return this.save();
};

// Static method to get leaderboard
tribeSchema.statics.getWeeklyLeaderboard = async function(limit = 50) {
  const tribes = await this.find()
    .sort({ 'stats.weeklyPoints': -1 })
    .limit(limit)
    .select('name displayName motto emblem stats rankings')
    .lean();

  // Update ranks
  tribes.forEach((tribe, index) => {
    const rank = index + 1;
    this.findByIdAndUpdate(tribe._id, {
      'rankings.weeklyRank': rank
    }).exec();
  });

  return tribes.map((tribe, index) => ({
    rank: index + 1,
    name: tribe.name,
    displayName: tribe.displayName,
    motto: tribe.motto,
    emblem: tribe.emblem,
    points: tribe.stats.weeklyPoints,
    members: tribe.stats.members,
    lastResetAt: tribe.rankings.lastResetAt
  }));
};

// Static method to get all-time leaderboard
tribeSchema.statics.getAllTimeLeaderboard = async function(limit = 50) {
  const tribes = await this.find()
    .sort({ 'stats.totalPoints': -1 })
    .limit(limit)
    .select('name displayName motto emblem stats rankings')
    .lean();

  // Update ranks
  tribes.forEach((tribe, index) => {
    const rank = index + 1;
    this.findByIdAndUpdate(tribe._id, {
      'rankings.allTimeRank': rank
    }).exec();
  });

  return tribes.map((tribe, index) => ({
    rank: index + 1,
    name: tribe.name,
    displayName: tribe.displayName,
    motto: tribe.motto,
    emblem: tribe.emblem,
    points: tribe.stats.totalPoints,
    members: tribe.stats.members
  }));
};

// Static method to seed initial tribes
tribeSchema.statics.seedTribes = async function() {
  const existingTribes = await this.countDocuments();
  
  if (existingTribes > 0) {
    console.log('Tribes already seeded');
    return;
  }

  const tribes = [
    {
      name: 'lagos_lions',
      displayName: 'Lagos Lions',
      motto: 'Strength in Unity',
      description: 'Mighty and united, we rule the pride',
      emblem: {
        icon: '🦁',
        color: '#F7931E'
      },
      stats: {
        members: 0,
        weeklyPoints: 0,
        totalPoints: 0
      },
      rankings: {
        weeklyRank: null,
        allTimeRank: null,
        lastResetAt: null
      }
    },
    {
      name: 'wakandan_warriors',
      displayName: 'Wakandan Warriors',
      motto: 'Forever Forward',
      description: 'Champions of innovation and excellence',
      emblem: {
        icon: '⚔️',
        color: '#7B2CBF'
      },
      stats: {
        members: 0,
        weeklyPoints: 0,
        totalPoints: 0
      },
      rankings: {
        weeklyRank: null,
        allTimeRank: null,
        lastResetAt: null
      }
    },
    {
      name: 'sahara_storm',
      displayName: 'Sahara Storm',
      motto: 'Desert Power',
      description: 'Unstoppable force of the desert winds',
      emblem: {
        icon: '🌪️',
        color: '#DC143C'
      },
      stats: {
        members: 0,
        weeklyPoints: 0,
        totalPoints: 0
      },
      rankings: {
        weeklyRank: null,
        allTimeRank: null,
        lastResetAt: null
      }
    },
    {
      name: 'nile_nobility',
      displayName: 'Nile Nobility',
      motto: 'Ancient Wisdom',
      description: 'Guardians of tradition and heritage',
      emblem: {
        icon: '👑',
        color: '#4169E1'
      },
      stats: {
        members: 0,
        weeklyPoints: 0,
        totalPoints: 0
      },
      rankings: {
        weeklyRank: null,
        allTimeRank: null,
        lastResetAt: null
      }
    },
    {
      name: 'zulu_nation',
      displayName: 'Zulu Nation',
      motto: 'Pride of Africa',
      description: 'Fierce warriors with unbreakable spirit',
      emblem: {
        icon: '🛡️',
        color: '#FFD700'
      },
      stats: {
        members: 0,
        weeklyPoints: 0,
        totalPoints: 0
      },
      rankings: {
        weeklyRank: null,
        allTimeRank: null,
        lastResetAt: null
      }
    }
  ];

  await this.insertMany(tribes);
  console.log('Tribes seeded successfully');
};

module.exports = mongoose.model('Tribe', tribeSchema);
