/**
 * © 2025 MyDebugger Contributors – MIT License
 * Permission definitions, request functions, and utilities.
 */

export type PermissionCategory =
  | 'media'
  | 'location'
  | 'sensors'
  | 'device'
  | 'storage'
  | 'system';

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface PermissionDef {
  id: string;
  displayName: string;
  description: string;
  category: PermissionCategory;
  /** Icon name (emoji or lucide icon string – rendered by caller) */
  icon: string;
  /** Called to request the permission; resolves with live data or undefined */
  requestFn: () => Promise<unknown>;
  /** Whether a live preview panel is available for this permission */
  hasLivePreview: boolean;
  /** Name for navigator.permissions.query(), if supported */
  permissionsApiName?: string;
}

// ---------------------------------------------------------------------------
// Helper: getUserMedia shorthand
// ---------------------------------------------------------------------------
function gum(constraints: MediaStreamConstraints): () => Promise<MediaStream> {
  return () => navigator.mediaDevices.getUserMedia(constraints);
}

// ---------------------------------------------------------------------------
// Permission definitions
// ---------------------------------------------------------------------------
export const PERMISSIONS: PermissionDef[] = [
  // ── MEDIA ────────────────────────────────────────────────────────────────
  {
    id: 'camera',
    displayName: 'Camera',
    description: 'Access the device camera for video capture.',
    category: 'media',
    icon: '📷',
    requestFn: gum({ video: true }),
    hasLivePreview: true,
    permissionsApiName: 'camera',
  },
  {
    id: 'microphone',
    displayName: 'Microphone',
    description: 'Access the device microphone for audio input.',
    category: 'media',
    icon: '🎤',
    requestFn: gum({ audio: true }),
    hasLivePreview: true,
    permissionsApiName: 'microphone',
  },
  {
    id: 'display-capture',
    displayName: 'Screen Capture',
    description: 'Capture the screen, window, or tab content.',
    category: 'media',
    icon: '🖥️',
    requestFn: () => (navigator.mediaDevices as any).getDisplayMedia({ video: true }),
    hasLivePreview: true,
  },
  // ── LOCATION ─────────────────────────────────────────────────────────────
  {
    id: 'geolocation',
    displayName: 'Geolocation',
    description: 'Read the device geographic position.',
    category: 'location',
    icon: '📍',
    requestFn: () =>
      new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        }),
      ),
    hasLivePreview: true,
    permissionsApiName: 'geolocation',
  },
  // ── SENSORS ──────────────────────────────────────────────────────────────
  {
    id: 'accelerometer',
    displayName: 'Accelerometer',
    description: 'Read linear acceleration along X, Y, Z axes.',
    category: 'sensors',
    icon: '📱',
    requestFn: async () => {
      await (navigator.permissions as any).query({ name: 'accelerometer' });
      const s = new (window as any).Accelerometer({ frequency: 10 });
      return new Promise<unknown>((resolve, reject) => {
        s.addEventListener('reading', () => {
          resolve({ x: s.x, y: s.y, z: s.z, sensor: s });
        });
        s.addEventListener('error', reject);
        s.start();
      });
    },
    hasLivePreview: true,
  },
  {
    id: 'gyroscope',
    displayName: 'Gyroscope',
    description: 'Read angular velocity along X, Y, Z axes.',
    category: 'sensors',
    icon: '🔄',
    requestFn: async () => {
      await (navigator.permissions as any).query({ name: 'gyroscope' });
      const s = new (window as any).Gyroscope({ frequency: 10 });
      return new Promise<unknown>((resolve, reject) => {
        s.addEventListener('reading', () => {
          resolve({ x: s.x, y: s.y, z: s.z, sensor: s });
        });
        s.addEventListener('error', reject);
        s.start();
      });
    },
    hasLivePreview: true,
  },
  {
    id: 'magnetometer',
    displayName: 'Magnetometer',
    description: 'Read magnetic field strength along X, Y, Z axes.',
    category: 'sensors',
    icon: '🧲',
    requestFn: async () => {
      await (navigator.permissions as any).query({ name: 'magnetometer' });
      const s = new (window as any).Magnetometer({ frequency: 10 });
      return new Promise<unknown>((resolve, reject) => {
        s.addEventListener('reading', () => {
          resolve({ x: s.x, y: s.y, z: s.z, sensor: s });
        });
        s.addEventListener('error', reject);
        s.start();
      });
    },
    hasLivePreview: true,
  },
  {
    id: 'ambient-light-sensor',
    displayName: 'Ambient Light Sensor',
    description: 'Read ambient light level in lux.',
    category: 'sensors',
    icon: '💡',
    requestFn: async () => {
      await (navigator.permissions as any).query({ name: 'ambient-light-sensor' });
      const s = new (window as any).AmbientLightSensor();
      return new Promise<unknown>((resolve, reject) => {
        s.addEventListener('reading', () => {
          resolve({ illuminance: s.illuminance, sensor: s });
        });
        s.addEventListener('error', reject);
        s.start();
      });
    },
    hasLivePreview: true,
  },
  // ── DEVICE ───────────────────────────────────────────────────────────────
  {
    id: 'bluetooth',
    displayName: 'Bluetooth',
    description: 'Discover and connect to nearby Bluetooth devices.',
    category: 'device',
    icon: '🔷',
    requestFn: async () => {
      const device = await (navigator as any).bluetooth.requestDevice({ acceptAllDevices: true });
      return { name: device.name, id: device.id, connected: device.gatt?.connected ?? false };
    },
    hasLivePreview: true,
  },
  {
    id: 'usb',
    displayName: 'USB',
    description: 'Connect to USB devices from the browser.',
    category: 'device',
    icon: '🔌',
    requestFn: async () => {
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      return {
        productName: device.productName,
        manufacturerName: device.manufacturerName,
        serialNumber: device.serialNumber,
        vendorId: device.vendorId,
        productId: device.productId,
      };
    },
    hasLivePreview: true,
  },
  {
    id: 'serial',
    displayName: 'Serial Port',
    description: 'Communicate with serial devices (Arduino, etc.).',
    category: 'device',
    icon: '🔗',
    requestFn: async () => {
      const port = await (navigator as any).serial.requestPort();
      const info = port.getInfo();
      return { usbVendorId: info.usbVendorId, usbProductId: info.usbProductId };
    },
    hasLivePreview: true,
  },
  {
    id: 'hid',
    displayName: 'HID Device',
    description: 'Access Human Interface Devices (gamepads, keyboards).',
    category: 'device',
    icon: '🎮',
    requestFn: async () => {
      const [device] = await (navigator as any).hid.requestDevice({ filters: [] });
      return { productName: device.productName, vendorId: device.vendorId, productId: device.productId };
    },
    hasLivePreview: true,
  },
  {
    id: 'midi',
    displayName: 'MIDI',
    description: 'Access MIDI input/output devices.',
    category: 'device',
    icon: '🎹',
    requestFn: async () => {
      const access = await (navigator as any).requestMIDIAccess();
      const inputs = [...access.inputs.values()].map((i: any) => i.name);
      const outputs = [...access.outputs.values()].map((o: any) => o.name);
      return { inputs, outputs };
    },
    hasLivePreview: true,
  },
  {
    id: 'nfc',
    displayName: 'NFC',
    description: 'Read NFC tags using the Web NFC API.',
    category: 'device',
    icon: '📶',
    requestFn: async () => {
      const reader = new (window as any).NDEFReader();
      await reader.scan();
      return { reader, records: [] };
    },
    hasLivePreview: true,
  },
  {
    id: 'speaker-selection',
    displayName: 'Speaker Selection',
    description: 'Enumerate and select audio output devices.',
    category: 'device',
    icon: '🔊',
    requestFn: async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const speakers = devices.filter(d => d.kind === 'audiooutput');
      return speakers.map(d => ({ label: d.label, deviceId: d.deviceId, groupId: d.groupId }));
    },
    hasLivePreview: true,
    permissionsApiName: 'speaker-selection',
  },
  // ── STORAGE ──────────────────────────────────────────────────────────────
  {
    id: 'persistent-storage',
    displayName: 'Persistent Storage',
    description: 'Request durable storage that survives browser clean-up.',
    category: 'storage',
    icon: '💾',
    requestFn: async () => {
      const persisted = await navigator.storage.persist();
      const estimate = await navigator.storage.estimate();
      return { persisted, quota: estimate.quota, usage: estimate.usage };
    },
    hasLivePreview: true,
    permissionsApiName: 'persistent-storage',
  },
  {
    id: 'storage-access',
    displayName: 'Storage Access',
    description: 'Request access to first-party storage from an embedded context.',
    category: 'storage',
    icon: '🗄️',
    requestFn: async () => {
      await (document as any).requestStorageAccess();
      return { granted: true };
    },
    hasLivePreview: false,
  },
  {
    id: 'local-fonts',
    displayName: 'Local Fonts',
    description: 'Enumerate fonts installed on the device.',
    category: 'storage',
    icon: '🔤',
    requestFn: async () => {
      const fonts = await (window as any).queryLocalFonts();
      return { count: fonts.length, sample: fonts.slice(0, 5).map((f: any) => f.family) };
    },
    hasLivePreview: true,
    permissionsApiName: 'local-fonts',
  },
  // ── SYSTEM ────────────────────────────────────────────────────────────────
  {
    id: 'notifications',
    displayName: 'Notifications',
    description: 'Show desktop push notifications to the user.',
    category: 'system',
    icon: '🔔',
    requestFn: async () => {
      const result = await Notification.requestPermission();
      if (result !== 'granted') throw new Error('Notification permission denied');
      return { permission: result };
    },
    hasLivePreview: true,
    permissionsApiName: 'notifications',
  },
  {
    id: 'clipboard-read',
    displayName: 'Clipboard Read',
    description: 'Read text and data from the system clipboard.',
    category: 'system',
    icon: '📋',
    requestFn: async () => {
      const text = await navigator.clipboard.readText();
      return { text: text.slice(0, 200) };
    },
    hasLivePreview: true,
    permissionsApiName: 'clipboard-read',
  },
  {
    id: 'clipboard-write',
    displayName: 'Clipboard Write',
    description: 'Write text and data to the system clipboard.',
    category: 'system',
    icon: '✏️',
    requestFn: async () => {
      await navigator.clipboard.writeText('MyDebugger clipboard test');
      return { written: 'MyDebugger clipboard test' };
    },
    hasLivePreview: true,
    permissionsApiName: 'clipboard-write',
  },
  {
    id: 'idle-detection',
    displayName: 'Idle Detection',
    description: 'Detect when the user is idle or the screen is locked.',
    category: 'system',
    icon: '😴',
    requestFn: async () => {
      const result = await (window as any).IdleDetector.requestPermission();
      if (result !== 'granted') throw new Error('Idle detection permission denied');
      const detector = new (window as any).IdleDetector();
      await detector.start({ threshold: 60000 });
      return { userState: detector.userState, screenState: detector.screenState, detector };
    },
    hasLivePreview: true,
    permissionsApiName: 'idle-detection',
  },
  {
    id: 'compute-pressure',
    displayName: 'Compute Pressure',
    description: 'Monitor CPU compute pressure level.',
    category: 'system',
    icon: '⚡',
    requestFn: async () => {
      return new Promise<unknown>((resolve, reject) => {
        const observer = new (window as any).PressureObserver((records: any[]) => {
          const last = records[records.length - 1];
          resolve({ state: last.state, time: last.time, observer });
        });
        observer.observe('cpu', { sampleInterval: 1000 }).catch(reject);
      });
    },
    hasLivePreview: true,
  },
  {
    id: 'screen-wake-lock',
    displayName: 'Screen Wake Lock',
    description: 'Prevent the screen from turning off.',
    category: 'system',
    icon: '🌟',
    requestFn: async () => {
      const sentinel = await navigator.wakeLock.request('screen');
      return { type: sentinel.type, released: sentinel.released, sentinel };
    },
    hasLivePreview: true,
    permissionsApiName: 'screen-wake-lock',
  },
  {
    id: 'window-management',
    displayName: 'Window Management',
    description: 'Query screen layout and manage multiple windows.',
    category: 'system',
    icon: '🪟',
    requestFn: async () => {
      const perm = await navigator.permissions.query({ name: 'window-management' as any });
      if (perm.state === 'denied') throw new Error('Window management permission denied');
      const screens = await (window as any).getScreenDetails?.();
      return { screens: screens?.screens?.length ?? 1, currentScreen: screen.width + 'x' + screen.height };
    },
    hasLivePreview: true,
    permissionsApiName: 'window-management',
  },
  {
    id: 'push',
    displayName: 'Push Notifications',
    description: 'Receive push messages even when the app is closed.',
    category: 'system',
    icon: '📨',
    requestFn: async () => {
      const result = await Notification.requestPermission();
      if (result !== 'granted') throw new Error('Push requires notification permission');
      return { notificationPermission: result };
    },
    hasLivePreview: false,
    permissionsApiName: 'push',
  },
  {
    id: 'background-sync',
    displayName: 'Background Sync',
    description: 'Defer requests until the user has network connectivity.',
    category: 'system',
    icon: '🔁',
    requestFn: async () => {
      const reg = await navigator.serviceWorker.ready;
      await (reg as any).sync.register('background-sync-test');
      return { tag: 'background-sync-test' };
    },
    hasLivePreview: false,
  },
  {
    id: 'periodic-background-sync',
    displayName: 'Periodic Background Sync',
    description: 'Periodically sync data in the background.',
    category: 'system',
    icon: '🕐',
    requestFn: async () => {
      const reg = await navigator.serviceWorker.ready;
      await (reg as any).periodicSync.register('periodic-sync-test', { minInterval: 24 * 60 * 60 * 1000 });
      return { tag: 'periodic-sync-test' };
    },
    hasLivePreview: false,
    permissionsApiName: 'periodic-background-sync',
  },
  {
    id: 'web-share',
    displayName: 'Web Share',
    description: 'Share content using the native OS share dialog.',
    category: 'system',
    icon: '📤',
    requestFn: async () => {
      if (!navigator.share) throw new Error('Web Share API not supported');
      await navigator.share({ title: 'MyDebugger', text: 'Testing Web Share API', url: location.href });
      return { shared: true };
    },
    hasLivePreview: false,
  },
  {
    id: 'picture-in-picture',
    displayName: 'Picture-in-Picture',
    description: 'Display video in a floating overlay window.',
    category: 'system',
    icon: '📺',
    requestFn: async () => {
      if (!document.pictureInPictureEnabled) throw new Error('Picture-in-Picture not supported');
      return { supported: true, enabled: document.pictureInPictureEnabled };
    },
    hasLivePreview: false,
  },
  {
    id: 'payment-handler',
    displayName: 'Payment Handler',
    description: 'Handle payment requests via the Payment Request API.',
    category: 'system',
    icon: '💳',
    requestFn: async () => {
      if (!(window as any).PaymentRequest) throw new Error('Payment Request API not supported');
      return { supported: true };
    },
    hasLivePreview: false,
  },
  {
    id: 'identity-credentials-get',
    displayName: 'Identity Credentials',
    description: 'Federated identity sign-in via FedCM.',
    category: 'system',
    icon: '🪪',
    requestFn: async () => {
      if (!(navigator as any).credentials) throw new Error('Credentials API not supported');
      return { supported: true };
    },
    hasLivePreview: false,
  },
  {
    id: 'background-fetch',
    displayName: 'Background Fetch',
    description: 'Download large files in the background.',
    category: 'system',
    icon: '⬇️',
    requestFn: async () => {
      const reg = await navigator.serviceWorker.ready;
      if (!(reg as any).backgroundFetch) throw new Error('Background Fetch API not supported');
      return { supported: true };
    },
    hasLivePreview: false,
  },
  {
    id: 'top-level-storage-access',
    displayName: 'Top-Level Storage Access',
    description: 'Request unpartitioned storage access for a third-party origin.',
    category: 'storage',
    icon: '🏠',
    requestFn: async () => {
      if (!(document as any).requestStorageAccessFor) throw new Error('Top-level storage access not supported');
      await (document as any).requestStorageAccessFor(location.origin);
      return { granted: true };
    },
    hasLivePreview: false,
  },
];

// ---------------------------------------------------------------------------
// checkPermissionStatus
// ---------------------------------------------------------------------------
export async function checkPermissionStatus(def: PermissionDef): Promise<PermissionStatus> {
  // Special: Notifications
  if (def.id === 'notifications' || def.id === 'push') {
    if (!('Notification' in window)) return 'unsupported';
    const p = Notification.permission;
    if (p === 'granted') return 'granted';
    if (p === 'denied') return 'denied';
    return 'prompt';
  }

  // Clipboard – check via permissions API
  if (def.permissionsApiName && navigator.permissions) {
    try {
      const result = await navigator.permissions.query({ name: def.permissionsApiName as PermissionName });
      return result.state as PermissionStatus;
    } catch {
      // fall through to feature-detect
    }
  }

  // Feature-detect for APIs without permissions query support
  const featureDetect: Record<string, () => boolean> = {
    'display-capture': () => typeof (navigator.mediaDevices as any)?.getDisplayMedia === 'function',
    accelerometer: () => 'Accelerometer' in window,
    gyroscope: () => 'Gyroscope' in window,
    magnetometer: () => 'Magnetometer' in window,
    'ambient-light-sensor': () => 'AmbientLightSensor' in window,
    bluetooth: () => 'bluetooth' in navigator,
    usb: () => 'usb' in navigator,
    serial: () => 'serial' in navigator,
    hid: () => 'hid' in navigator,
    midi: () => typeof (navigator as any).requestMIDIAccess === 'function',
    nfc: () => 'NDEFReader' in window,
    'speaker-selection': () => typeof navigator.mediaDevices?.enumerateDevices === 'function',
    'storage-access': () => typeof (document as any).requestStorageAccess === 'function',
    'local-fonts': () => 'queryLocalFonts' in window,
    'idle-detection': () => 'IdleDetector' in window,
    'compute-pressure': () => 'PressureObserver' in window,
    'screen-wake-lock': () => 'wakeLock' in navigator,
    'window-management': () => 'getScreenDetails' in window,
    'background-sync': () => 'serviceWorker' in navigator,
    'periodic-background-sync': () => 'serviceWorker' in navigator,
    'web-share': () => 'share' in navigator,
    'picture-in-picture': () => 'pictureInPictureEnabled' in document,
    'payment-handler': () => 'PaymentRequest' in window,
    'identity-credentials-get': () => 'credentials' in navigator,
    'background-fetch': () => 'serviceWorker' in navigator,
    'top-level-storage-access': () => typeof (document as any).requestStorageAccessFor === 'function',
  };

  const detect = featureDetect[def.id];
  if (detect) return detect() ? 'prompt' : 'unsupported';

  return 'prompt';
}

// ---------------------------------------------------------------------------
// requestPermissionWithTimeout
// ---------------------------------------------------------------------------
export async function requestPermissionWithTimeout(def: PermissionDef): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const result = await Promise.race([
      def.requestFn(),
      new Promise<never>((_, reject) =>
        controller.signal.addEventListener('abort', () =>
          reject(new Error('Request timed out after 15 seconds')),
        ),
      ),
    ]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// cleanupPermissionData
// ---------------------------------------------------------------------------
export function cleanupPermissionData(id: string, data: unknown): void {
  if (!data || typeof data !== 'object') return;
  const d = data as Record<string, any>;

  // Media streams
  if (d.getTracks) {
    (d as MediaStream).getTracks().forEach(t => t.stop());
    return;
  }
  // Generic sensor
  if (d.sensor && typeof d.sensor.stop === 'function') {
    d.sensor.stop();
  }
  // Wake lock sentinel
  if (d.sentinel && typeof d.sentinel.release === 'function') {
    d.sentinel.release().catch(() => {});
  }
  // Compute pressure observer
  if (d.observer && typeof d.observer.disconnect === 'function') {
    d.observer.disconnect();
  }
  // Idle detector
  if (d.detector && typeof d.detector.abort === 'function') {
    d.detector.abort();
  }
  // NFC reader
  if (d.reader && typeof d.reader.abort === 'function') {
    d.reader.abort();
  }
}

// ---------------------------------------------------------------------------
// generateCodeSnippet
// ---------------------------------------------------------------------------
const SNIPPETS: Record<string, string> = {
  camera: `const stream = await navigator.mediaDevices.getUserMedia({ video: true });`,
  microphone: `const stream = await navigator.mediaDevices.getUserMedia({ audio: true });`,
  'display-capture': `const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });`,
  geolocation: `navigator.geolocation.getCurrentPosition(
  (pos) => console.log(pos.coords),
  (err) => console.error(err),
  { enableHighAccuracy: true }
);`,
  accelerometer: `const sensor = new Accelerometer({ frequency: 60 });
sensor.addEventListener('reading', () => {
  console.log(sensor.x, sensor.y, sensor.z);
});
sensor.start();`,
  gyroscope: `const sensor = new Gyroscope({ frequency: 60 });
sensor.addEventListener('reading', () => {
  console.log(sensor.x, sensor.y, sensor.z);
});
sensor.start();`,
  magnetometer: `const sensor = new Magnetometer({ frequency: 60 });
sensor.addEventListener('reading', () => {
  console.log(sensor.x, sensor.y, sensor.z);
});
sensor.start();`,
  'ambient-light-sensor': `const sensor = new AmbientLightSensor();
sensor.addEventListener('reading', () => {
  console.log('Illuminance:', sensor.illuminance, 'lux');
});
sensor.start();`,
  bluetooth: `const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
console.log(device.name);`,
  usb: `const device = await navigator.usb.requestDevice({ filters: [] });
console.log(device.productName);`,
  serial: `const port = await navigator.serial.requestPort();
await port.open({ baudRate: 9600 });`,
  hid: `const [device] = await navigator.hid.requestDevice({ filters: [] });
console.log(device.productName);`,
  midi: `const access = await navigator.requestMIDIAccess();
access.inputs.forEach(input => console.log(input.name));`,
  nfc: `const reader = new NDEFReader();
await reader.scan();
reader.addEventListener('reading', ({ message }) => {
  for (const record of message.records) console.log(record.recordType);
});`,
  'speaker-selection': `const devices = await navigator.mediaDevices.enumerateDevices();
const speakers = devices.filter(d => d.kind === 'audiooutput');`,
  'persistent-storage': `const persisted = await navigator.storage.persist();
const estimate = await navigator.storage.estimate();
console.log({ persisted, ...estimate });`,
  'storage-access': `await document.requestStorageAccess();`,
  'local-fonts': `const fonts = await window.queryLocalFonts();
fonts.forEach(f => console.log(f.family));`,
  notifications: `const permission = await Notification.requestPermission();
if (permission === 'granted') new Notification('Hello!');`,
  'clipboard-read': `const text = await navigator.clipboard.readText();
console.log(text);`,
  'clipboard-write': `await navigator.clipboard.writeText('Hello from clipboard!');`,
  'idle-detection': `const permission = await IdleDetector.requestPermission();
if (permission === 'granted') {
  const detector = new IdleDetector();
  detector.addEventListener('change', () => {
    console.log(detector.userState, detector.screenState);
  });
  await detector.start({ threshold: 60_000 });
}`,
  'compute-pressure': `const observer = new PressureObserver((records) => {
  console.log(records[0].state);
});
await observer.observe('cpu', { sampleInterval: 1000 });`,
  'screen-wake-lock': `const sentinel = await navigator.wakeLock.request('screen');
// To release:
await sentinel.release();`,
  'window-management': `const permission = await navigator.permissions.query({ name: 'window-management' });
if (permission.state === 'granted') {
  const details = await window.getScreenDetails();
  console.log(details.screens);
}`,
  push: `// Requires service worker & VAPID keys
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_KEY });`,
  'background-sync': `const reg = await navigator.serviceWorker.ready;
await reg.sync.register('my-tag');`,
  'periodic-background-sync': `const reg = await navigator.serviceWorker.ready;
await reg.periodicSync.register('my-tag', { minInterval: 86400000 });`,
  'web-share': `await navigator.share({ title: 'Page Title', url: location.href });`,
  'picture-in-picture': `const video = document.querySelector('video');
await video.requestPictureInPicture();`,
  'payment-handler': `const request = new PaymentRequest(methods, details);
const response = await request.show();`,
  'identity-credentials-get': `const cred = await navigator.credentials.get({ identity: { providers: [...] } });`,
  'background-fetch': `const reg = await navigator.serviceWorker.ready;
const bgFetch = await reg.backgroundFetch.fetch('my-fetch', ['/large-file.zip']);`,
  'top-level-storage-access': `await document.requestStorageAccessFor('https://third-party.example');`,
};

export function generateCodeSnippet(id: string): string {
  return SNIPPETS[id] ?? `// No code snippet available for "${id}"`;
}

// ---------------------------------------------------------------------------
// revokePermissionGuidance  (browser-specific)
// ---------------------------------------------------------------------------
export function revokePermissionGuidance(id: string): string {
  const ua = navigator.userAgent;
  const isChrome = /Chrome/.test(ua) && !/Edg/.test(ua);
  const isEdge = /Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);

  if (isChrome || isEdge) {
    return `Click the lock/info icon in the address bar → Site settings → find "${id}" → Reset or Allow.`;
  }
  if (isFirefox) {
    return `Click the lock icon in the address bar → Connection secure → More Information → Permissions → find "${id}" → clear "Use Default".`;
  }
  if (isSafari) {
    return `Safari menu → Settings for This Website → find "${id}" → change to Allow.`;
  }
  return `Open your browser's site settings for this page and update the "${id}" permission to Allow.`;
}
