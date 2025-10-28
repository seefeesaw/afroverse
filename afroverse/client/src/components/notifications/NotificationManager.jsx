import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import useNotification from '../hooks/useNotification';
import { addNotification, updateUnreadCount } from '../store/slices/notificationSlice';
import NotificationBanner from '../components/notifications/NotificationBanner';
import NotificationInbox from '../components/notifications/NotificationInbox';
import BattleAlertsBubble from '../components/notifications/BattleAlertsBubble';
import NotificationSettings from '../components/notifications/NotificationSettings';

const NotificationManager = () => {
  const dispatch = useDispatch();
  const {
    settings,
    refreshUnreadCount,
    handleRealtimeNotification,
    handleNotificationUpdate,
    handleNotificationRemoval,
    canReceiveNotification
  } = useNotification();

  const [socket, setSocket] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [inboxVisible, setInboxVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification socket');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification socket');
    });

    // Listen for new notifications
    newSocket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      
      // Check if user can receive this notification
      if (canReceiveNotification(notification.type, notification.channel)) {
        handleRealtimeNotification(notification);
        
        // Show banner for in-app notifications
        if (notification.channel === 'inapp' && settings.notifications.inapp.banner) {
          setCurrentBanner(notification);
          setBannerVisible(true);
        }
        
        // Play sound if enabled
        if (settings.notifications.inapp.sound) {
          playNotificationSound(notification.type);
        }
        
        // Vibrate if enabled
        if (settings.notifications.inapp.vibration && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    });

    // Listen for notification updates
    newSocket.on('notification_update', (notification) => {
      handleNotificationUpdate(notification);
    });

    // Listen for notification removals
    newSocket.on('notification_removed', (notificationId) => {
      handleNotificationRemoval(notificationId);
    });

    // Listen for unread count updates
    newSocket.on('unread_count_update', (count) => {
      dispatch(updateUnreadCount(count));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [dispatch, handleRealtimeNotification, handleNotificationUpdate, handleNotificationRemoval, canReceiveNotification, settings]);

  // Play notification sound based on type
  const playNotificationSound = (type) => {
    try {
      const audio = new Audio();
      
      const soundMap = {
        battle_challenge: '/sounds/battle-challenge.mp3',
        battle_live: '/sounds/battle-live.mp3',
        battle_result: '/sounds/battle-result.mp3',
        streak_reminder: '/sounds/streak-reminder.mp3',
        tribe_alert: '/sounds/tribe-alert.mp3',
        daily_challenge: '/sounds/daily-challenge.mp3',
        coin_earned: '/sounds/coin-earned.mp3',
        default: '/sounds/notification.mp3'
      };

      audio.src = soundMap[type] || soundMap.default;
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Error playing notification sound:', error);
    }
  };

  // Handle banner close
  const handleBannerClose = () => {
    setBannerVisible(false);
    setCurrentBanner(null);
  };

  // Handle banner action
  const handleBannerAction = (actionUrl) => {
    // Use your app's routing system here
    // For example, with React Router:
    // history.push(actionUrl);
    
    // Or open in new tab:
    window.open(actionUrl, '_blank');
    
    handleBannerClose();
  };

  // Handle notification click from battle alerts
  const handleBattleNotificationClick = (notification) => {
    if (notification.actionUrl) {
      // Use your app's routing system here
      // For example, with React Router:
      // history.push(notification.actionUrl);
      
      // Or open in new tab:
      window.open(notification.actionUrl, '_blank');
    }
  };

  // Register service worker for push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Listen for push events
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PUSH_RECEIVED') {
              const notification = event.data.notification;
              handleRealtimeNotification(notification);
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [handleRealtimeNotification]);

  // Set up notification click handlers
  useEffect(() => {
    const handleNotificationClick = (event) => {
      event.preventDefault();
      
      const notification = event.notification;
      const data = notification.data;
      
      if (data && data.actionUrl) {
        // Use your app's routing system here
        // For example, with React Router:
        // history.push(data.actionUrl);
        
        // Or open in new tab:
        window.open(data.actionUrl, '_blank');
      }
      
      notification.close();
    };

    // Listen for notification clicks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          handleNotificationClick(event.data);
        }
      });
    }

    return () => {
      // Cleanup listeners if needed
    };
  }, []);

  // Deep linking handler
  const handleDeepLink = (url) => {
    try {
      // Parse the URL and navigate accordingly
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const params = new URLSearchParams(urlObj.search);
      
      // Handle different notification types
      switch (true) {
        case path.includes('/battle/'):
          const battleId = path.split('/battle/')[1];
          // Navigate to battle page
          // history.push(`/battle/${battleId}`);
          break;
          
        case path.includes('/transform/'):
          // Navigate to transform page
          // history.push('/transform');
          break;
          
        case path.includes('/tribe/'):
          // Navigate to tribe page
          // history.push('/tribe');
          break;
          
        case path.includes('/profile/'):
          const userId = path.split('/profile/')[1];
          // Navigate to profile page
          // history.push(`/profile/${userId}`);
          break;
          
        case path.includes('/leaderboard'):
          // Navigate to leaderboard
          // history.push('/leaderboard');
          break;
          
        default:
          // Navigate to home or default page
          // history.push('/');
          break;
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  // Global notification handlers
  const showNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        ...options
      });

      notification.onclick = () => {
        if (options.data && options.data.actionUrl) {
          handleDeepLink(options.data.actionUrl);
        }
        notification.close();
      };

      return notification;
    }
  };

  // Expose global notification functions
  useEffect(() => {
    window.showNotification = showNotification;
    window.handleDeepLink = handleDeepLink;
    
    return () => {
      delete window.showNotification;
      delete window.handleDeepLink;
    };
  }, []);

  return (
    <>
      {/* Notification Banner */}
      <NotificationBanner
        notification={currentBanner}
        visible={bannerVisible}
        onClose={handleBannerClose}
        onAction={handleBannerAction}
      />

      {/* Notification Inbox */}
      <NotificationInbox
        visible={inboxVisible}
        onClose={() => setInboxVisible(false)}
        onSettingsClick={() => {
          setInboxVisible(false);
          setSettingsVisible(true);
        }}
      />

      {/* Battle Alerts Bubble */}
      <BattleAlertsBubble
        onNotificationClick={handleBattleNotificationClick}
      />

      {/* Notification Settings */}
      <NotificationSettings
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </>
  );
};

export default NotificationManager;
