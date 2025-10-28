import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserPreferences,
  updateUserPreferences,
  subscribePush,
  unsubscribePush,
  fetchNotificationHistory,
  testPushNotification,
  addBanner,
  removeBanner,
  clearAllBanners,
  updatePushPermission,
  updatePushSubscription,
  updateAnalytics,
  enableRealTimeUpdates,
  disableRealTimeUpdates,
  clearErrors,
  resetNotifications
} from '../store/slices/notificationSlice';
import { useAuth } from './useAuth';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const notificationState = useSelector(state => state.notifications);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [serviceWorker, setServiceWorker] = useState(null);

  // Initialize notifications
  const initialize = useCallback(async () => {
    try {
      // Fetch user preferences
      await dispatch(fetchUserPreferences());
      
      // Initialize push notifications
      await initializePushNotifications();
      
      // Register service worker
      await registerServiceWorker();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }, [dispatch]);

  // Initialize push notifications
  const initializePushNotifications = useCallback(async () => {
    try {
      if (!notificationState.pushNotification.supported) {
        return;
      }

      // Check current permission
      const permission = Notification.permission;
      dispatch(updatePushPermission(permission));

      if (permission === 'granted') {
        // Get existing subscription
        const token = await notificationService.getPushToken();
        if (token) {
          dispatch(updatePushSubscription({ subscribed: true, token }));
        }
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }, [dispatch, notificationState.pushNotification.supported]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await notificationService.registerServiceWorker();
        setServiceWorker(registration);
        
        // Listen for push events
        registration.addEventListener('push', handlePushEvent);
        registration.addEventListener('notificationclick', handleNotificationClick);
      }
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
  }, []);

  // Handle push event
  const handlePushEvent = useCallback((event) => {
    try {
      const data = event.data ? event.data.json() : {};
      
      // Show notification
      const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: data.campaignId,
        data: data
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (error) {
      console.error('Error handling push event:', error);
    }
  }, []);

  // Handle notification click
  const handleNotificationClick = useCallback((event) => {
    try {
      event.notification.close();
      
      const data = event.notification.data;
      if (data && data.deeplink) {
        // Open deeplink
        window.open(data.deeplink, '_blank');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  }, []);

  // Request push permission
  const requestPushPermission = useCallback(async () => {
    try {
      const result = await notificationService.requestPushPermission();
      
      if (result.granted) {
        // Subscribe to push
        const subscription = await notificationService.subscribeToPush();
        const token = subscription.endpoint;
        
        // Register with backend
        await dispatch(subscribePush({ token, platform: 'web' }));
        
        dispatch(updatePushSubscription({ subscribed: true, token }));
      }
      
      dispatch(updatePushPermission(result.permission));
      return result;
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return { granted: false, permission: 'denied', error: error.message };
    }
  }, [dispatch]);

  // Unsubscribe from push
  const unsubscribeFromPush = useCallback(async () => {
    try {
      const token = notificationState.pushNotification.token;
      if (token) {
        await dispatch(unsubscribePush(token));
        await notificationService.unsubscribeFromPush();
        dispatch(updatePushSubscription({ subscribed: false, token: null }));
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
    }
  }, [dispatch, notificationState.pushNotification.token]);

  // Update preferences
  const updatePreferences = useCallback(async (preferences) => {
    try {
      await dispatch(updateUserPreferences(preferences));
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }, [dispatch]);

  // Show banner
  const showBanner = useCallback((banner) => {
    const bannerData = notificationService.showBanner(banner);
    dispatch(addBanner(bannerData));
    
    // Auto-dismiss after duration
    setTimeout(() => {
      dispatch(removeBanner(bannerData.id));
    }, bannerData.duration);
    
    return bannerData.id;
  }, [dispatch]);

  // Dismiss banner
  const dismissBanner = useCallback((bannerId) => {
    dispatch(removeBanner(bannerId));
  }, [dispatch]);

  // Clear all banners
  const clearBanners = useCallback(async () => {
    try {
      await notificationService.clearAllBanners();
      dispatch(clearAllBanners());
    } catch (error) {
      console.error('Error clearing banners:', error);
    }
  }, [dispatch]);

  // Handle banner action
  const handleBannerAction = useCallback(async (bannerId, actionId) => {
    try {
      await notificationService.handleBannerAction(bannerId, actionId);
      
      // Dismiss banner after action
      dispatch(removeBanner(bannerId));
    } catch (error) {
      console.error('Error handling banner action:', error);
    }
  }, [dispatch]);

  // Test push notification
  const testPush = useCallback(async (title, body) => {
    try {
      await dispatch(testPushNotification({ title, body }));
    } catch (error) {
      console.error('Error testing push notification:', error);
      throw error;
    }
  }, [dispatch]);

  // Get notification history
  const getNotificationHistory = useCallback(async (limit = 50) => {
    try {
      await dispatch(fetchNotificationHistory(limit));
    } catch (error) {
      console.error('Error fetching notification history:', error);
      throw error;
    }
  }, [dispatch]);

  // Get preferences
  const getPreferences = useCallback(() => {
    return notificationState.preferences;
  }, [notificationState.preferences]);

  // Get active banners
  const getActiveBanners = useCallback(() => {
    return notificationState.activeBanners;
  }, [notificationState.activeBanners]);

  // Get push notification status
  const getPushStatus = useCallback(() => {
    return notificationState.pushNotification;
  }, [notificationState.pushNotification]);

  // Get analytics
  const getAnalytics = useCallback(() => {
    return notificationState.analytics;
  }, [notificationState.analytics]);

  // Check if channel is enabled
  const isChannelEnabled = useCallback((channel) => {
    return notificationState.preferences.channels[channel]?.enabled || false;
  }, [notificationState.preferences.channels]);

  // Check if category is enabled
  const isCategoryEnabled = useCallback((category) => {
    return notificationState.preferences.categories[category] || false;
  }, [notificationState.preferences.categories]);

  // Get quiet hours status
  const isInQuietHours = useCallback(() => {
    if (!notificationState.preferences.quietHours.enabled) {
      return false;
    }
    
    const now = new Date();
    const tz = notificationState.preferences.quietHours.timezone;
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const currentHour = localTime.getHours();
    const currentMinute = localTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const startTime = parseTimeString(notificationState.preferences.quietHours.start);
    const endTime = parseTimeString(notificationState.preferences.quietHours.end);
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }, [notificationState.preferences.quietHours]);

  // Parse time string (HH:MM) to minutes
  const parseTimeString = useCallback((timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Validate preferences
  const validatePreferences = useCallback((preferences) => {
    return notificationService.validatePreferences(preferences);
  }, []);

  // Get channel display name
  const getChannelDisplayName = useCallback((channel) => {
    return notificationService.getChannelDisplayName(channel);
  }, []);

  // Get category display name
  const getCategoryDisplayName = useCallback((category) => {
    return notificationService.getCategoryDisplayName(category);
  }, []);

  // Get status display name
  const getStatusDisplayName = useCallback((status) => {
    return notificationService.getStatusDisplayName(status);
  }, []);

  // Get status color
  const getStatusColor = useCallback((status) => {
    return notificationService.getStatusColor(status);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (user && !isInitialized) {
      initialize();
    }
  }, [user, initialize, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(disableRealTimeUpdates());
    };
  }, [dispatch]);

  return {
    // State
    ...notificationState,
    isInitialized,
    serviceWorker,
    
    // Actions
    initialize,
    updatePreferences,
    requestPushPermission,
    unsubscribeFromPush,
    showBanner,
    dismissBanner,
    clearBanners,
    handleBannerAction,
    testPush,
    getNotificationHistory,
    
    // Getters
    getPreferences,
    getActiveBanners,
    getPushStatus,
    getAnalytics,
    isChannelEnabled,
    isCategoryEnabled,
    isInQuietHours,
    
    // Utilities
    validatePreferences,
    getChannelDisplayName,
    getCategoryDisplayName,
    getStatusDisplayName,
    getStatusColor,
    
    // Redux actions
    clearErrors: () => dispatch(clearErrors()),
    resetNotifications: () => dispatch(resetNotifications()),
    enableRealTimeUpdates: () => dispatch(enableRealTimeUpdates()),
    disableRealTimeUpdates: () => dispatch(disableRealTimeUpdates())
  };
};

export default useNotifications;
