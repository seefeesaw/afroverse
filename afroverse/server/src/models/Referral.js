const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  referralCode: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true,
  },
  rewards: {
    referrer: {
      xp: { type: Number, default: 0 },
      transformCredits: { type: Number, default: 0 },
      coins: { type: Number, default: 0 },
      premiumStyle: { type: String, default: null },
      badge: { type: String, default: null },
    },
    referredUser: {
      xp: { type: Number, default: 0 },
      coins: { type: Number, default: 0 },
    },
  },
  tribeAssignment: {
    autoAssigned: { type: Boolean, default: true },
    tribeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tribe' },
  },
  fraudDetection: {
    deviceFingerprint: String,
    ipAddress: String,
    suspiciousActivity: { type: Boolean, default: false },
    flaggedReason: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  failedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes for performance
referralSchema.index({ referrerUserId: 1, status: 1 });
referralSchema.index({ referredUserId: 1, status: 1 });
referralSchema.index({ referralCode: 1, status: 1 });
referralSchema.index({ createdAt: -1 });
referralSchema.index({ 'fraudDetection.deviceFingerprint': 1 });
referralSchema.index({ 'fraudDetection.ipAddress': 1 });

// Static methods
referralSchema.statics.getReferralStats = function(userId) {
  return this.aggregate([
    { $match: { referrerUserId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalReferrals: { $sum: 1 },
        completedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        pendingReferrals: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        totalXpEarned: { $sum: '$rewards.referrer.xp' },
        totalCoinsEarned: { $sum: '$rewards.referrer.coins' },
        totalTransformCredits: { $sum: '$rewards.referrer.transformCredits' },
      }
    }
  ]);
};

referralSchema.statics.getTribeReferralStats = function(tribeId) {
  return this.aggregate([
    { $match: { 'tribeAssignment.tribeId': new mongoose.Types.ObjectId(tribeId) } },
    {
      $group: {
        _id: null,
        totalRecruits: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        thisWeekRecruits: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'completed'] },
                  { $gte: ['$completedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }
                ]
              },
              1,
              0
            ]
          }
        },
      }
    }
  ]);
};

referralSchema.statics.getTopRecruiters = function(limit = 10) {
  return this.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$referrerUserId',
        totalReferrals: { $sum: 1 },
        lastReferralAt: { $max: '$completedAt' },
      }
    },
    { $sort: { totalReferrals: -1, lastReferralAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        username: '$user.username',
        displayName: '$user.displayName',
        tribe: '$user.tribe',
        totalReferrals: 1,
        lastReferralAt: 1,
      }
    }
  ]);
};

referralSchema.statics.getTopRecruitingTribes = function(limit = 10) {
  return this.aggregate([
    { $match: { status: 'completed', 'tribeAssignment.tribeId': { $exists: true } } },
    {
      $group: {
        _id: '$tribeAssignment.tribeId',
        totalRecruits: { $sum: 1 },
        thisWeekRecruits: {
          $sum: {
            $cond: [
              { $gte: ['$completedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        },
        lastRecruitAt: { $max: '$completedAt' },
      }
    },
    { $sort: { totalRecruits: -1, thisWeekRecruits: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'tribes',
        localField: '_id',
        foreignField: '_id',
        as: 'tribe'
      }
    },
    { $unwind: '$tribe' },
    {
      $project: {
        tribeId: '$_id',
        tribeName: '$tribe.name',
        tribeEmoji: '$tribe.emoji',
        totalRecruits: 1,
        thisWeekRecruits: 1,
        lastRecruitAt: 1,
      }
    }
  ]);
};

module.exports = mongoose.model('Referral', referralSchema);