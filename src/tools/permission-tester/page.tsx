/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Enhanced Permission Tester with Rich Data Previews
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';

// Types and Interfaces
interface Permission {
  name: string;
  displayName: string;
  description: string;
  category: string;
  requestFn: () => Promise<unknown>;
  checkFn?: () => Promise<string>;
  hasLivePreview: boolean;
  requiresUserInteraction?: boolean;
  requiresSecureContext?: boolean;
  browserSupport?: string[];
}

interface PermissionState {
  permission: Permission;
  status: 'granted' | 'denied' | 'prompt' | 'unsupported';
  data?: unknown;
  error?: string;
  lastRequested?: number;
}

interface PermissionEvent {
  id: string;
  permissionName: string;
  action: 'request' | 'grant' | 'deny' | 'error';
  details?: string;
  timestamp: number;
}

// Permission Definitions
const PERMISSIONS: Permission[] = [
  {
    name: 'camera',
    displayName: 'Camera',
    description: 'Access device camera for video capture',
    category: 'media',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    requestFn: async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        } 
      });
      return stream;
    },
    checkFn: async () => {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state;
    }
  },
  {
    name: 'microphone',
    displayName: 'Microphone',
    description: 'Access device microphone for audio capture',
    category: 'media',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    requestFn: async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      return stream;
    },
    checkFn: async () => {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    }
  },
  {
    name: 'geolocation',
    displayName: 'Geolocation',
    description: 'Access device location coordinates',
    category: 'location',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    requestFn: () => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    }),
    checkFn: async () => {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    }
  },
  {
    name: 'notifications',
    displayName: 'Notifications',
    description: 'Show system notifications',
    category: 'engagement',
    hasLivePreview: true,
    browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    requestFn: async () => {
      const permission = await Notification.requestPermission();
      return permission;
    },
    checkFn: async () => {
      return Notification.permission === 'granted' ? 'granted' : 
             Notification.permission === 'denied' ? 'denied' : 'prompt';
    }
  },
  {
    name: 'clipboard-read',
    displayName: 'Clipboard Read',
    description: 'Read from system clipboard',
    category: 'system',
    hasLivePreview: true,
    requiresSecureContext: true,
    requiresUserInteraction: true,
    browserSupport: ['Chrome', 'Edge', 'Safari'],
    requestFn: async () => {
      const text = await navigator.clipboard.readText();
      return text;
    },
    checkFn: async () => {
      const result = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      return result.state;
    }
  },
  {
    name: 'clipboard-write',
    displayName: 'Clipboard Write',
    description: 'Write to system clipboard',
    category: 'system',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    requestFn: async () => {
      await navigator.clipboard.writeText('Test clipboard write at ' + new Date().toLocaleTimeString());
      return 'success';
    },
    checkFn: async () => {
      const result = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      return result.state;
    }
  },
  {
    name: 'screen-capture',
    displayName: 'Screen Capture',
    description: 'Capture screen content for sharing',
    category: 'media',
    hasLivePreview: true,
    requiresUserInteraction: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Firefox', 'Edge'],
    requestFn: async () => {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
          displaySurface: 'monitor',
          logicalSurface: true,
          cursor: 'always'
        },
        audio: false 
      });
      return stream;
    }
  },
  {
    name: 'bluetooth',
    displayName: 'Bluetooth',
    description: 'Connect to Bluetooth devices',
    category: 'hardware',
    hasLivePreview: true,
    requiresSecureContext: true,
    requiresUserInteraction: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('bluetooth' in navigator)) throw new Error('Bluetooth not supported');
      const device = await (navigator as any).bluetooth.requestDevice({ 
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });
      return device;
    }
  },
  {
    name: 'usb',
    displayName: 'USB',
    description: 'Connect to USB devices',
    category: 'hardware',
    hasLivePreview: true,
    requiresSecureContext: true,
    requiresUserInteraction: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('usb' in navigator)) throw new Error('WebUSB not supported');
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      return device;
    }
  },
  {
    name: 'midi',
    displayName: 'MIDI',
    description: 'Connect to MIDI devices',
    category: 'hardware',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('requestMIDIAccess' in navigator)) throw new Error('Web MIDI not supported');
      const access = await (navigator as any).requestMIDIAccess({ sysex: true });
      return access;
    }
  },
  {
    name: 'persistent-storage',
    displayName: 'Persistent Storage',
    description: 'Request persistent storage quota',
    category: 'storage',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Firefox', 'Edge'],
    requestFn: async () => {
      if (!navigator.storage?.persist) throw new Error('Persistent storage not supported');
      const granted = await navigator.storage.persist();
      const estimate = await navigator.storage.estimate();
      return { granted, estimate };
    }
  },
  {
    name: 'screen-wake-lock',
    displayName: 'Screen Wake Lock',
    description: 'Prevent screen from sleeping',
    category: 'system',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Edge', 'Safari'],
    requestFn: async () => {
      if (!('wakeLock' in navigator)) throw new Error('Wake Lock not supported');
      const wakeLock = await (navigator as any).wakeLock.request('screen');
      return wakeLock;
    }
  },
  {
    name: 'idle-detection',
    displayName: 'Idle Detection',
    description: 'Detect user idle state',
    category: 'system',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('IdleDetector' in window)) throw new Error('Idle Detection not supported');
      const IdleDetector = (window as any).IdleDetector;
      const permission = await IdleDetector.requestPermission();
      if (permission !== 'granted') throw new Error('Permission denied');
      const detector = new IdleDetector();
      await detector.start({ threshold: 60000 });
      return detector;
    }
  },
  {
    name: 'file-system',
    displayName: 'File System Access',
    description: 'Access local file system',
    category: 'storage',
    hasLivePreview: true,
    requiresSecureContext: true,
    requiresUserInteraction: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('showOpenFilePicker' in window)) throw new Error('File System Access not supported');
      const handles = await (window as any).showOpenFilePicker({
        multiple: true,
        types: [{
          description: 'All Files',
          accept: { '*/*': ['*'] }
        }]
      });
      return handles;
    }
  },
  {
    name: 'accelerometer',
    displayName: 'Accelerometer',
    description: 'Access device motion sensors',
    category: 'sensors',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('Accelerometer' in window)) throw new Error('Accelerometer not supported');
      const sensor = new (window as any).Accelerometer({ frequency: 60 });
      sensor.start();
      return sensor;
    }
  },
  {
    name: 'gyroscope',
    displayName: 'Gyroscope',
    description: 'Access device rotation sensors',
    category: 'sensors',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('Gyroscope' in window)) throw new Error('Gyroscope not supported');
      const sensor = new (window as any).Gyroscope({ frequency: 60 });
      sensor.start();
      return sensor;
    }
  },
  {
    name: 'magnetometer',
    displayName: 'Magnetometer',
    description: 'Access device magnetic field sensor',
    category: 'sensors',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('Magnetometer' in window)) throw new Error('Magnetometer not supported');
      const sensor = new (window as any).Magnetometer({ frequency: 60 });
      sensor.start();
      return sensor;
    }
  },
  {
    name: 'ambient-light',
    displayName: 'Ambient Light Sensor',
    description: 'Access ambient light levels',
    category: 'sensors',
    hasLivePreview: true,
    requiresSecureContext: true,
    browserSupport: ['Chrome', 'Edge'],
    requestFn: async () => {
      if (!('AmbientLightSensor' in window)) throw new Error('Ambient Light Sensor not supported');
      const sensor = new (window as any).AmbientLightSensor({ frequency: 10 });
      sensor.start();
      return sensor;
    }
  }
];

// Main Hook
const usePermissionTester = () => {
  const [permissions, setPermissions] = useState<PermissionState[]>([]);
  const [events, setEvents] = useState<PermissionEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const cleanupFns = useRef<Map<string, () => void>>(new Map());

  // Initialize permissions
  useEffect(() => {
    const initPermissions = async () => {
      const initialStates = await Promise.all(
        PERMISSIONS.map(async (permission) => {
          let status: PermissionState['status'] = 'prompt';
          
          try {
            // Check if API is supported
            if (permission.requiresSecureContext && !window.isSecureContext) {
              status = 'unsupported';
            } else if (permission.checkFn) {
              const state = await permission.checkFn();
              status = state as PermissionState['status'];
            }
          } catch {
            // Check basic API availability
            switch (permission.name) {
              case 'bluetooth':
                status = 'bluetooth' in navigator ? 'prompt' : 'unsupported';
                break;
              case 'usb':
                status = 'usb' in navigator ? 'prompt' : 'unsupported';
                break;
              case 'midi':
                status = 'requestMIDIAccess' in navigator ? 'prompt' : 'unsupported';
                break;
              case 'screen-wake-lock':
                status = 'wakeLock' in navigator ? 'prompt' : 'unsupported';
                break;
              case 'idle-detection':
                status = 'IdleDetector' in window ? 'prompt' : 'unsupported';
                break;
              case 'file-system':
                status = 'showOpenFilePicker' in window ? 'prompt' : 'unsupported';
                break;
              case 'accelerometer':
                status = 'Accelerometer' in window ? 'prompt' : 'unsupported';
                break;
              case 'gyroscope':
                status = 'Gyroscope' in window ? 'prompt' : 'unsupported';
                break;
              case 'magnetometer':
                status = 'Magnetometer' in window ? 'prompt' : 'unsupported';
                break;
              case 'ambient-light':
                status = 'AmbientLightSensor' in window ? 'prompt' : 'unsupported';
                break;
              default:
                status = 'prompt';
            }
          }
          
          return { permission, status };
        })
      );
      
      setPermissions(initialStates);
    };
    
    initPermissions();
    
    // Auto-detect theme
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupFns.current.forEach(cleanup => cleanup());
      permissions.forEach(({ data, permission }) => {
        if (data instanceof MediaStream) {
          data.getTracks().forEach(track => track.stop());
        } else if (permission.name === 'screen-wake-lock' && data) {
          (data as any).release?.();
        } else if (['accelerometer', 'gyroscope', 'magnetometer', 'ambient-light'].includes(permission.name) && data) {
          (data as any).stop?.();
        }
      });
    };
  }, [permissions]);

  const addEvent = useCallback((event: Omit<PermissionEvent, 'id' | 'timestamp'>) => {
    const newEvent: PermissionEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 99)]);
  }, []);

  const requestPermission = useCallback(async (permissionName: string) => {
    const permissionState = permissions.find(p => p.permission.name === permissionName);
    if (!permissionState) return;

    const { permission } = permissionState;
    
    // Clean up existing data
    if (permissionState.data) {
      if (permissionState.data instanceof MediaStream) {
        permissionState.data.getTracks().forEach(track => track.stop());
      }
      const cleanup = cleanupFns.current.get(permissionName);
      if (cleanup) {
        cleanup();
        cleanupFns.current.delete(permissionName);
      }
    }

    setLoadingStates(prev => new Set(prev).add(permissionName));
    addEvent({
      permissionName,
      action: 'request',
      details: `Requesting ${permission.displayName}`
    });

    try {
      // Add timeout for long-running requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const result = await Promise.race([
        permission.requestFn(),
        timeoutPromise
      ]);

      // Check actual status after request
      let newStatus: PermissionState['status'] = 'granted';
      if (permission.checkFn) {
        try {
          const state = await permission.checkFn();
          newStatus = state as PermissionState['status'];
        } catch {
          newStatus = 'granted'; // Assume granted if check fails but request succeeded
        }
      }

      setPermissions(prev =>
        prev.map(p =>
          p.permission.name === permissionName
            ? { ...p, status: newStatus, data: result, error: undefined, lastRequested: Date.now() }
            : p
        )
      );

      addEvent({
        permissionName,
        action: newStatus === 'granted' ? 'grant' : 'deny',
        details: `${permission.displayName} ${newStatus}`
      });

      // Set up cleanup functions for specific permissions
      if (result instanceof MediaStream) {
        cleanupFns.current.set(permissionName, () => {
          result.getTracks().forEach(track => track.stop());
        });
      } else if (permission.name === 'screen-wake-lock') {
        cleanupFns.current.set(permissionName, () => {
          (result as any).release?.();
        });
      } else if (['accelerometer', 'gyroscope', 'magnetometer', 'ambient-light'].includes(permission.name)) {
        cleanupFns.current.set(permissionName, () => {
          (result as any).stop?.();
        });
      } else if (permission.name === 'idle-detection') {
        cleanupFns.current.set(permissionName, () => {
          (result as any).stop?.();
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission denied';
      
      setPermissions(prev =>
        prev.map(p =>
          p.permission.name === permissionName
            ? { ...p, status: 'denied', data: undefined, error: errorMessage, lastRequested: Date.now() }
            : p
        )
      );

      addEvent({
        permissionName,
        action: 'error',
        details: errorMessage
      });
    } finally {
      setLoadingStates(prev => {
        const next = new Set(prev);
        next.delete(permissionName);
        return next;
      });
    }
  }, [permissions, addEvent]);

  const clearPermissionData = useCallback((permissionName: string) => {
    const cleanup = cleanupFns.current.get(permissionName);
    if (cleanup) {
      cleanup();
      cleanupFns.current.delete(permissionName);
    }
    
    setPermissions(prev =>
      prev.map(p =>
        p.permission.name === permissionName
          ? { ...p, data: undefined }
          : p
      )
    );
  }, []);

  const testNotification = useCallback(() => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Test Notification', {
        body: 'This is a test notification from Permission Tester',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><circle cx="12" cy="12" r="10"/></svg>',
        tag: 'test-notification',
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200]
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      addEvent({
        permissionName: 'notifications',
        action: 'grant',
        details: 'Test notification sent'
      });
      
      setTimeout(() => notification.close(), 5000);
    }
  }, [addEvent]);

  const exportResults = useCallback(() => {
    const results = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      permissions: permissions.map(({ permission, status, error }) => ({
        name: permission.name,
        displayName: permission.displayName,
        status,
        error
      })),
      events: events.slice(0, 50)
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [permissions, events]);

  const filteredPermissions = useMemo(() => {
    let filtered = permissions;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(({ permission }) =>
        permission.name.toLowerCase().includes(query) ||
        permission.displayName.toLowerCase().includes(query) ||
        permission.description.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(({ permission }) =>
        permission.category === selectedCategory
      );
    }
    
    return filtered;
  }, [permissions, searchQuery, selectedCategory]);

  const stats = useMemo(() => ({
    total: permissions.length,
    granted: permissions.filter(p => p.status === 'granted').length,
    denied: permissions.filter(p => p.status === 'denied').length,
    unsupported: permissions.filter(p => p.status === 'unsupported').length
  }), [permissions]);

  return {
    permissions: filteredPermissions,
    events,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    requestPermission,
    clearPermissionData,
    testNotification,
    exportResults,
    loadingStates,
    stats,
    theme,
    setTheme,
    categories: ['all', ...new Set(PERMISSIONS.map(p => p.category))]
  };
};

// Enhanced Preview Components
const CameraPreview: React.FC<{ stream: MediaStream; onStop: () => void }> = ({ stream, onStop }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [videoSettings, setVideoSettings] = useState<any>({});
  const [photoUrl, setPhotoUrl] = useState('');
  const [filter, setFilter] = useState('none');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Get video track settings
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setVideoSettings(settings);
      }
    }
    
    // Get available camera devices
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
    });
  }, [stream]);

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const url = canvas.toDataURL('image/png');
        setPhotoUrl(url);
      }
    }
  };

  const startRecording = () => {
    if (stream) {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const filters = [
    { name: 'none', value: 'none' },
    { name: 'grayscale', value: 'grayscale(100%)' },
    { name: 'sepia', value: 'sepia(100%)' },
    { name: 'blur', value: 'blur(5px)' },
    { name: 'brightness', value: 'brightness(150%)' },
    { name: 'contrast', value: 'contrast(200%)' },
    { name: 'hue-rotate', value: 'hue-rotate(90deg)' },
    { name: 'invert', value: 'invert(100%)' }
  ];

  return (
    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
        📷 Camera Preview
      </h3>
      
      {/* Video Preview */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            borderRadius: '8px',
            filter: filter,
            transition: 'filter 0.3s'
          }}
        />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            background: 'red',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.8rem',
            animation: 'pulse 1s infinite'
          }}>
            ● REC
          </div>
        )}
      </div>

      {/* Video Settings Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>
          <strong>Resolution:</strong> {videoSettings.width}x{videoSettings.height}
        </div>
        <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>
          <strong>Frame Rate:</strong> {videoSettings.frameRate?.toFixed(0)} fps
        </div>
        <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>
          <strong>Aspect Ratio:</strong> {videoSettings.aspectRatio?.toFixed(2)}
        </div>
        <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>
          <strong>Facing:</strong> {videoSettings.facingMode || 'N/A'}
        </div>
      </div>

      {/* Camera Selection */}
      {devices.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Select Camera:
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e0'
            }}
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filter Selection */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Video Filters:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.name}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: filter === f.value ? '2px solid #3b82f6' : '1px solid #cbd5e0',
                background: filter === f.value ? '#dbeafe' : 'white',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={takeSnapshot}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          📸 Take Photo
        </button>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: isRecording ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {isRecording ? '⏹ Stop Recording' : '⏺ Start Recording'}
        </button>
        <button
          onClick={onStop}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Stop
        </button>
      </div>

      {/* Snapshot Preview */}
      {photoUrl && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Last Snapshot:</h4>
          <img
            src={photoUrl}
            alt="Snapshot"
            style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
          />
          <a
            href={photoUrl}
            download={`snapshot-${Date.now()}.png`}
            style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.85rem'
            }}
          >
            Download Photo
          </a>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const MicrophonePreview: React.FC<{ stream: MediaStream; onStop: () => void }> = ({ stream, onStop }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioSettings, setAudioSettings] = useState<any>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      const settings = audioTrack.getSettings();
      setAudioSettings(settings);
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteTimeDomainData(dataArray);
      analyser.getByteFrequencyData(frequencyData);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      const avgLevel = sum / bufferLength;
      setAudioLevel(avgLevel);

      // Find dominant frequency
      let maxValue = 0;
      let maxIndex = 0;
      for (let i = 0; i < frequencyData.length; i++) {
        if (frequencyData[i] > maxValue) {
          maxValue = frequencyData[i];
          maxIndex = i;
        }
      }
      const dominantFreq = (maxIndex * audioContext.sampleRate) / (analyser.fftSize);
      setFrequency(Math.round(dominantFreq));

      // Draw waveform
      if (waveformCanvasRef.current) {
        const canvas = waveformCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.lineWidth = 2;
          ctx.strokeStyle = '#10b981';
          ctx.beginPath();

          const sliceWidth = canvas.width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        }
      }

      // Draw frequency spectrum
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = (frequencyData[i] / 255) * canvas.height;

            const r = barHeight + 25 * (i / bufferLength);
            const g = 250 * (i / bufferLength);
            const b = 50;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
          }
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [stream]);

  const startRecording = () => {
    if (stream) {
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audio-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
        🎤 Microphone Preview
      </h3>

      {/* Audio Level Meter */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Audio Level:
        </label>
        <div style={{
          height: '30px',
          background: '#e2e8f0',
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, audioLevel * 2)}%`,
            background: audioLevel > 30 ? '#ef4444' : audioLevel > 15 ? '#f59e0b' : '#10b981',
            transition: 'width 0.1s, background 0.3s'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem' }}>
          <span>Silent</span>
          <span>Level: {audioLevel.toFixed(1)}</span>
          <span>Loud</span>
        </div>
      </div>

      {/* Waveform Display */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Waveform:
        </label>
        <canvas
          ref={waveformCanvasRef}
          width={500}
          height={100}
          style={{
            width: '100%',
            height: '100px',
            borderRadius: '8px',
            border: '1px solid #cbd5e0'
          }}
        />
      </div>

      {/* Frequency Spectrum */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Frequency Spectrum:
        </label>
        <canvas
          ref={canvasRef}
          width={500}
          height={100}
          style={{
            width: '100%',
            height: '100px',
            borderRadius: '8px',
            border: '1px solid #cbd5e0'
          }}
        />
      </div>

      {/* Audio Settings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>
          <strong>Sample Rate:</strong> {audioSettings.sampleRate || 'N/A'} Hz
        </div>
        <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>
          <strong>Echo Cancel:</strong> {audioSettings.echoCancellation ? 'Yes' : 'No'}
        </div>
        <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>
          <strong>Noise Suppress:</strong> {audioSettings.noiseSuppression ? 'Yes' : 'No'}
        </div>
        <div style={{ padding: '0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>
          <strong>Dominant Freq:</strong> {frequency} Hz
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: isRecording ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {isRecording ? '⏹ Stop Recording' : '⏺ Start Recording'}
        </button>
        <button
          onClick={onStop}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Stop
        </button>
      </div>

      {isRecording && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          background: '#fee2e2',
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#991b1b'
        }}>
          🔴 Recording in progress...
        </div>
      )}
    </div>
  );
};

const LocationPreview: React.FC<{ position: GeolocationPosition; onRefresh: () => void }> = ({ position, onRefresh }) => {
  const [address, setAddress] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [tracking, setTracking] = useState(false);
  const [path, setPath] = useState<{ lat: number; lng: number; time: number }[]>([]);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Add initial position to path
    setPath([{
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      time: position.timestamp
    }]);
  }, [position]);

  const startTracking = () => {
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setPath(prev => [...prev, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            time: pos.timestamp
          }]);
        },
        console.error,
        { enableHighAccuracy: true }
      );
      setTracking(true);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setTracking(false);
    }
  };

  const calculateDistance = () => {
    if (path.length < 2) return 0;
    
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const R = 6371; // Earth's radius in km
      const dLat = (path[i].lat - path[i-1].lat) * Math.PI / 180;
      const dLon = (path[i].lng - path[i-1].lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(path[i-1].lat * Math.PI / 180) * Math.cos(path[i].lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance += R * c;
    }
    return distance;
  };

  const exportGPX = () => {
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Permission Tester">
  <trk>
    <name>Tracked Path</name>
    <trkseg>
      ${path.map(p => `<trkpt lat="${p.lat}" lon="${p.lng}"><time>${new Date(p.time).toISOString()}</time></trkpt>`).join('\n      ')}
    </trkseg>
  </trk>
</gpx>`;
    
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `track-${Date.now()}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
        📍 Location Preview
      </h3>

      {/* Coordinates Display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ padding: '0.75rem', background: '#e2e8f0', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Latitude</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{position.coords.latitude.toFixed(6)}°</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#e2e8f0', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Longitude</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{position.coords.longitude.toFixed(6)}°</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#e2e8f0', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Accuracy</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{position.coords.accuracy.toFixed(0)}m</div>
        </div>
        {position.coords.altitude !== null && (
          <div style={{ padding: '0.75rem', background: '#e2e8f0', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Altitude</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{position.coords.altitude.toFixed(0)}m</div>
          </div>
        )}
        {position.coords.speed !== null && (
          <div style={{ padding: '0.75rem', background: '#e2e8f0', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Speed</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{(position.coords.speed * 3.6).toFixed(1)} km/h</div>
          </div>
        )}
        {position.coords.heading !== null && (
          <div style={{ padding: '0.75rem', background: '#e2e8f0', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Heading</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{position.coords.heading.toFixed(0)}°</div>
          </div>
        )}
      </div>

      {/* Map Preview */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Map Preview:
        </label>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #cbd5e0'
        }}>
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${position.coords.longitude-0.01},${position.coords.latitude-0.01},${position.coords.longitude+0.01},${position.coords.latitude+0.01}&layer=mapnik&marker=${position.coords.latitude},${position.coords.longitude}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title="Map"
          />
          <a
            href={`https://www.openstreetmap.org/?mlat=${position.coords.latitude}&mlon=${position.coords.longitude}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              padding: '0.25rem 0.5rem',
              background: 'white',
              borderRadius: '4px',
              fontSize: '0.75rem',
              textDecoration: 'none',
              color: '#3b82f6',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            Open in Maps →
          </a>
        </div>
      </div>

      {/* Tracking Info */}
      {tracking && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#dbeafe',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>📍 Tracking Active</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                Points: {path.length} | Distance: {calculateDistance().toFixed(2)} km
              </div>
            </div>
            <div style={{
              width: '10px',
              height: '10px',
              background: 'red',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }} />
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onRefresh}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
        <button
          onClick={tracking ? stopTracking : startTracking}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: tracking ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {tracking ? '⏹ Stop Tracking' : '▶ Start Tracking'}
        </button>
        {path.length > 1 && (
          <button
            onClick={exportGPX}
            style={{
              padding: '0.75rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📥 Export GPX
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

const SensorPreview: React.FC<{ sensor: any; type: string; onStop: () => void }> = ({ sensor, type, onStop }) => {
  const [data, setData] = useState<{ x: number; y: number; z: number; timestamp: number }[]>([]);
  const [current, setCurrent] = useState({ x: 0, y: 0, z: 0 });
  const [recording, setRecording] = useState(false);
  const maxDataPoints = 100;

  useEffect(() => {
    if (!sensor) return;

    const handleReading = () => {
      const reading = {
        x: sensor.x || 0,
        y: sensor.y || 0,
        z: sensor.z || 0,
        timestamp: Date.now()
      };
      
      setCurrent(reading);
      
      if (recording) {
        setData(prev => {
          const newData = [...prev, reading];
          return newData.slice(-maxDataPoints);
        });
      }
    };

    sensor.addEventListener('reading', handleReading);
    sensor.start?.();

    return () => {
      sensor.removeEventListener('reading', handleReading);
      sensor.stop?.();
    };
  }, [sensor, recording]);

  const exportData = () => {
    const csv = [
      'timestamp,x,y,z',
      ...data.map(d => `${d.timestamp},${d.x},${d.y},${d.z}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const magnitude = Math.sqrt(current.x ** 2 + current.y ** 2 + current.z ** 2);

  return (
    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
        📊 {type.charAt(0).toUpperCase() + type.slice(1)} Data
      </h3>

      {/* Current Values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>X Axis</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{current.x.toFixed(3)}</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Y Axis</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{current.y.toFixed(3)}</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#dbeafe', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Z Axis</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{current.z.toFixed(3)}</div>
        </div>
        <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Magnitude</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{magnitude.toFixed(3)}</div>
        </div>
      </div>

      {/* Visual Representation */}
      <div style={{
        marginBottom: '1rem',
        padding: '1rem',
        background: '#1e293b',
        borderRadius: '8px',
        position: 'relative',
        height: '200px'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotateX(${current.x * 10}deg) rotateY(${current.y * 10}deg) rotateZ(${current.z * 10}deg)`,
          width: '100px',
          height: '100px',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          transition: 'transform 0.1s'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '10px',
            background: '#ef4444',
            borderRadius: '50%'
          }} />
        </div>
      </div>

      {/* Data Recording */}
      {recording && data.length > 0 && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          background: '#e2e8f0',
          borderRadius: '8px',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Recording Data ({data.length} points)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: '0.25rem',
            fontSize: '0.75rem'
          }}>
            <div style={{ fontWeight: 'bold' }}>Time</div>
            <div style={{ fontWeight: 'bold' }}>X</div>
            <div style={{ fontWeight: 'bold' }}>Y</div>
            <div style={{ fontWeight: 'bold' }}>Z</div>
            {data.slice(-5).map((d, i) => (
              <React.Fragment key={i}>
                <div>{new Date(d.timestamp).toLocaleTimeString()}</div>
                <div>{d.x.toFixed(2)}</div>
                <div>{d.y.toFixed(2)}</div>
                <div>{d.z.toFixed(2)}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setRecording(!recording)}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: recording ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {recording ? '⏹ Stop Recording' : '⏺ Start Recording'}
        </button>
        {data.length > 0 && (
          <button
            onClick={exportData}
            style={{
              padding: '0.75rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📥 Export CSV
          </button>
        )}
        <button
          onClick={onStop}
          style={{
            padding: '0.75rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Stop
        </button>
      </div>
    </div>
  );
};

// Main Component
const PermissionTesterPage: React.FC = () => {
  const {
    permissions,
    events,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    requestPermission,
    clearPermissionData,
    testNotification,
    exportResults,
    loadingStates,
    stats,
    theme,
    setTheme,
    categories
  } = usePermissionTester();

  const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
  const textColor = theme === 'dark' ? '#f1f5f9' : '#1e293b';
  const cardBg = theme === 'dark' ? '#1e293b' : '#f8fafc';

  return (
    <>
      <Helmet>
        <title>Web Permission Tester - Test Browser APIs</title>
        <meta name="description" content="Test and inspect browser permissions with rich data previews and visualizations" />
      </Helmet>

      <div style={{
        minHeight: '100vh',
        background: bgColor,
        color: textColor,
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🔐 Web Permission Tester
            </h1>
            <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>
              Test browser permissions with rich data previews and visualizations
            </p>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: cardBg, padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.total}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Total</div>
            </div>
            <div style={{ background: cardBg, padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.granted}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Granted</div>
            </div>
            <div style={{ background: cardBg, padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.denied}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Denied</div>
            </div>
            <div style={{ background: cardBg, padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b7280' }}>{stats.unsupported}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Unsupported</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  background: cardBg,
                  color: textColor
                }}
              />
              <button
                onClick={exportResults}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                📥 Export Results
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{
                  padding: '0.75rem',
                  background: cardBg,
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: 'none',
                    background: selectedCategory === cat ? '#3b82f6' : cardBg,
                    color: selectedCategory === cat ? 'white' : textColor,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            {/* Permission Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
              {permissions.map(({ permission, status, data, error }) => (
                <div
                  key={permission.name}
                  style={{
                    background: cardBg,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: `2px solid ${
                      status === 'granted' ? '#10b981' :
                      status === 'denied' ? '#ef4444' :
                      status === 'unsupported' ? '#6b7280' : '#3b82f6'
                    }`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {permission.displayName}
                      </h3>
                      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{permission.description}</p>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      background: status === 'granted' ? '#10b98120' :
                                 status === 'denied' ? '#ef444420' :
                                 status === 'unsupported' ? '#6b728020' : '#3b82f620',
                      color: status === 'granted' ? '#10b981' :
                             status === 'denied' ? '#ef4444' :
                             status === 'unsupported' ? '#6b7280' : '#3b82f6'
                    }}>
                      {status}
                    </span>
                  </div>

                  {error && (
                    <div style={{
                      padding: '0.75rem',
                      background: '#ef444420',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontSize: '0.9rem'
                    }}>
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Enhanced Live Previews */}
                  {status === 'granted' && data && permission.hasLivePreview && (
                    <div style={{ marginBottom: '1rem' }}>
                      {permission.name === 'camera' && <CameraPreview stream={data as MediaStream} onStop={() => clearPermissionData(permission.name)} />}
                      {permission.name === 'microphone' && <MicrophonePreview stream={data as MediaStream} onStop={() => clearPermissionData(permission.name)} />}
                      {permission.name === 'geolocation' && <LocationPreview position={data as GeolocationPosition} onRefresh={() => requestPermission(permission.name)} />}
                      {permission.name === 'screen-capture' && <CameraPreview stream={data as MediaStream} onStop={() => clearPermissionData(permission.name)} />}
                      {['accelerometer', 'gyroscope', 'magnetometer'].includes(permission.name) && (
                        <SensorPreview sensor={data} type={permission.name} onStop={() => clearPermissionData(permission.name)} />
                      )}
                      {permission.name === 'ambient-light' && (
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                          <h4 style={{ marginBottom: '0.5rem' }}>💡 Light Level</h4>
                          <div style={{
                            height: '30px',
                            background: '#e2e8f0',
                            borderRadius: '15px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, ((data as any).illuminance || 0) / 10)}%`,
                              background: 'linear-gradient(90deg, #1e293b, #fbbf24)',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Illuminance: {(data as any).illuminance || 0} lux
                          </p>
                        </div>
                      )}
                      {permission.name === 'notifications' && (
                        <button onClick={testNotification} style={{
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}>
                          Send Test Notification
                        </button>
                      )}
                      {permission.name === 'persistent-storage' && data && (
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                          <h4 style={{ marginBottom: '0.5rem' }}>💾 Storage Info</h4>
                          <div style={{ fontSize: '0.9rem' }}>
                            <div>Persistent: {(data as any).granted ? 'Yes' : 'No'}</div>
                            <div>Quota: {((data as any).estimate?.quota / (1024*1024*1024)).toFixed(2)} GB</div>
                            <div>Usage: {((data as any).estimate?.usage / (1024*1024)).toFixed(2)} MB</div>
                          </div>
                        </div>
                      )}
                      {permission.name === 'file-system' && data && (
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                          <h4 style={{ marginBottom: '0.5rem' }}>📁 Selected Files</h4>
                          <ul style={{ fontSize: '0.9rem' }}>
                            {(data as any[]).map((handle: any, i) => (
                              <li key={i}>{handle.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => requestPermission(permission.name)}
                      disabled={loadingStates.has(permission.name) || status === 'unsupported'}
                      style={{
                        flex: '1',
                        padding: '0.75rem',
                        background: status === 'denied' ? '#ef4444' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loadingStates.has(permission.name) || status === 'unsupported' ? 'not-allowed' : 'pointer',
                        opacity: loadingStates.has(permission.name) || status === 'unsupported' ? 0.5 : 1
                      }}
                    >
                      {loadingStates.has(permission.name) ? '⏳ Requesting...' : 
                       status === 'denied' ? 'Retry' : 'Request'}
                    </button>
                    {data && (
                      <button
                        onClick={() => clearPermissionData(permission.name)}
                        style={{
                          padding: '0.75rem',
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Browser Support */}
                  {permission.browserSupport && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.6 }}>
                      Supported: {permission.browserSupport.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Event Log */}
            <div style={{
              background: cardBg,
              borderRadius: '12px',
              padding: '1.5rem',
              height: 'fit-content',
              position: 'sticky',
              top: '2rem'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                📋 Event Log
              </h3>
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                fontSize: '0.85rem'
              }}>
                {events.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>No events yet</p>
                ) : (
                  events.map(event => (
                    <div
                      key={event.id}
                      style={{
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        background: theme === 'dark' ? '#0f172a' : '#ffffff',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${
                          event.action === 'grant' ? '#10b981' :
                          event.action === 'deny' ? '#ef4444' :
                          event.action === 'error' ? '#f59e0b' : '#3b82f6'
                        }`
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{event.permissionName}</div>
                      <div style={{ opacity: 0.8 }}>{event.details}</div>
                      <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? '#374151' : '#cbd5e1'};
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default PermissionTesterPage;