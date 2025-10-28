import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

// Async thunks for authentication
export const loginAdmin = createAsyncThunk(
  'admin/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await adminService.login(email, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithMagicLink = createAsyncThunk(
  'admin/loginWithMagicLink',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await adminService.loginWithMagicLink(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyTwoFA = createAsyncThunk(
  'admin/verifyTwoFA',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await adminService.verifyTwoFA(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'admin/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.refreshToken();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.logout();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for profile
export const getAdminProfile = createAsyncThunk(
  'admin/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAdminProfile = createAsyncThunk(
  'admin/updateProfile',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await adminService.updateProfile(updates);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for dashboard
export const getDashboard = createAsyncThunk(
  'admin/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getDashboard();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for moderation
export const getModerationQueue = createAsyncThunk(
  'admin/getModerationQueue',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminService.getModerationQueue(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getModerationJob = createAsyncThunk(
  'admin/getModerationJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await adminService.getModerationJob(jobId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignModerationJob = createAsyncThunk(
  'admin/assignModerationJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await adminService.assignModerationJob(jobId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const makeModerationDecision = createAsyncThunk(
  'admin/makeModerationDecision',
  async ({ jobId, decision, reason, notes }, { rejectWithValue }) => {
    try {
      const response = await adminService.makeModerationDecision(jobId, decision, reason, notes);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const escalateModerationJob = createAsyncThunk(
  'admin/escalateModerationJob',
  async ({ jobId, reason, priority }, { rejectWithValue }) => {
    try {
      const response = await adminService.escalateModerationJob(jobId, reason, priority);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveAppeal = createAsyncThunk(
  'admin/resolveAppeal',
  async ({ jobId, resolution, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.resolveAppeal(jobId, resolution, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for fraud detection
export const getFraudDetections = createAsyncThunk(
  'admin/getFraudDetections',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminService.getFraudDetections(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFraudDetection = createAsyncThunk(
  'admin/getFraudDetection',
  async (fraudDetectionId, { rejectWithValue }) => {
    try {
      const response = await adminService.getFraudDetection(fraudDetectionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reviewFraudDetection = createAsyncThunk(
  'admin/reviewFraudDetection',
  async ({ fraudDetectionId, action, notes }, { rejectWithValue }) => {
    try {
      const response = await adminService.reviewFraudDetection(fraudDetectionId, action, notes);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const shadowbanUser = createAsyncThunk(
  'admin/shadowbanUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.shadowbanUser(userId, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const liftShadowban = createAsyncThunk(
  'admin/liftShadowban',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.liftShadowban(userId, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for user management
export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminService.getUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUser = createAsyncThunk(
  'admin/getUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.getUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserDetails = createAsyncThunk(
  'admin/getUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserDetails(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyEnforcement = createAsyncThunk(
  'admin/applyEnforcement',
  async ({ userId, type, scope, reason, expiresAt }, { rejectWithValue }) => {
    try {
      const response = await adminService.applyEnforcement(userId, type, scope, reason, expiresAt);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const banUser = createAsyncThunk(
  'admin/banUser',
  async ({ userId, reason, duration }, { rejectWithValue }) => {
    try {
      const response = await adminService.banUser(userId, reason, duration);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unbanUser = createAsyncThunk(
  'admin/unbanUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.unbanUser(userId, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for tribe management
export const getTribes = createAsyncThunk(
  'admin/getTribes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminService.getTribes(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTribe = createAsyncThunk(
  'admin/getTribe',
  async (tribeId, { rejectWithValue }) => {
    try {
      const response = await adminService.getTribe(tribeId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTribe = createAsyncThunk(
  'admin/updateTribe',
  async ({ tribeId, updates }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateTribe(tribeId, updates);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changeTribeCaptain = createAsyncThunk(
  'admin/changeTribeCaptain',
  async ({ tribeId, newCaptainId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.changeTribeCaptain(tribeId, newCaptainId, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for audit logs
export const getAuditLogs = createAsyncThunk(
  'admin/getAuditLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminService.getAuditLogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAuditLog = createAsyncThunk(
  'admin/getAuditLog',
  async (auditLogId, { rejectWithValue }) => {
    try {
      const response = await adminService.getAuditLog(auditLogId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reverseAuditLog = createAsyncThunk(
  'admin/reverseAuditLog',
  async ({ auditLogId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.reverseAuditLog(auditLogId, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Authentication state
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Admin user data
  admin: null,
  profile: null,
  
  // Dashboard data
  dashboard: null,
  
  // Moderation state
  moderationQueue: [],
  currentModerationJob: null,
  
  // Fraud detection state
  fraudDetections: [],
  currentFraudDetection: null,
  
  // User management state
  users: [],
  currentUser: null,
  userDetails: null,
  
  // Tribe management state
  tribes: [],
  currentTribe: null,
  
  // Audit logs state
  auditLogs: [],
  currentAuditLog: null,
  
  // UI state
  activeTab: 'dashboard',
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  }
};

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Authentication reducers
    clearError: (state) => {
      state.error = null;
    },
    
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Moderation reducers
    setCurrentModerationJob: (state, action) => {
      state.currentModerationJob = action.payload;
    },
    
    updateModerationJob: (state, action) => {
      const { jobId, updates } = action.payload;
      const jobIndex = state.moderationQueue.findIndex(job => job._id === jobId);
      if (jobIndex !== -1) {
        state.moderationQueue[jobIndex] = { ...state.moderationQueue[jobIndex], ...updates };
      }
    },
    
    // Fraud detection reducers
    setCurrentFraudDetection: (state, action) => {
      state.currentFraudDetection = action.payload;
    },
    
    updateFraudDetection: (state, action) => {
      const { fraudDetectionId, updates } = action.payload;
      const detectionIndex = state.fraudDetections.findIndex(detection => detection._id === fraudDetectionId);
      if (detectionIndex !== -1) {
        state.fraudDetections[detectionIndex] = { ...state.fraudDetections[detectionIndex], ...updates };
      }
    },
    
    // User management reducers
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    
    // Tribe management reducers
    setCurrentTribe: (state, action) => {
      state.currentTribe = action.payload;
    },
    
    // Audit log reducers
    setCurrentAuditLog: (state, action) => {
      state.currentAuditLog = action.payload;
    },
    
    // Reset state
    resetAdminState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Authentication cases
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.user;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.error = action.payload;
      })
      
      .addCase(loginWithMagicLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithMagicLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.user;
        state.error = null;
      })
      .addCase(loginWithMagicLink.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.error = action.payload;
      })
      
      .addCase(verifyTwoFA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyTwoFA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.user;
        state.error = null;
      })
      .addCase(verifyTwoFA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.user;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.error = action.payload;
      })
      
      .addCase(logoutAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.profile = null;
        state.dashboard = null;
        state.moderationQueue = [];
        state.currentModerationJob = null;
        state.fraudDetections = [];
        state.currentFraudDetection = null;
        state.users = [];
        state.currentUser = null;
        state.userDetails = null;
        state.tribes = [];
        state.currentTribe = null;
        state.auditLogs = [];
        state.currentAuditLog = null;
        state.activeTab = 'dashboard';
        state.filters = {};
        state.pagination = { page: 1, limit: 20, total: 0 };
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Profile cases
      .addCase(getAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Dashboard cases
      .addCase(getDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload.dashboard;
        state.error = null;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Moderation cases
      .addCase(getModerationQueue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getModerationQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.moderationQueue = action.payload.jobs || [];
        state.pagination.total = action.payload.total || 0;
        state.error = null;
      })
      .addCase(getModerationQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getModerationJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getModerationJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModerationJob = action.payload;
        state.error = null;
      })
      .addCase(getModerationJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(assignModerationJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignModerationJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModerationJob = action.payload;
        state.error = null;
      })
      .addCase(assignModerationJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(makeModerationDecision.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(makeModerationDecision.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModerationJob = action.payload;
        state.error = null;
      })
      .addCase(makeModerationDecision.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(escalateModerationJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(escalateModerationJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModerationJob = action.payload;
        state.error = null;
      })
      .addCase(escalateModerationJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(resolveAppeal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resolveAppeal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModerationJob = action.payload;
        state.error = null;
      })
      .addCase(resolveAppeal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fraud detection cases
      .addCase(getFraudDetections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFraudDetections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fraudDetections = action.payload.detections || [];
        state.pagination.total = action.payload.total || 0;
        state.error = null;
      })
      .addCase(getFraudDetections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getFraudDetection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFraudDetection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFraudDetection = action.payload;
        state.error = null;
      })
      .addCase(getFraudDetection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(reviewFraudDetection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reviewFraudDetection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFraudDetection = action.payload;
        state.error = null;
      })
      .addCase(reviewFraudDetection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(shadowbanUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shadowbanUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(shadowbanUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(liftShadowban.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(liftShadowban.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(liftShadowban.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // User management cases
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users || [];
        state.pagination.total = action.payload.total || 0;
        state.error = null;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDetails = action.payload;
        state.error = null;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(applyEnforcement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyEnforcement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(applyEnforcement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(banUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(banUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(unbanUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Tribe management cases
      .addCase(getTribes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTribes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tribes = action.payload.tribes || [];
        state.pagination.total = action.payload.total || 0;
        state.error = null;
      })
      .addCase(getTribes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getTribe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTribe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTribe = action.payload;
        state.error = null;
      })
      .addCase(getTribe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateTribe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTribe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTribe = action.payload;
        state.error = null;
      })
      .addCase(updateTribe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(changeTribeCaptain.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeTribeCaptain.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTribe = action.payload;
        state.error = null;
      })
      .addCase(changeTribeCaptain.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Audit log cases
      .addCase(getAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditLogs = action.payload.logs || [];
        state.pagination.total = action.payload.total || 0;
        state.error = null;
      })
      .addCase(getAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getAuditLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAuditLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAuditLog = action.payload;
        state.error = null;
      })
      .addCase(getAuditLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(reverseAuditLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reverseAuditLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAuditLog = action.payload;
        state.error = null;
      })
      .addCase(reverseAuditLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setActiveTab,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentModerationJob,
  updateModerationJob,
  setCurrentFraudDetection,
  updateFraudDetection,
  setCurrentUser,
  setUserDetails,
  setCurrentTribe,
  setCurrentAuditLog,
  resetAdminState
} = adminSlice.actions;

export default adminSlice.reducer;
