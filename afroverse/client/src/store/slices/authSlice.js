import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Async thunks
export const startAuth = createAsyncThunk(
  'auth/startAuth',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await authService.startAuth(phone);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyAuth = createAsyncThunk(
  'auth/verifyAuth',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyAuth(phone, otp);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshAccessToken();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  authStep: 'phone', // 'phone', 'otp', 'complete'
  phone: null,
  requestId: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthStep: (state, action) => {
      state.authStep = action.payload;
    },
    setPhone: (state, action) => {
      state.phone = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.authStep = 'phone';
      state.phone = null;
      state.requestId = null;
      state.error = null;
    },
    initializeAuth: (state) => {
      const token = authService.getAccessToken();
      if (token) {
        state.accessToken = token;
        state.isAuthenticated = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Start Auth
      .addCase(startAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requestId = action.payload.requestId;
        state.authStep = 'otp';
      })
      .addCase(startAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Verify Auth
      .addCase(verifyAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.authStep = 'complete';
        state.error = null;
      })
      .addCase(verifyAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.authStep = 'phone';
      })
      
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.authStep = 'phone';
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.authStep = 'phone';
        state.phone = null;
        state.requestId = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        // Clear state anyway
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.authStep = 'phone';
        state.phone = null;
        state.requestId = null;
      });
  },
});

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthStep = (state) => state.auth.authStep;
export const selectPhone = (state) => state.auth.phone;

// Action creators
export const { clearError, setAuthStep, setPhone, clearAuth, initializeAuth } = authSlice.actions;

export default authSlice.reducer;
