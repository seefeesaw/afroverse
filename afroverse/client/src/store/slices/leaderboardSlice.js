import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leaderboardService from '../../services/leaderboardService';

// Async thunks
export const fetchTribeLeaderboard = createAsyncThunk(
  'leaderboard/fetchTribeLeaderboard',
  async ({ period = 'weekly', limit = 50, cursor = null }, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getTribeLeaderboard(period, limit, cursor);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tribe leaderboard');
    }
  }
);

export const fetchUserLeaderboard = createAsyncThunk(
  'leaderboard/fetchUserLeaderboard',
  async ({ period = 'weekly', limit = 50, cursor = null }, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getUserLeaderboard(period, limit, cursor);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user leaderboard');
    }
  }
);

export const fetchCountryLeaderboard = createAsyncThunk(
  'leaderboard/fetchCountryLeaderboard',
  async ({ countryCode, period = 'weekly', limit = 50, cursor = null }, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getCountryLeaderboard(countryCode, period, limit, cursor);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch country leaderboard');
    }
  }
);

export const fetchMyRank = createAsyncThunk(
  'leaderboard/fetchMyRank',
  async ({ scope = 'users', period = 'weekly', country = null }, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getMyRank(scope, period, country);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user rank');
    }
  }
);

export const fetchWeeklyChampions = createAsyncThunk(
  'leaderboard/fetchWeeklyChampions',
  async (weekStart = null, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getWeeklyChampions(weekStart);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch weekly champions');
    }
  }
);

export const fetchRecentChampions = createAsyncThunk(
  'leaderboard/fetchRecentChampions',
  async (limit = 4, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getRecentChampions(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent champions');
    }
  }
);

export const searchLeaderboard = createAsyncThunk(
  'leaderboard/searchLeaderboard',
  async ({ query, scope = 'users', period = 'weekly', country = null }, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.searchLeaderboard(query, scope, period, country);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search leaderboard');
    }
  }
);

export const shareRank = createAsyncThunk(
  'leaderboard/shareRank',
  async ({ scope, period, rank, points, name, tribe = null }, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.shareRank(scope, period, rank, points, name, tribe);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share rank');
    }
  }
);

const initialState = {
  // Tribe leaderboard
  tribeLeaderboard: {
    weekly: {
      items: [],
      nextCursor: null,
      loading: false,
      error: null
    },
    all: {
      items: [],
      nextCursor: null,
      loading: false,
      error: null
    }
  },
  
  // User leaderboard
  userLeaderboard: {
    weekly: {
      items: [],
      nextCursor: null,
      loading: false,
      error: null
    },
    all: {
      items: [],
      nextCursor: null,
      loading: false,
      error: null
    }
  },
  
  // Country leaderboard
  countryLeaderboard: {
    weekly: {
      items: [],
      nextCursor: null,
      loading: false,
      error: null
    },
    all: {
      items: [],
      nextCursor: null,
      loading: false,
      error: null
    }
  },
  
  // My rank
  myRank: {
    users: {
      weekly: null,
      all: null
    },
    tribes: {
      weekly: null,
      all: null
    }
  },
  
  // Weekly champions
  weeklyChampions: {
    current: null,
    recent: [],
    loading: false,
    error: null
  },
  
  // Search results
  searchResults: {
    items: [],
    query: '',
    scope: 'users',
    period: 'weekly',
    loading: false,
    error: null
  },
  
  // Share functionality
  share: {
    loading: false,
    error: null,
    lastShared: null
  },
  
  // UI state
  activeTab: 'tribes',
  activePeriod: 'weekly',
  selectedCountry: null,
  
  // Real-time updates
  realTimeUpdates: {
    enabled: false,
    lastUpdate: null
  }
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setActivePeriod: (state, action) => {
      state.activePeriod = action.payload;
    },
    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = {
        items: [],
        query: '',
        scope: 'users',
        period: 'weekly',
        loading: false,
        error: null
      };
    },
    updateRankRealtime: (state, action) => {
      const { scope, period, changes } = action.payload;
      
      if (scope === 'tribes') {
        changes.forEach(change => {
          const item = state.tribeLeaderboard[period].items.find(item => item.tribeId === change.tribeId);
          if (item) {
            item.points = change.newPoints;
            item.delta = change.delta;
          }
        });
      } else if (scope === 'users') {
        changes.forEach(change => {
          const item = state.userLeaderboard[period].items.find(item => item.userId === change.userId);
          if (item) {
            item.points = change.newPoints;
            item.delta = change.delta;
          }
        });
      }
      
      state.realTimeUpdates.lastUpdate = new Date().toISOString();
    },
    enableRealTimeUpdates: (state) => {
      state.realTimeUpdates.enabled = true;
    },
    disableRealTimeUpdates: (state) => {
      state.realTimeUpdates.enabled = false;
    },
    resetLeaderboard: (state) => {
      state.tribeLeaderboard = {
        weekly: { items: [], nextCursor: null, loading: false, error: null },
        all: { items: [], nextCursor: null, loading: false, error: null }
      };
      state.userLeaderboard = {
        weekly: { items: [], nextCursor: null, loading: false, error: null },
        all: { items: [], nextCursor: null, loading: false, error: null }
      };
      state.countryLeaderboard = {
        weekly: { items: [], nextCursor: null, loading: false, error: null },
        all: { items: [], nextCursor: null, loading: false, error: null }
      };
      state.realTimeUpdates.lastUpdate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tribe leaderboard
      .addCase(fetchTribeLeaderboard.pending, (state, action) => {
        const { period } = action.meta.arg;
        state.tribeLeaderboard[period].loading = true;
        state.tribeLeaderboard[period].error = null;
      })
      .addCase(fetchTribeLeaderboard.fulfilled, (state, action) => {
        const { period, cursor } = action.meta.arg;
        const { items, nextCursor } = action.payload;
        
        if (cursor) {
          // Append to existing items
          state.tribeLeaderboard[period].items = [...state.tribeLeaderboard[period].items, ...items];
        } else {
          // Replace items
          state.tribeLeaderboard[period].items = items;
        }
        
        state.tribeLeaderboard[period].nextCursor = nextCursor;
        state.tribeLeaderboard[period].loading = false;
      })
      .addCase(fetchTribeLeaderboard.rejected, (state, action) => {
        const { period } = action.meta.arg;
        state.tribeLeaderboard[period].loading = false;
        state.tribeLeaderboard[period].error = action.payload;
      })
      
      // Fetch user leaderboard
      .addCase(fetchUserLeaderboard.pending, (state, action) => {
        const { period } = action.meta.arg;
        state.userLeaderboard[period].loading = true;
        state.userLeaderboard[period].error = null;
      })
      .addCase(fetchUserLeaderboard.fulfilled, (state, action) => {
        const { period, cursor } = action.meta.arg;
        const { items, nextCursor } = action.payload;
        
        if (cursor) {
          // Append to existing items
          state.userLeaderboard[period].items = [...state.userLeaderboard[period].items, ...items];
        } else {
          // Replace items
          state.userLeaderboard[period].items = items;
        }
        
        state.userLeaderboard[period].nextCursor = nextCursor;
        state.userLeaderboard[period].loading = false;
      })
      .addCase(fetchUserLeaderboard.rejected, (state, action) => {
        const { period } = action.meta.arg;
        state.userLeaderboard[period].loading = false;
        state.userLeaderboard[period].error = action.payload;
      })
      
      // Fetch country leaderboard
      .addCase(fetchCountryLeaderboard.pending, (state, action) => {
        const { period } = action.meta.arg;
        state.countryLeaderboard[period].loading = true;
        state.countryLeaderboard[period].error = null;
      })
      .addCase(fetchCountryLeaderboard.fulfilled, (state, action) => {
        const { period, cursor } = action.meta.arg;
        const { items, nextCursor } = action.payload;
        
        if (cursor) {
          // Append to existing items
          state.countryLeaderboard[period].items = [...state.countryLeaderboard[period].items, ...items];
        } else {
          // Replace items
          state.countryLeaderboard[period].items = items;
        }
        
        state.countryLeaderboard[period].nextCursor = nextCursor;
        state.countryLeaderboard[period].loading = false;
      })
      .addCase(fetchCountryLeaderboard.rejected, (state, action) => {
        const { period } = action.meta.arg;
        state.countryLeaderboard[period].loading = false;
        state.countryLeaderboard[period].error = action.payload;
      })
      
      // Fetch my rank
      .addCase(fetchMyRank.fulfilled, (state, action) => {
        const { scope, period } = action.meta.arg;
        state.myRank[scope][period] = action.payload;
      })
      
      // Fetch weekly champions
      .addCase(fetchWeeklyChampions.pending, (state) => {
        state.weeklyChampions.loading = true;
        state.weeklyChampions.error = null;
      })
      .addCase(fetchWeeklyChampions.fulfilled, (state, action) => {
        state.weeklyChampions.current = action.payload;
        state.weeklyChampions.loading = false;
      })
      .addCase(fetchWeeklyChampions.rejected, (state, action) => {
        state.weeklyChampions.loading = false;
        state.weeklyChampions.error = action.payload;
      })
      
      // Fetch recent champions
      .addCase(fetchRecentChampions.fulfilled, (state, action) => {
        state.weeklyChampions.recent = action.payload.champions;
      })
      
      // Search leaderboard
      .addCase(searchLeaderboard.pending, (state) => {
        state.searchResults.loading = true;
        state.searchResults.error = null;
      })
      .addCase(searchLeaderboard.fulfilled, (state, action) => {
        const { query, scope, period } = action.meta.arg;
        state.searchResults.items = action.payload.results;
        state.searchResults.query = query;
        state.searchResults.scope = scope;
        state.searchResults.period = period;
        state.searchResults.loading = false;
      })
      .addCase(searchLeaderboard.rejected, (state, action) => {
        state.searchResults.loading = false;
        state.searchResults.error = action.payload;
      })
      
      // Share rank
      .addCase(shareRank.pending, (state) => {
        state.share.loading = true;
        state.share.error = null;
      })
      .addCase(shareRank.fulfilled, (state, action) => {
        state.share.loading = false;
        state.share.lastShared = action.payload;
      })
      .addCase(shareRank.rejected, (state, action) => {
        state.share.loading = false;
        state.share.error = action.payload;
      });
  }
});

export const {
  setActiveTab,
  setActivePeriod,
  setSelectedCountry,
  clearSearchResults,
  updateRankRealtime,
  enableRealTimeUpdates,
  disableRealTimeUpdates,
  resetLeaderboard
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
