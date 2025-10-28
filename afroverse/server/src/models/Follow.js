const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  followingId: {
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

// Compound index to ensure unique follow relationships
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Index for efficient queries
followSchema.index({ followerId: 1, createdAt: -1 });
followSchema.index({ followingId: 1, createdAt: -1 });

module.exports = mongoose.model('Follow', followSchema);
