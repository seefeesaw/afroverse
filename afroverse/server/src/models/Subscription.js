const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled', 'past_due', 'trialing'],
    default: 'active',
    index: true
  },
  provider: {
    type: String,
    enum: ['stripe', 'google_play', 'apple_iap', 'paystack'],
    required: true,
    index: true
  },
  product: {
    type: String,
    enum: ['warrior_pass'],
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'weekly'],
    required: true,
    index: true
  },
  startedAt: {
    type: Date,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  providerRef: {
    type: String,
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
  trialEndsAt: {
    type: Date,
    default: null
  },
  canceledAt: {
    type: Date,
    default: null
  },
  cancelReason: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ expiresAt: 1 });
subscriptionSchema.index({ providerRef: 1 }, { unique: true });
subscriptionSchema.index({ status: 1, expiresAt: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && this.expiresAt > now;
};

// Method to check if subscription is expired
subscriptionSchema.methods.isExpired = function() {
  const now = new Date();
  return this.expiresAt <= now;
};

// Method to check if subscription is in trial
subscriptionSchema.methods.isTrial = function() {
  const now = new Date();
  return this.trialEndsAt && this.trialEndsAt > now;
};

// Method to get days until expiry
subscriptionSchema.methods.getDaysUntilExpiry = function() {
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Method to get subscription benefits
subscriptionSchema.methods.getBenefits = function() {
  return {
    unlimitedTransformations: true,
    allStyles: true,
    tribePointsMultiplier: 2,
    aiPriority: true,
    warriorBadge: true,
    fasterProcessing: true
  };
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function(reason = 'user_requested') {
  this.status = 'canceled';
  this.canceledAt = new Date();
  this.cancelReason = reason;
  this.autoRenew = false;
  return this.save();
};

// Method to renew subscription
subscriptionSchema.methods.renew = function(newExpiryDate) {
  this.status = 'active';
  this.expiresAt = newExpiryDate;
  this.canceledAt = null;
  this.cancelReason = null;
  return this.save();
};

// Method to extend trial
subscriptionSchema.methods.extendTrial = function(days) {
  const newTrialEnd = new Date();
  newTrialEnd.setDate(newTrialEnd.getDate() + days);
  this.trialEndsAt = newTrialEnd;
  return this.save();
};

// Static method to get active subscriptions
subscriptionSchema.statics.getActiveSubscriptions = function() {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

// Static method to get expiring subscriptions
subscriptionSchema.statics.getExpiringSubscriptions = function(days = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    expiresAt: { $lte: futureDate, $gt: new Date() }
  });
};

// Static method to get expired subscriptions
subscriptionSchema.statics.getExpiredSubscriptions = function() {
  return this.find({
    status: 'active',
    expiresAt: { $lte: new Date() }
  });
};

// Static method to get subscription by provider reference
subscriptionSchema.statics.getByProviderRef = function(providerRef) {
  return this.findOne({ providerRef });
};

// Static method to get user's current subscription
subscriptionSchema.statics.getUserSubscription = function(userId) {
  return this.findOne({
    userId,
    status: { $in: ['active', 'trialing'] },
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to get subscription analytics
subscriptionSchema.statics.getSubscriptionAnalytics = function(startDate, endDate) {
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
          status: '$status',
          plan: '$plan',
          provider: '$provider'
        },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$price.amount' }
      }
    },
    {
      $group: {
        _id: '$_id.status',
        plans: {
          $push: {
            plan: '$_id.plan',
            provider: '$_id.provider',
            count: '$count',
            revenue: '$totalRevenue'
          }
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get subscription metrics
subscriptionSchema.statics.getSubscriptionMetrics = function() {
  const now = new Date();
  
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalSubscriptions: { $sum: 1 },
        activeSubscriptions: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'active'] },
                  { $gt: ['$expiresAt', now] }
                ]
              },
              1,
              0
            ]
          }
        },
        expiredSubscriptions: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'active'] },
                  { $lte: ['$expiresAt', now] }
                ]
              },
              1,
              0
            ]
          }
        },
        canceledSubscriptions: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'canceled'] },
              1,
              0
            ]
          }
        },
        totalRevenue: { $sum: '$price.amount' },
        monthlyRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$plan', 'monthly'] },
                  { $eq: ['$status', 'active'] },
                  { $gt: ['$expiresAt', now] }
                ]
              },
              '$price.amount',
              0
            ]
          }
        },
        weeklyRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$plan', 'weekly'] },
                  { $eq: ['$status', 'active'] },
                  { $gt: ['$expiresAt', now] }
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

module.exports = mongoose.model('Subscription', subscriptionSchema);
