// Service Worker for Push Notifications
const CACHE_NAME = 'afroverse-notifications-v1';
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Afroverse',
    body: 'You have a new notification',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        title: pushData.title || 'Afroverse',
        body: pushData.body || 'You have a new notification',
        icon: pushData.icon || '/icons/notification-icon.png',
        badge: pushData.badge || '/icons/badge-icon.png',
        data: {
          url: pushData.data?.actionUrl || '/',
          type: pushData.data?.type || 'general',
          notificationId: pushData.data?.notificationId
        },
        actions: pushData.actions || [],
        tag: pushData.tag || 'afroverse-notification',
        requireInteraction: pushData.requireInteraction || false
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data;
  const url = notificationData?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }

        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );

  // Send message to main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_CLICK',
        notification: event.notification,
        data: notificationData
      });
    });
  });
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);

  // Send message to main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSE',
        notification: event.notification
      });
    });
  });
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);

  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sync notification data
      syncNotifications()
    );
  }
});

// Message event
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sync notifications function
async function syncNotifications() {
  try {
    // Get stored notifications
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Process each notification
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const notification = await response.json();
        
        // Send to main thread
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NOTIFICATION_SYNC',
              notification: notification
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Cache management
self.addEventListener('fetch', (event) => {
  // Handle notification-related requests
  if (event.request.url.includes('/api/notifications')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available
          if (response) {
            return response;
          }

          // Otherwise fetch from network
          return fetch(event.request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                  });
              }
              return response;
            });
        })
    );
  }
});

console.log('Service Worker loaded');
