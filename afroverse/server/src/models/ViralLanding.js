const mongoose = require('mongoose');

const viralLandingSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
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
  originalUrl: {
    type: String,
    required: true
  },
  landingUrl: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    lastViewedAt: {
      type: Date,
      default: null
    },
    lastClickedAt: {
      type: Date,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
viralLandingSchema.index({ shortCode: 1 });
viralLandingSchema.index({ contentType: 1, contentId: 1 });
viralLandingSchema.index({ isActive: 1, expiresAt: 1 });
viralLandingSchema.index({ 'analytics.views': -1 });

// Method to increment views
viralLandingSchema.methods.incrementViews = function() {
  this.analytics.views++;
  this.analytics.lastViewedAt = new Date();
  return this.save();
};

// Method to increment clicks
viralLandingSchema.methods.incrementClicks = function() {
  this.analytics.clicks++;
  this.analytics.lastClickedAt = new Date();
  return this.save();
};

// Method to increment conversions
viralLandingSchema.methods.incrementConversions = function() {
  this.analytics.conversions++;
  return this.save();
};

// Method to get conversion rate
viralLandingSchema.methods.getConversionRate = function() {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.conversions / this.analytics.views) * 100;
};

// Method to get click-through rate
viralLandingSchema.methods.getClickThroughRate = function() {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.clicks / this.analytics.views) * 100;
};

// Method to get analytics summary
viralLandingSchema.methods.getAnalyticsSummary = function() {
  return {
    views: this.analytics.views,
    clicks: this.analytics.clicks,
    conversions: this.analytics.conversions,
    conversionRate: this.getConversionRate(),
    clickThroughRate: this.getClickThroughRate(),
    lastViewedAt: this.analytics.lastViewedAt,
    lastClickedAt: this.analytics.lastClickedAt
  };
};

// Method to check if expired
viralLandingSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to check if active
viralLandingSchema.methods.isCurrentlyActive = function() {
  return this.isActive && !this.isExpired();
};

// Static method to generate short code
viralLandingSchema.statics.generateShortCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// Static method to create viral landing
viralLandingSchema.statics.createViralLanding = async function(contentType, contentId, originalUrl, metadata = {}) {
  let shortCode;
  let isUnique = false;
  
  // Generate unique short code
  while (!isUnique) {
    shortCode = this.generateShortCode();
    const existing = await this.findOne({ shortCode });
    if (!existing) {
      isUnique = true;
    }
  }
  
  const landingUrl = `${process.env.CLIENT_URL}/v/${shortCode}`;
  
  return this.create({
    shortCode,
    contentType,
    contentId,
    originalUrl,
    landingUrl,
    metadata
  });
};

// Static method to get viral landing by short code
viralLandingSchema.statics.getViralLandingByShortCode = function(shortCode) {
  return this.findOne({ shortCode, isActive: true });
};

// Static method to get viral landing by content
viralLandingSchema.statics.getViralLandingByContent = function(contentType, contentId) {
  return this.findOne({ contentType, contentId, isActive: true });
};

// Static method to get viral landing statistics
viralLandingSchema.statics.getViralLandingStatistics = function(startDate, endDate) {
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
          contentType: '$contentType'
        },
        totalLandings: { $sum: 1 },
        totalViews: { $sum: '$analytics.views' },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' }
      }
    },
    {
      $project: {
        contentType: '$_id.contentType',
        totalLandings: 1,
        totalViews: 1,
        totalClicks: 1,
        totalConversions: 1,
        averageViews: { $divide: ['$totalViews', '$totalLandings'] },
        averageClicks: { $divide: ['$totalClicks', '$totalLandings'] },
        averageConversions: { $divide: ['$totalConversions', '$totalLandings'] },
        conversionRate: {
          $cond: [
            { $eq: ['$totalViews', 0] },
            0,
            { $multiply: [{ $divide: ['$totalConversions', '$totalViews'] }, 100] }
          ]
        },
        clickThroughRate: {
          $cond: [
            { $eq: ['$totalViews', 0] },
            0,
            { $multiply: [{ $divide: ['$totalClicks', '$totalViews'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { totalViews: -1 }
    }
  ]);
};

// Static method to get top viral landings
viralLandingSchema.statics.getTopViralLandings = function(limit = 20) {
  return this.aggregate([
    {
      $group: {
        _id: {
          contentType: '$contentType',
          contentId: '$contentId'
        },
        totalViews: { $sum: '$analytics.views' },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' },
        landingCount: { $sum: 1 }
      }
    },
    {
      $project: {
        contentType: '$_id.contentType',
        contentId: '$_id.contentId',
        totalViews: 1,
        totalClicks: 1,
        totalConversions: 1,
        landingCount: 1,
        conversionRate: {
          $cond: [
            { $eq: ['$totalViews', 0] },
            0,
            { $multiply: [{ $divide: ['$totalConversions', '$totalViews'] }, 100] }
          ]
        },
        clickThroughRate: {
          $cond: [
            { $eq: ['$totalViews', 0] },
            0,
            { $multiply: [{ $divide: ['$totalClicks', '$totalViews'] }, 100] }
          ]
        },
        viralScore: {
          $add: [
            { $multiply: ['$totalViews', 1] },
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

// Static method to get viral landing trends
viralLandingSchema.statics.getViralLandingTrends = function(days = 30) {
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
        totalLandings: { $sum: 1 },
        totalViews: { $sum: '$analytics.views' },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get expired landings
viralLandingSchema.statics.getExpiredLandings = function() {
  return this.find({
    isActive: true,
    expiresAt: { $lt: new Date() }
  });
};

// Static method to deactivate expired landings
viralLandingSchema.statics.deactivateExpiredLandings = function() {
  return this.updateMany(
    {
      isActive: true,
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { isActive: false }
    }
  );
};

// Static method to get active landings
viralLandingSchema.statics.getActiveLandings = function(limit = 100) {
  return this.find({
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get landing performance
viralLandingSchema.statics.getLandingPerformance = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          contentType: '$contentType'
        },
        totalLandings: { $sum: 1 },
        totalViews: { $sum: '$analytics.views' },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' },
        avgViews: { $avg: '$analytics.views' },
        avgClicks: { $avg: '$analytics.clicks' },
        avgConversions: { $avg: '$analytics.conversions' }
      }
    },
    {
      $project: {
        contentType: '$_id.contentType',
        totalLandings: 1,
        totalViews: 1,
        totalClicks: 1,
        totalConversions: 1,
        avgViews: 1,
        avgClicks: 1,
        avgConversions: 1,
        conversionRate: {
          $cond: [
            { $eq: ['$totalViews', 0] },
            0,
            { $multiply: [{ $divide: ['$totalConversions', '$totalViews'] }, 100] }
          ]
        },
        clickThroughRate: {
          $cond: [
            { $eq: ['$totalViews', 0] },
            0,
            { $multiply: [{ $divide: ['$totalClicks', '$totalViews'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { totalViews: -1 }
    }
  ]);
};

module.exports = mongoose.model('ViralLanding', viralLandingSchema);
