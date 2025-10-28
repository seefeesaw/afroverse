import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

// Async thunks
export const createCheckoutSession = createAsyncThunk(
  'payment/createCheckoutSession',
  async (plan, { rejectWithValue }) => {
    try {
      const response = await paymentService.createCheckoutSession(plan);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create checkout session');
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async ({ type, metadata }, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPaymentIntent(type, metadata);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment intent');
    }
  }
);

export const getSubscriptionStatus = createAsyncThunk(
  'payment/getSubscriptionStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getSubscriptionStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get subscription status');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'payment/cancelSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.cancelSubscription();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

export const getSubscriptionHistory = createAsyncThunk(
  'payment/getSubscriptionHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getSubscriptionHistory();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get subscription history');
    }
  }
);

export const createTrialSubscription = createAsyncThunk(
  'payment/createTrialSubscription',
  async (days, { rejectWithValue }) => {
    try {
      const response = await paymentService.createTrialSubscription(days);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create trial subscription');
    }
  }
);

const initialState = {
  // Subscription status
  subscription: {
    hasSubscription: false,
    status: 'free',
    plan: null,
    expiresAt: null,
    isActive: false,
    isTrial: false,
    daysUntilExpiry: null,
    entitlements: {
      warriorActive: false,
      multiplier: 1,
      aiPriority: false,
      unlimitedTransformations: false,
      allStyles: false,
      warriorBadge: false,
      fasterProcessing: false
    },
    benefits: {}
  },
  
  // Subscription history
  history: [],
  
  // Payment state
  payment: {
    isProcessing: false,
    currentSession: null,
    currentIntent: null,
    error: null
  },
  
  // Paywall state
  paywall: {
    isVisible: false,
    type: 'warrior_pass',
    feature: null,
    message: null,
    cta: null
  },
  
  // Loading states
  loading: {
    subscription: false,
    history: false,
    checkout: false,
    payment: false,
    cancel: false,
    trial: false
  },
  
  // Error states
  errors: {
    subscription: null,
    history: null,
    checkout: null,
    payment: null,
    cancel: null,
    trial: null
  },
  
  // Analytics
  analytics: {
    metrics: null,
    conversionRate: null,
    churnRate: null
  }
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setSubscription: (state, action) => {
      state.subscription = { ...state.subscription, ...action.payload };
    },
    setEntitlements: (state, action) => {
      state.subscription.entitlements = { ...state.subscription.entitlements, ...action.payload };
    },
    showPaywall: (state, action) => {
      const { type, feature, message, cta } = action.payload;
      state.paywall = {
        isVisible: true,
        type,
        feature,
        message,
        cta
      };
    },
    hidePaywall: (state) => {
      state.paywall = {
        isVisible: false,
        type: 'warrior_pass',
        feature: null,
        message: null,
        cta: null
      };
    },
    setPaymentProcessing: (state, action) => {
      state.payment.isProcessing = action.payload;
    },
    setPaymentError: (state, action) => {
      state.payment.error = action.payload;
    },
    clearPaymentError: (state) => {
      state.payment.error = null;
    },
    setCurrentSession: (state, action) => {
      state.payment.currentSession = action.payload;
    },
    setCurrentIntent: (state, action) => {
      state.payment.currentIntent = action.payload;
    },
    updateAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
    clearErrors: (state) => {
      state.errors = {
        subscription: null,
        history: null,
        checkout: null,
        payment: null,
        cancel: null,
        trial: null
      };
    },
    resetPayment: (state) => {
      state.subscription = initialState.subscription;
      state.history = [];
      state.payment = initialState.payment;
      state.paywall = initialState.paywall;
      state.analytics = initialState.analytics;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create checkout session
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading.checkout = true;
        state.errors.checkout = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.loading.checkout = false;
        state.payment.currentSession = action.payload;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading.checkout = false;
        state.errors.checkout = action.payload;
      })
      
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading.payment = true;
        state.errors.payment = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading.payment = false;
        state.payment.currentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading.payment = false;
        state.errors.payment = action.payload;
      })
      
      // Get subscription status
      .addCase(getSubscriptionStatus.pending, (state) => {
        state.loading.subscription = true;
        state.errors.subscription = null;
      })
      .addCase(getSubscriptionStatus.fulfilled, (state, action) => {
        state.loading.subscription = false;
        state.subscription = { ...state.subscription, ...action.payload };
      })
      .addCase(getSubscriptionStatus.rejected, (state, action) => {
        state.loading.subscription = false;
        state.errors.subscription = action.payload;
      })
      
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading.cancel = true;
        state.errors.cancel = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading.cancel = false;
        state.subscription.status = 'canceled';
        state.subscription.isActive = false;
        state.subscription.entitlements = initialState.subscription.entitlements;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading.cancel = false;
        state.errors.cancel = action.payload;
      })
      
      // Get subscription history
      .addCase(getSubscriptionHistory.pending, (state) => {
        state.loading.history = true;
        state.errors.history = null;
      })
      .addCase(getSubscriptionHistory.fulfilled, (state, action) => {
        state.loading.history = false;
        state.history = action.payload.history;
      })
      .addCase(getSubscriptionHistory.rejected, (state, action) => {
        state.loading.history = false;
        state.errors.history = action.payload;
      })
      
      // Create trial subscription
      .addCase(createTrialSubscription.pending, (state) => {
        state.loading.trial = true;
        state.errors.trial = null;
      })
      .addCase(createTrialSubscription.fulfilled, (state, action) => {
        state.loading.trial = false;
        state.subscription = { ...state.subscription, ...action.payload.subscription };
      })
      .addCase(createTrialSubscription.rejected, (state, action) => {
        state.loading.trial = false;
        state.errors.trial = action.payload;
      });
  }
});

export const {
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
} = paymentSlice.actions;

export default paymentSlice.reducer;
