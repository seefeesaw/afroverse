const mongoose = require('mongoose');

const feedImpressionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  tab: {
    type: String,
    enum: ['foryou', 'following', 'tribe', 'battles'],
    required: true,
    index: true,
  },
  position: {
    type: Number,
    required: true,
  },
  shownAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  watchedMs: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  replayed: {
    type: Number,
    default: 0,
  },
  actions: {
    like: {
      type: Boolean,
      default: false,
    },
    share: {
      type: Boolean,
      default: false,
    },
    vote: {
      type: String,
      enum: ['challenger', 'defender', null],
      default: null,
    },
    follow: {
      type: Boolean,
      default: false,
    },
    challenge: {
      type: Boolean,
      default: false,
    },
  },
  metadata: {
    userAgent: {
      type: String,
      default: null,
    },
    ipHash: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'mobile',
    },
    connectionType: {
      type: String,
      enum: ['wifi', '4g', '3g', '2g'],
      default: '4g',
    },
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
feedImpressionSchema.index({ userId: 1, tab: 1, shownAt: -1 });
feedImpressionSchema.index({ videoId: 1, shownAt: -1 });
feedImpressionSchema.index({ sessionId: 1, shownAt: -1 });
feedImpressionSchema.index({ userId: 1, videoId: 1 }, { unique: true });

// Methods
feedImpressionSchema.methods.updateWatchTime = function(watchedMs) {
  this.watchedMs = watchedMs;
  return this.save();
};

feedImpressionSchema.methods.markCompleted = function() {
  this.completed = true;
  return this.save();
};

feedImpressionSchema.methods.incrementReplay = function() {
  this.replayed += 1;
  return this.save();
};

feedImpressionSchema.methods.addAction = function(action, value = true) {
  this.actions[action] = value;
  return this.save();
};

// Static methods
feedImpressionSchema.statics.getUserImpressions = function(userId, tab = null, limit = 100) {
  const query = { userId };
  if (tab) query.tab = tab;
  
  return this.find(query)
    .sort({ shownAt: -1 })
    .limit(limit)
    .populate('videoId', 'ownerId type style tribe stats');
};

feedImpressionSchema.statics.getVideoImpressions = function(videoId, limit = 1000) {
  return this.find({ videoId })
    .sort({ shownAt: -1 })
    .limit(limit)
    .populate('userId', 'username tribe region');
};

feedImpressionSchema.statics.getSessionImpressions = function(sessionId) {
  return this.find({ sessionId })
    .sort({ shownAt: -1 })
    .populate('videoId', 'ownerId type style tribe stats');
};

feedImpressionSchema.statics.getEngagementStats = function(videoId) {
  return this.aggregate([
    { $match: { videoId: new mongoose.Types.ObjectId(videoId) } },
    {
      $group: {
        _id: null,
        totalImpressions: { $sum: 1 },
        totalWatchTime: { $sum: '$watchedMs' },
        completions: { $sum: { $cond: ['$completed', 1, 0] } },
        replays: { $sum: '$replayed' },
        likes: { $sum: { $cond: ['$actions.like', 1, 0] } },
        shares: { $sum: { $cond: ['$actions.share', 1, 0] } },
        votes: { $sum: { $cond: [{ $ne: ['$actions.vote', null] }, 1, 0] } },
        follows: { $sum: { $cond: ['$actions.follow', 1, 0] } },
        challenges: { $sum: { $cond: ['$actions.challenge', 1, 0] } },
        avgWatchTime: { $avg: '$watchedMs' },
        completionRate: { $avg: { $cond: ['$completed', 1, 0] } },
        shareRate: { $avg: { $cond: ['$actions.share', 1, 0] } },
        voteRate: { $avg: { $cond: [{ $ne: ['$actions.vote', null] }, 1, 0] } },
        followRate: { $avg: { $cond: ['$actions.follow', 1, 0] } },
      },
    },
  ]);
};

module.exports = mongoose.model('FeedImpression', feedImpressionSchema);
