const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Challenge reference
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
    index: true,
  },
  
  // Progress tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Completion status
  isCompleted: {
    type: Boolean,
    default: false,
  },
  
  // Completion timestamp
  completedAt: {
    type: Date,
    default: null,
  },
  
  // Rewards claimed
  rewardsClaimed: {
    type: Boolean,
    default: false,
  },
  
  // Rewards claimed timestamp
  rewardsClaimedAt: {
    type: Date,
    default: null,
  },
  
  // Challenge date (for daily challenges)
  challengeDate: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Week number (for weekly challenges)
  weekNumber: {
    type: Number,
    default: null,
  },
  
  // Year
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  
  // Additional metadata
  metadata: {
    // For tracking specific activities that contributed to progress
    activities: [{
      type: String, // e.g., 'transformation_created', 'battle_voted', 'friend_invited'
      timestamp: Date,
      value: Number, // How much this activity contributed to progress
    }],
    
    // For weekly challenges - tribe contribution
    tribeContribution: {
      type: Number,
      default: 0,
    },
  },
  
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
userChallengeSchema.index({ userId: 1, challengeDate: 1 });
userChallengeSchema.index({ userId: 1, challengeId: 1 });
userChallengeSchema.index({ userId: 1, weekNumber: 1, year: 1 });
userChallengeSchema.index({ challengeId: 1, isCompleted: 1 });

// Virtual for progress percentage
userChallengeSchema.virtual('progressPercentage').get(function() {
  // This will be populated by the service when needed
  return this.progress; // Will be calculated as percentage in service
});

// Static method to get user's daily challenge for a specific date
userChallengeSchema.statics.getUserDailyChallenge = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  return this.findOne({
    userId,
    challengeDate: { $gte: startOfDay, $lt: endOfDay },
  }).populate('challengeId');
};

// Static method to get user's weekly challenge for a specific week
userChallengeSchema.statics.getUserWeeklyChallenge = function(userId, weekNumber, year) {
  return this.findOne({
    userId,
    weekNumber,
    year,
  }).populate('challengeId');
};

// Static method to get all completed challenges for a user
userChallengeSchema.statics.getUserCompletedChallenges = function(userId, limit = 50) {
  return this.find({
    userId,
    isCompleted: true,
  })
  .populate('challengeId')
  .sort({ completedAt: -1 })
  .limit(limit);
};

// Static method to get challenge completion statistics
userChallengeSchema.statics.getChallengeStats = function(challengeId) {
  return this.aggregate([
    { $match: { challengeId: new mongoose.Types.ObjectId(challengeId) } },
    {
      $group: {
        _id: null,
        totalParticipants: { $sum: 1 },
        completedCount: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        averageProgress: { $avg: '$progress' },
      },
    },
  ]);
};

module.exports = mongoose.model('UserChallenge', userChallengeSchema);
