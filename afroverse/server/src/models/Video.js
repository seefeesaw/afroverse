const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['image_loop', 'portrait_loop', 'fullbody_dance', 'battle_clip'],
    required: true,
    index: true,
  },
  sourceTransformId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transformation',
    default: null,
    index: true,
  },
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle',
    default: null,
    index: true,
  },
  style: {
    type: String,
    required: true,
    index: true,
  },
  tribe: {
    type: String,
    required: true,
    index: true,
  },
  durationSec: {
    type: Number,
    required: true,
  },
  cdn: {
    hlsUrl: {
      type: String,
      required: true,
    },
    mp4Url: {
      type: String,
      required: true,
    },
    thumbUrl: {
      type: String,
      required: true,
    },
    blurhash: {
      type: String,
      default: null,
    },
  },
  stats: {
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
      index: true,
    },
    shares: {
      type: Number,
      default: 0,
      index: true,
    },
    completions: {
      type: Number,
      default: 0,
      index: true,
    },
    replays: {
      type: Number,
      default: 0,
      index: true,
    },
    votesCast: {
      type: Number,
      default: 0,
      index: true,
    },
    followsAfterView: {
      type: Number,
      default: 0,
      index: true,
    },
    avgWatchTime: {
      type: Number,
      default: 0,
    },
    completionRate: {
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
  },
  safety: {
    moderation: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
      index: true,
    },
    ageGate: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    lastModeratedAt: {
      type: Date,
      default: null,
    },
  },
  metadata: {
    caption: {
      type: String,
      maxlength: 280,
      default: '',
    },
    hashtags: [{
      type: String,
      maxlength: 50,
    }],
    location: {
      type: String,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  region: {
    type: String,
    required: true,
    index: true,
  },
  ranking: {
    foryouScore: {
      type: Number,
      default: 0,
      index: true,
    },
    tribeScore: {
      type: Number,
      default: 0,
      index: true,
    },
    followingScore: {
      type: Number,
      default: 0,
      index: true,
    },
    battlesScore: {
      type: Number,
      default: 0,
      index: true,
    },
    lastRankedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  boost: {
    status: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold'],
      default: 'none',
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    multiplier: {
      type: Number,
      default: 1,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
videoSchema.index({ ownerId: 1, createdAt: -1 });
videoSchema.index({ type: 1, createdAt: -1 });
videoSchema.index({ tribe: 1, createdAt: -1 });
videoSchema.index({ 'safety.moderation': 1, 'metadata.isPublic': 1, createdAt: -1 });
videoSchema.index({ 'ranking.foryouScore': -1, createdAt: -1 });
videoSchema.index({ 'ranking.tribeScore': -1, createdAt: -1 });
videoSchema.index({ 'ranking.followingScore': -1, createdAt: -1 });
videoSchema.index({ 'ranking.battlesScore': -1, createdAt: -1 });

// Methods
videoSchema.methods.incrementView = function() {
  this.stats.views += 1;
  return this.save();
};

videoSchema.methods.incrementLike = function() {
  this.stats.likes += 1;
  return this.save();
};

videoSchema.methods.incrementShare = function() {
  this.stats.shares += 1;
  return this.save();
};

videoSchema.methods.incrementCompletion = function() {
  this.stats.completions += 1;
  return this.save();
};

videoSchema.methods.incrementReplay = function() {
  this.stats.replays += 1;
  return this.save();
};

videoSchema.methods.incrementVote = function() {
  this.stats.votesCast += 1;
  return this.save();
};

videoSchema.methods.incrementFollowAfterView = function() {
  this.stats.followsAfterView += 1;
  return this.save();
};

videoSchema.methods.updateStats = function(stats) {
  if (stats.avgWatchTime !== undefined) {
    this.stats.avgWatchTime = stats.avgWatchTime;
  }
  if (stats.completionRate !== undefined) {
    this.stats.completionRate = stats.completionRate;
  }
  if (stats.shareRate !== undefined) {
    this.stats.shareRate = stats.shareRate;
  }
  if (stats.voteRate !== undefined) {
    this.stats.voteRate = stats.voteRate;
  }
  if (stats.followRate !== undefined) {
    this.stats.followRate = stats.followRate;
  }
  return this.save();
};

videoSchema.methods.updateRanking = function(scores) {
  if (scores.foryouScore !== undefined) {
    this.ranking.foryouScore = scores.foryouScore;
  }
  if (scores.tribeScore !== undefined) {
    this.ranking.tribeScore = scores.tribeScore;
  }
  if (scores.followingScore !== undefined) {
    this.ranking.followingScore = scores.followingScore;
  }
  if (scores.battlesScore !== undefined) {
    this.ranking.battlesScore = scores.battlesScore;
  }
  this.ranking.lastRankedAt = new Date();
  return this.save();
};

// Static methods
videoSchema.statics.getTrendingVideos = function(limit = 20, region = 'ZA') {
  return this.find({
    'safety.moderation': 'approved',
    'metadata.isPublic': true,
    region,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
  })
    .sort({ 'stats.views': -1, 'stats.likes': -1, createdAt: -1 })
    .limit(limit)
    .populate('ownerId', 'username displayName avatar tribe')
    .populate('sourceTransformId', 'style')
    .populate('battleId', 'shortCode status');
};

videoSchema.statics.getFreshVideos = function(limit = 20, region = 'ZA') {
  return this.find({
    'safety.moderation': 'approved',
    'metadata.isPublic': true,
    region,
    createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // Last 48 hours
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('ownerId', 'username displayName avatar tribe')
    .populate('sourceTransformId', 'style')
    .populate('battleId', 'shortCode status');
};

module.exports = mongoose.model('Video', videoSchema);