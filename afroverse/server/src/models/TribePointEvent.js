const mongoose = require('mongoose');

const tribePointEventSchema = new mongoose.Schema({
  tribeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tribe',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: ['battle_win', 'battle_loss', 'vote', 'login_bonus', 'streak_bonus', 'daily_participation'],
    required: true,
    index: true
  },
  points: {
    type: Number,
    required: true
  },
  ref: {
    battleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Battle',
      default: null
    },
    transformId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transformation',
      default: null
    }
  },
  meta: {
    timestamp: {
      type: Date,
      default: Date.now
    },
    day: {
      type: String,
      default: function() {
        const now = new Date();
        return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      }
    },
    week: {
      type: String,
      default: function() {
        const now = new Date();
        const year = now.getFullYear();
        const onejan = new Date(year, 0, 1);
        const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        return `${year}W${String(week).padStart(2, '0')}`;
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tribePointEventSchema.index({ tribeId: 1, createdAt: -1 });
tribePointEventSchema.index({ userId: 1, createdAt: -1 });
tribePointEventSchema.index({ reason: 1, createdAt: -1 });
tribePointEventSchema.index({ 'meta.day': 1, 'meta.week': 1 });
tribePointEventSchema.index({ createdAt: -1 });

// Method to get tribe points for a period
tribePointEventSchema.statics.getTribePointsForPeriod = async function(tribeId, startDate, endDate) {
  const events = await this.find({
    tribeId,
    createdAt: { $gte: startDate, $lte: endDate }
  }).select('points').lean();

  return events.reduce((total, event) => total + event.points, 0);
};

// Method to get user points for a period
tribePointEventSchema.statics.getUserPointsForPeriod = async function(userId, startDate, endDate) {
  const events = await this.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  }).select('points reason').lean();

  return events.reduce((total, event) => total + event.points, 0);
};

// Method to get top contributors for a tribe
tribePointEventSchema.statics.getTopContributors = async function(tribeId, limit = 5) {
  const contributors = await this.aggregate([
    {
      $match: { tribeId: new mongoose.Types.ObjectId(tribeId) }
    },
    {
      $group: {
        _id: '$userId',
        totalPoints: { $sum: '$points' },
        contributionCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalPoints: -1 }
    },
    {
      $limit: limit
    }
  ]);

  return contributors;
};

module.exports = mongoose.model('TribePointEvent', tribePointEventSchema);
