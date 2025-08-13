/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface PushSupport {
  secure: boolean;
  serviceWorker: boolean;
  pushManager: boolean;
  notification: boolean;
}

// Full Notifications API payload interface
export interface NotificationPayload {
  // Basic fields
  title: string;
  body?: string;
  
  // Media fields
  icon?: string;
  image?: string;
  badge?: string;
  
  // Behavior fields
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  vibrate?: number[];
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  requireInteraction?: boolean;
  timestamp?: number;
  
  // Actions
  actions?: NotificationAction[];
  
  // Custom data for click handling
  data?: any;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Transport headers for Push Protocol
export interface PushHeaders {
  ttl?: number; // Time to live in seconds
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  topic?: string; // Collapse key
}

// FCM v1 webpush envelope
export interface FCMWebpushPayload {
  notification: NotificationPayload;
  headers?: PushHeaders;
  fcmOptions?: {
    link?: string; // Click target URL
    analyticsLabel?: string;
  };
}

// Platform detection
export interface PlatformInfo {
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
  os: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown';
  mobile: boolean;
  supportsActions: boolean;
  supportsImage: boolean;
  supportsVibrate: boolean;
  supportsTimestamp: boolean;
  requiresClickForClose: boolean;
}

export const detectPushSupport = (): PushSupport => ({
  secure: typeof window !== 'undefined' && (window as { isSecureContext?: boolean }).isSecureContext === true,
  serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  pushManager: typeof window !== 'undefined' && 'PushManager' in window,
  notification: typeof window !== 'undefined' && 'Notification' in window,
});

export const detectPlatform = (): PlatformInfo => {
  if (typeof navigator === 'undefined') {
    return {
      browser: 'unknown',
      os: 'unknown',
      mobile: false,
      supportsActions: false,
      supportsImage: false,
      supportsVibrate: false,
      supportsTimestamp: false,
      requiresClickForClose: false,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isEdge = /edg/.test(userAgent);
  
  const browser = isChrome ? 'chrome' : isFirefox ? 'firefox' : isSafari ? 'safari' : isEdge ? 'edge' : 'unknown';
  
  const isAndroid = /android/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isWindows = /win/.test(userAgent);
  const isMacOS = /mac/.test(userAgent) && !isIOS;
  const isLinux = /linux/.test(userAgent) && !isAndroid;
  
  const os = isAndroid ? 'android' : isIOS ? 'ios' : isWindows ? 'windows' : isMacOS ? 'macos' : isLinux ? 'linux' : 'unknown';
  const mobile = isAndroid || isIOS;
  
  return {
    browser,
    os,
    mobile,
    supportsActions: isChrome || isFirefox || isEdge,
    supportsImage: isChrome || isFirefox || isEdge,
    supportsVibrate: mobile && (isChrome || isFirefox),
    supportsTimestamp: isChrome || isFirefox || isEdge,
    requiresClickForClose: isSafari,
  };
};

export const decodeVapidKey = (base64: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const str = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(str);
  return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)));
};

// Generate example payloads
export const generateExamplePayload = (platform: PlatformInfo): NotificationPayload => ({
  title: 'MyDebugger Push Test',
  body: 'This is a comprehensive test of web push notifications! 🚀',
  icon: '/favicon.svg',
  image: platform.supportsImage ? 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Push+Test+Image' : undefined,
  badge: '/favicon.svg',
  dir: 'auto',
  lang: 'en',
  vibrate: platform.supportsVibrate ? [200, 100, 200] : undefined,
  tag: 'mydebugger-enhanced-test',
  renotify: false,
  silent: false,
  requireInteraction: false,
  timestamp: platform.supportsTimestamp ? Date.now() : undefined,
  actions: platform.supportsActions ? [
    { action: 'view', title: 'View Details', icon: '/favicon.svg' },
    { action: 'dismiss', title: 'Dismiss' }
  ] : undefined,
  data: {
    url: 'https://mydebugger.dev',
    timestamp: Date.now(),
    source: 'push-tester'
  }
});

export const generateFCMPayload = (notification: NotificationPayload, headers: PushHeaders): FCMWebpushPayload => ({
  notification,
  headers,
  fcmOptions: {
    link: notification.data?.url || 'https://mydebugger.dev',
    analyticsLabel: 'push_test'
  }
});

// Validation helpers
export const validateNotificationPayload = (payload: NotificationPayload): string[] => {
  const errors: string[] = [];
  
  if (!payload.title.trim()) {
    errors.push('Title is required');
  }
  
  if (payload.title.length > 200) {
    errors.push('Title should be under 200 characters');
  }
  
  if (payload.body && payload.body.length > 1000) {
    errors.push('Body should be under 1000 characters');
  }
  
  if (payload.actions && payload.actions.length > 2) {
    errors.push('Maximum 2 actions are supported');
  }
  
  if (payload.vibrate && payload.vibrate.length > 31) {
    errors.push('Vibration pattern should have maximum 31 values');
  }
  
  return errors;
};

export const getSupportedFields = (platform: PlatformInfo): (keyof NotificationPayload)[] => {
  const base: (keyof NotificationPayload)[] = ['title', 'body', 'icon', 'badge', 'dir', 'lang', 'tag', 'renotify', 'silent', 'requireInteraction', 'data'];
  
  if (platform.supportsActions) {
    base.push('actions');
  }
  
  if (platform.supportsImage) {
    base.push('image');
  }
  
  if (platform.supportsVibrate) {
    base.push('vibrate');
  }
  
  if (platform.supportsTimestamp) {
    base.push('timestamp');
  }
  
  return base;
};
