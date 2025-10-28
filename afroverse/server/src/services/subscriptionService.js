const Subscription = require('../models/Subscription');
const User = require('../models/User');
const notificationService = require('./notificationService');
const { logger } = require('../utils/logger');

class SubscriptionService {
  constructor() {
    this.renewalReminderDays = [7, 3, 1]; // Days before expiry to send reminders
  }

  // Check and update expired subscriptions
  async checkExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await Subscription.getExpiredSubscriptions();
      
      const results = {
        checked: expiredSubscriptions.length,
        expired: 0,
        errors: []
      };

      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription status
          subscription.status = 'expired';
          await subscription.save();

          // Deactivate user entitlements
          const user = await User.findById(subscription.userId);
          if (user) {
            await user.updateEntitlementsFromSubscription(subscription);
          }

          results.expired++;
          logger.info(`Subscription expired for user ${subscription.userId}`);
          
        } catch (error) {
          results.errors.push({
            subscriptionId: subscription._id,
            userId: subscription.userId,
            error: error.message
          });
          logger.error(`Error processing expired subscription ${subscription._id}:`, error);
        }
      }

      logger.info(`Processed ${results.expired}/${results.checked} expired subscriptions`);
      return results;

    } catch (error) {
      logger.error('Error checking expired subscriptions:', error);
      throw error;
    }
  }

  // Send renewal reminders
  async sendRenewalReminders() {
    try {
      const results = {
        sent: 0,
        errors: []
      };

      for (const days of this.renewalReminderDays) {
        const expiringSubscriptions = await Subscription.getExpiringSubscriptions(days);
        
        for (const subscription of expiringSubscriptions) {
          try {
            await this.sendRenewalReminder(subscription, days);
            results.sent++;
          } catch (error) {
            results.errors.push({
              subscriptionId: subscription._id,
              userId: subscription.userId,
              error: error.message
            });
            logger.error(`Error sending renewal reminder for subscription ${subscription._id}:`, error);
          }
        }
      }

      logger.info(`Sent ${results.sent} renewal reminders`);
      return results;

    } catch (error) {
      logger.error('Error sending renewal reminders:', error);
      throw error;
    }
  }

  // Send renewal reminder for specific subscription
  async sendRenewalReminder(subscription, daysUntilExpiry) {
    try {
      const user = await User.findById(subscription.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if reminder was already sent
      const lastReminderKey = `renewal_reminder_${daysUntilExpiry}d`;
      if (subscription.metadata[lastReminderKey]) {
        return; // Already sent
      }

      // Prepare reminder message
      const message = this.getRenewalReminderMessage(daysUntilExpiry, subscription.plan);
      
      // Send notification
      await notificationService.sendNotification(
        subscription.userId,
        'subscription_renewal_reminder',
        'push',
        {
          days_left: daysUntilExpiry,
          plan: subscription.plan,
          deeplink: `${process.env.CLIENT_URL}/payment/renew`
        }
      );

      // Mark reminder as sent
      subscription.metadata[lastReminderKey] = new Date();
      await subscription.save();

      logger.info(`Renewal reminder sent to user ${subscription.userId} (${daysUntilExpiry} days)`);

    } catch (error) {
      logger.error('Error sending renewal reminder:', error);
      throw error;
    }
  }

  // Get renewal reminder message
  getRenewalReminderMessage(daysUntilExpiry, plan) {
    const planName = plan === 'monthly' ? 'Monthly' : 'Weekly';
    
    if (daysUntilExpiry === 7) {
      return {
        title: 'Warrior Pass Expires Soon',
        body: `Your ${planName} Warrior Pass expires in 7 days. Renew to keep your unlimited transformations and 2× tribe points!`
      };
    } else if (daysUntilExpiry === 3) {
      return {
        title: 'Warrior Pass Expires in 3 Days',
        body: `Don't lose your Warrior benefits! Renew your ${planName} pass to keep unlimited transformations and 2× tribe points.`
      };
    } else if (daysUntilExpiry === 1) {
      return {
        title: 'Last Day - Renew Warrior Pass',
        body: `Your ${planName} Warrior Pass expires tomorrow! Renew now to keep your unlimited transformations and 2× tribe points.`
      };
    }
    
    return {
      title: 'Warrior Pass Expires Soon',
      body: `Your ${planName} Warrior Pass expires in ${daysUntilExpiry} days. Renew to keep your benefits!`
    };
  }

  // Get subscription metrics
  async getSubscriptionMetrics() {
    try {
      const metrics = await Subscription.getSubscriptionMetrics();
      return metrics[0] || {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        canceledSubscriptions: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0
      };
    } catch (error) {
      logger.error('Error getting subscription metrics:', error);
      throw error;
    }
  }

  // Get subscription analytics
  async getSubscriptionAnalytics(startDate, endDate) {
    try {
      const analytics = await Subscription.getSubscriptionAnalytics(startDate, endDate);
      return analytics;
    } catch (error) {
      logger.error('Error getting subscription analytics:', error);
      throw error;
    }
  }

  // Get user subscription history
  async getUserSubscriptionHistory(userId) {
    try {
      const subscriptions = await Subscription.find({ userId })
        .sort({ createdAt: -1 })
        .select('status plan startedAt expiresAt canceledAt cancelReason price')
        .lean();
      
      return subscriptions;
    } catch (error) {
      logger.error('Error getting user subscription history:', error);
      throw error;
    }
  }

  // Get subscription by ID
  async getSubscriptionById(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error getting subscription by ID:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, updates) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          subscription[key] = updates[key];
        }
      });

      await subscription.save();
      return subscription;
    } catch (error) {
      logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Create trial subscription
  async createTrialSubscription(userId, days = 7) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has active subscription
      const existingSubscription = await Subscription.getUserSubscription(userId);
      if (existingSubscription) {
        throw new Error('User already has active subscription');
      }

      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

      // Create trial subscription
      const trialSubscription = new Subscription({
        userId: userId,
        status: 'trialing',
        provider: 'stripe',
        product: 'warrior_pass',
        plan: 'monthly',
        startedAt: now,
        expiresAt: trialEndsAt,
        autoRenew: false,
        providerRef: `trial_${userId}_${Date.now()}`,
        price: {
          amount: 0,
          currency: 'USD'
        },
        trialEndsAt: trialEndsAt,
        metadata: {
          isTrial: true,
          trialDays: days
        }
      });

      await trialSubscription.save();

      // Activate user entitlements
      await user.updateEntitlementsFromSubscription(trialSubscription);

      logger.info(`Trial subscription created for user ${userId} (${days} days)`);
      
      return trialSubscription;
    } catch (error) {
      logger.error('Error creating trial subscription:', error);
      throw error;
    }
  }

  // Convert trial to paid subscription
  async convertTrialToPaid(userId, stripeSubscriptionId) {
    try {
      const trialSubscription = await Subscription.findOne({
        userId: userId,
        status: 'trialing'
      });

      if (!trialSubscription) {
        throw new Error('No trial subscription found');
      }

      // Update trial subscription to paid
      trialSubscription.status = 'active';
      trialSubscription.providerRef = stripeSubscriptionId;
      trialSubscription.autoRenew = true;
      trialSubscription.metadata.isTrial = false;
      await trialSubscription.save();

      logger.info(`Trial converted to paid for user ${userId}`);
      
      return trialSubscription;
    } catch (error) {
      logger.error('Error converting trial to paid:', error);
      throw error;
    }
  }

  // Get subscription conversion rate
  async getSubscriptionConversionRate(startDate, endDate) {
    try {
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
            _id: null,
            totalTrials: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'trialing'] },
                  1,
                  0
                ]
              }
            },
            convertedTrials: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'active'] },
                      { $ne: ['$metadata.isTrial', true] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ];

      const result = await Subscription.aggregate(pipeline);
      const data = result[0] || { totalTrials: 0, convertedTrials: 0 };
      
      const conversionRate = data.totalTrials > 0 
        ? (data.convertedTrials / data.totalTrials) * 100 
        : 0;

      return {
        totalTrials: data.totalTrials,
        convertedTrials: data.convertedTrials,
        conversionRate: Math.round(conversionRate * 100) / 100
      };
    } catch (error) {
      logger.error('Error getting subscription conversion rate:', error);
      throw error;
    }
  }

  // Get subscription churn rate
  async getSubscriptionChurnRate(startDate, endDate) {
    try {
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
            _id: null,
            totalSubscriptions: { $sum: 1 },
            canceledSubscriptions: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'canceled'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ];

      const result = await Subscription.aggregate(pipeline);
      const data = result[0] || { totalSubscriptions: 0, canceledSubscriptions: 0 };
      
      const churnRate = data.totalSubscriptions > 0 
        ? (data.canceledSubscriptions / data.totalSubscriptions) * 100 
        : 0;

      return {
        totalSubscriptions: data.totalSubscriptions,
        canceledSubscriptions: data.canceledSubscriptions,
        churnRate: Math.round(churnRate * 100) / 100
      };
    } catch (error) {
      logger.error('Error getting subscription churn rate:', error);
      throw error;
    }
  }
}

// Create singleton instance
const subscriptionService = new SubscriptionService();

module.exports = subscriptionService;
