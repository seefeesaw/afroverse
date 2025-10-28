const Stripe = require('stripe');
const Subscription = require('../models/Subscription');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const { logger } = require('../utils/logger');

class PaymentService {
  constructor() {
    this.stripe = null;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // Initialize Stripe only if key is provided
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder_key_replace_with_real_key') {
      try {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      } catch (error) {
        logger.warn('Stripe initialization failed:', error.message);
      }
    } else {
      logger.warn('Stripe not configured - payments will be disabled');
    }
  }

  // Create checkout session for subscription
  async createCheckoutSession(userId, plan = 'monthly') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has active subscription
      const existingSubscription = await Subscription.getUserSubscription(userId);
      if (existingSubscription && existingSubscription.isActive()) {
        throw new Error('User already has active subscription');
      }

      // Define pricing
      const pricing = {
        monthly: {
          priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
          amount: 499, // $4.99
          currency: 'USD'
        },
        weekly: {
          priceId: process.env.STRIPE_WEEKLY_PRICE_ID,
          amount: 199, // $1.99
          currency: 'USD'
        }
      };

      const selectedPricing = pricing[plan];
      if (!selectedPricing) {
        throw new Error('Invalid plan selected');
      }

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer_email: user.phone, // Using phone as email for now
        payment_method_types: ['card'],
        line_items: [
          {
            price: selectedPricing.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
        metadata: {
          userId: userId.toString(),
          plan: plan
        },
        subscription_data: {
          metadata: {
            userId: userId.toString(),
            plan: plan
          }
        }
      });

      logger.info(`Created checkout session for user ${userId}: ${session.id}`);
      
      return {
        success: true,
        sessionId: session.id,
        url: session.url
      };

    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Create payment intent for consumable purchase
  async createPaymentIntent(userId, type, metadata = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Define pricing for consumables
      const pricing = {
        boost: {
          amount: 99, // $0.99
          currency: 'USD',
          description: 'Battle Boost - 3x visibility for 2 hours'
        },
        streak_insurance: {
          amount: 49, // $0.49
          currency: 'USD',
          description: 'Streak Insurance - Protect your streak'
        },
        instant_finish: {
          amount: 79, // $0.79
          currency: 'USD',
          description: 'Instant Finish - Skip AI queue'
        }
      };

      const selectedPricing = pricing[type];
      if (!selectedPricing) {
        throw new Error('Invalid purchase type');
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: selectedPricing.amount,
        currency: selectedPricing.currency,
        metadata: {
          userId: userId.toString(),
          type: type,
          ...metadata
        }
      });

      logger.info(`Created payment intent for user ${userId}: ${paymentIntent.id}`);
      
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };

    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Handle successful payment intent
  async handleSuccessfulPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not succeeded');
      }

      const { userId, type } = paymentIntent.metadata;
      
      // Create purchase record
      const purchase = new Purchase({
        userId: userId,
        type: type,
        price: {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        },
        provider: 'stripe',
        providerRef: paymentIntent.id,
        status: 'completed',
        metadata: paymentIntent.metadata
      });

      await purchase.save();

      // Grant benefits based on type
      await this.grantPurchaseBenefits(userId, type, purchase._id);

      logger.info(`Successfully processed payment for user ${userId}: ${type}`);
      
      return {
        success: true,
        purchaseId: purchase._id
      };

    } catch (error) {
      logger.error('Error handling successful payment:', error);
      throw error;
    }
  }

  // Grant benefits for consumable purchase
  async grantPurchaseBenefits(userId, type, purchaseId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      switch (type) {
        case 'boost':
          // Grant battle boost (handled by battle system)
          logger.info(`Granted battle boost to user ${userId}`);
          break;
          
        case 'streak_insurance':
          // Grant streak insurance
          user.streak.freeze.available += 1;
          await user.save();
          logger.info(`Granted streak insurance to user ${userId}`);
          break;
          
        case 'instant_finish':
          // Grant instant finish (handled by transform system)
          logger.info(`Granted instant finish to user ${userId}`);
          break;
          
        default:
          logger.warn(`Unknown purchase type: ${type}`);
      }

    } catch (error) {
      logger.error('Error granting purchase benefits:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
          
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;
          
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
          
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
          
        default:
          logger.info(`Unhandled webhook event: ${event.type}`);
      }
      
      return { success: true };
      
    } catch (error) {
      logger.error('Error handling webhook event:', error);
      throw error;
    }
  }

  // Handle checkout session completed
  async handleCheckoutCompleted(session) {
    try {
      const { userId, plan } = session.metadata;
      
      // Get subscription from Stripe
      const subscription = await this.stripe.subscriptions.retrieve(session.subscription);
      
      // Create subscription record
      const newSubscription = new Subscription({
        userId: userId,
        status: 'active',
        provider: 'stripe',
        product: 'warrior_pass',
        plan: plan,
        startedAt: new Date(subscription.current_period_start * 1000),
        expiresAt: new Date(subscription.current_period_end * 1000),
        autoRenew: true,
        providerRef: subscription.id,
        price: {
          amount: subscription.items.data[0].price.unit_amount,
          currency: subscription.items.data[0].price.currency
        }
      });

      await newSubscription.save();

      // Activate user entitlements
      const user = await User.findById(userId);
      if (user) {
        await user.updateEntitlementsFromSubscription(newSubscription);
      }

      logger.info(`Subscription activated for user ${userId}: ${subscription.id}`);
      
    } catch (error) {
      logger.error('Error handling checkout completed:', error);
      throw error;
    }
  }

  // Handle invoice paid
  async handleInvoicePaid(invoice) {
    try {
      const subscription = await Subscription.getByProviderRef(invoice.subscription);
      
      if (subscription) {
        // Update subscription expiry
        subscription.expiresAt = new Date(invoice.period_end * 1000);
        subscription.status = 'active';
        await subscription.save();

        // Update user entitlements
        const user = await User.findById(subscription.userId);
        if (user) {
          await user.updateEntitlementsFromSubscription(subscription);
        }

        logger.info(`Subscription renewed for user ${subscription.userId}`);
      }
      
    } catch (error) {
      logger.error('Error handling invoice paid:', error);
      throw error;
    }
  }

  // Handle invoice payment failed
  async handleInvoicePaymentFailed(invoice) {
    try {
      const subscription = await Subscription.getByProviderRef(invoice.subscription);
      
      if (subscription) {
        // Mark as past due
        subscription.status = 'past_due';
        await subscription.save();

        // Send notification to user
        // This would integrate with notification service
        logger.info(`Subscription payment failed for user ${subscription.userId}`);
      }
      
    } catch (error) {
      logger.error('Error handling invoice payment failed:', error);
      throw error;
    }
  }

  // Handle subscription deleted
  async handleSubscriptionDeleted(subscription) {
    try {
      const userSubscription = await Subscription.getByProviderRef(subscription.id);
      
      if (userSubscription) {
        // Mark as canceled
        userSubscription.status = 'canceled';
        userSubscription.canceledAt = new Date();
        userSubscription.autoRenew = false;
        await userSubscription.save();

        // Deactivate user entitlements
        const user = await User.findById(userSubscription.userId);
        if (user) {
          await user.updateEntitlementsFromSubscription(userSubscription);
        }

        logger.info(`Subscription canceled for user ${userSubscription.userId}`);
      }
      
    } catch (error) {
      logger.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  // Handle payment intent succeeded
  async handlePaymentIntentSucceeded(paymentIntent) {
    try {
      await this.handleSuccessfulPayment(paymentIntent.id);
    } catch (error) {
      logger.error('Error handling payment intent succeeded:', error);
      throw error;
    }
  }

  // Get user subscription status
  async getUserSubscriptionStatus(userId) {
    try {
      const subscription = await Subscription.getUserSubscription(userId);
      const user = await User.findById(userId);
      
      if (!subscription) {
        return {
          hasSubscription: false,
          status: 'free',
          entitlements: user.entitlements
        };
      }

      return {
        hasSubscription: true,
        status: subscription.status,
        plan: subscription.plan,
        expiresAt: subscription.expiresAt,
        isActive: subscription.isActive(),
        isTrial: subscription.isTrial(),
        daysUntilExpiry: subscription.getDaysUntilExpiry(),
        entitlements: user.entitlements,
        benefits: subscription.getBenefits()
      };

    } catch (error) {
      logger.error('Error getting user subscription status:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      const subscription = await Subscription.getUserSubscription(userId);
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Cancel in Stripe
      await this.stripe.subscriptions.cancel(subscription.providerRef);

      // Update local record
      await subscription.cancel('user_requested');

      // Deactivate entitlements
      const user = await User.findById(userId);
      if (user) {
        await user.updateEntitlementsFromSubscription(subscription);
      }

      logger.info(`Subscription canceled for user ${userId}`);
      
      return {
        success: true,
        canceledAt: subscription.canceledAt
      };

    } catch (error) {
      logger.error('Error canceling subscription:', error);
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

  // Get purchase analytics
  async getPurchaseAnalytics(startDate, endDate) {
    try {
      const analytics = await Purchase.getPurchaseAnalytics(startDate, endDate);
      return analytics;
    } catch (error) {
      logger.error('Error getting purchase analytics:', error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const paymentService = new PaymentService();

module.exports = paymentService;
