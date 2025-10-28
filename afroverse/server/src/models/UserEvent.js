const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Event reference
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  
  // Event type
  eventType: {
    type: String,
    enum: ['clan_war', 'power_hour'],
    required: true,
    index: true,
  },
  
  // Participation tracking
  participationStats: {
    totalActions: {
      type: Number,
      default: 0,
    },
    totalXP: {
      type: Number,
      default: 0,
    },
    totalClanPoints: {
      type: Number,
      default: 0,
    },
    totalCoins: {
      type: Number,
      default: 0,
    },
    multiplierBonus: {
      type: Number,
      default: 0,
    },
  },
  
  // Activity breakdown
  activities: [{
    type: String, // e.g., 'transformation_created', 'battle_won', 'battle_voted'
    count: Number,
    xpEarned: Number,
    clanPointsEarned: Number,
    coinsEarned: Number,
    multiplierApplied: Number,
    timestamp: Date,
  }],
  
  // Rewards earned
  rewardsEarned: [{
    type: String, // e.g., 'clan_badge', 'premium_style', 'double_xp'
    amount: Number,
    duration: Number, // for time-limited rewards
    claimedAt: Date,
    expiresAt: Date,
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Event date (for daily events)
  eventDate: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Week number (for weekly events)
  weekNumber: {
    type: Number,
    default: null,
  },
  
  // Year
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
userEventSchema.index({ userId: 1, eventDate: 1 });
userEventSchema.index({ userId: 1, eventId: 1 });
userEventSchema.index({ userId: 1, eventType: 1 });
userEventSchema.index({ userId: 1, weekNumber: 1, year: 1 });
userEventSchema.index({ eventId: 1, isActive: 1 });

// Static method to get user's event participation for a specific date
userEventSchema.statics.getUserEventParticipation = function(userId, eventType, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  return this.findOne({
    userId,
    eventType,
    eventDate: { $gte: startOfDay, $lt: endOfDay },
    isActive: true,
  }).populate('eventId');
};

// Static method to get user's weekly event participation
userEventSchema.statics.getUserWeeklyEventParticipation = function(userId, weekNumber, year) {
  return this.findOne({
    userId,
    eventType: 'clan_war',
    weekNumber,
    year,
    isActive: true,
  }).populate('eventId');
};

// Static method to get event participation statistics
userEventSchema.statics.getEventParticipationStats = function(eventId) {
  return this.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId), isActive: true } },
    {
      $group: {
        _id: null,
        totalParticipants: { $sum: 1 },
        totalActions: { $sum: '$participationStats.totalActions' },
        totalXP: { $sum: '$participationStats.totalXP' },
        totalClanPoints: { $sum: '$participationStats.totalClanPoints' },
        averageActionsPerUser: { $avg: '$participationStats.totalActions' },
      },
    },
  ]);
};

// Static method to get top contributors for an event
userEventSchema.statics.getTopContributors = function(eventId, limit = 10) {
  return this.find({
    eventId,
    isActive: true,
  })
  .populate('userId', 'username tribe')
  .populate('userId.tribe', 'name displayName emblem')
  .sort({ 'participationStats.totalActions': -1 })
  .limit(limit);
};

module.exports = mongoose.model('UserEvent', userEventSchema);
