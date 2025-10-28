import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import walletService from '../../services/walletService';

// Async thunks for wallet operations
export const getWallet = createAsyncThunk(
  'wallet/getWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getWallet();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const earnCoins = createAsyncThunk(
  'wallet/earnCoins',
  async ({ reason, metadata, amount }, { rejectWithValue }) => {
    try {
      const response = await walletService.earnCoins(reason, metadata, amount);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const spendCoins = createAsyncThunk(
  'wallet/spendCoins',
  async ({ reason, metadata, amount }, { rejectWithValue }) => {
    try {
      const response = await walletService.spendCoins(reason, metadata, amount);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const purchaseCoins = createAsyncThunk(
  'wallet/purchaseCoins',
  async ({ packType, paymentId }, { rejectWithValue }) => {
    try {
      const response = await walletService.purchaseCoins(packType, paymentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTransactionHistory = createAsyncThunk(
  'wallet/getTransactionHistory',
  async (options, { rejectWithValue }) => {
    try {
      const response = await walletService.getTransactionHistory(options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getEarningOpportunities = createAsyncThunk(
  'wallet/getEarningOpportunities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getEarningOpportunities();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSpendingOptions = createAsyncThunk(
  'wallet/getSpendingOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getSpendingOptions();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCoinPacks = createAsyncThunk(
  'wallet/getCoinPacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getCoinPacks();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAction = createAsyncThunk(
  'wallet/checkAction',
  async (action, { rejectWithValue }) => {
    try {
      const response = await walletService.checkAction(action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Specific action thunks
export const saveStreak = createAsyncThunk(
  'wallet/saveStreak',
  async (reason, { rejectWithValue }) => {
    try {
      const response = await walletService.saveStreak(reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const battleBoost = createAsyncThunk(
  'wallet/battleBoost',
  async (battleId, { rejectWithValue }) => {
    try {
      const response = await walletService.battleBoost(battleId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const priorityTransformation = createAsyncThunk(
  'wallet/priorityTransformation',
  async (transformationId, { rejectWithValue }) => {
    try {
      const response = await walletService.priorityTransformation(transformationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const retryTransformation = createAsyncThunk(
  'wallet/retryTransformation',
  async (transformationId, { rejectWithValue }) => {
    try {
      const response = await walletService.retryTransformation(transformationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const tribeSupport = createAsyncThunk(
  'wallet/tribeSupport',
  async (tribeId, { rejectWithValue }) => {
    try {
      const response = await walletService.tribeSupport(tribeId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Wallet data
  balance: 0,
  totalEarned: 0,
  totalSpent: 0,
  dailyEarned: 0,
  canEarnToday: true,
  lastEarnedAt: null,
  
  // Transaction history
  transactions: [],
  transactionHistory: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  // Opportunities and options
  earningOpportunities: [],
  spendingOptions: {},
  coinPacks: [],
  
  // UI state
  isLoading: false,
  error: null,
  showRewardPopup: false,
  rewardData: null,
  showSpendModal: false,
  spendData: null,
  showCoinStore: false,
  showEarnMore: false,
  
  // Action states
  isSavingStreak: false,
  isBoostingBattle: false,
  isPriorityProcessing: false,
  isRetryingTransformation: false,
  isSupportingTribe: false,
};

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Show/hide reward popup
    showRewardPopup: (state, action) => {
      state.showRewardPopup = true;
      state.rewardData = action.payload;
    },
    
    hideRewardPopup: (state) => {
      state.showRewardPopup = false;
      state.rewardData = null;
    },
    
    // Show/hide spend modal
    showSpendModal: (state, action) => {
      state.showSpendModal = true;
      state.spendData = action.payload;
    },
    
    hideSpendModal: (state) => {
      state.showSpendModal = false;
      state.spendData = null;
    },
    
    // Show/hide coin store
    showCoinStore: (state) => {
      state.showCoinStore = true;
    },
    
    hideCoinStore: (state) => {
      state.showCoinStore = false;
    },
    
    // Show/hide earn more
    showEarnMore: (state) => {
      state.showEarnMore = true;
    },
    
    hideEarnMore: (state) => {
      state.showEarnMore = false;
    },
    
    // Update balance locally (for optimistic updates)
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    
    // Add transaction to history
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    
    // Reset wallet state
    resetWallet: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Get wallet
      .addCase(getWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        const wallet = action.payload.wallet;
        state.balance = wallet.balance;
        state.totalEarned = wallet.totalEarned;
        state.totalSpent = wallet.totalSpent;
        state.dailyEarned = wallet.dailyEarned;
        state.canEarnToday = wallet.canEarnToday;
        state.lastEarnedAt = wallet.lastEarnedAt;
        state.error = null;
      })
      .addCase(getWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Earn coins
      .addCase(earnCoins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(earnCoins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
        state.totalEarned += action.payload.amount;
        state.dailyEarned += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
        state.showRewardPopup = true;
        state.rewardData = {
          amount: action.payload.amount,
          reason: action.payload.transaction.reason,
          description: action.payload.transaction.description,
          icon: action.payload.transaction.icon
        };
        state.error = null;
      })
      .addCase(earnCoins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Spend coins
      .addCase(spendCoins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(spendCoins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
        state.totalSpent += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
        state.error = null;
      })
      .addCase(spendCoins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Purchase coins
      .addCase(purchaseCoins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(purchaseCoins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
        state.totalEarned += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
        state.showCoinStore = false;
        state.showRewardPopup = true;
        state.rewardData = {
          amount: action.payload.amount,
          reason: 'purchase',
          description: 'Coins Purchased',
          icon: '💰'
        };
        state.error = null;
      })
      .addCase(purchaseCoins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get transaction history
      .addCase(getTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.transactionHistory = action.payload.pagination;
        state.error = null;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get earning opportunities
      .addCase(getEarningOpportunities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEarningOpportunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.earningOpportunities = action.payload.opportunities;
        state.error = null;
      })
      .addCase(getEarningOpportunities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get spending options
      .addCase(getSpendingOptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSpendingOptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spendingOptions = action.payload.options;
        state.error = null;
      })
      .addCase(getSpendingOptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get coin packs
      .addCase(getCoinPacks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCoinPacks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coinPacks = action.payload.packs;
        state.error = null;
      })
      .addCase(getCoinPacks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Check action
      .addCase(checkAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Save streak
      .addCase(saveStreak.pending, (state) => {
        state.isSavingStreak = true;
        state.error = null;
      })
      .addCase(saveStreak.fulfilled, (state, action) => {
        state.isSavingStreak = false;
        state.balance = action.payload.balance;
        state.totalSpent += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
        state.showSpendModal = false;
        state.error = null;
      })
      .addCase(saveStreak.rejected, (state, action) => {
        state.isSavingStreak = false;
        state.error = action.payload;
      })
      
      // Battle boost
      .addCase(battleBoost.pending, (state) => {
        state.isBoostingBattle = true;
        state.error = null;
      })
      .addCase(battleBoost.fulfilled, (state, action) => {
        state.isBoostingBattle = false;
        state.balance = action.payload.balance;
        state.totalSpent += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
        state.showSpendModal = false;
        state.error = null;
      })
      .addCase(battleBoost.rejected, (state, action) => {
        state.isBoostingBattle = false;
        state.error = action.payload;
      })
      
      // Priority transformation
      .addCase(priorityTransformation.pending, (state) => {
        state.isPriorityProcessing = true;
        state.error = null;
      })
      .addCase(priorityTransformation.fulfilled, (state, action) => {
        state.isPriorityProcessing = false;
        state.balance = action.payload.balance;
        state.totalSpent += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
        state.showSpendModal = false;
        state.error = null;
      })
      .addCase(priorityTransformation.rejected, (state, action) => {
        state.isPriorityProcessing = false;
        state.error = action.payload;
      })
      
      // Retry transformation
      .addCase(retryTransformation.pending, (state) => {
        state.isRetryingTransformation = true;
        state.error = null;
      })
      .addCase(retryTransformation.fulfilled, (state, action) => {
        state.isRetryingTransformation = false;
        state.balance = action.payload.balance;
        state.totalSpent += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
        state.showSpendModal = false;
        state.error = null;
      })
      .addCase(retryTransformation.rejected, (state, action) => {
        state.isRetryingTransformation = false;
        state.error = action.payload;
      })
      
      // Tribe support
      .addCase(tribeSupport.pending, (state) => {
        state.isSupportingTribe = true;
        state.error = null;
      })
      .addCase(tribeSupport.fulfilled, (state, action) => {
        state.isSupportingTribe = false;
        state.balance = action.payload.balance;
        state.totalSpent += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
        state.showSpendModal = false;
        state.error = null;
      })
      .addCase(tribeSupport.rejected, (state, action) => {
        state.isSupportingTribe = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  showRewardPopup,
  hideRewardPopup,
  showSpendModal,
  hideSpendModal,
  showCoinStore,
  hideCoinStore,
  showEarnMore,
  hideEarnMore,
  updateBalance,
  addTransaction,
  resetWallet
} = walletSlice.actions;

export default walletSlice.reducer;
