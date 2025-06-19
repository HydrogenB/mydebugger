/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Permission Tester Model - Browser permissions testing
 */

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface Permission {
  name: string;
  displayName: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'Media' | 'Location' | 'Sensors' | 'Device' | 'Storage' | 'System';
  requestFn: () => Promise<any>;
  hasLivePreview: boolean;
}

export interface PermissionState {
  permission: Permission;
  status: PermissionStatus;
  error?: string;
  data?: any;
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
  geolocation: async () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  },

  camera: async () => {
    return navigator.mediaDevices.getUserMedia({ video: true });
  },

  microphone: async () => {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  },

  'display-capture': async () => {
    return navigator.mediaDevices.getDisplayMedia({ video: true });
  },

  notifications: async () => {
    return Notification.requestPermission();
  },

  'clipboard-read': async () => {
    return navigator.clipboard.readText();
  },

  'clipboard-write': async () => {
    return navigator.clipboard.writeText('test');
  },

  bluetooth: async () => {
    return (navigator as any).bluetooth?.requestDevice({ acceptAllDevices: true });
  },

  usb: async () => {
    return (navigator as any).usb?.requestDevice({ filters: [] });
  },

  serial: async () => {
    return (navigator as any).serial?.requestPort();
  },

  hid: async () => {
    return (navigator as any).hid?.requestDevice({ filters: [] });
  },

  midi: async () => {
    return navigator.requestMIDIAccess?.({ sysex: true });
  },

  'persistent-storage': async () => {
    return navigator.storage?.persist();
  },

  'screen-wake-lock': async () => {
    return navigator.wakeLock?.request('screen');
  },

  'ambient-light-sensor': async () => {
    const sensor = new (window as any).AmbientLightSensor();
    sensor.start();
    return sensor;
  },

  accelerometer: async () => {
    const sensor = new (window as any).Accelerometer();
    sensor.start();
    return sensor;
  },

  gyroscope: async () => {
    const sensor = new (window as any).Gyroscope();
    sensor.start();
    return sensor;
  },

  magnetometer: async () => {
    const sensor = new (window as any).Magnetometer();
    sensor.start();
    return sensor;
  },

  'local-fonts': async () => {
    return (navigator as any).fonts?.query();
  },

  'storage-access': async () => {
    return document.requestStorageAccess?.();
  },

  'idle-detection': async () => {
    return (window as any).IdleDetector?.requestPermission();
  },

  'compute-pressure': async () => {
    return (navigator as any).computePressure?.getStatus?.();
  },

  'window-management': async () => {
    return (window as any).getScreenDetails?.();
  },

  nfc: async () => {
    const reader = new (window as any).NDEFReader();
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
    return (registration as any).sync?.register('background-sync');
  },

  'top-level-storage-access': async () => {
    return document.requestStorageAccess?.();
  }
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
  },
  {
    name: 'nfc',
    displayName: 'NFC',
    description: 'Near Field Communication',
    icon: 'ContactlessPayment',
    category: 'Device',
    requestFn: requestFunctions.nfc,
    hasLivePreview: true
  }
];

// Utility functions
export const checkPermissionStatus = async (permissionName: string): Promise<PermissionStatus> => {
  if (!navigator.permissions) return 'unsupported';
  
  try {
    const result = await navigator.permissions.query({ name: permissionName as any });
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
