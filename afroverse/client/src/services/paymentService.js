import api from './api';

class PaymentService {
  constructor() {
    this.baseURL = '/api/payments';
  }

  // Create checkout session for subscription
  async createCheckoutSession(plan = 'monthly') {
    try {
      const response = await api.post(`${this.baseURL}/checkout-session`, {
        plan
      });
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Create payment intent for consumable
  async createPaymentIntent(type, metadata = {}) {
    try {
      const response = await api.post(`${this.baseURL}/payment-intent`, {
        type,
        metadata
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Get subscription status
  async getSubscriptionStatus() {
    try {
      const response = await api.get(`${this.baseURL}/subscription/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await api.post(`${this.baseURL}/subscription/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Get subscription history
  async getSubscriptionHistory() {
    try {
      const response = await api.get(`${this.baseURL}/subscription/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting subscription history:', error);
      throw error;
    }
  }

  // Create trial subscription
  async createTrialSubscription(days = 7) {
    try {
      const response = await api.post(`${this.baseURL}/subscription/trial`, {
        days
      });
      return response.data;
    } catch (error) {
      console.error('Error creating trial subscription:', error);
      throw error;
    }
  }

  // Get subscription analytics
  async getSubscriptionAnalytics(startDate, endDate) {
    try {
      const response = await api.get(`${this.baseURL}/analytics/subscription`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting subscription analytics:', error);
      throw error;
    }
  }

  // Get purchase analytics
  async getPurchaseAnalytics(startDate, endDate) {
    try {
      const response = await api.get(`${this.baseURL}/analytics/purchase`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting purchase analytics:', error);
      throw error;
    }
  }

  // Get subscription metrics
  async getSubscriptionMetrics() {
    try {
      const response = await api.get(`${this.baseURL}/analytics/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error getting subscription metrics:', error);
      throw error;
    }
  }

  // Get subscription conversion rate
  async getSubscriptionConversionRate(startDate, endDate) {
    try {
      const response = await api.get(`${this.baseURL}/analytics/conversion-rate`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting subscription conversion rate:', error);
      throw error;
    }
  }

  // Get subscription churn rate
  async getSubscriptionChurnRate(startDate, endDate) {
    try {
      const response = await api.get(`${this.baseURL}/analytics/churn-rate`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting subscription churn rate:', error);
      throw error;
    }
  }

  // Stripe Integration
  
  // Initialize Stripe
  initializeStripe(publishableKey) {
    if (window.Stripe) {
      return window.Stripe(publishableKey);
    }
    throw new Error('Stripe.js not loaded');
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId) {
    try {
      const stripe = this.initializeStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(clientSecret, paymentMethod) {
    try {
      const stripe = this.initializeStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const { error, paymentIntent } = await stripe.confirmPayment({
        client_secret: clientSecret,
        payment_method: paymentMethod
      });
      
      if (error) {
        throw error;
      }
      
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  // Create payment method
  async createPaymentMethod(cardElement) {
    try {
      const stripe = this.initializeStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      });
      
      if (error) {
        throw error;
      }
      
      return paymentMethod;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  // Utility Methods
  
  // Format price
  formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  }

  // Get plan display name
  getPlanDisplayName(plan) {
    const names = {
      monthly: 'Monthly',
      weekly: 'Weekly'
    };
    return names[plan] || plan;
  }

  // Get plan benefits
  getPlanBenefits(plan) {
    const benefits = {
      monthly: [
        'Unlimited Transformations',
        'Access All Styles',
        '2× Tribe Points',
        'Faster AI Processing',
        'Warrior Badge',
        'Priority Support'
      ],
      weekly: [
        'Unlimited Transformations',
        'Access All Styles',
        '2× Tribe Points',
        'Faster AI Processing',
        'Warrior Badge'
      ]
    };
    return benefits[plan] || [];
  }

  // Get consumable display info
  getConsumableInfo(type) {
    const info = {
      boost: {
        name: 'Battle Boost',
        description: '3× more voters for 2 hours',
        icon: '🚀',
        color: '#E74C3C',
        price: 99
      },
      streak_insurance: {
        name: 'Streak Insurance',
        description: 'Protect your streak from loss',
        icon: '🛡️',
        color: '#3498DB',
        price: 49
      },
        instant_finish: {
        name: 'Instant Finish',
        description: 'Skip AI processing queue',
        icon: '⚡',
        color: '#F39C12',
        price: 79
      }
    };
    return info[type] || {};
  }

  // Get subscription status display
  getSubscriptionStatusDisplay(status) {
    const displays = {
      active: { text: 'Active', color: '#2ECC71', icon: '✅' },
      expired: { text: 'Expired', color: '#E74C3C', icon: '❌' },
      canceled: { text: 'Canceled', color: '#95A5A6', icon: '🚫' },
      past_due: { text: 'Past Due', color: '#F39C12', icon: '⚠️' },
      trialing: { text: 'Trial', color: '#9B59B6', icon: '🎯' }
    };
    return displays[status] || { text: status, color: '#34495E', icon: '❓' };
  }

  // Check if user should see paywall
  shouldShowPaywall(user, feature) {
    if (!user) return false;
    
    switch (feature) {
      case 'transform':
        return !user.entitlements.unlimitedTransformations && user.limits.transformsUsed >= 3;
      case 'premium_style':
        return !user.entitlements.allStyles;
      case 'ai_priority':
        return !user.entitlements.aiPriority;
      case 'battle_boost':
        return !user.entitlements.warriorActive;
      case 'streak_insurance':
        return !user.streak.freeze.available || user.streak.freeze.available <= 0;
      case 'instant_finish':
        return !user.entitlements.warriorActive;
      default:
        return false;
    }
  }

  // Get paywall type for feature
  getPaywallType(feature) {
    const types = {
      transform: 'warrior_pass',
      premium_style: 'warrior_pass',
      ai_priority: 'warrior_pass',
      battle_boost: 'battle_boost',
      streak_insurance: 'streak_insurance',
      instant_finish: 'instant_finish'
    };
    return types[feature] || 'warrior_pass';
  }

  // Get paywall message
  getPaywallMessage(feature) {
    const messages = {
      transform: 'You\'ve reached your daily limit of 3 transformations. Upgrade to Warrior Pass for unlimited transformations!',
      premium_style: 'Premium styles are available with Warrior Pass. Upgrade to access all styles!',
      ai_priority: 'Priority AI processing is available with Warrior Pass. Upgrade for faster results!',
      battle_boost: 'Battle boost required for this feature. Purchase boost to increase visibility!',
      streak_insurance: 'Streak insurance required to protect your streak. Purchase insurance to save your progress!',
      instant_finish: 'Instant finish required to skip the queue. Purchase instant finish for immediate processing!'
    };
    return messages[feature] || 'Premium feature requires upgrade.';
  }

  // Get paywall CTA
  getPaywallCTA(feature) {
    const ctas = {
      transform: 'Upgrade to Warrior Pass',
      premium_style: 'Upgrade to Warrior Pass',
      ai_priority: 'Upgrade to Warrior Pass',
      battle_boost: 'Purchase Battle Boost',
      streak_insurance: 'Purchase Streak Insurance',
      instant_finish: 'Purchase Instant Finish'
    };
    return ctas[feature] || 'Upgrade Now';
  }

  // Validate payment data
  validatePaymentData(data) {
    const errors = {};
    
    if (data.plan && !['monthly', 'weekly'].includes(data.plan)) {
      errors.plan = 'Plan must be monthly or weekly';
    }
    
    if (data.type && !['boost', 'streak_insurance', 'instant_finish'].includes(data.type)) {
      errors.type = 'Invalid purchase type';
    }
    
    if (data.days && (data.days < 1 || data.days > 30)) {
      errors.days = 'Trial days must be between 1 and 30';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get subscription renewal date
  getRenewalDate(expiresAt) {
    if (!expiresAt) return null;
    
    const date = new Date(expiresAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get days until expiry
  getDaysUntilExpiry(expiresAt) {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Check if subscription is expiring soon
  isExpiringSoon(expiresAt, days = 3) {
    const daysUntilExpiry = this.getDaysUntilExpiry(expiresAt);
    return daysUntilExpiry !== null && daysUntilExpiry <= days && daysUntilExpiry > 0;
  }

  // Get subscription value proposition
  getValueProposition(plan) {
    const propositions = {
      monthly: {
        title: 'Warrior Pass Monthly',
        subtitle: 'Unlock unlimited transformations and 2× tribe points',
        price: '$4.99',
        period: 'per month',
        savings: 'Save 17% vs weekly',
        features: [
          'Unlimited Transformations',
          'Access All Styles',
          '2× Tribe Points',
          'Faster AI Processing',
          'Warrior Badge'
        ]
      },
      weekly: {
        title: 'Warrior Pass Weekly',
        subtitle: 'Try unlimited transformations and 2× tribe points',
        price: '$1.99',
        period: 'per week',
        savings: 'Perfect for trying',
        features: [
          'Unlimited Transformations',
          'Access All Styles',
          '2× Tribe Points',
          'Faster AI Processing',
          'Warrior Badge'
        ]
      }
    };
    return propositions[plan] || propositions.monthly;
  }
}

// Create singleton instance
const paymentService = new PaymentService();

export default paymentService;
