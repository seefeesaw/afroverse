const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['milestone', 'streak', 'tribe', 'battle', 'social', 'special'],
    required: true,
    index: true,
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    required: true,
    index: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  metric: {
    type: String,
    required: true,
    enum: ['transformations', 'battles_won', 'votes_cast', 'tribe_points', 'streak_days', 'shares', 'followers', 'following'],
  },
  reward: {
    type: {
      type: String,
      enum: ['free_transform', 'streak_freeze', 'tribe_points_multiplier', 'premium_style', 'profile_title', 'badge', 'xp_boost'],
      default: null,
    },
    value: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
  },
  xpReward: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
achievementSchema.index({ category: 1, rarity: 1 });
achievementSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);