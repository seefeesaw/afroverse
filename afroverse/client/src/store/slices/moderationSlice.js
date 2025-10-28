import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import moderationService from '../../services/moderationService';

const initialState = {
  // Report data
  reports: [],
  reportReasons: [],
  
  // Block data
  blockedUsers: [],
  blockers: [],
  
  // Moderation history
  moderationHistory: [],
  
  // User reports
  userReports: [],
  reportsAgainst: [],
  
  // Moderation stats
  stats: {
    logs: [],
    reports: []
  },
  
  // Service status
  serviceStatus: {
    initialized: false,
    services: {}
  },
  
  // UI state
  loading: false,
  error: null,
  
  // Moderation settings
  settings: {
    autoModeration: true,
    strictMode: true,
    reportThreshold: 5,
    blockThreshold: 3
  }
};

// Async Thunks
export const fetchReportReasons = createAsyncThunk(
  'moderation/fetchReportReasons',
  async (_, { rejectWithValue }) => {
    try {
      const reasons = await moderationService.getReportReasons();
      return reasons;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const submitReport = createAsyncThunk(
  'moderation/submitReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const result = await moderationService.submitReport(reportData);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const blockUser = createAsyncThunk(
  'moderation/blockUser',
  async ({ blockedUserId, reason, description }, { rejectWithValue }) => {
    try {
      const result = await moderationService.blockUser(blockedUserId, reason, description);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const unblockUser = createAsyncThunk(
  'moderation/unblockUser',
  async (blockedUserId, { rejectWithValue }) => {
    try {
      const result = await moderationService.unblockUser(blockedUserId);
      return { result, blockedUserId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBlockedUsers = createAsyncThunk(
  'moderation/fetchBlockedUsers',
  async (_, { rejectWithValue }) => {
    try {
      const blockedUsers = await moderationService.getBlockedUsers();
      return blockedUsers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBlockers = createAsyncThunk(
  'moderation/fetchBlockers',
  async (_, { rejectWithValue }) => {
    try {
      const blockers = await moderationService.getBlockers();
      return blockers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchModerationHistory = createAsyncThunk(
  'moderation/fetchModerationHistory',
  async (params, { rejectWithValue }) => {
    try {
      const data = await moderationService.getModerationHistory(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserReports = createAsyncThunk(
  'moderation/fetchUserReports',
  async (params, { rejectWithValue }) => {
    try {
      const data = await moderationService.getUserReports(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchReportsAgainst = createAsyncThunk(
  'moderation/fetchReportsAgainst',
  async (params, { rejectWithValue }) => {
    try {
      const data = await moderationService.getReportsAgainst(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const moderateText = createAsyncThunk(
  'moderation/moderateText',
  async ({ text, contentType, options }, { rejectWithValue }) => {
    try {
      const result = await moderationService.moderateText(text, contentType, options);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const validateUsername = createAsyncThunk(
  'moderation/validateUsername',
  async (username, { rejectWithValue }) => {
    try {
      const result = await moderationService.validateUsername(username);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const validateTribeName = createAsyncThunk(
  'moderation/validateTribeName',
  async (tribeName, { rejectWithValue }) => {
    try {
      const result = await moderationService.validateTribeName(tribeName);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchModerationStats = createAsyncThunk(
  'moderation/fetchModerationStats',
  async (timeframe, { rejectWithValue }) => {
    try {
      const stats = await moderationService.getModerationStats(timeframe);
      return stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchModerationStatus = createAsyncThunk(
  'moderation/fetchModerationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const status = await moderationService.getModerationStatus();
      return status;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const moderationSlice = createSlice({
  name: 'moderation',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update moderation settings
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // Add blocked user to local state
    addBlockedUser: (state, action) => {
      const blockedUser = action.payload;
      const existingIndex = state.blockedUsers.findIndex(
        user => user.blockedUserId._id === blockedUser.blockedUserId
      );
      
      if (existingIndex === -1) {
        state.blockedUsers.unshift(blockedUser);
      }
    },
    
    // Remove blocked user from local state
    removeBlockedUser: (state, action) => {
      const blockedUserId = action.payload;
      state.blockedUsers = state.blockedUsers.filter(
        user => user.blockedUserId._id !== blockedUserId
      );
    },
    
    // Add report to local state
    addReport: (state, action) => {
      const report = action.payload;
      state.userReports.unshift(report);
    },
    
    // Update report status
    updateReportStatus: (state, action) => {
      const { reportId, status } = action.payload;
      const report = state.userReports.find(r => r._id === reportId);
      if (report) {
        report.status = status;
      }
    },
    
    // Reset moderation state
    resetModeration: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch report reasons
      .addCase(fetchReportReasons.fulfilled, (state, action) => {
        state.reportReasons = action.payload;
      })
      
      // Submit report
      .addCase(submitReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReport.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.userReports.unshift(action.payload);
        }
      })
      .addCase(submitReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Block user
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // Add to blocked users list
          state.blockedUsers.unshift(action.payload);
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Unblock user
      .addCase(unblockUser.fulfilled, (state, action) => {
        if (action.payload.result.success) {
          state.blockedUsers = state.blockedUsers.filter(
            user => user.blockedUserId._id !== action.payload.blockedUserId
          );
        }
      })
      
      // Fetch blocked users
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.blockedUsers = action.payload;
      })
      
      // Fetch blockers
      .addCase(fetchBlockers.fulfilled, (state, action) => {
        state.blockers = action.payload;
      })
      
      // Fetch moderation history
      .addCase(fetchModerationHistory.fulfilled, (state, action) => {
        state.moderationHistory = action.payload.history;
      })
      
      // Fetch user reports
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.userReports = action.payload.reports;
      })
      
      // Fetch reports against
      .addCase(fetchReportsAgainst.fulfilled, (state, action) => {
        state.reportsAgainst = action.payload.reports;
      })
      
      // Moderate text
      .addCase(moderateText.fulfilled, (state, action) => {
        // Text moderation result is handled by the calling component
      })
      
      // Validate username
      .addCase(validateUsername.fulfilled, (state, action) => {
        // Username validation result is handled by the calling component
      })
      
      // Validate tribe name
      .addCase(validateTribeName.fulfilled, (state, action) => {
        // Tribe name validation result is handled by the calling component
      })
      
      // Fetch moderation stats
      .addCase(fetchModerationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch moderation status
      .addCase(fetchModerationStatus.fulfilled, (state, action) => {
        state.serviceStatus = action.payload;
      });
  }
});

export const {
  clearError,
  updateSettings,
  addBlockedUser,
  removeBlockedUser,
  addReport,
  updateReportStatus,
  resetModeration
} = moderationSlice.actions;

export default moderationSlice.reducer;