import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventService from '../../services/eventService';

// Async thunks
export const fetchCurrentEvent = createAsyncThunk(
  'event/fetchCurrentEvent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getCurrentEvent();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUpcomingEvent = createAsyncThunk(
  'event/fetchUpcomingEvent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getUpcomingEvent();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchClanWarStandings = createAsyncThunk(
  'event/fetchClanWarStandings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getClanWarStandings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchPowerHourStatus = createAsyncThunk(
  'event/fetchPowerHourStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getPowerHourStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateClanWarScore = createAsyncThunk(
  'event/updateClanWarScore',
  async ({ activityType, value = 1, metadata = {} }, { rejectWithValue }) => {
    try {
      const response = await eventService.updateClanWarScore(activityType, value, metadata);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserEventStats = createAsyncThunk(
  'event/fetchUserEventStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getUserEventStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserEventHistory = createAsyncThunk(
  'event/fetchUserEventHistory',
  async ({ limit = 50, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await eventService.getUserEventHistory(limit, offset);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchEventLeaderboard = createAsyncThunk(
  'event/fetchEventLeaderboard',
  async ({ eventType = 'clan_war', limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventLeaderboard(eventType, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTribeWarStatus = createAsyncThunk(
  'event/fetchTribeWarStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getTribeWarStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const eventSlice = createSlice({
  name: 'event',
  initialState: {
    currentEvent: null,
    upcomingEvent: null,
    clanWarStandings: [],
    powerHourStatus: null,
    userTribeWar: null,
    eventStats: null,
    eventHistory: [],
    eventLeaderboard: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetEventState: (state) => {
      state.currentEvent = null;
      state.upcomingEvent = null;
      state.clanWarStandings = [];
      state.powerHourStatus = null;
      state.userTribeWar = null;
      state.eventStats = null;
      state.eventHistory = [];
      state.eventLeaderboard = [];
      state.status = 'idle';
      state.error = null;
    },
    updateClanWarStandings: (state, action) => {
      state.clanWarStandings = action.payload;
    },
    updatePowerHourStatus: (state, action) => {
      state.powerHourStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current Event
      .addCase(fetchCurrentEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentEvent = action.payload.event;
        state.error = null;
      })
      .addCase(fetchCurrentEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Upcoming Event
      .addCase(fetchUpcomingEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUpcomingEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.upcomingEvent = action.payload.event;
        state.error = null;
      })
      .addCase(fetchUpcomingEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Clan War Standings
      .addCase(fetchClanWarStandings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchClanWarStandings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clanWarStandings = action.payload.standings;
        state.error = null;
      })
      .addCase(fetchClanWarStandings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Power Hour Status
      .addCase(fetchPowerHourStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPowerHourStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.powerHourStatus = action.payload.powerHour;
        state.error = null;
      })
      .addCase(fetchPowerHourStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update Clan War Score
      .addCase(updateClanWarScore.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateClanWarScore.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateClanWarScore.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch User Event Stats
      .addCase(fetchUserEventStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserEventStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventStats = action.payload.stats;
        state.error = null;
      })
      .addCase(fetchUserEventStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch User Event History
      .addCase(fetchUserEventHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserEventHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventHistory = action.payload.events;
        state.error = null;
      })
      .addCase(fetchUserEventHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Event Leaderboard
      .addCase(fetchEventLeaderboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEventLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventLeaderboard = action.payload.leaderboard;
        state.error = null;
      })
      .addCase(fetchEventLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Tribe War Status
      .addCase(fetchTribeWarStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTribeWarStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userTribeWar = action.payload;
        state.error = null;
      })
      .addCase(fetchTribeWarStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  resetEventState,
  updateClanWarStandings,
  updatePowerHourStatus,
} = eventSlice.actions;

export default eventSlice.reducer;
