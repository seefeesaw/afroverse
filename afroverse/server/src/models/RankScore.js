const mongoose = require('mongoose');

const rankScoreSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    unique: true,
    index: true,
  },
  scores: {
    foryou: {
      type: Number,
      default: 0,
      index: true,
    },
    tribe: {
      type: Number,
      default: 0,
      index: true,
    },
    following: {
      type: Number,
      default: 0,
      index: true,
    },
    battles: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  factors: {
    videoCompletionRate: {
      type: Number,
      default: 0,
    },
    avgWatchTime: {
      type: Number,
      default: 0,
    },
    replayRate: {
      type: Number,
      default: 0,
    },
    shareRate: {
      type: Number,
      default: 0,
    },
    voteRate: {
      type: Number,
      default: 0,
    },
    followRate: {
      type: Number,
      default: 0,
    },
    creatorQualityScore: {
      type: Number,
      default: 0,
    },
    freshnessScore: {
      type: Number,
      default: 0,
    },
    tribeAffinityScore: {
      type: Number,
      default: 0,
    },
    regionAffinityScore: {
      type: Number,
      default: 0,
    },
  },
  metadata: {
    totalImpressions: {
      type: Number,
      default: 0,
    },
    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
    calculationVersion: {
      type: String,
      default: '1.0',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
rankScoreSchema.index({ 'scores.foryou': -1 });
rankScoreSchema.index({ 'scores.tribe': -1 });
rankScoreSchema.index({ 'scores.following': -1 });
rankScoreSchema.index({ 'scores.battles': -1 });
rankScoreSchema.index({ 'metadata.lastCalculatedAt': -1 });

// Methods
rankScoreSchema.methods.updateScore = function(tab, score) {
  this.scores[tab] = score;
  this.metadata.lastCalculatedAt = new Date();
  return this.save();
};

rankScoreSchema.methods.updateFactors = function(factors) {
  this.factors = { ...this.factors, ...factors };
  this.metadata.lastCalculatedAt = new Date();
  return this.save();
};

rankScoreSchema.methods.incrementImpressions = function() {
  this.metadata.totalImpressions += 1;
  return this.save();
};

// Static methods
rankScoreSchema.statics.getTopVideos = function(tab, limit = 50, region = 'ZA') {
  const scoreField = `scores.${tab}`;
  return this.find({})
    .sort({ [scoreField]: -1 })
    .limit(limit)
    .populate('videoId')
    .then(scores => {
      return scores
        .filter(score => score.videoId && score.videoId.region === region)
        .map(score => score.videoId);
    });
};

rankScoreSchema.statics.getVideoScore = function(videoId, tab) {
  return this.findOne({ videoId })
    .then(score => {
      if (!score) return 0;
      return score.scores[tab] || 0;
    });
};

rankScoreSchema.statics.bulkUpdateScores = function(updates) {
  const bulkOps = updates.map(update => ({
    updateOne: {
      filter: { videoId: update.videoId },
      update: {
        $set: {
          [`scores.${update.tab}`]: update.score,
          'metadata.lastCalculatedAt': new Date(),
        },
      },
      upsert: true,
    },
  }));
  
  return this.bulkWrite(bulkOps);
};

module.exports = mongoose.model('RankScore', rankScoreSchema);
