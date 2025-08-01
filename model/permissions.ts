/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Permission Tester Model - Browser permissions testing
 */
/* istanbul ignore file */


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

export interface IdleDetectorLike extends EventTarget {
  start: (options: { threshold: number }) => Promise<void>;
  stop?: () => void;
  userState: 'active' | 'idle';
  screenState: 'locked' | 'unlocked';
}

export interface IdleDetectorConstructor {
  requestPermission: () => Promise<'granted' | 'denied'>;
  new (): IdleDetectorLike;
}

// Permission request functions
/* istanbul ignore next */
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
      bluetooth?: { requestDevice: (options: unknown) => Promise<unknown> };
    }).bluetooth?.requestDevice({ acceptAllDevices: true })
  ),

  usb: async () => (
    (navigator as Navigator & {
      usb?: { requestDevice: (options: unknown) => Promise<unknown> };
    }).usb?.requestDevice({ filters: [] })
  ),

  serial: async () => (
    (navigator as Navigator & {
      serial?: { requestPort: () => Promise<unknown> };
    }).serial?.requestPort()
  ),

  hid: async () => (
    (navigator as Navigator & {
      hid?: { requestDevice: (options: unknown) => Promise<unknown> };
    }).hid?.requestDevice({ filters: [] })
  ),


  midi: async () => navigator.requestMIDIAccess?.({ sysex: true }),

  'persistent-storage': async () => navigator.storage?.persist(),

  'screen-wake-lock': async () => {
    const sentinel = await navigator.wakeLock?.request('screen');
    return sentinel;
  },

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
    (navigator as Navigator & { fonts?: { query: () => Promise<unknown> } }).fonts?.query()
  ),

  'storage-access': async () => document.requestStorageAccess?.(),

  'idle-detection': async () => {
    const IdleClass = (window as Window & { IdleDetector?: IdleDetectorConstructor }).IdleDetector;
    if (!IdleClass) throw new Error('IdleDetector not supported');
    const permission = await IdleClass.requestPermission();
    if (permission !== 'granted') throw new Error('Permission denied');
    const detector = new IdleClass();
    await detector.start({ threshold: 60000 });
    return detector;
  },

  'compute-pressure': async () => {
    const ObserverClass = (window as Window & { ComputePressureObserver?: new (
      callback: (records: unknown[]) => void,
      options?: { sampleInterval?: number }
    ) => { observe(type: string): Promise<void>; disconnect(): void } }).ComputePressureObserver;
    if (!ObserverClass) throw new Error('Compute Pressure API not supported');
    const readings: unknown[] = [];
    const observer = new ObserverClass((records) => {
      readings.push(...records);
    }, { sampleInterval: 1000 });
    await observer.observe('cpu');
    return { observer, readings };
  },

  'window-management': async () => {
    const win = window.open('', '_blank', 'noopener,noreferrer,width=400,height=300');
    if (!win) throw new Error('Window failed to open - popup blocked or not supported');
    return win;
  },



  nfc: async () => {
    const ReaderClass = (window as Window & { NDEFReader?: new () => { 
      scan(): Promise<unknown>;
      addEventListener: (event: string, handler: (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer; mediaType?: string }> } }) => void) => void;
      removeEventListener: (event: string, handler: (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer; mediaType?: string }> } }) => void) => void;
    } }).NDEFReader;
    if (!ReaderClass) throw new Error('NFC not supported');
    const reader = new ReaderClass();
    // Return the reader object so the preview component can manage scanning
    return reader;
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
    if (!navigator.serviceWorker.controller) {
      await navigator.serviceWorker.register('/sw.js');
    }
    const registration = await navigator.serviceWorker.ready;
    return (registration as ServiceWorkerRegistration & {
      sync?: { register(tag: string): Promise<unknown> };
    }).sync?.register('demo-sync');
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
    video.src =
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    video.muted = true;
    video.playsInline = true;
    await video.play().catch(() => {});
    return (video as HTMLVideoElement & {
      requestPictureInPicture?: () => Promise<unknown>;
    }).requestPictureInPicture?.();
  },

  'speaker-selection': async () => {
    const devices = await (navigator.mediaDevices as MediaDevices & {
      enumerateDevices: () => Promise<MediaDeviceInfo[]>;
      selectAudioOutput?: () => Promise<MediaDeviceInfo>;
    }).enumerateDevices();
    const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
    return (navigator.mediaDevices as MediaDevices & {
      selectAudioOutput?: () => Promise<MediaDeviceInfo>;
    }).selectAudioOutput?.() ?? audioOutputs[0];
  },

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
    hasLivePreview: true
  },
  {
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
    // Handle special cases where permission name doesn't match query name
    let queryName = permissionName;
    if (permissionName === 'display-capture') {
      queryName = 'screen-capture';
    }
    
    const result = await navigator.permissions.query({ 
      name: queryName as unknown as PermissionDescriptor['name'] 
    });
    return result.state as PermissionStatus;
  } catch (error) {
    // Check if the error is because the permission is not supported
    if (error instanceof Error && error.message.includes('not supported')) {
      return 'unsupported';
    }
    
    // For some permissions, we need to check alternative ways
    switch (permissionName) {
      case 'clipboard-read':
      case 'clipboard-write':
        return navigator.clipboard ? 'prompt' : 'unsupported';
      case 'bluetooth':
        return (navigator as Navigator & { bluetooth?: unknown }).bluetooth ? 'prompt' : 'unsupported';
      case 'usb':
        return (navigator as Navigator & { usb?: unknown }).usb ? 'prompt' : 'unsupported';
      case 'serial':
        return (navigator as Navigator & { serial?: unknown }).serial ? 'prompt' : 'unsupported';
      case 'hid':
        return (navigator as Navigator & { hid?: unknown }).hid ? 'prompt' : 'unsupported';
      case 'web-share':
        return (navigator as Navigator & { share?: unknown }).share ? 'prompt' : 'unsupported';
      default:
        return 'unsupported';
    }
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

// Resource cleanup utilities
export const cleanupPermissionData = (permissionName: string, data: unknown): void => {
  if (!data) return;

  try {
    switch (permissionName) {
      case 'camera':
      case 'microphone':
      case 'display-capture':
        if (data instanceof MediaStream) {
          data.getTracks().forEach(track => {
            if (track.readyState === 'live') {
              track.stop();
            }
          });
        }
        break;
        
      case 'screen-wake-lock':
        if (data && typeof data === 'object' && 'release' in data) {
          (data as { release: () => Promise<void> }).release().catch(() => {
            // Ignore cleanup errors
          });
        }
        break;
        
      case 'window-management':
        if (data && typeof data === 'object' && 'close' in data) {
          const win = data as Window;
          if (!win.closed) {
            win.close();
          }
        }
        break;
        
      case 'accelerometer':
      case 'gyroscope':
      case 'magnetometer':
      case 'ambient-light-sensor':
        if (data && typeof data === 'object' && 'stop' in data) {
          (data as { stop: () => void }).stop();
        }
        break;
        
      case 'compute-pressure':
        if (data && typeof data === 'object' && 'observer' in data) {
          const { observer } = data as { observer: { disconnect(): void } };
          observer.disconnect();
        }
        break;
        
      case 'idle-detection':
        if (data && typeof data === 'object' && 'stop' in data) {
          (data as { stop?: () => void }).stop?.();
        }
        break;
        
      default:
        // No specific cleanup needed for other permissions
        break;
    }
  } catch (error) {
    // Silent cleanup failure - don't log in production
  }
};

// Enhanced permission request with timeout and proper error handling
export const requestPermissionWithTimeout = async (
  permission: Permission,
  timeoutMs: number = 15000
): Promise<unknown> => 
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Permission request timed out after ${timeoutMs/1000}s. Please try again or check your browser settings.`));
    }, timeoutMs);

    permission.requestFn()
      .then(result => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeout);
        // Enhanced error messaging for better user understanding
        let enhancedError = error;
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('denied') || errorMessage.includes('permission')) {
            enhancedError = new Error(`Permission denied. To grant access: 1) Click the permission icon in your browser's address bar, 2) Choose "Allow", 3) Refresh the page, or 4) Check browser settings.`);
          } else if (errorMessage.includes('not supported') || errorMessage.includes('unsupported')) {
            enhancedError = new Error(`This feature is not supported in your current browser. Try using a recent version of Chrome, Firefox, or Edge.`);
          } else if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
            enhancedError = new Error(`Popup blocked. Please allow popups for this site in your browser settings and try again.`);
          } else if (errorMessage.includes('secure') || errorMessage.includes('https')) {
            enhancedError = new Error(`This feature requires a secure connection (HTTPS). Please access this page over HTTPS.`);
          }
        }
        reject(enhancedError);
      });
  });

// Permission removal/revocation helper
export const revokePermissionGuidance = (permissionName: string): string => {
  const browserDetection = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    return 'browser';
  };

  const browser = browserDetection();
  
  const instructions: Record<string, string> = {
    chrome: `1. Click the lock/info icon in the address bar
2. Find "${permissionName}" and click the dropdown
3. Select "Block" or "Ask"
4. Refresh the page`,
    firefox: `1. Click the shield/lock icon in the address bar  
2. Click "Connection secure" > "More information"
3. Go to "Permissions" tab
4. Find "${permissionName}" and change to "Block"
5. Refresh the page`,
    safari: `1. Go to Safari > Settings > Websites
2. Find "${permissionName}" in the left sidebar
3. Change setting for this site to "Deny"
4. Refresh the page`,
    edge: `1. Click the lock icon in the address bar
2. Click "Permissions for this site"  
3. Find "${permissionName}" and change to "Block"
4. Refresh the page`,
    browser: `1. Look for the lock/shield icon in your address bar
2. Click it and find permissions settings
3. Block or reset the "${permissionName}" permission
4. Refresh the page`
  };

  return instructions[browser] || instructions.browser;
};
