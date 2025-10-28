const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  achievementId: {
    type: String,
    ref: 'Achievement',
    required: true,
    index: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  rewardClaimed: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  isNotified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique user-achievement pairs
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// Index for efficient queries
userAchievementSchema.index({ userId: 1, unlockedAt: -1 });
userAchievementSchema.index({ achievementId: 1, unlockedAt: -1 });

module.exports = mongoose.model('UserAchievement', userAchievementSchema);