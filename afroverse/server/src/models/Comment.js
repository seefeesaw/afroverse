const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true,
  },
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle',
    default: null,
    index: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true,
  },
  likes: {
    type: Number,
    default: 0,
    index: true,
  },
  replies: {
    count: {
      type: Number,
      default: 0,
    },
    lastReplyAt: {
      type: Date,
      default: null,
    },
  },
  flags: {
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    reported: {
      type: Boolean,
      default: false,
      index: true,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden'],
      default: 'pending',
      index: true,
    },
    lastModeratedAt: {
      type: Date,
      default: null,
    },
  },
  metadata: {
    mentions: [{
      type: String,
    }],
    hashtags: [{
      type: String,
    }],
    emojis: [{
      type: String,
    }],
    isTribeWar: {
      type: Boolean,
      default: false,
    },
    tribe: {
      type: String,
      default: null,
    },
  },
  engagement: {
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
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
commentSchema.index({ videoId: 1, 'flags.isPinned': -1, createdAt: -1 });
commentSchema.index({ battleId: 1, 'flags.isPinned': -1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, createdAt: -1 });
commentSchema.index({ likes: -1, createdAt: -1 });

// Methods
commentSchema.methods.incrementLike = function() {
  this.likes += 1;
  return this.save();
};

commentSchema.methods.decrementLike = function() {
  this.likes = Math.max(0, this.likes - 1);
  return this.save();
};

commentSchema.methods.incrementReplyCount = function() {
  this.replies.count += 1;
  this.replies.lastReplyAt = new Date();
  return this.save();
};

commentSchema.methods.decrementReplyCount = function() {
  this.replies.count = Math.max(0, this.replies.count - 1);
  return this.save();
};

commentSchema.methods.reportComment = function() {
  this.flags.reported = true;
  this.flags.reportCount += 1;
  return this.save();
};

commentSchema.methods.pinComment = function() {
  this.flags.isPinned = true;
  return this.save();
};

commentSchema.methods.unpinComment = function() {
  this.flags.isPinned = false;
  return this.save();
};

commentSchema.methods.isTopComment = function() {
  // Top comments have high likes, replies, and recency
  const ageHours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 1 - (ageHours / 48));
  const likesScore = Math.log10(this.likes + 1);
  const repliesScore = Math.log10(this.replies.count + 1);
  
  return (likesScore * 0.4) + (repliesScore * 0.3) + (recencyScore * 0.3);
};

// Static methods
commentSchema.statics.getCommentsByVideo = function(videoId, sort = 'top', limit = 20, skip = 0) {
  const query = { videoId, parentId: null, 'flags.moderationStatus': 'approved' };
  const sortObj = sort === 'top' ? 
    { 'flags.isPinned': -1, likes: -1, createdAt: -1 } : 
    { createdAt: -1 };
  
  return this.find(query)
    .sort(sortObj)
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username displayName avatar tribe')
    .populate('parentId', 'userId text')
    .lean();
};

commentSchema.statics.getRepliesForComment = function(commentId, limit = 10) {
  return this.find({ parentId: commentId, 'flags.moderationStatus': 'approved' })
    .sort({ likes: -1, createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username displayName avatar tribe')
    .lean();
};

commentSchema.statics.getTotalCommentCount = function(videoId) {
  return this.countDocuments({ videoId, 'flags.moderationStatus': 'approved' });
};

commentSchema.statics.getPinnedComment = function(videoId) {
  return this.findOne({
    videoId,
    'flags.isPinned': true,
    'flags.moderationStatus': 'approved'
  })
    .populate('userId', 'username displayName avatar tribe')
    .lean();
};

module.exports = mongoose.model('Comment', commentSchema);
