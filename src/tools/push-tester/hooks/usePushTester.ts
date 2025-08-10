/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from 'react';
import { detectPushSupport, decodeVapidKey, PushSupport } from '../lib/pushTester';

interface NotificationPayload {
  title: string;
  body: string;
}

export interface PushTesterState {
  support: PushSupport;
  registration: ServiceWorkerRegistration | null;
  subscription: PushSubscription | null;
  payload: NotificationPayload;
  status: 'idle' | 'registered' | 'subscribed' | 'notified';
  logs: string[];
  vapidKey: string;
}

export const usePushTester = () => {
  const [support, setSupport] = useState<PushSupport>(() => detectPushSupport());
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [payload, setPayload] = useState<NotificationPayload>({ title: 'MyDebugger Push Test', body: 'Hello from the Push Tester module \u{1F44B}' });
  const [status, setStatus] = useState<'idle' | 'registered' | 'subscribed' | 'notified'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [vapidKey, setVapidKey] = useState('');

  useEffect(() => {
    setSupport(detectPushSupport());
  }, []);

  const log = (msg: string) => setLogs(l => [...l, msg]);

  const register = async () => {
    if (!support.serviceWorker) throw new Error('Service Worker unsupported');
    const reg = await navigator.serviceWorker.register('/sw/push-tester-sw.js');
    setRegistration(reg);
    setStatus('registered');
    log('Service worker registered');
  };

  const subscribe = async () => {
    if (!registration) throw new Error('Register service worker first');
    const key = decodeVapidKey(vapidKey.trim());
    const sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    setSubscription(sub);
    setStatus('subscribed');
    log('Push subscription created');
  };

  const sendPush = async () => {
    if (!subscription) throw new Error('No subscription');
    const res = await fetch('/api/mydebugger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'push-echo', subscription, notification: payload }),
    });
    if (!res.ok) throw new Error('Failed to send push');
    setStatus('notified');
    log('Push sent');
  };

  const copySubscription = async () => {
    if (!subscription) return;
    await navigator.clipboard.writeText(JSON.stringify(subscription));
    log('Subscription copied to clipboard');
  };

  const cleanup = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
    }
    if (registration) {
      await registration.unregister();
      setRegistration(null);
    }
    setStatus('idle');
    log('Cleaned up');
  };

  return {
    support,
    registration,
    subscription,
    payload,
    setPayload,
    status,
    logs,
    vapidKey,
    setVapidKey,
    register,
    subscribe,
    sendPush,
    copySubscription,
    cleanup,
  } as const;
};
