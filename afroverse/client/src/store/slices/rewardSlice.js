import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rewardService from '../../services/rewardService';

// Async thunks
export const getUserAchievements = createAsyncThunk(
  'reward/getUserAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardService.getUserAchievements();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get achievements');
    }
  }
);

export const getUnclaimedRewards = createAsyncThunk(
  'reward/getUnclaimedRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardService.getUnclaimedRewards();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get unclaimed rewards');
    }
  }
);

export const claimReward = createAsyncThunk(
  'reward/claimReward',
  async (rewardId, { rejectWithValue }) => {
    try {
      const response = await rewardService.claimReward(rewardId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to claim reward');
    }
  }
);

export const equipCosmetic = createAsyncThunk(
  'reward/equipCosmetic',
  async ({ slot, key }, { rejectWithValue }) => {
    try {
      const response = await rewardService.equipCosmetic(slot, key);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to equip cosmetic');
    }
  }
);

export const getUserInventory = createAsyncThunk(
  'reward/getUserInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardService.getUserInventory();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get inventory');
    }
  }
);

export const getEquippedCosmetics = createAsyncThunk(
  'reward/getEquippedCosmetics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardService.getEquippedCosmetics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get equipped cosmetics');
    }
  }
);

export const getAchievementsByCategory = createAsyncThunk(
  'reward/getAchievementsByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await rewardService.getAchievementsByCategory(category);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get achievements by category');
    }
  }
);

export const getAchievementsByRarity = createAsyncThunk(
  'reward/getAchievementsByRarity',
  async (rarity, { rejectWithValue }) => {
    try {
      const response = await rewardService.getAchievementsByRarity(rarity);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get achievements by rarity');
    }
  }
);

export const getAllAchievements = createAsyncThunk(
  'reward/getAllAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardService.getAllAchievements();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get all achievements');
    }
  }
);

export const getAchievementByKey = createAsyncThunk(
  'reward/getAchievementByKey',
  async (key, { rejectWithValue }) => {
    try {
      const response = await rewardService.getAchievementByKey(key);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get achievement');
    }
  }
);

export const getUserAchievementStatistics = createAsyncThunk(
  'reward/getUserAchievementStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardService.getUserAchievementStatistics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get achievement statistics');
    }
  }
);

export const getRecentAchievements = createAsyncThunk(
  'reward/getRecentAchievements',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await rewardService.getRecentAchievements(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get recent achievements');
    }
  }
);

export const getAchievementProgressSummary = createAsyncThunk(
  'reward/getAchievementProgressSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardService.getAchievementProgressSummary();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get progress summary');
    }
  }
);

export const getAchievementCategories = createAsyncThunk(
  'reward/getAchievementCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardService.getAchievementCategories();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get categories');
    }
  }
);

export const getRarityInfo = createAsyncThunk(
  'reward/getRarityInfo',
  async (rarity, { rejectWithValue }) => {
    try {
      const response = await rewardService.getRarityInfo(rarity);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get rarity info');
    }
  }
);

const initialState = {
  // Achievements
  achievements: {
    unlocked: [],
    locked: [],
    rarityCounts: { common: 0, rare: 0, epic: 0, legendary: 0 }
  },
  
  // Rewards
  rewards: {
    unclaimed: [],
    inventory: {
      vouchers: {},
      tokens: {},
      boosts: [],
      cosmetics: {
        equipped: {},
        owned: [],
        temporary: []
      }
    }
  },
  
  // Cosmetics
  cosmetics: {
    equipped: {
      frame: null,
      title: null,
      confetti: null
    }
  },
  
  // Statistics
  statistics: {
    user: null,
    progress: null,
    recent: []
  },
  
  // Categories and filters
  categories: [],
  filters: {
    category: 'all',
    rarity: 'all',
    status: 'all',
    search: ''
  },
  
  // Loading states
  loading: {
    achievements: false,
    rewards: false,
    cosmetics: false,
    statistics: false,
    categories: false,
    claim: false,
    equip: false
  },
  
  // Error states
  errors: {
    achievements: null,
    rewards: null,
    cosmetics: null,
    statistics: null,
    categories: null,
    claim: null,
    equip: null
  },
  
  // UI state
  ui: {
    selectedAchievement: null,
    selectedCategory: 'all',
    selectedRarity: 'all',
    selectedStatus: 'all',
    searchQuery: '',
    sortBy: 'sortOrder',
    sortOrder: 'asc'
  }
};

const rewardSlice = createSlice({
  name: 'reward',
  initialState,
  reducers: {
    setAchievements: (state, action) => {
      state.achievements = { ...state.achievements, ...action.payload };
    },
    setRewards: (state, action) => {
      state.rewards = { ...state.rewards, ...action.payload };
    },
    setCosmetics: (state, action) => {
      state.cosmetics = { ...state.cosmetics, ...action.payload };
    },
    setStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setUI: (state, action) => {
      state.ui = { ...state.ui, ...action.payload };
    },
    setSelectedAchievement: (state, action) => {
      state.ui.selectedAchievement = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.ui.selectedCategory = action.payload;
      state.filters.category = action.payload;
    },
    setSelectedRarity: (state, action) => {
      state.ui.selectedRarity = action.payload;
      state.filters.rarity = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.ui.selectedStatus = action.payload;
      state.filters.status = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.ui.searchQuery = action.payload;
      state.filters.search = action.payload;
    },
    setSortBy: (state, action) => {
      state.ui.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.ui.sortOrder = action.payload;
    },
    clearErrors: (state) => {
      state.errors = {
        achievements: null,
        rewards: null,
        cosmetics: null,
        statistics: null,
        categories: null,
        claim: null,
        equip: null
      };
    },
    resetReward: (state) => {
      state.achievements = initialState.achievements;
      state.rewards = initialState.rewards;
      state.cosmetics = initialState.cosmetics;
      state.statistics = initialState.statistics;
      state.categories = initialState.categories;
      state.filters = initialState.filters;
      state.ui = initialState.ui;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user achievements
      .addCase(getUserAchievements.pending, (state) => {
        state.loading.achievements = true;
        state.errors.achievements = null;
      })
      .addCase(getUserAchievements.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.achievements = { ...state.achievements, ...action.payload };
      })
      .addCase(getUserAchievements.rejected, (state, action) => {
        state.loading.achievements = false;
        state.errors.achievements = action.payload;
      })
      
      // Get unclaimed rewards
      .addCase(getUnclaimedRewards.pending, (state) => {
        state.loading.rewards = true;
        state.errors.rewards = null;
      })
      .addCase(getUnclaimedRewards.fulfilled, (state, action) => {
        state.loading.rewards = false;
        state.rewards.unclaimed = action.payload.items;
      })
      .addCase(getUnclaimedRewards.rejected, (state, action) => {
        state.loading.rewards = false;
        state.errors.rewards = action.payload;
      })
      
      // Claim reward
      .addCase(claimReward.pending, (state) => {
        state.loading.claim = true;
        state.errors.claim = null;
      })
      .addCase(claimReward.fulfilled, (state, action) => {
        state.loading.claim = false;
        state.rewards.inventory = { ...state.rewards.inventory, ...action.payload.inventory };
        // Remove claimed reward from unclaimed list
        state.rewards.unclaimed = state.rewards.unclaimed.filter(
          reward => reward.id !== action.payload.rewardId
        );
      })
      .addCase(claimReward.rejected, (state, action) => {
        state.loading.claim = false;
        state.errors.claim = action.payload;
      })
      
      // Equip cosmetic
      .addCase(equipCosmetic.pending, (state) => {
        state.loading.equip = true;
        state.errors.equip = null;
      })
      .addCase(equipCosmetic.fulfilled, (state, action) => {
        state.loading.equip = false;
        state.cosmetics.equipped = { ...state.cosmetics.equipped, ...action.payload.equipped };
      })
      .addCase(equipCosmetic.rejected, (state, action) => {
        state.loading.equip = false;
        state.errors.equip = action.payload;
      })
      
      // Get user inventory
      .addCase(getUserInventory.pending, (state) => {
        state.loading.rewards = true;
        state.errors.rewards = null;
      })
      .addCase(getUserInventory.fulfilled, (state, action) => {
        state.loading.rewards = false;
        state.rewards.inventory = { ...state.rewards.inventory, ...action.payload };
      })
      .addCase(getUserInventory.rejected, (state, action) => {
        state.loading.rewards = false;
        state.errors.rewards = action.payload;
      })
      
      // Get equipped cosmetics
      .addCase(getEquippedCosmetics.pending, (state) => {
        state.loading.cosmetics = true;
        state.errors.cosmetics = null;
      })
      .addCase(getEquippedCosmetics.fulfilled, (state, action) => {
        state.loading.cosmetics = false;
        state.cosmetics.equipped = { ...state.cosmetics.equipped, ...action.payload.equipped };
      })
      .addCase(getEquippedCosmetics.rejected, (state, action) => {
        state.loading.cosmetics = false;
        state.errors.cosmetics = action.payload;
      })
      
      // Get achievements by category
      .addCase(getAchievementsByCategory.pending, (state) => {
        state.loading.achievements = true;
        state.errors.achievements = null;
      })
      .addCase(getAchievementsByCategory.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.achievements.locked = action.payload.achievements;
      })
      .addCase(getAchievementsByCategory.rejected, (state, action) => {
        state.loading.achievements = false;
        state.errors.achievements = action.payload;
      })
      
      // Get achievements by rarity
      .addCase(getAchievementsByRarity.pending, (state) => {
        state.loading.achievements = true;
        state.errors.achievements = null;
      })
      .addCase(getAchievementsByRarity.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.achievements.locked = action.payload.achievements;
      })
      .addCase(getAchievementsByRarity.rejected, (state, action) => {
        state.loading.achievements = false;
        state.errors.achievements = action.payload;
      })
      
      // Get all achievements
      .addCase(getAllAchievements.pending, (state) => {
        state.loading.achievements = true;
        state.errors.achievements = null;
      })
      .addCase(getAllAchievements.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.achievements.locked = action.payload.achievements;
      })
      .addCase(getAllAchievements.rejected, (state, action) => {
        state.loading.achievements = false;
        state.errors.achievements = action.payload;
      })
      
      // Get achievement by key
      .addCase(getAchievementByKey.pending, (state) => {
        state.loading.achievements = true;
        state.errors.achievements = null;
      })
      .addCase(getAchievementByKey.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.ui.selectedAchievement = action.payload.achievement;
      })
      .addCase(getAchievementByKey.rejected, (state, action) => {
        state.loading.achievements = false;
        state.errors.achievements = action.payload;
      })
      
      // Get user achievement statistics
      .addCase(getUserAchievementStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.errors.statistics = null;
      })
      .addCase(getUserAchievementStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics.user = action.payload.statistics;
      })
      .addCase(getUserAchievementStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.errors.statistics = action.payload;
      })
      
      // Get recent achievements
      .addCase(getRecentAchievements.pending, (state) => {
        state.loading.statistics = true;
        state.errors.statistics = null;
      })
      .addCase(getRecentAchievements.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics.recent = action.payload.achievements;
      })
      .addCase(getRecentAchievements.rejected, (state, action) => {
        state.loading.statistics = false;
        state.errors.statistics = action.payload;
      })
      
      // Get achievement progress summary
      .addCase(getAchievementProgressSummary.pending, (state) => {
        state.loading.statistics = true;
        state.errors.statistics = null;
      })
      .addCase(getAchievementProgressSummary.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics.progress = action.payload.progress;
      })
      .addCase(getAchievementProgressSummary.rejected, (state, action) => {
        state.loading.statistics = false;
        state.errors.statistics = action.payload;
      })
      
      // Get achievement categories
      .addCase(getAchievementCategories.pending, (state) => {
        state.loading.categories = true;
        state.errors.categories = null;
      })
      .addCase(getAchievementCategories.fulfilled, (state, action) => {
        state.loading.categories = false;
        state.categories = action.payload.categories;
      })
      .addCase(getAchievementCategories.rejected, (state, action) => {
        state.loading.categories = false;
        state.errors.categories = action.payload;
      })
      
      // Get rarity info
      .addCase(getRarityInfo.pending, (state) => {
        state.loading.achievements = true;
        state.errors.achievements = null;
      })
      .addCase(getRarityInfo.fulfilled, (state, action) => {
        state.loading.achievements = false;
        // Store rarity info in UI state
        state.ui.rarityInfo = action.payload.info;
      })
      .addCase(getRarityInfo.rejected, (state, action) => {
        state.loading.achievements = false;
        state.errors.achievements = action.payload;
      });
  }
});

export const {
  setAchievements,
  setRewards,
  setCosmetics,
  setStatistics,
  setCategories,
  setFilters,
  setUI,
  setSelectedAchievement,
  setSelectedCategory,
  setSelectedRarity,
  setSelectedStatus,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  clearErrors,
  resetReward
} = rewardSlice.actions;

export default rewardSlice.reducer;
