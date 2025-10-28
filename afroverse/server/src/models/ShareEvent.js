const mongoose = require('mongoose');

const shareEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['whatsapp', 'instagram', 'tiktok', 'twitter', 'facebook', 'telegram', 'copy_link', 'other'],
    required: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ['battle', 'transformation', 'profile', 'referral', 'tribe'],
    required: true,
    index: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  shareUrl: {
    type: String,
    required: true
  },
  shareMessage: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  analytics: {
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    lastClickedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
shareEventSchema.index({ userId: 1, createdAt: -1 });
shareEventSchema.index({ platform: 1, createdAt: -1 });
shareEventSchema.index({ contentType: 1, contentId: 1 });
shareEventSchema.index({ 'analytics.clicks': -1 });

// Method to increment clicks
shareEventSchema.methods.incrementClicks = function() {
  this.analytics.clicks++;
  this.analytics.lastClickedAt = new Date();
  return this.save();
};

// Method to increment conversions
shareEventSchema.methods.incrementConversions = function() {
  this.analytics.conversions++;
  return this.save();
};

// Method to get conversion rate
shareEventSchema.methods.getConversionRate = function() {
  if (this.analytics.clicks === 0) return 0;
  return (this.analytics.conversions / this.analytics.clicks) * 100;
};

// Method to get share statistics
shareEventSchema.methods.getStatistics = function() {
  return {
    clicks: this.analytics.clicks,
    conversions: this.analytics.conversions,
    conversionRate: this.getConversionRate(),
    lastClickedAt: this.analytics.lastClickedAt
  };
};

// Static method to create share event
shareEventSchema.statics.createShareEvent = function(userId, platform, contentType, contentId, shareUrl, shareMessage = null, metadata = {}) {
  return this.create({
    userId,
    platform,
    contentType,
    contentId,
    shareUrl,
    shareMessage,
    metadata
  });
};

// Static method to get share events by user
shareEventSchema.statics.getShareEventsByUser = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('contentId');
};

// Static method to get share events by content
shareEventSchema.statics.getShareEventsByContent = function(contentType, contentId) {
  return this.find({ contentType, contentId })
    .sort({ createdAt: -1 })
    .populate('userId', 'username');
};

// Static method to get share statistics
shareEventSchema.statics.getShareStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          platform: '$platform',
          contentType: '$contentType'
        },
        totalShares: { $sum: 1 },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' }
      }
    },
    {
      $group: {
        _id: '$_id.platform',
        contentTypes: {
          $push: {
            contentType: '$_id.contentType',
            totalShares: '$totalShares',
            totalClicks: '$totalClicks',
            totalConversions: '$totalConversions'
          }
        },
        totalShares: { $sum: '$totalShares' },
        totalClicks: { $sum: '$totalClicks' },
        totalConversions: { $sum: '$totalConversions' }
      }
    },
    {
      $sort: { totalShares: -1 }
    }
  ]);
};

// Static method to get top sharing users
shareEventSchema.statics.getTopSharingUsers = function(limit = 20) {
  return this.aggregate([
    {
      $group: {
        _id: '$userId',
        totalShares: { $sum: 1 },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' },
        platforms: { $addToSet: '$platform' },
        contentTypes: { $addToSet: '$contentType' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        userId: '$_id',
        username: '$user.username',
        totalShares: 1,
        totalClicks: 1,
        totalConversions: 1,
        platforms: 1,
        contentTypes: 1,
        conversionRate: {
          $cond: [
            { $eq: ['$totalClicks', 0] },
            0,
            { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { totalShares: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get viral content
shareEventSchema.statics.getViralContent = function(limit = 20) {
  return this.aggregate([
    {
      $group: {
        _id: {
          contentType: '$contentType',
          contentId: '$contentId'
        },
        totalShares: { $sum: 1 },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' },
        platforms: { $addToSet: '$platform' },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        contentType: '$_id.contentType',
        contentId: '$_id.contentId',
        totalShares: 1,
        totalClicks: 1,
        totalConversions: 1,
        platforms: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        conversionRate: {
          $cond: [
            { $eq: ['$totalClicks', 0] },
            0,
            { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] }
          ]
        },
        viralScore: {
          $add: [
            { $multiply: ['$totalShares', 1] },
            { $multiply: ['$totalClicks', 2] },
            { $multiply: ['$totalConversions', 5] }
          ]
        }
      }
    },
    {
      $sort: { viralScore: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get platform performance
shareEventSchema.statics.getPlatformPerformance = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$platform',
        totalShares: { $sum: 1 },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        platform: '$_id',
        totalShares: 1,
        totalClicks: 1,
        totalConversions: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        conversionRate: {
          $cond: [
            { $eq: ['$totalClicks', 0] },
            0,
            { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { totalShares: -1 }
    }
  ]);
};

// Static method to get content type performance
shareEventSchema.statics.getContentTypePerformance = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$contentType',
        totalShares: { $sum: 1 },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' },
        platforms: { $addToSet: '$platform' }
      }
    },
    {
      $project: {
        contentType: '$_id',
        totalShares: 1,
        totalClicks: 1,
        totalConversions: 1,
        platforms: 1,
        conversionRate: {
          $cond: [
            { $eq: ['$totalClicks', 0] },
            0,
            { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { totalShares: -1 }
    }
  ]);
};

// Static method to get share trends
shareEventSchema.statics.getShareTrends = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalShares: { $sum: 1 },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get K-factor
shareEventSchema.statics.getKFactor = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalShares: { $sum: 1 },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' }
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalShares: { $sum: '$totalShares' },
        totalClicks: { $sum: '$totalClicks' },
        totalConversions: { $sum: '$totalConversions' },
        avgSharesPerUser: { $avg: '$totalShares' },
        avgClicksPerUser: { $avg: '$totalClicks' },
        avgConversionsPerUser: { $avg: '$totalConversions' }
      }
    },
    {
      $project: {
        totalUsers: 1,
        totalShares: 1,
        totalClicks: 1,
        totalConversions: 1,
        avgSharesPerUser: 1,
        avgClicksPerUser: 1,
        avgConversionsPerUser: 1,
        kFactor: {
          $multiply: [
            '$avgSharesPerUser',
            {
              $cond: [
                { $eq: ['$totalClicks', 0] },
                0,
                { $divide: ['$totalConversions', '$totalClicks'] }
              ]
            }
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('ShareEvent', shareEventSchema);
