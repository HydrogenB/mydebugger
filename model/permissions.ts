/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Permission Tester Model - Browser permissions testing
 */

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export type PermissionName = 
  | 'geolocation'
  | 'camera' 
  | 'microphone'
  | 'notifications'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'accelerometer'
  | 'gyroscope'
  | 'magnetometer'
  | 'ambient-light-sensor'
  | 'screen-wake-lock'
  | 'idle-detection'
  | 'compute-pressure'
  | 'window-management'
  | 'bluetooth'
  | 'usb'
  | 'serial'
  | 'hid'
  | 'midi'
  | 'nfc'
  | 'persistent-storage'
  | 'local-fonts'
  | 'storage-access'
  | 'top-level-storage-access'
  | 'display-capture'
  | 'push'
  | 'background-sync'
  | 'payment-handler'
  | 'background-fetch'
  | 'periodic-background-sync'
  | 'web-share'
  | 'picture-in-picture'
  | 'speaker-selection'
  | 'identity-credentials-get';

export interface Permission {
  name: string;
  displayName: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'Media' | 'Location' | 'Sensors' | 'Device' | 'Storage' | 'System';
  requestFn: () => Promise<unknown>;
  hasLivePreview: boolean;
}

export interface PermissionState {
  permission: Permission;
  status: PermissionStatus;
  error?: string;
  data?: unknown;
  lastRequested?: number;
}

export interface PermissionEvent {
  id: string;
  timestamp: number;
  permissionName: string;
  action: 'request' | 'grant' | 'deny' | 'error';
  details?: string;
}

// Permission request functions
const requestFunctions = {
  geolocation: async () => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    }),

  camera: async () => navigator.mediaDevices.getUserMedia({ video: true }),

  microphone: async () => navigator.mediaDevices.getUserMedia({ audio: true }),

  'display-capture': async () => navigator.mediaDevices.getDisplayMedia({ video: true }),

  notifications: async () => Notification.requestPermission(),

  'clipboard-read': async () => navigator.clipboard.readText(),

  'clipboard-write': async () => navigator.clipboard.writeText('test'),

  bluetooth: async () => (
    (navigator as Navigator & {
      bluetooth?: { requestDevice(options: { acceptAllDevices: boolean }): Promise<unknown> };
    }).bluetooth?.requestDevice({ acceptAllDevices: true })
  ),

  usb: async () => (
    (navigator as Navigator & {
      usb?: { requestDevice(options: { filters: unknown[] }): Promise<unknown> };
    }).usb?.requestDevice({ filters: [] })
  ),

  serial: async () => (
    (navigator as Navigator & {
      serial?: { requestPort(): Promise<unknown> };
    }).serial?.requestPort()
  ),

  hid: async () => (
    (navigator as Navigator & {
      hid?: { requestDevice(options: { filters: unknown[] }): Promise<unknown> };
    }).hid?.requestDevice({ filters: [] })
  ),

  midi: async () => navigator.requestMIDIAccess?.({ sysex: true }),

  'persistent-storage': async () => navigator.storage?.persist(),

  'screen-wake-lock': async () => navigator.wakeLock?.request('screen'),

  'ambient-light-sensor': async () => {
    const SensorClass = (window as Window & { AmbientLightSensor?: new () => unknown }).AmbientLightSensor;
    if (!SensorClass) throw new Error('AmbientLightSensor not supported');
    const sensor = new SensorClass();
    (sensor as { start: () => void }).start();
    return sensor;
  },

  accelerometer: async () => {
    const SensorClass = (window as Window & { Accelerometer?: new () => unknown }).Accelerometer;
    if (!SensorClass) throw new Error('Accelerometer not supported');
    const sensor = new SensorClass();
    (sensor as { start: () => void }).start();
    return sensor;
  },

  gyroscope: async () => {
    const SensorClass = (window as Window & { Gyroscope?: new () => unknown }).Gyroscope;
    if (!SensorClass) throw new Error('Gyroscope not supported');
    const sensor = new SensorClass();
    (sensor as { start: () => void }).start();
    return sensor;
  },

  magnetometer: async () => {
    const SensorClass = (window as Window & { Magnetometer?: new () => unknown }).Magnetometer;
    if (!SensorClass) throw new Error('Magnetometer not supported');
    const sensor = new SensorClass();
    (sensor as { start: () => void }).start();
    return sensor;
  },

  'local-fonts': async () => (
    (navigator as Navigator & { fonts?: { query(): Promise<unknown> } }).fonts?.query()
  ),

  'storage-access': async () => document.requestStorageAccess?.(),

  'idle-detection': async () => (
    (window as Window & { IdleDetector?: { requestPermission(): Promise<unknown> } }).IdleDetector?.requestPermission()
  ),

  'compute-pressure': async () => (
    (navigator as Navigator & { computePressure?: { getStatus?: () => Promise<unknown> } }).computePressure?.getStatus?.()
  ),

  'window-management': async () => (
    (window as Window & { getScreenDetails?: () => Promise<unknown> }).getScreenDetails?.()
  ),

  nfc: async () => {
    const ReaderClass = (window as Window & { NDEFReader?: new () => { scan(): Promise<unknown> } }).NDEFReader;
    if (!ReaderClass) throw new Error('NFC not supported');
    const reader = new ReaderClass();
    return reader.scan();
  },

  'payment-handler': async () => {
    // Mock implementation
    throw new Error('Payment handler requires service worker registration');
  },

  push: async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: new Uint8Array(1) // Mock key
    });
  },

  'background-sync': async () => {
    const registration = await navigator.serviceWorker.ready;
    return (registration as ServiceWorkerRegistration & {
      sync?: { register(tag: string): Promise<unknown> };
    }).sync?.register('background-sync');
  },

  'top-level-storage-access': async () => document.requestStorageAccess?.(),

  'background-fetch': async () => {
    const registration = await navigator.serviceWorker.ready;
    return (registration as ServiceWorkerRegistration & {
      backgroundFetch?: { fetch(id: string, url: string): Promise<unknown> };
    }).backgroundFetch?.fetch('bg-fetch', '/');
  },

  'periodic-background-sync': async () => {
    const registration = await navigator.serviceWorker.ready;
    return (registration as ServiceWorkerRegistration & {
      periodicSync?: { register(tag: string, options: { minInterval: number }): Promise<void> };
    }).periodicSync?.register('periodic-sync', {
      minInterval: 24 * 60 * 60 * 1000 // 24 hours
    });
  },

  'web-share': async () => navigator.share?.({
    title: 'Test Share',
    text: 'Testing Web Share API',
    url: window.location.href
  }),

  'picture-in-picture': async () => {
    const video = document.createElement('video');
    return (video as HTMLVideoElement & {
      requestPictureInPicture?: () => Promise<unknown>;
    }).requestPictureInPicture?.();
  },

  'speaker-selection': async () => (navigator.mediaDevices as MediaDevices & {
    selectAudioOutput?: () => Promise<MediaDeviceInfo>;
  }).selectAudioOutput?.(),

  'identity-credentials-get': async () => (navigator as Navigator & {
    credentials?: {
      get?: (options: {
        identity: {
          providers: Array<{ configURL: string; clientId: string }>;
        };
      }) => Promise<unknown>;
    };
  }).credentials?.get?.({
    identity: {
      providers: [{
        configURL: "https://accounts.google.com/.well-known/web_identity",
        clientId: "demo"
      }]
    }
  })
};

// Permission definitions from Appendix A
export const PERMISSIONS: Permission[] = [
  {
    name: 'geolocation',
    displayName: 'Geolocation',
    description: 'Access device location coordinates',
    icon: 'MapPin',
    category: 'Location',
    requestFn: requestFunctions.geolocation,
    hasLivePreview: true
  },
  {
    name: 'camera',
    displayName: 'Camera',
    description: 'Access device camera for video capture',
    icon: 'Camera',
    category: 'Media',
    requestFn: requestFunctions.camera,
    hasLivePreview: true
  },
  {
    name: 'microphone',
    displayName: 'Microphone',
    description: 'Access device microphone for audio capture',
    icon: 'Mic',
    category: 'Media',
    requestFn: requestFunctions.microphone,
    hasLivePreview: true
  },
  {
    name: 'display-capture',
    displayName: 'Screen Capture',
    description: 'Capture screen content for sharing',
    icon: 'MonitorUp',
    category: 'Media',
    requestFn: requestFunctions['display-capture'],
    hasLivePreview: true
  },
  {
    name: 'notifications',
    displayName: 'Notifications',
    description: 'Show browser notifications',
    icon: 'Bell',
    category: 'System',
    requestFn: requestFunctions.notifications,
    hasLivePreview: false
  },
  {
    name: 'clipboard-read',
    displayName: 'Clipboard Read',
    description: 'Read clipboard content',
    icon: 'Clipboard',
    category: 'System',
    requestFn: requestFunctions['clipboard-read'],
    hasLivePreview: true
  },
  {
    name: 'clipboard-write',
    displayName: 'Clipboard Write',
    description: 'Write to clipboard',
    icon: 'Clipboard',
    category: 'System',
    requestFn: requestFunctions['clipboard-write'],
    hasLivePreview: false
  },
  {
    name: 'bluetooth',
    displayName: 'Bluetooth',
    description: 'Connect to Bluetooth devices',
    icon: 'Bluetooth',
    category: 'Device',
    requestFn: requestFunctions.bluetooth,
    hasLivePreview: true
  },
  {
    name: 'usb',
    displayName: 'USB',
    description: 'Connect to USB devices',
    icon: 'Usb',
    category: 'Device',
    requestFn: requestFunctions.usb,
    hasLivePreview: true
  },
  {
    name: 'serial',
    displayName: 'Serial Port',
    description: 'Access serial port devices',
    icon: 'Cable',
    category: 'Device',
    requestFn: requestFunctions.serial,
    hasLivePreview: true
  },
  {
    name: 'hid',
    displayName: 'HID Devices',
    description: 'Access Human Interface Devices',
    icon: 'Gamepad2',
    category: 'Device',
    requestFn: requestFunctions.hid,
    hasLivePreview: true
  },
  {
    name: 'midi',
    displayName: 'MIDI',
    description: 'Access MIDI devices for music',
    icon: 'Music',
    category: 'Device',
    requestFn: requestFunctions.midi,
    hasLivePreview: true
  },
  {
    name: 'persistent-storage',
    displayName: 'Persistent Storage',
    description: 'Request persistent storage quota',
    icon: 'HardDrive',
    category: 'Storage',
    requestFn: requestFunctions['persistent-storage'],
    hasLivePreview: false
  },
  {
    name: 'screen-wake-lock',
    displayName: 'Screen Wake Lock',
    description: 'Prevent screen from sleeping',
    icon: 'Lock',
    category: 'System',
    requestFn: requestFunctions['screen-wake-lock'],
    hasLivePreview: false
  },
  {
    name: 'ambient-light-sensor',
    displayName: 'Light Sensor',
    description: 'Read ambient light levels',
    icon: 'Sun',
    category: 'Sensors',
    requestFn: requestFunctions['ambient-light-sensor'],
    hasLivePreview: true
  },
  {
    name: 'accelerometer',
    displayName: 'Accelerometer',
    description: 'Read device acceleration data',
    icon: 'Move',
    category: 'Sensors',
    requestFn: requestFunctions.accelerometer,
    hasLivePreview: true
  },
  {
    name: 'gyroscope',
    displayName: 'Gyroscope',
    description: 'Read device rotation data',
    icon: 'RotateCcw',
    category: 'Sensors',
    requestFn: requestFunctions.gyroscope,
    hasLivePreview: true
  },
  {
    name: 'magnetometer',
    displayName: 'Magnetometer',
    description: 'Read magnetic field data',
    icon: 'Compass',
    category: 'Sensors',
    requestFn: requestFunctions.magnetometer,
    hasLivePreview: true
  },
  {
    name: 'local-fonts',
    displayName: 'Local Fonts',
    description: 'Access local font files',
    icon: 'Type',
    category: 'System',
    requestFn: requestFunctions['local-fonts'],
    hasLivePreview: true
  },
  {
    name: 'storage-access',
    displayName: 'Storage Access',
    description: 'Access third-party storage',
    icon: 'Database',
    category: 'Storage',
    requestFn: requestFunctions['storage-access'],
    hasLivePreview: false
  },
  {
    name: 'idle-detection',
    displayName: 'Idle Detection',
    description: 'Detect user idle state',
    icon: 'Clock',
    category: 'System',
    requestFn: requestFunctions['idle-detection'],
    hasLivePreview: true
  },
  {
    name: 'compute-pressure',
    displayName: 'Compute Pressure',
    description: 'Monitor CPU pressure',
    icon: 'Cpu',
    category: 'System',
    requestFn: requestFunctions['compute-pressure'],
    hasLivePreview: true
  },
  {
    name: 'window-management',
    displayName: 'Window Management',
    description: 'Manage multiple windows',
    icon: 'Monitor',
    category: 'System',
    requestFn: requestFunctions['window-management'],
    hasLivePreview: false
  },  {
    name: 'nfc',
    displayName: 'NFC',
    description: 'Near Field Communication',
    icon: 'ContactlessPayment',
    category: 'Device',
    requestFn: requestFunctions.nfc,
    hasLivePreview: true
  },
  {
    name: 'push',
    displayName: 'Push Notifications',
    description: 'Receive push notifications',
    icon: 'Send',
    category: 'System',
    requestFn: requestFunctions.push,
    hasLivePreview: false
  },
  {
    name: 'background-sync',
    displayName: 'Background Sync',
    description: 'Sync data in background',
    icon: 'RefreshCw',
    category: 'System',
    requestFn: requestFunctions['background-sync'],
    hasLivePreview: false
  },
  {
    name: 'payment-handler',
    displayName: 'Payment Handler',
    description: 'Handle payment requests',
    icon: 'CreditCard',
    category: 'System',
    requestFn: requestFunctions['payment-handler'],
    hasLivePreview: false
  },
  {
    name: 'top-level-storage-access',
    displayName: 'Top-Level Storage Access',
    description: 'Access storage from embedded context',
    icon: 'FolderOpen',
    category: 'Storage',
    requestFn: requestFunctions['top-level-storage-access'],
    hasLivePreview: false
  },
  {
    name: 'background-fetch',
    displayName: 'Background Fetch',
    description: 'Download files in background',
    icon: 'Download',
    category: 'System',
    requestFn: requestFunctions['background-fetch'],
    hasLivePreview: false
  },
  {
    name: 'periodic-background-sync',
    displayName: 'Periodic Background Sync',
    description: 'Periodic data synchronization',
    icon: 'Timer',
    category: 'System',
    requestFn: requestFunctions['periodic-background-sync'],
    hasLivePreview: false
  },
  {
    name: 'web-share',
    displayName: 'Web Share',
    description: 'Share content via native sharing',
    icon: 'Share2',
    category: 'System',
    requestFn: requestFunctions['web-share'],
    hasLivePreview: false
  },
  {
    name: 'picture-in-picture',
    displayName: 'Picture-in-Picture',
    description: 'Display video in floating window',
    icon: 'PictureInPicture',
    category: 'Media',
    requestFn: requestFunctions['picture-in-picture'],
    hasLivePreview: false
  },
  {
    name: 'speaker-selection',
    displayName: 'Speaker Selection',
    description: 'Select audio output device',
    icon: 'Volume2',
    category: 'Media',
    requestFn: requestFunctions['speaker-selection'],
    hasLivePreview: true
  },
  {
    name: 'identity-credentials-get',
    displayName: 'Identity Credentials',
    description: 'Get user identity credentials',
    icon: 'UserCheck',
    category: 'System',
    requestFn: requestFunctions['identity-credentials-get'],
    hasLivePreview: false
  }
];

// Utility functions
export const checkPermissionStatus = async (permissionName: string): Promise<PermissionStatus> => {
  if (!navigator.permissions) return 'unsupported';
  
  try {
    const result = await navigator.permissions.query({ name: permissionName as unknown as PermissionDescriptor['name'] });
    return result.state as PermissionStatus;
  } catch {
    return 'unsupported';
  }
};

export const generateCodeSnippet = (permission: Permission): string => {
  const fnBody = permission.requestFn.toString();
  const cleanCode = fnBody.replace(/^async \(\) => {\s*/, '').replace(/\s*}$/, '');
  
  return `// Request ${permission.displayName} permission
try {
  const result = await ${cleanCode};
  console.log('${permission.displayName} granted:', result);
} catch (error) {
  console.error('${permission.displayName} denied:', error);
}`;
};

export const createPermissionEvent = (
  permissionName: string,
  action: PermissionEvent['action'],
  details?: string
): PermissionEvent => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: Date.now(),
  permissionName,
  action,
  details
});
