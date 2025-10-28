const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['boost', 'streak_insurance', 'instant_finish'],
    required: true,
    index: true
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  provider: {
    type: String,
    enum: ['stripe', 'google_play', 'apple_iap', 'paystack'],
    required: true,
    index: true
  },
  providerRef: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  consumedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
purchaseSchema.index({ userId: 1, type: 1 });
purchaseSchema.index({ userId: 1, status: 1 });
purchaseSchema.index({ providerRef: 1 }, { unique: true });
purchaseSchema.index({ type: 1, status: 1 });
purchaseSchema.index({ createdAt: -1 });

// Method to check if purchase is active
purchaseSchema.methods.isActive = function() {
  if (this.status !== 'completed') return false;
  
  if (this.expiresAt) {
    return new Date() < this.expiresAt;
  }
  
  return true;
};

// Method to check if purchase is expired
purchaseSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() >= this.expiresAt;
};

// Method to consume purchase
purchaseSchema.methods.consume = function() {
  this.consumedAt = new Date();
  return this.save();
};

// Method to refund purchase
purchaseSchema.methods.refund = function() {
  this.status = 'refunded';
  return this.save();
};

// Method to get purchase benefits
purchaseSchema.methods.getBenefits = function() {
  const benefits = {
    boost: {
      description: 'Battle visibility boost',
      duration: '2 hours',
      multiplier: 3
    },
    streak_insurance: {
      description: 'Protect streak from loss',
      duration: '1 use',
      protection: true
    },
    instant_finish: {
      description: 'Skip AI processing queue',
      duration: '1 transformation',
      priority: true
    }
  };
  
  return benefits[this.type] || {};
};

// Method to get display name
purchaseSchema.methods.getDisplayName = function() {
  const names = {
    boost: 'Battle Boost',
    streak_insurance: 'Streak Insurance',
    instant_finish: 'Instant Finish'
  };
  
  return names[this.type] || this.type;
};

// Method to get icon
purchaseSchema.methods.getIcon = function() {
  const icons = {
    boost: '🚀',
    streak_insurance: '🛡️',
    instant_finish: '⚡'
  };
  
  return icons[this.type] || '💎';
};

// Static method to get user's active purchases
purchaseSchema.statics.getUserActivePurchases = function(userId) {
  return this.find({
    userId,
    status: 'completed',
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to get user's purchases by type
purchaseSchema.statics.getUserPurchasesByType = function(userId, type) {
  return this.find({
    userId,
    type,
    status: 'completed'
  }).sort({ createdAt: -1 });
};

// Static method to get purchase analytics
purchaseSchema.statics.getPurchaseAnalytics = function(startDate, endDate) {
  const pipeline = [
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
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$price.amount' }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            revenue: '$totalRevenue'
          }
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get purchase metrics
purchaseSchema.statics.getPurchaseMetrics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        completedPurchases: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              1,
              0
            ]
          }
        },
        failedPurchases: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'failed'] },
              1,
              0
            ]
          }
        },
        refundedPurchases: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'refunded'] },
              1,
              0
            ]
          }
        },
        totalRevenue: { $sum: '$price.amount' },
        boostRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$type', 'boost'] },
                  { $eq: ['$status', 'completed'] }
                ]
              },
              '$price.amount',
              0
            ]
          }
        },
        streakInsuranceRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$type', 'streak_insurance'] },
                  { $eq: ['$status', 'completed'] }
                ]
              },
              '$price.amount',
              0
            ]
          }
        },
        instantFinishRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$type', 'instant_finish'] },
                  { $eq: ['$status', 'completed'] }
                ]
              },
              '$price.amount',
              0
            ]
          }
        }
      }
    }
  ]);
};

// Static method to get top purchasers
purchaseSchema.statics.getTopPurchasers = function(limit = 10) {
  return this.aggregate([
    {
      $match: {
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$userId',
        totalPurchases: { $sum: 1 },
        totalSpent: { $sum: '$price.amount' },
        lastPurchase: { $max: '$createdAt' }
      }
    },
    {
      $sort: {
        totalSpent: -1
      }
    },
    {
      $limit: limit
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
        totalPurchases: 1,
        totalSpent: 1,
        lastPurchase: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Purchase', purchaseSchema);
