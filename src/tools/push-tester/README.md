# Enhanced Web Push Tester

A comprehensive testing tool for modern Web Push notifications with full Notifications API and FCM v1 support.

## Features

### 🚀 Complete Web Push Implementation
- **All Notifications API fields** - title, body, icon, image, badge, actions, and more
- **Transport Headers** - TTL, Urgency, Topic (collapse key)
- **FCM v1 Envelope** - Full Firebase Cloud Messaging v1 webpush support
- **Platform Detection** - Automatic browser/OS detection with feature support
- **Event Handling** - Click, close, and action event handling in service worker

### 📱 Cross-Platform Support
- **Chrome** (Desktop + Android) - Full support
- **Firefox** (Desktop) - Full support  
- **Edge** (Desktop) - Full support
- **Safari** (macOS + iOS PWA) - Core support with platform-specific guidance
- **Mobile Browsers** - Optimized for mobile usage

### 🎯 Advanced Features
- **Notification Actions** - Up to 2 custom actions per notification
- **Media Support** - Icons, badges, hero images
- **Vibration Patterns** - Mobile vibration support
- **Custom Data** - Arbitrary JSON payload for click handling
- **Validation** - Real-time payload validation
- **Export Options** - cURL examples, JSON payloads

## Quick Start

### 1. Setup
1. Open the **Setup & Status** section
2. Verify browser support (green checkmarks)
3. Grant notification permissions if prompted
4. Use the sample VAPID key or provide your own
5. Register service worker and subscribe to push

### 2. Configure Notification
Navigate through the sections to configure your notification:

- **Basic Fields** - Title, body, language, direction
- **Media & Visuals** - Icon, badge, hero image URLs
- **Behavior** - Tags, timestamps, interaction requirements
- **Actions** - Custom action buttons (up to 2)
- **Transport Headers** - TTL, urgency, topic settings

### 3. Send & Test
1. Choose send mode (Raw Web Push or FCM v1)
2. Click "🚀 Send Push Notification"
3. Test click handling and actions
4. Review logs and telemetry

## Notification Fields Reference

### Basic Fields
| Field | Type | Description | Support |
|-------|------|-------------|---------|
| `title` | string | Notification title (required) | All browsers |
| `body` | string | Notification body text | All browsers |
| `dir` | enum | Text direction (auto/ltr/rtl) | All browsers |
| `lang` | string | Language code (BCP-47) | All browsers |

### Media Fields
| Field | Type | Description | Support |
|-------|------|-------------|---------|
| `icon` | URL | Small icon (32x32px recommended) | All browsers |
| `badge` | URL | Monochrome badge for mobile | All browsers |
| `image` | URL | Hero image (Chrome/Firefox/Edge) | Limited |

### Behavior Fields
| Field | Type | Description | Support |
|-------|------|-------------|---------|
| `tag` | string | Notification group identifier | All browsers |
| `renotify` | boolean | Re-alert for same tag | All browsers |
| `silent` | boolean | Silent notification | All browsers |
| `requireInteraction` | boolean | Persistent until clicked | All browsers |
| `timestamp` | number | Custom timestamp | Chrome/Firefox/Edge |
| `vibrate` | number[] | Vibration pattern (mobile) | Mobile Chrome/Firefox |

### Actions
| Field | Type | Description | Support |
|-------|------|-------------|---------|
| `actions` | array | Action buttons (max 2) | Chrome/Firefox/Edge |
| `action.action` | string | Action identifier | - |
| `action.title` | string | Button text | - |
| `action.icon` | URL | Button icon (optional) | - |

### Custom Data
| Field | Type | Description |
|-------|------|-------------|
| `data` | object | Arbitrary JSON for click handling |
| `data.url` | string | Target URL for click navigation |

## Transport Headers

### TTL (Time To Live)
- **Purpose**: Maximum time (seconds) to attempt delivery
- **Default**: 3600 (1 hour)
- **Range**: 0 to 2419200 (28 days)

### Urgency
- **very-low**: Background sync, no user interaction
- **low**: Non-time-critical updates  
- **normal**: Default priority (most messages)
- **high**: Time-sensitive alerts

### Topic (Collapse Key)
- **Purpose**: Replace pending notifications with same topic
- **Use Case**: Latest weather, sports scores, news updates
- **Limit**: Only one message per topic in queue

## FCM v1 Envelope Format

```json
{
  "notification": {
    "title": "Enhanced Push Test",
    "body": "Testing FCM v1 webpush envelope",
    "icon": "/favicon.svg",
    "actions": [
      {"action": "view", "title": "View Details"}
    ],
    "data": {
      "url": "https://example.com",
      "userId": 123
    }
  },
  "headers": {
    "ttl": 3600,
    "urgency": "normal",
    "topic": "news-updates"
  },
  "fcmOptions": {
    "link": "https://example.com/target",
    "analyticsLabel": "campaign_123"
  }
}
```

## Platform-Specific Notes

### iOS Safari
- **Requirement**: Must add to Home Screen as PWA
- **Limitations**: No notification actions, limited media support
- **Setup**: Share → Add to Home Screen → Open from Home Screen

### Desktop Safari
- **Support**: Basic notifications work
- **Limitations**: Some advanced features unavailable
- **Behavior**: User must click to dismiss notifications

### Chrome/Edge
- **Support**: Full Web Push API support
- **Features**: All notification fields, actions, media
- **Best Experience**: Recommended for comprehensive testing

### Firefox
- **Support**: Excellent Web Push support
- **Features**: Most notification fields supported
- **Quirks**: Some minor differences in action handling

## Service Worker Events

The enhanced service worker handles:

### Push Event
```javascript
self.addEventListener('push', event => {
  // Parse JSON payload
  // Display notification with all fields
  // Handle errors gracefully
});
```

### Notification Click
```javascript
self.addEventListener('notificationclick', event => {
  // Handle action clicks
  // Navigate to URLs from data
  // Focus/open windows
  // Send telemetry
});
```

### Notification Close
```javascript
self.addEventListener('notificationclose', event => {
  // Track dismissal analytics
  // Clean up resources
});
```

## VAPID Keys

### Sample Key (Testing Only)
```
BEl62iUYgUivxIkv69yViEuiBIa40HI0DLzx-SaBhLNdsbT6nOEYRSqGhE03c9NXbM6Zg8YDGu9C0qNqx5R_EJw
```

### Generate Your Own
```bash
npm install web-push -g
web-push generate-vapid-keys
```

## API Endpoints

### Web Push
```
POST /api/mydebugger
Content-Type: application/json

{
  "action": "push-web-push",
  "subscription": {...},
  "notification": {...},
  "headers": {...}
}
```

### FCM v1
```
POST /api/mydebugger
Content-Type: application/json

{
  "action": "push-fcm-v1", 
  "subscription": {...},
  "payload": {...}
}
```

## Troubleshooting

### Common Issues

**Notifications not showing**
- Check browser permissions
- Verify secure context (HTTPS)
- Ensure valid VAPID key
- Check browser console for errors

**Actions not working**
- Verify browser support (Chrome/Firefox/Edge)
- Check action array format
- Maximum 2 actions supported

**Images not displaying**
- Check image URL accessibility
- Verify browser support
- Ensure proper CORS headers

**iOS Safari issues**
- Must be added to Home Screen
- Must open from Home Screen icon
- Limited feature support

### Debug Tips
1. Open browser developer tools
2. Check Console tab for errors
3. Monitor Network tab for API calls
4. Review Application → Service Workers
5. Use the built-in activity logs

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| Basic Push | ✅ | ✅ | ✅ | ✅ | ✅ |
| Actions | ✅ | ✅ | ❌ | ✅ | ✅ |
| Images | ✅ | ✅ | ❌ | ✅ | Limited |
| Vibration | Mobile | Mobile | ❌ | Mobile | ✅ |
| Timestamp | ✅ | ✅ | ❌ | ✅ | ✅ |
| All Headers | ✅ | ✅ | Limited | ✅ | ✅ |

## Contributing

This push tester is part of the MyDebugger toolkit. Contributions welcome for:
- Additional browser support
- New notification features
- Platform-specific optimizations
- Bug fixes and improvements