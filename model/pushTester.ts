/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface PushSupport {
  secure: boolean;
  serviceWorker: boolean;
  pushManager: boolean;
  notification: boolean;
}

export const detectPushSupport = (): PushSupport => ({
  secure: typeof window !== 'undefined' && (window as { isSecureContext?: boolean }).isSecureContext === true,
  serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  pushManager: typeof window !== 'undefined' && 'PushManager' in window,
  notification: typeof window !== 'undefined' && 'Notification' in window,
});

export const decodeVapidKey = (base64: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const str = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(str);
  return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)));
};
