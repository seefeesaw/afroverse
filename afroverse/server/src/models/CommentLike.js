const mongoose = require('mongoose');

const commentLikeSchema = new mongoose.Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index to ensure one like per user per comment
commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CommentLike', commentLikeSchema);
