const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  // Challenge identification
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true,
    index: true,
  },
  
  // Challenge metadata
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
    default: '🎯',
  },
  
  // Challenge rules and requirements
  objective: {
    type: String,
    enum: [
      'create_transformation',
      'vote_battles',
      'win_battle',
      'participate_battle',
      'invite_friend',
      'upload_transformations',
      'support_tribe',
      'wildcard_activity',
      'weekly_battles',
      'weekly_referrals',
      'weekly_transformations'
    ],
    required: true,
  },
  
  // Progress tracking
  targetValue: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    enum: ['count', 'points', 'minutes', 'hours'],
    default: 'count',
  },
  
  // Rewards
  rewards: {
    xp: {
      type: Number,
      default: 0,
    },
    clanPoints: {
      type: Number,
      default: 0,
    },
    transformationCredits: {
      type: Number,
      default: 0,
    },
    premiumStyleUnlock: {
      type: String,
      default: null,
    },
    streakSaver: {
      type: Boolean,
      default: false,
    },
    coins: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      default: null,
    },
  },
  
  // Timing and availability
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    required: true,
    index: true,
  },
  
  // For weekly challenges
  weekNumber: {
    type: Number,
    default: null,
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  
  // Cultural theme
  culturalTheme: {
    type: String,
    enum: [
      'zulu_warrior',
      'maasai_heritage',
      'yoruba_tradition',
      'afro_futuristic',
      'general',
      'wildcard'
    ],
    default: 'general',
  },
  
  // Difficulty and engagement
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Analytics
  completionRate: {
    type: Number,
    default: 0,
  },
  totalParticipants: {
    type: Number,
    default: 0,
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for system-generated challenges
  },
  
}, {
  timestamps: true,
});

// Indexes for efficient queries
challengeSchema.index({ type: 1, startDate: 1, endDate: 1 });
challengeSchema.index({ type: 1, weekNumber: 1, year: 1 });
challengeSchema.index({ objective: 1, isActive: 1 });
challengeSchema.index({ culturalTheme: 1, difficulty: 1 });

// Virtual for checking if challenge is currently active
challengeSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Static method to get today's daily challenge
challengeSchema.statics.getTodaysDailyChallenge = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.findOne({
    type: 'daily',
    startDate: { $gte: today },
    endDate: { $lt: tomorrow },
    isActive: true,
  });
};

// Static method to get current week's weekly challenge
challengeSchema.statics.getCurrentWeeklyChallenge = function() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  return this.findOne({
    type: 'weekly',
    startDate: { $gte: startOfWeek },
    endDate: { $lt: endOfWeek },
    isActive: true,
  });
};

module.exports = mongoose.model('Challenge', challengeSchema);
