import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import progressionService from '../../services/progressionService';

// Async thunks
export const fetchUserProgression = createAsyncThunk(
  'progression/fetchUserProgression',
  async (_, { rejectWithValue }) => {
    try {
      const response = await progressionService.getUserProgression();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user progression');
    }
  }
);

export const fetchStreakStatus = createAsyncThunk(
  'progression/fetchStreakStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await progressionService.getStreakStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch streak status');
    }
  }
);

export const fetchQualifyingActionsStatus = createAsyncThunk(
  'progression/fetchQualifyingActionsStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await progressionService.getQualifyingActionsStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch qualifying actions status');
    }
  }
);

export const useFreeze = createAsyncThunk(
  'progression/useFreeze',
  async (confirm, { rejectWithValue }) => {
    try {
      const response = await progressionService.useFreeze(confirm);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to use freeze');
    }
  }
);

export const claimReward = createAsyncThunk(
  'progression/claimReward',
  async (rewardId, { rejectWithValue }) => {
    try {
      const response = await progressionService.claimReward(rewardId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to claim reward');
    }
  }
);

export const handleDailyLogin = createAsyncThunk(
  'progression/handleDailyLogin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await progressionService.handleDailyLogin();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to handle daily login');
    }
  }
);

const initialState = {
  // User progression data
  progression: {
    streak: {
      current: 0,
      longest: 0,
      safeToday: false,
      timeToMidnightSec: 0,
      freeze: { available: 0 }
    },
    xp: {
      value: 0,
      level: 1,
      nextLevelXp: 100
    },
    milestones: [],
    today: {
      voted: 0,
      votesNeededForStreak: 5,
      didTransform: false,
      didBattleAction: false
    }
  },
  
  // Qualifying actions status
  qualifyingActions: {
    transform: false,
    voteBundle: false,
    battleAction: false,
    votesNeeded: 5,
    voteCount: 0
  },
  
  // UI state
  showStreakPanel: false,
  showFreezeModal: false,
  showLevelUpModal: false,
  showRewardModal: false,
  
  // Loading states
  loading: {
    progression: false,
    streak: false,
    qualifyingActions: false,
    freeze: false,
    reward: false,
    dailyLogin: false
  },
  
  // Error states
  errors: {
    progression: null,
    streak: null,
    qualifyingActions: null,
    freeze: null,
    reward: null,
    dailyLogin: null
  },
  
  // Real-time updates
  realTimeUpdates: {
    enabled: false,
    lastUpdate: null
  },
  
  // Notifications
  notifications: {
    streakAtRisk: false,
    levelUp: false,
    rewardGranted: false
  }
};

const progressionSlice = createSlice({
  name: 'progression',
  initialState,
  reducers: {
    setShowStreakPanel: (state, action) => {
      state.showStreakPanel = action.payload;
    },
    setShowFreezeModal: (state, action) => {
      state.showFreezeModal = action.payload;
    },
    setShowLevelUpModal: (state, action) => {
      state.showLevelUpModal = action.payload;
    },
    setShowRewardModal: (state, action) => {
      state.showRewardModal = action.payload;
    },
    updateStreakRealtime: (state, action) => {
      const { current, safeToday, timeToMidnightSec } = action.payload;
      state.progression.streak.current = current;
      state.progression.streak.safeToday = safeToday;
      state.progression.streak.timeToMidnightSec = timeToMidnightSec;
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    updateXpRealtime: (state, action) => {
      const { amount, newXp, levelUp, newLevel } = action.payload;
      state.progression.xp.value = newXp;
      state.progression.xp.level = newLevel;
      
      if (levelUp) {
        state.showLevelUpModal = true;
        state.notifications.levelUp = true;
      }
      
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    updateRewardRealtime: (state, action) => {
      const { rewardId, type } = action.payload;
      state.showRewardModal = true;
      state.notifications.rewardGranted = true;
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    updateQualifyingActionsRealtime: (state, action) => {
      const { transform, voteBundle, battleAction, voteCount } = action.payload;
      state.qualifyingActions.transform = transform;
      state.qualifyingActions.voteBundle = voteBundle;
      state.qualifyingActions.battleAction = battleAction;
      state.qualifyingActions.voteCount = voteCount;
      state.qualifyingActions.votesNeeded = Math.max(0, 5 - voteCount);
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    enableRealTimeUpdates: (state) => {
      state.realTimeUpdates.enabled = true;
    },
    disableRealTimeUpdates: (state) => {
      state.realTimeUpdates.enabled = false;
    },
    clearNotifications: (state) => {
      state.notifications = {
        streakAtRisk: false,
        levelUp: false,
        rewardGranted: false
      };
    },
    setStreakAtRisk: (state, action) => {
      state.notifications.streakAtRisk = action.payload;
    },
    resetProgression: (state) => {
      state.progression = initialState.progression;
      state.qualifyingActions = initialState.qualifyingActions;
      state.realTimeUpdates.lastUpdate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user progression
      .addCase(fetchUserProgression.pending, (state) => {
        state.loading.progression = true;
        state.errors.progression = null;
      })
      .addCase(fetchUserProgression.fulfilled, (state, action) => {
        state.loading.progression = false;
        state.progression = action.payload;
      })
      .addCase(fetchUserProgression.rejected, (state, action) => {
        state.loading.progression = false;
        state.errors.progression = action.payload;
      })
      
      // Fetch streak status
      .addCase(fetchStreakStatus.pending, (state) => {
        state.loading.streak = true;
        state.errors.streak = null;
      })
      .addCase(fetchStreakStatus.fulfilled, (state, action) => {
        state.loading.streak = false;
        state.progression.streak = action.payload;
      })
      .addCase(fetchStreakStatus.rejected, (state, action) => {
        state.loading.streak = false;
        state.errors.streak = action.payload;
      })
      
      // Fetch qualifying actions status
      .addCase(fetchQualifyingActionsStatus.pending, (state) => {
        state.loading.qualifyingActions = true;
        state.errors.qualifyingActions = null;
      })
      .addCase(fetchQualifyingActionsStatus.fulfilled, (state, action) => {
        state.loading.qualifyingActions = false;
        state.qualifyingActions = action.payload;
      })
      .addCase(fetchQualifyingActionsStatus.rejected, (state, action) => {
        state.loading.qualifyingActions = false;
        state.errors.qualifyingActions = action.payload;
      })
      
      // Use freeze
      .addCase(useFreeze.pending, (state) => {
        state.loading.freeze = true;
        state.errors.freeze = null;
      })
      .addCase(useFreeze.fulfilled, (state, action) => {
        state.loading.freeze = false;
        state.progression.streak.current = action.payload.streakRestoredTo;
        state.progression.streak.freeze.available = action.payload.freezeRemaining;
        state.showFreezeModal = false;
      })
      .addCase(useFreeze.rejected, (state, action) => {
        state.loading.freeze = false;
        state.errors.freeze = action.payload;
      })
      
      // Claim reward
      .addCase(claimReward.pending, (state) => {
        state.loading.reward = true;
        state.errors.reward = null;
      })
      .addCase(claimReward.fulfilled, (state, action) => {
        state.loading.reward = false;
        state.showRewardModal = false;
      })
      .addCase(claimReward.rejected, (state, action) => {
        state.loading.reward = false;
        state.errors.reward = action.payload;
      })
      
      // Handle daily login
      .addCase(handleDailyLogin.pending, (state) => {
        state.loading.dailyLogin = true;
        state.errors.dailyLogin = null;
      })
      .addCase(handleDailyLogin.fulfilled, (state, action) => {
        state.loading.dailyLogin = false;
      })
      .addCase(handleDailyLogin.rejected, (state, action) => {
        state.loading.dailyLogin = false;
        state.errors.dailyLogin = action.payload;
      });
  }
});

export const {
  setShowStreakPanel,
  setShowFreezeModal,
  setShowLevelUpModal,
  setShowRewardModal,
  updateStreakRealtime,
  updateXpRealtime,
  updateRewardRealtime,
  updateQualifyingActionsRealtime,
  enableRealTimeUpdates,
  disableRealTimeUpdates,
  clearNotifications,
  setStreakAtRisk,
  resetProgression
} = progressionSlice.actions;

export default progressionSlice.reducer;
