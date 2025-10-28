import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import challengeService from '../../services/challengeService';

// Async thunks
export const fetchDailyChallenge = createAsyncThunk(
  'challenge/fetchDailyChallenge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await challengeService.getDailyChallenge();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchWeeklyChallenge = createAsyncThunk(
  'challenge/fetchWeeklyChallenge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await challengeService.getWeeklyChallenge();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateChallengeProgress = createAsyncThunk(
  'challenge/updateProgress',
  async ({ activityType, value = 1, metadata = {} }, { rejectWithValue }) => {
    try {
      const response = await challengeService.updateProgress(activityType, value, metadata);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const completeChallenge = createAsyncThunk(
  'challenge/completeChallenge',
  async ({ userChallengeId, challengeType }, { rejectWithValue }) => {
    try {
      const response = await challengeService.completeChallenge(userChallengeId, challengeType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchChallengeStats = createAsyncThunk(
  'challenge/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await challengeService.getChallengeStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchChallengeHistory = createAsyncThunk(
  'challenge/fetchHistory',
  async ({ limit = 50, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await challengeService.getChallengeHistory(limit, offset);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchChallengeLeaderboard = createAsyncThunk(
  'challenge/fetchLeaderboard',
  async ({ type = 'daily', period = 'week' }, { rejectWithValue }) => {
    try {
      const response = await challengeService.getChallengeLeaderboard(type, period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTribeWeeklyChallenge = createAsyncThunk(
  'challenge/fetchTribeWeekly',
  async (_, { rejectWithValue }) => {
    try {
      const response = await challengeService.getTribeWeeklyChallenge();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const challengeSlice = createSlice({
  name: 'challenge',
  initialState: {
    dailyChallenge: null,
    weeklyChallenge: null,
    challengeStats: null,
    challengeHistory: [],
    challengeLeaderboard: [],
    tribeWeeklyChallenge: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetChallengeState: (state) => {
      state.dailyChallenge = null;
      state.weeklyChallenge = null;
      state.challengeStats = null;
      state.challengeHistory = [];
      state.challengeLeaderboard = [];
      state.tribeWeeklyChallenge = null;
      state.status = 'idle';
      state.error = null;
    },
    updateDailyProgress: (state, action) => {
      if (state.dailyChallenge) {
        state.dailyChallenge.progress = action.payload;
      }
    },
    updateWeeklyProgress: (state, action) => {
      if (state.weeklyChallenge) {
        state.weeklyChallenge.progress = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Daily Challenge
      .addCase(fetchDailyChallenge.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDailyChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dailyChallenge = action.payload;
        state.error = null;
      })
      .addCase(fetchDailyChallenge.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Weekly Challenge
      .addCase(fetchWeeklyChallenge.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWeeklyChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.weeklyChallenge = action.payload;
        state.error = null;
      })
      .addCase(fetchWeeklyChallenge.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update Challenge Progress
      .addCase(updateChallengeProgress.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateChallengeProgress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update progress in both daily and weekly challenges
        if (state.dailyChallenge) {
          state.dailyChallenge.progress = action.payload.daily;
        }
        if (state.weeklyChallenge) {
          state.weeklyChallenge.progress = action.payload.weekly;
        }
        state.error = null;
      })
      .addCase(updateChallengeProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Complete Challenge
      .addCase(completeChallenge.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(completeChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Mark challenge as completed
        if (action.payload.challengeType === 'daily' && state.dailyChallenge) {
          state.dailyChallenge.progress.isCompleted = true;
          state.dailyChallenge.progress.completedAt = new Date().toISOString();
        }
        if (action.payload.challengeType === 'weekly' && state.weeklyChallenge) {
          state.weeklyChallenge.progress.isCompleted = true;
          state.weeklyChallenge.progress.completedAt = new Date().toISOString();
        }
        state.error = null;
      })
      .addCase(completeChallenge.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Challenge Stats
      .addCase(fetchChallengeStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchChallengeStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.challengeStats = action.payload.stats;
        state.error = null;
      })
      .addCase(fetchChallengeStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Challenge History
      .addCase(fetchChallengeHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchChallengeHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.challengeHistory = action.payload.challenges;
        state.error = null;
      })
      .addCase(fetchChallengeHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Challenge Leaderboard
      .addCase(fetchChallengeLeaderboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchChallengeLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.challengeLeaderboard = action.payload.leaderboard;
        state.error = null;
      })
      .addCase(fetchChallengeLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Tribe Weekly Challenge
      .addCase(fetchTribeWeeklyChallenge.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTribeWeeklyChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tribeWeeklyChallenge = action.payload;
        state.error = null;
      })
      .addCase(fetchTribeWeeklyChallenge.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  resetChallengeState,
  updateDailyProgress,
  updateWeeklyProgress,
} = challengeSlice.actions;

export default challengeSlice.reducer;
