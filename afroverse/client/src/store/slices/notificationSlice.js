import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    notifications: {
      push: {
        enabled: true,
        battle: true,
        streak: true,
        tribe: true,
        daily: true,
        coin: true,
        system: true
      },
      whatsapp: {
        enabled: true,
        battle: true,
        streak: true,
        tribe: true
      },
      inapp: {
        enabled: true,
        banner: true,
        sound: true,
        vibration: true
      },
      email: {
        enabled: false,
        weekly: false,
        system: true
      }
    },
    timing: {
      timezone: 'UTC',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      dailyReminder: {
        enabled: true,
        time: '19:00'
      },
      streakReminder: {
        enabled: true,
        time: '23:00'
      }
    },
    frequency: {
      maxPerDay: 10,
      cooldownMinutes: 30,
      batchSimilar: true
    }
  },
  stats: {
    totalReceived: 0,
    totalRead: 0,
    readRate: 0,
    avgReadTime: 0,
    lastReadAt: null,
    deviceTokens: 0,
    whatsappEnabled: false
  },
  loading: false,
  error: null,
  lastFetch: null,
  pushPermission: 'default',
  pushSubscription: null
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const data = await notificationService.getNotifications(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      return count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue, dispatch }) => {
    try {
      const notification = await notificationService.markAsRead(notificationId);
      // Refetch unread count after marking as read
      dispatch(fetchUnreadCount());
      return notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const result = await notificationService.markAllAsRead();
      // Refetch unread count after marking all as read
      dispatch(fetchUnreadCount());
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSettings = createAsyncThunk(
  'notifications/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settings = await notificationService.getSettings();
      return settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'notifications/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const updatedSettings = await notificationService.updateSettings(settings);
      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const registerDeviceToken = createAsyncThunk(
  'notifications/registerDeviceToken',
  async ({ token, platform }, { rejectWithValue }) => {
    try {
      const result = await notificationService.registerDeviceToken(token, platform);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeDeviceToken = createAsyncThunk(
  'notifications/removeDeviceToken',
  async (token, { rejectWithValue }) => {
    try {
      const result = await notificationService.removeDeviceToken(token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const registerWhatsAppPhone = createAsyncThunk(
  'notifications/registerWhatsAppPhone',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const result = await notificationService.registerWhatsAppPhone(phoneNumber);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeWhatsAppPhone = createAsyncThunk(
  'notifications/removeWhatsAppPhone',
  async (_, { rejectWithValue }) => {
    try {
      const result = await notificationService.removeWhatsAppPhone();
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchStats = createAsyncThunk(
  'notifications/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await notificationService.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const requestPushPermission = createAsyncThunk(
  'notifications/requestPushPermission',
  async (_, { rejectWithValue }) => {
    try {
      const granted = await notificationService.requestPushPermission();
      return granted;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const subscribeToPush = createAsyncThunk(
  'notifications/subscribeToPush',
  async (vapidPublicKey, { rejectWithValue, dispatch }) => {
    try {
      const subscription = await notificationService.subscribeToPush(vapidPublicKey);
      
      // Register the subscription with the backend
      const token = subscription.endpoint.split('/').pop();
      const platform = 'web';
      
      await dispatch(registerDeviceToken({ token, platform }));
      
      return subscription;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unsubscribeFromPush = createAsyncThunk(
  'notifications/unsubscribeFromPush',
  async (_, { rejectWithValue }) => {
    try {
      const success = await notificationService.unsubscribeFromPush();
      return success;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Real-time notification updates
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (action.payload.status !== 'read') {
        state.unreadCount += 1;
      }
    },
    
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n._id === action.payload._id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
    },
    
    // Update unread count
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    // Increment unread count
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    
    // Decrement unread count
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set push permission status
    setPushPermission: (state, action) => {
      state.pushPermission = action.payload;
    },
    
    // Set push subscription
    setPushSubscription: (state, action) => {
      state.pushSubscription = action.payload;
    },
    
    // Reset state
    resetNotifications: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({
          ...n,
          status: 'read',
          readAt: new Date().toISOString()
        }));
        state.unreadCount = 0;
      })
      
      // Fetch settings
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      
      // Update settings
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      
      // Fetch stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Push permission
      .addCase(requestPushPermission.fulfilled, (state, action) => {
        state.pushPermission = action.payload ? 'granted' : 'denied';
      })
      
      // Push subscription
      .addCase(subscribeToPush.fulfilled, (state, action) => {
        state.pushSubscription = action.payload;
      })
      .addCase(unsubscribeFromPush.fulfilled, (state) => {
        state.pushSubscription = null;
      });
  }
});

export const {
  addNotification,
  updateNotification,
  removeNotification,
  updateUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  clearError,
  setPushPermission,
  setPushSubscription,
  resetNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;