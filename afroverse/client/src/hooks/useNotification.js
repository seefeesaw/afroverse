import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  fetchSettings,
  updateSettings,
  registerDeviceToken,
  removeDeviceToken,
  registerWhatsAppPhone,
  removeWhatsAppPhone,
  fetchStats,
  requestPushPermission,
  subscribeToPush,
  unsubscribeFromPush,
  addNotification,
  updateNotification,
  removeNotification,
  updateUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  clearError,
  setPushPermission,
  setPushSubscription
} from '../store/slices/notificationSlice';
import notificationService from '../services/notificationService';

const useNotification = () => {
  const dispatch = useDispatch();
  const {
    notifications,
    unreadCount,
    settings,
    stats,
    loading,
    error,
    lastFetch,
    pushPermission,
    pushSubscription
  } = useSelector((state) => state.notifications);

  // Initialize notification system
  useEffect(() => {
    // Check push permission status
    if ('Notification' in window) {
      dispatch(setPushPermission(Notification.permission));
    }

    // Fetch initial data
    dispatch(fetchUnreadCount());
    dispatch(fetchSettings());
    dispatch(fetchStats());

    // Set up service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Set up notification click handler
    const handleNotificationClick = (event) => {
      const notification = event.notification;
      notificationService.handleNotificationClick(notification);
    };

    // Listen for notification clicks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          handleNotificationClick(event.data);
        }
      });
    }

  }, [dispatch]);

  // Fetch notifications with pagination
  const getNotifications = useCallback((params = {}) => {
    return dispatch(fetchNotifications(params));
  }, [dispatch]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(() => {
    return dispatch(fetchUnreadCount());
  }, [dispatch]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    return dispatch(markAsRead(notificationId));
  }, [dispatch]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    return dispatch(markAllAsRead());
  }, [dispatch]);

  // Update notification settings
  const updateNotificationSettings = useCallback((newSettings) => {
    return dispatch(updateSettings(newSettings));
  }, [dispatch]);

  // Register device token for push notifications
  const registerPushToken = useCallback(async (token, platform) => {
    try {
      await dispatch(registerDeviceToken({ token, platform }));
      return true;
    } catch (error) {
      console.error('Failed to register device token:', error);
      return false;
    }
  }, [dispatch]);

  // Remove device token
  const removePushToken = useCallback(async (token) => {
    try {
      await dispatch(removeDeviceToken(token));
      return true;
    } catch (error) {
      console.error('Failed to remove device token:', error);
      return false;
    }
  }, [dispatch]);

  // Register WhatsApp phone number
  const registerWhatsApp = useCallback(async (phoneNumber) => {
    try {
      await dispatch(registerWhatsAppPhone(phoneNumber));
      return true;
    } catch (error) {
      console.error('Failed to register WhatsApp phone:', error);
      return false;
    }
  }, [dispatch]);

  // Remove WhatsApp phone number
  const removeWhatsApp = useCallback(async () => {
    try {
      await dispatch(removeWhatsAppPhone());
      return true;
    } catch (error) {
      console.error('Failed to remove WhatsApp phone:', error);
      return false;
    }
  }, [dispatch]);

  // Request push notification permission
  const requestPermission = useCallback(async () => {
    try {
      const granted = await dispatch(requestPushPermission());
      return granted.payload;
    } catch (error) {
      console.error('Failed to request push permission:', error);
      return false;
    }
  }, [dispatch]);

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async (vapidPublicKey) => {
    try {
      const subscription = await dispatch(subscribeToPush(vapidPublicKey));
      return subscription.payload;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }, [dispatch]);

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = useCallback(async () => {
    try {
      const success = await dispatch(unsubscribeFromPush());
      return success.payload;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [dispatch]);

  // Show local notification
  const showLocalNotification = useCallback((title, options = {}) => {
    try {
      return notificationService.showLocalNotification(title, options);
    } catch (error) {
      console.error('Failed to show local notification:', error);
      return null;
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async (type, channel, message) => {
    try {
      const result = await notificationService.sendTestNotification(type, channel, message);
      return result;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }, []);

  // Real-time notification handlers
  const handleRealtimeNotification = useCallback((notification) => {
    dispatch(addNotification(notification));
    if (notification.status !== 'read') {
      dispatch(incrementUnreadCount());
    }
  }, [dispatch]);

  const handleNotificationUpdate = useCallback((notification) => {
    dispatch(updateNotification(notification));
  }, [dispatch]);

  const handleNotificationRemoval = useCallback((notificationId) => {
    dispatch(removeNotification(notificationId));
    dispatch(decrementUnreadCount());
  }, [dispatch]);

  // Clear error
  const clearNotificationError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if user can receive notifications
  const canReceiveNotification = useCallback((type, channel) => {
    const channelSettings = settings.notifications[channel];
    if (!channelSettings || !channelSettings.enabled) {
      return false;
    }

    // Check specific type setting
    if (channelSettings[type] !== undefined) {
      return channelSettings[type];
    }

    // Check quiet hours
    if (settings.timing.quietHours.enabled) {
      const now = new Date();
      const userTime = new Date(now.toLocaleString("en-US", { timeZone: settings.timing.timezone }));
      const currentTime = userTime.getHours() * 60 + userTime.getMinutes();
      
      const startTime = parseTime(settings.timing.quietHours.start);
      const endTime = parseTime(settings.timing.quietHours.end);
      
      if (startTime <= endTime) {
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      } else {
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      }
    }

    return true;
  }, [settings]);

  // Helper function to parse time
  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Get notification by ID
  const getNotificationById = useCallback((id) => {
    return notifications.find(n => n._id === id);
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => n.status !== 'read');
  }, [notifications]);

  // Check if push notifications are supported
  const isPushSupported = useCallback(() => {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }, []);

  // Check if push notifications are enabled
  const isPushEnabled = useCallback(() => {
    return pushPermission === 'granted' && !!pushSubscription;
  }, [pushPermission, pushSubscription]);

  return {
    // State
    notifications,
    unreadCount,
    settings,
    stats,
    loading,
    error,
    lastFetch,
    pushPermission,
    pushSubscription,

    // Actions
    getNotifications,
    refreshUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateNotificationSettings,
    registerPushToken,
    removePushToken,
    registerWhatsApp,
    removeWhatsApp,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showLocalNotification,
    sendTestNotification,
    clearNotificationError,

    // Real-time handlers
    handleRealtimeNotification,
    handleNotificationUpdate,
    handleNotificationRemoval,

    // Utilities
    canReceiveNotification,
    getNotificationById,
    getNotificationsByType,
    getUnreadNotifications,
    isPushSupported,
    isPushEnabled
  };
};

export default useNotification;
