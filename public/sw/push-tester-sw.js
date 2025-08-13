/**
 * © 2025 MyDebugger Contributors – MIT License
 * Enhanced Push Tester Service Worker with full Web Push API support
 */

// Handle push events with full notification payload support
self.addEventListener('push', event => {
  console.log('[Push Tester SW] Push event received', event);
  
  let data;
  try {
    data = event.data?.json() ?? { title: 'MyDebugger Push', body: 'Default push notification' };
  } catch (error) {
    console.error('[Push Tester SW] Failed to parse push data:', error);
    data = { title: 'MyDebugger Push', body: 'Invalid payload format' };
  }

  // Build notification options with all supported fields
  const notificationOptions = {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    image: data.image,
    dir: data.dir || 'auto',
    lang: data.lang || 'en',
    vibrate: data.vibrate,
    tag: data.tag || 'mydebugger-push-test',
    renotify: data.renotify || false,
    silent: data.silent || false,
    requireInteraction: data.requireInteraction || false,
    timestamp: data.timestamp || Date.now(),
    actions: data.actions || [],
    data: {
      // Preserve original data and add service worker metadata
      ...data.data,
      originalPayload: data,
      swTimestamp: Date.now(),
      endpoint: self.registration.scope
    }
  };

  // Filter out undefined values to avoid browser warnings
  Object.keys(notificationOptions).forEach(key => {
    if (notificationOptions[key] === undefined) {
      delete notificationOptions[key];
    }
  });

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
      .then(() => {
        console.log('[Push Tester SW] Notification displayed successfully');
      })
      .catch(error => {
        console.error('[Push Tester SW] Failed to show notification:', error);
      })
  );
});

// Handle notification click events
self.addEventListener('notificationclick', event => {
  console.log('[Push Tester SW] Notification click event', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const originalPayload = notificationData.originalPayload || {};
  
  // Handle action clicks
  if (event.action) {
    console.log('[Push Tester SW] Action clicked:', event.action);
    
    // Handle built-in actions
    switch (event.action) {
      case 'view':
        handleViewAction(notificationData);
        break;
      case 'dismiss':
        // Just close the notification (already done above)
        console.log('[Push Tester SW] Notification dismissed via action');
        break;
      default:
        console.log('[Push Tester SW] Custom action clicked:', event.action);
        // For custom actions, still try to open URL if available
        handleViewAction(notificationData);
        break;
    }
  } else {
    // Handle main notification click
    console.log('[Push Tester SW] Main notification body clicked');
    handleViewAction(notificationData);
  }

  // Send analytics/telemetry data to main app if needed
  event.waitUntil(
    sendClickTelemetry({
      action: event.action || 'main',
      timestamp: Date.now(),
      notificationTag: event.notification.tag,
      data: notificationData
    })
  );
});

// Handle notification close events (when user dismisses without clicking)
self.addEventListener('notificationclose', event => {
  console.log('[Push Tester SW] Notification closed without clicking', event);
  
  const notificationData = event.notification.data || {};
  
  // Send close telemetry
  event.waitUntil(
    sendCloseTelemetry({
      timestamp: Date.now(),
      notificationTag: event.notification.tag,
      data: notificationData
    })
  );
});

// Helper function to handle view/open actions
function handleViewAction(notificationData) {
  const url = notificationData.url || 
               notificationData.originalPayload?.data?.url || 
               self.registration.scope;
  
  // Try to focus existing window or open new one
  return clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(clientList => {
      // Look for existing window with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          console.log('[Push Tester SW] Focusing existing window:', url);
          return client.focus();
        }
      }
      
      // Look for any window from the same origin
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          console.log('[Push Tester SW] Focusing existing app window and navigating');
          // Navigate to the target URL
          client.postMessage({
            type: 'NAVIGATE_TO',
            url: url
          });
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        console.log('[Push Tester SW] Opening new window:', url);
        return clients.openWindow(url);
      }
    })
    .catch(error => {
      console.error('[Push Tester SW] Error handling view action:', error);
    });
}

// Send click telemetry to the main application
function sendClickTelemetry(data) {
  return fetch('/api/mydebugger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'push-telemetry',
      type: 'click',
      data: data
    })
  }).catch(error => {
    console.error('[Push Tester SW] Failed to send click telemetry:', error);
  });
}

// Send close telemetry to the main application
function sendCloseTelemetry(data) {
  return fetch('/api/mydebugger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'push-telemetry',
      type: 'close',
      data: data
    })
  }).catch(error => {
    console.error('[Push Tester SW] Failed to send close telemetry:', error);
  });
}

// Listen for messages from the main application
self.addEventListener('message', event => {
  console.log('[Push Tester SW] Message received:', event.data);
  
  switch (event.data?.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLAIM_CLIENTS':
      self.clients.claim();
      break;
    case 'TEST_NOTIFICATION':
      // Handle test notification from main thread
      handleTestNotification(event.data.payload);
      break;
    default:
      console.log('[Push Tester SW] Unknown message type:', event.data?.type);
  }
});

// Handle test notifications sent from main thread
function handleTestNotification(payload) {
  console.log('[Push Tester SW] Handling test notification:', payload);
  
  try {
    // Build notification options with all supported fields
    const notificationOptions = {
      body: payload.body,
      icon: payload.icon || '/favicon.svg',
      badge: payload.badge || '/favicon.svg',
      image: payload.image,
      dir: payload.dir || 'auto',
      lang: payload.lang || 'en',
      vibrate: payload.vibrate,
      tag: payload.tag || 'mydebugger-test-notification',
      renotify: payload.renotify || false,
      silent: payload.silent || false,
      requireInteraction: payload.requireInteraction || false,
      timestamp: payload.timestamp || Date.now(),
      actions: payload.actions || [],
      data: {
        // Preserve original data and add service worker metadata
        ...payload.data,
        originalPayload: payload,
        swTimestamp: Date.now(),
        endpoint: self.registration.scope,
        testMode: true
      }
    };

    // Filter out undefined values to avoid browser warnings
    Object.keys(notificationOptions).forEach(key => {
      if (notificationOptions[key] === undefined) {
        delete notificationOptions[key];
      }
    });

    return self.registration.showNotification(payload.title || 'Test Notification', notificationOptions)
      .then(() => {
        console.log('[Push Tester SW] Test notification displayed successfully');
      })
      .catch(error => {
        console.error('[Push Tester SW] Failed to show test notification:', error);
      });
  } catch (error) {
    console.error('[Push Tester SW] Error handling test notification:', error);
  }
}

// Service worker lifecycle events
self.addEventListener('install', event => {
  console.log('[Push Tester SW] Installing service worker');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[Push Tester SW] Activating service worker');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

console.log('[Push Tester SW] Service worker script loaded and ready');
