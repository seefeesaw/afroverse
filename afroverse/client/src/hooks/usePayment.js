import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCheckoutSession,
  createPaymentIntent,
  getSubscriptionStatus,
  cancelSubscription,
  getSubscriptionHistory,
  createTrialSubscription,
  setSubscription,
  setEntitlements,
  showPaywall,
  hidePaywall,
  setPaymentProcessing,
  setPaymentError,
  clearPaymentError,
  setCurrentSession,
  setCurrentIntent,
  updateAnalytics,
  clearErrors,
  resetPayment
} from '../store/slices/paymentSlice';
import { useAuth } from './useAuth';
import paymentService from '../services/paymentService';

export const usePayment = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const paymentState = useSelector(state => state.payment);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [stripe, setStripe] = useState(null);

  // Initialize payment system
  const initialize = useCallback(async () => {
    try {
      // Load Stripe.js
      if (window.Stripe) {
        const stripeInstance = paymentService.initializeStripe(
          process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
        );
        setStripe(stripeInstance);
      }
      
      // Fetch subscription status
      await dispatch(getSubscriptionStatus());
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize payment system:', error);
    }
  }, [dispatch]);

  // Create checkout session
  const createCheckout = useCallback(async (plan = 'monthly') => {
    try {
      dispatch(setPaymentProcessing(true));
      dispatch(clearPaymentError());
      
      const result = await dispatch(createCheckoutSession(plan));
      
      if (result.payload.success) {
        dispatch(setCurrentSession(result.payload));
        return result.payload;
      } else {
        throw new Error(result.payload.message || 'Failed to create checkout session');
      }
    } catch (error) {
      dispatch(setPaymentError(error.message));
      throw error;
    } finally {
      dispatch(setPaymentProcessing(false));
    }
  }, [dispatch]);

  // Redirect to Stripe Checkout
  const redirectToCheckout = useCallback(async (sessionId) => {
    try {
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      dispatch(setPaymentError(error.message));
      throw error;
    }
  }, [stripe, dispatch]);

  // Create payment intent for consumable
  const createConsumablePayment = useCallback(async (type, metadata = {}) => {
    try {
      dispatch(setPaymentProcessing(true));
      dispatch(clearPaymentError());
      
      const result = await dispatch(createPaymentIntent({ type, metadata }));
      
      if (result.payload.success) {
        dispatch(setCurrentIntent(result.payload));
        return result.payload;
      } else {
        throw new Error(result.payload.message || 'Failed to create payment intent');
      }
    } catch (error) {
      dispatch(setPaymentError(error.message));
      throw error;
    } finally {
      dispatch(setPaymentProcessing(false));
    }
  }, [dispatch]);

  // Confirm payment intent
  const confirmPayment = useCallback(async (clientSecret, paymentMethod) => {
    try {
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        client_secret: clientSecret,
        payment_method: paymentMethod
      });
      
      if (error) {
        throw error;
      }
      
      return paymentIntent;
    } catch (error) {
      dispatch(setPaymentError(error.message));
      throw error;
    }
  }, [stripe, dispatch]);

  // Create payment method
  const createPaymentMethod = useCallback(async (cardElement) => {
    try {
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      });
      
      if (error) {
        throw error;
      }
      
      return paymentMethod;
    } catch (error) {
      dispatch(setPaymentError(error.message));
      throw error;
    }
  }, [stripe, dispatch]);

  // Cancel subscription
  const cancelUserSubscription = useCallback(async () => {
    try {
      dispatch(setPaymentProcessing(true));
      dispatch(clearPaymentError());
      
      const result = await dispatch(cancelSubscription());
      
      if (result.payload.success) {
        // Update local state
        dispatch(setSubscription({
          status: 'canceled',
          isActive: false,
          entitlements: {
            warriorActive: false,
            multiplier: 1,
            aiPriority: false,
            unlimitedTransformations: false,
            allStyles: false,
            warriorBadge: false,
            fasterProcessing: false
          }
        }));
        
        return result.payload;
      } else {
        throw new Error(result.payload.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      dispatch(setPaymentError(error.message));
      throw error;
    } finally {
      dispatch(setPaymentProcessing(false));
    }
  }, [dispatch]);

  // Create trial subscription
  const createTrial = useCallback(async (days = 7) => {
    try {
      dispatch(setPaymentProcessing(true));
      dispatch(clearPaymentError());
      
      const result = await dispatch(createTrialSubscription(days));
      
      if (result.payload.success) {
        // Update local state
        dispatch(setSubscription({
          ...result.payload.subscription,
          isActive: true,
          isTrial: true,
          entitlements: {
            warriorActive: true,
            multiplier: 2,
            aiPriority: true,
            unlimitedTransformations: true,
            allStyles: true,
            warriorBadge: true,
            fasterProcessing: true
          }
        }));
        
        return result.payload;
      } else {
        throw new Error(result.payload.message || 'Failed to create trial subscription');
      }
    } catch (error) {
      dispatch(setPaymentError(error.message));
      throw error;
    } finally {
      dispatch(setPaymentProcessing(false));
    }
  }, [dispatch]);

  // Get subscription history
  const getHistory = useCallback(async () => {
    try {
      await dispatch(getSubscriptionHistory());
    } catch (error) {
      console.error('Error getting subscription history:', error);
      throw error;
    }
  }, [dispatch]);

  // Show paywall
  const showPaywallModal = useCallback((feature) => {
    const type = paymentService.getPaywallType(feature);
    const message = paymentService.getPaywallMessage(feature);
    const cta = paymentService.getPaywallCTA(feature);
    
    dispatch(showPaywall({ type, feature, message, cta }));
  }, [dispatch]);

  // Hide paywall
  const hidePaywallModal = useCallback(() => {
    dispatch(hidePaywall());
  }, [dispatch]);

  // Check if user should see paywall
  const shouldShowPaywall = useCallback((feature) => {
    if (!user) return false;
    return paymentService.shouldShowPaywall(user, feature);
  }, [user]);

  // Get subscription status
  const getSubscription = useCallback(() => {
    return paymentState.subscription;
  }, [paymentState.subscription]);

  // Get entitlements
  const getEntitlements = useCallback(() => {
    return paymentState.subscription.entitlements;
  }, [paymentState.subscription.entitlements]);

  // Check if user has warrior pass
  const hasWarriorPass = useCallback(() => {
    return paymentState.subscription.isActive && paymentState.subscription.entitlements.warriorActive;
  }, [paymentState.subscription]);

  // Check if user can transform
  const canTransform = useCallback(() => {
    if (!user) return false;
    return user.entitlements.unlimitedTransformations || user.limits.transformsUsed < 3;
  }, [user]);

  // Check if user has all styles
  const hasAllStyles = useCallback(() => {
    return paymentState.subscription.entitlements.allStyles;
  }, [paymentState.subscription.entitlements]);

  // Check if user has AI priority
  const hasAiPriority = useCallback(() => {
    return paymentState.subscription.entitlements.aiPriority;
  }, [paymentState.subscription.entitlements]);

  // Check if user has warrior badge
  const hasWarriorBadge = useCallback(() => {
    return paymentState.subscription.entitlements.warriorBadge;
  }, [paymentState.subscription.entitlements]);

  // Get tribe points multiplier
  const getTribePointsMultiplier = useCallback(() => {
    return paymentState.subscription.entitlements.multiplier || 1;
  }, [paymentState.subscription.entitlements]);

  // Get subscription benefits
  const getSubscriptionBenefits = useCallback(() => {
    return paymentState.subscription.benefits;
  }, [paymentState.subscription.benefits]);

  // Get subscription history
  const getSubscriptionHistory = useCallback(() => {
    return paymentState.history;
  }, [paymentState.history]);

  // Get payment state
  const getPaymentState = useCallback(() => {
    return paymentState.payment;
  }, [paymentState.payment]);

  // Get paywall state
  const getPaywallState = useCallback(() => {
    return paymentState.paywall;
  }, [paymentState.paywall]);

  // Get loading state
  const getLoadingState = useCallback(() => {
    return paymentState.loading;
  }, [paymentState.loading]);

  // Get error state
  const getErrorState = useCallback(() => {
    return paymentState.errors;
  }, [paymentState.errors]);

  // Get analytics
  const getAnalytics = useCallback(() => {
    return paymentState.analytics;
  }, [paymentState.analytics]);

  // Format price
  const formatPrice = useCallback((amount, currency = 'USD') => {
    return paymentService.formatPrice(amount, currency);
  }, []);

  // Get plan display name
  const getPlanDisplayName = useCallback((plan) => {
    return paymentService.getPlanDisplayName(plan);
  }, []);

  // Get plan benefits
  const getPlanBenefits = useCallback((plan) => {
    return paymentService.getPlanBenefits(plan);
  }, []);

  // Get consumable info
  const getConsumableInfo = useCallback((type) => {
    return paymentService.getConsumableInfo(type);
  }, []);

  // Get subscription status display
  const getSubscriptionStatusDisplay = useCallback((status) => {
    return paymentService.getSubscriptionStatusDisplay(status);
  }, []);

  // Get subscription renewal date
  const getRenewalDate = useCallback((expiresAt) => {
    return paymentService.getRenewalDate(expiresAt);
  }, []);

  // Get days until expiry
  const getDaysUntilExpiry = useCallback((expiresAt) => {
    return paymentService.getDaysUntilExpiry(expiresAt);
  }, []);

  // Check if subscription is expiring soon
  const isExpiringSoon = useCallback((expiresAt, days = 3) => {
    return paymentService.isExpiringSoon(expiresAt, days);
  }, []);

  // Get subscription value proposition
  const getValueProposition = useCallback((plan) => {
    return paymentService.getValueProposition(plan);
  }, []);

  // Clear errors
  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
    dispatch(clearPaymentError());
  }, [dispatch]);

  // Reset payment state
  const resetPaymentState = useCallback(() => {
    dispatch(resetPayment());
  }, [dispatch]);

  // Initialize on mount
  useEffect(() => {
    if (user && !isInitialized) {
      initialize();
    }
  }, [user, initialize, isInitialized]);

  // Update entitlements when user changes
  useEffect(() => {
    if (user && user.entitlements) {
      dispatch(setEntitlements(user.entitlements));
    }
  }, [user, dispatch]);

  return {
    // State
    ...paymentState,
    isInitialized,
    stripe,
    
    // Actions
    initialize,
    createCheckout,
    redirectToCheckout,
    createConsumablePayment,
    confirmPayment,
    createPaymentMethod,
    cancelUserSubscription,
    createTrial,
    getHistory,
    showPaywallModal,
    hidePaywallModal,
    
    // Getters
    getSubscription,
    getEntitlements,
    hasWarriorPass,
    canTransform,
    hasAllStyles,
    hasAiPriority,
    hasWarriorBadge,
    getTribePointsMultiplier,
    getSubscriptionBenefits,
    getSubscriptionHistory,
    getPaymentState,
    getPaywallState,
    getLoadingState,
    getErrorState,
    getAnalytics,
    
    // Utilities
    shouldShowPaywall,
    formatPrice,
    getPlanDisplayName,
    getPlanBenefits,
    getConsumableInfo,
    getSubscriptionStatusDisplay,
    getRenewalDate,
    getDaysUntilExpiry,
    isExpiringSoon,
    getValueProposition,
    
    // Redux actions
    clearAllErrors,
    resetPaymentState
  };
};

export default usePayment;
