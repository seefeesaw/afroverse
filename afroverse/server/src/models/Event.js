const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Event identification
  type: {
    type: String,
    enum: ['clan_war', 'power_hour'],
    required: true,
    index: true,
  },
  
  // Event metadata
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    default: '⚔️',
  },
  
  // Timing
  startAt: {
    type: Date,
    required: true,
    index: true,
  },
  endAt: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Event configuration
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
    default: null, // Only for clan wars
  },
  
  multipliers: {
    xp: {
      type: Number,
      default: 1,
    },
    clanPoints: {
      type: Number,
      default: 1,
    },
    transformationCredits: {
      type: Number,
      default: 1,
    },
    coins: {
      type: Number,
      default: 1,
    },
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true,
  },
  
  // Rewards configuration
  rewards: {
    // Clan War rewards
    clanBadge: {
      type: String,
      default: null,
    },
    badgeDuration: {
      type: Number,
      default: 7, // days
    },
    premiumStyles: {
      type: Number,
      default: 0,
    },
    doubleXPDuration: {
      type: Number,
      default: 24, // hours
    },
    crownIcon: {
      type: Boolean,
      default: false,
    },
    
    // Power Hour rewards (multipliers)
    powerHourMultipliers: {
      xp: {
        type: Number,
        default: 2,
      },
      clanPoints: {
        type: Number,
        default: 2,
      },
    },
  },
  
  // Analytics
  participationStats: {
    totalParticipants: {
      type: Number,
      default: 0,
    },
    totalActions: {
      type: Number,
      default: 0,
    },
    peakConcurrency: {
      type: Number,
      default: 0,
    },
    averageEngagement: {
      type: Number,
      default: 0,
    },
  },
  
  // Clan War specific fields
  clanWar: {
    weekNumber: {
      type: Number,
      default: null,
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    winningTribe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe',
      default: null,
    },
    finalStandings: [{
      tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe',
      },
      score: Number,
      rank: Number,
    }],
  },
  
  // Power Hour specific fields
  powerHour: {
    timezone: {
      type: String,
      default: 'UTC',
    },
    localTime: {
      type: String, // e.g., "19:00" for 7 PM
      default: null,
    },
    duration: {
      type: Number,
      default: 60, // minutes
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for system-generated events
  },
  
}, {
  timestamps: true,
});

// Indexes for efficient queries
eventSchema.index({ type: 1, startAt: 1, endAt: 1 });
eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ 'clanWar.weekNumber': 1, 'clanWar.year': 1 });
eventSchema.index({ startAt: 1, endAt: 1, status: 1 });

// Virtual for checking if event is currently active
eventSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startAt && now <= this.endAt;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.status === 'scheduled' && now < this.startAt;
});

// Static method to get current active event
eventSchema.statics.getCurrentActiveEvent = function() {
  const now = new Date();
  return this.findOne({
    status: 'active',
    startAt: { $lte: now },
    endAt: { $gte: now },
  });
};

// Static method to get upcoming event
eventSchema.statics.getUpcomingEvent = function() {
  const now = new Date();
  return this.findOne({
    status: 'scheduled',
    startAt: { $gt: now },
  }).sort({ startAt: 1 });
};

// Static method to get current clan war
eventSchema.statics.getCurrentClanWar = function() {
  const now = new Date();
  return this.findOne({
    type: 'clan_war',
    status: 'active',
    startAt: { $lte: now },
    endAt: { $gte: now },
  });
};

// Static method to get today's power hour
eventSchema.statics.getTodaysPowerHour = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.findOne({
    type: 'power_hour',
    startAt: { $gte: today },
    endAt: { $lt: tomorrow },
  });
};

// Method to check if multipliers are active
eventSchema.methods.isMultiplierActive = function() {
  if (this.type === 'power_hour') {
    return this.isCurrentlyActive;
  }
  return false;
};

// Method to get current multipliers
eventSchema.methods.getCurrentMultipliers = function() {
  if (this.type === 'power_hour' && this.isCurrentlyActive) {
    return this.rewards.powerHourMultipliers;
  }
  return { xp: 1, clanPoints: 1 };
};

module.exports = mongoose.model('Event', eventSchema);
