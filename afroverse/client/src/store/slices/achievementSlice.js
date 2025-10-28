import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import achievementService from '../../services/achievementService';

// Async Thunks
export const getAllAchievements = createAsyncThunk(
  'achievements/getAllAchievements',
  async (params, { rejectWithValue }) => {
    try {
      const response = await achievementService.getAllAchievements(params.category, params.rarity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getUserAchievements = createAsyncThunk(
  'achievements/getUserAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await achievementService.getUserAchievements();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const claimReward = createAsyncThunk(
  'achievements/claimReward',
  async (achievementId, { rejectWithValue }) => {
    try {
      const response = await achievementService.claimReward(achievementId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getLeaderboard = createAsyncThunk(
  'achievements/getLeaderboard',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await achievementService.getLeaderboard(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getStats = createAsyncThunk(
  'achievements/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await achievementService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAchievement = createAsyncThunk(
  'achievements/getAchievement',
  async (achievementId, { rejectWithValue }) => {
    try {
      const response = await achievementService.getAchievement(achievementId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getCategories = createAsyncThunk(
  'achievements/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await achievementService.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getRarities = createAsyncThunk(
  'achievements/getRarities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await achievementService.getRarities();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const achievementSlice = createSlice({
  name: 'achievements',
  initialState: {
    // All achievements
    allAchievements: [],
    allAchievementsLoading: false,
    allAchievementsError: null,
    
    // User achievements
    userAchievements: [],
    userStats: null,
    userAchievementsLoading: false,
    userAchievementsError: null,
    
    // Leaderboard
    leaderboard: [],
    leaderboardLoading: false,
    leaderboardError: null,
    
    // Stats
    stats: null,
    statsLoading: false,
    statsError: null,
    
    // Categories and rarities
    categories: [],
    categoriesLoading: false,
    categoriesError: null,
    
    rarities: [],
    raritiesLoading: false,
    raritiesError: null,
    
    // Current achievement being viewed
    currentAchievement: null,
    currentAchievementLoading: false,
    currentAchievementError: null,
    
    // Recently unlocked achievements (for popups)
    recentlyUnlocked: [],
    
    // General state
    status: 'idle',
    error: null,
  },
  reducers: {
    // Add recently unlocked achievement
    addRecentlyUnlocked: (state, action) => {
      state.recentlyUnlocked.push(action.payload);
    },
    
    // Clear recently unlocked achievements
    clearRecentlyUnlocked: (state) => {
      state.recentlyUnlocked = [];
    },
    
    // Update achievement progress
    updateAchievementProgress: (state, action) => {
      const { achievementId, progress, progressPercentage } = action.payload;
      const achievement = state.userAchievements.find(a => a._id === achievementId);
      if (achievement) {
        achievement.progress = progress;
        achievement.progressPercentage = progressPercentage;
      }
    },
    
    // Mark achievement as unlocked
    markAchievementUnlocked: (state, action) => {
      const { achievementId, unlockedAt } = action.payload;
      const achievement = state.userAchievements.find(a => a._id === achievementId);
      if (achievement) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = unlockedAt;
        achievement.rewardClaimed = false;
      }
    },
    
    // Mark reward as claimed
    markRewardClaimed: (state, action) => {
      const { achievementId } = action.payload;
      const achievement = state.userAchievements.find(a => a._id === achievementId);
      if (achievement) {
        achievement.rewardClaimed = true;
      }
    },
    
    // Update user stats
    updateUserStats: (state, action) => {
      state.userStats = { ...state.userStats, ...action.payload };
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.allAchievementsError = null;
      state.userAchievementsError = null;
      state.leaderboardError = null;
      state.statsError = null;
      state.categoriesError = null;
      state.raritiesError = null;
      state.currentAchievementError = null;
    },
    
    // Reset state
    resetAchievementState: (state) => {
      state.allAchievements = [];
      state.userAchievements = [];
      state.userStats = null;
      state.leaderboard = [];
      state.stats = null;
      state.categories = [];
      state.rarities = [];
      state.currentAchievement = null;
      state.recentlyUnlocked = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all achievements
      .addCase(getAllAchievements.pending, (state) => {
        state.allAchievementsLoading = true;
        state.allAchievementsError = null;
      })
      .addCase(getAllAchievements.fulfilled, (state, action) => {
        state.allAchievementsLoading = false;
        state.allAchievements = action.payload.achievements;
      })
      .addCase(getAllAchievements.rejected, (state, action) => {
        state.allAchievementsLoading = false;
        state.allAchievementsError = action.payload;
      })
      
      // Get user achievements
      .addCase(getUserAchievements.pending, (state) => {
        state.userAchievementsLoading = true;
        state.userAchievementsError = null;
      })
      .addCase(getUserAchievements.fulfilled, (state, action) => {
        state.userAchievementsLoading = false;
        state.userAchievements = action.payload.achievements;
        state.userStats = action.payload.stats;
      })
      .addCase(getUserAchievements.rejected, (state, action) => {
        state.userAchievementsLoading = false;
        state.userAchievementsError = action.payload;
      })
      
      // Claim reward
      .addCase(claimReward.fulfilled, (state, action) => {
        const { achievementId } = action.meta.arg;
        const achievement = state.userAchievements.find(a => a._id === achievementId);
        if (achievement) {
          achievement.rewardClaimed = true;
        }
      })
      
      // Get leaderboard
      .addCase(getLeaderboard.pending, (state) => {
        state.leaderboardLoading = true;
        state.leaderboardError = null;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.leaderboardLoading = false;
        state.leaderboard = action.payload.leaderboard;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.leaderboardLoading = false;
        state.leaderboardError = action.payload;
      })
      
      // Get stats
      .addCase(getStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(getStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Get achievement
      .addCase(getAchievement.pending, (state) => {
        state.currentAchievementLoading = true;
        state.currentAchievementError = null;
      })
      .addCase(getAchievement.fulfilled, (state, action) => {
        state.currentAchievementLoading = false;
        state.currentAchievement = action.payload.achievement;
      })
      .addCase(getAchievement.rejected, (state, action) => {
        state.currentAchievementLoading = false;
        state.currentAchievementError = action.payload;
      })
      
      // Get categories
      .addCase(getCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.categories;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })
      
      // Get rarities
      .addCase(getRarities.pending, (state) => {
        state.raritiesLoading = true;
        state.raritiesError = null;
      })
      .addCase(getRarities.fulfilled, (state, action) => {
        state.raritiesLoading = false;
        state.rarities = action.payload.rarities;
      })
      .addCase(getRarities.rejected, (state, action) => {
        state.raritiesLoading = false;
        state.raritiesError = action.payload;
      });
  },
});

export const {
  addRecentlyUnlocked,
  clearRecentlyUnlocked,
  updateAchievementProgress,
  markAchievementUnlocked,
  markRewardClaimed,
  updateUserStats,
  clearError,
  resetAchievementState,
} = achievementSlice.actions;

// Selectors
export const selectAllAchievements = (state) => state.achievements.allAchievements;
export const selectAllAchievementsLoading = (state) => state.achievements.allAchievementsLoading;
export const selectAllAchievementsError = (state) => state.achievements.allAchievementsError;

export const selectUserAchievements = (state) => state.achievements.userAchievements;
export const selectUserStats = (state) => state.achievements.userStats;
export const selectUserAchievementsLoading = (state) => state.achievements.userAchievementsLoading;
export const selectUserAchievementsError = (state) => state.achievements.userAchievementsError;

export const selectLeaderboard = (state) => state.achievements.leaderboard;
export const selectLeaderboardLoading = (state) => state.achievements.leaderboardLoading;
export const selectLeaderboardError = (state) => state.achievements.leaderboardError;

export const selectStats = (state) => state.achievements.stats;
export const selectStatsLoading = (state) => state.achievements.statsLoading;
export const selectStatsError = (state) => state.achievements.statsError;

export const selectCategories = (state) => state.achievements.categories;
export const selectCategoriesLoading = (state) => state.achievements.categoriesLoading;
export const selectCategoriesError = (state) => state.achievements.categoriesError;

export const selectRarities = (state) => state.achievements.rarities;
export const selectRaritiesLoading = (state) => state.achievements.raritiesLoading;
export const selectRaritiesError = (state) => state.achievements.raritiesError;

export const selectCurrentAchievement = (state) => state.achievements.currentAchievement;
export const selectCurrentAchievementLoading = (state) => state.achievements.currentAchievementLoading;
export const selectCurrentAchievementError = (state) => state.achievements.currentAchievementError;

export const selectRecentlyUnlocked = (state) => state.achievements.recentlyUnlocked;

export const selectAchievementStatus = (state) => state.achievements.status;
export const selectAchievementError = (state) => state.achievements.error;

export default achievementSlice.reducer;
