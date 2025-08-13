/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from 'react';
import { 
  detectPushSupport, 
  detectPlatform,
  decodeVapidKey, 
  generateExamplePayload,
  generateFCMPayload,
  validateNotificationPayload,
  PushSupport,
  PlatformInfo,
  NotificationPayload,
  PushHeaders,
  FCMWebpushPayload
} from '../lib/pushTester';

export interface PushTesterState {
  support: PushSupport;
  platform: PlatformInfo;
  registration: ServiceWorkerRegistration | null;
  subscription: PushSubscription | null;
  payload: NotificationPayload;
  headers: PushHeaders;
  status: 'idle' | 'registered' | 'subscribed' | 'notified';
  logs: string[];
  vapidKey: string;
  validationErrors: string[];
  sendMode: 'web-push' | 'fcm-v1';
}

export const usePushTester = () => {
  const [support, setSupport] = useState<PushSupport>(() => detectPushSupport());
  const [platform, setPlatform] = useState<PlatformInfo>(() => detectPlatform());
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [status, setStatus] = useState<'idle' | 'registered' | 'subscribed' | 'notified'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [vapidKey, setVapidKey] = useState('');
  const [sendMode, setSendMode] = useState<'web-push' | 'fcm-v1'>('web-push');
  
  // Initialize with platform-appropriate example payload
  const [payload, setPayload] = useState<NotificationPayload>(() => 
    generateExamplePayload(detectPlatform())
  );
  
  const [headers, setHeaders] = useState<PushHeaders>({
    ttl: 3600, // 1 hour
    urgency: 'normal',
    topic: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const newSupport = detectPushSupport();
    const newPlatform = detectPlatform();
    setSupport(newSupport);
    setPlatform(newPlatform);
    
    // Update payload with platform-specific capabilities
    setPayload(generateExamplePayload(newPlatform));
  }, []);

  useEffect(() => {
    // Validate payload whenever it changes
    const errors = validateNotificationPayload(payload);
    setValidationErrors(errors);
  }, [payload]);

  const log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timestamp}] ${msg}`]);
  };

  const register = async () => {
    try {
      if (!support.serviceWorker) throw new Error('Service Worker unsupported');
      
      log('Registering service worker...');
      const reg = await navigator.serviceWorker.register('/sw/push-tester-sw.js');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      setRegistration(reg);
      setStatus('registered');
      log('Service worker registered successfully');
    } catch (error: any) {
      log(`Registration failed: ${error.message}`);
      throw error;
    }
  };

  const subscribe = async () => {
    try {
      if (!registration) throw new Error('Register service worker first');
      if (!vapidKey.trim()) throw new Error('VAPID key is required');
      
      log('Creating push subscription...');
      const key = decodeVapidKey(vapidKey.trim());
      const sub = await registration.pushManager.subscribe({ 
        userVisibleOnly: true, 
        applicationServerKey: key 
      });
      
      setSubscription(sub);
      setStatus('subscribed');
      log('Push subscription created successfully');
    } catch (error: any) {
      log(`Subscription failed: ${error.message}`);
      throw error;
    }
  };

  const sendPush = async () => {
    try {
      if (!subscription) throw new Error('No subscription available');
      if (validationErrors.length > 0) throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      
      log(`Sending push notification via ${sendMode}...`);
      
      const requestBody = sendMode === 'fcm-v1' 
        ? { 
            action: 'push-fcm-v1', 
            subscription, 
            payload: generateFCMPayload(payload, headers) 
          }
        : { 
            action: 'push-web-push', 
            subscription, 
            notification: payload,
            headers 
          };

      const res = await fetch('/api/mydebugger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to send push');
      
      setStatus('notified');
      log('Push notification sent successfully!');
      
      if (platform.requiresClickForClose) {
        log('Note: On Safari, you may need to click the notification to close it');
      }
    } catch (error: any) {
      log(`Send failed: ${error.message}`);
      throw error;
    }
  };

  const copySubscription = async () => {
    try {
      if (!subscription) return;
      await navigator.clipboard.writeText(JSON.stringify(subscription, null, 2));
      log('Subscription JSON copied to clipboard');
    } catch (error: any) {
      log(`Copy failed: ${error.message}`);
    }
  };

  const copyPayload = async () => {
    try {
      const payloadToCopy = sendMode === 'fcm-v1' 
        ? generateFCMPayload(payload, headers)
        : { notification: payload, headers };
      
      await navigator.clipboard.writeText(JSON.stringify(payloadToCopy, null, 2));
      log(`${sendMode} payload copied to clipboard`);
    } catch (error: any) {
      log(`Copy payload failed: ${error.message}`);
    }
  };

  const generateCurlExample = (): string => {
    if (!subscription) return '';
    
    const endpoint = subscription.endpoint;
    const p256dhKey = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)));
    const authKey = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)));
    
    const payloadJson = sendMode === 'fcm-v1' 
      ? JSON.stringify(generateFCMPayload(payload, headers))
      : JSON.stringify(payload);
    
    const curlHeaders = [
      'Content-Type: application/json',
      `TTL: ${headers.ttl || 3600}`,
      `Urgency: ${headers.urgency || 'normal'}`,
    ];
    
    if (headers.topic) {
      curlHeaders.push(`Topic: ${headers.topic}`);
    }
    
    return `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "TTL: ${headers.ttl || 3600}" \\
  -H "Urgency: ${headers.urgency || 'normal'}" \\${headers.topic ? `\n  -H "Topic: ${headers.topic}" \\` : ''}
  -H "Content-Encoding: aes128gcm" \\
  -H "Crypto-Key: p256dh=${p256dhKey}" \\
  -H "Authorization: vapid t=[JWT_TOKEN], k=[VAPID_PUBLIC_KEY]" \\
  -d '${payloadJson}'`;
  };

  const updatePayloadField = <K extends keyof NotificationPayload>(
    field: K, 
    value: NotificationPayload[K]
  ) => {
    setPayload(prev => ({ ...prev, [field]: value }));
  };

  const updateHeaderField = <K extends keyof PushHeaders>(
    field: K, 
    value: PushHeaders[K]
  ) => {
    setHeaders(prev => ({ ...prev, [field]: value }));
  };

  const addAction = () => {
    const currentActions = payload.actions || [];
    if (currentActions.length >= 2) return; // Max 2 actions
    
    const newAction = {
      action: `action-${currentActions.length + 1}`,
      title: `Action ${currentActions.length + 1}`,
      icon: '/favicon.svg'
    };
    
    setPayload(prev => ({
      ...prev,
      actions: [...currentActions, newAction]
    }));
  };

  const removeAction = (index: number) => {
    const currentActions = payload.actions || [];
    setPayload(prev => ({
      ...prev,
      actions: currentActions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: keyof typeof payload.actions[0], value: string) => {
    const currentActions = payload.actions || [];
    const updatedActions = currentActions.map((action, i) => 
      i === index ? { ...action, [field]: value } : action
    );
    
    setPayload(prev => ({
      ...prev,
      actions: updatedActions
    }));
  };

  const resetToExample = () => {
    setPayload(generateExamplePayload(platform));
    setHeaders({
      ttl: 3600,
      urgency: 'normal',
      topic: ''
    });
    log('Reset to example payload');
  };

  const cleanup = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        log('Push subscription unsubscribed');
      }
      if (registration) {
        await registration.unregister();
        setRegistration(null);
        log('Service worker unregistered');
      }
      setStatus('idle');
      log('Cleanup completed');
    } catch (error: any) {
      log(`Cleanup failed: ${error.message}`);
    }
  };

  return {
    // State
    support,
    platform,
    registration,
    subscription,
    payload,
    headers,
    status,
    logs,
    vapidKey,
    validationErrors,
    sendMode,
    
    // Setters
    setVapidKey,
    setSendMode,
    updatePayloadField,
    updateHeaderField,
    
    // Actions
    register,
    subscribe,
    sendPush,
    copySubscription,
    copyPayload,
    generateCurlExample,
    resetToExample,
    cleanup,
    
    // Action management
    addAction,
    removeAction,
    updateAction,
  } as const;
};
