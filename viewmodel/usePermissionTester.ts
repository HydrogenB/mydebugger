/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Permission Tester ViewModel Hook
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  PERMISSIONS,
  PermissionState,
  PermissionEvent,
  checkPermissionStatus,
  generateCodeSnippet,
  createPermissionEvent,
  cleanupPermissionData,
  requestPermissionWithTimeout,
  IdleDetectorConstructor
} from '../model/permissions';

export interface UsePermissionTesterReturn {
  permissions: PermissionState[];
  filteredPermissions: PermissionState[];
  events: PermissionEvent[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  requestPermission: (permissionName: string) => Promise<void>;
  retryPermission: (permissionName: string) => Promise<void>;
  copyCodeSnippet: (permissionName: string) => Promise<void>;
  copyEventLog: () => Promise<void>;
  clearEvents: () => void;
  testNotification: () => void;
  getCodeSnippet: (permissionName: string) => string;
  isLoading: (permissionName: string) => boolean;
  getPermissionData: (permissionName: string) => unknown;
  clearPermissionData: (permissionName: string) => void;
  activePreview: string | null;
  setActivePreview: (permissionName: string | null) => void;
  previewStates: Record<string, any>;
  updatePreviewState: (permissionName: string, data: any) => void;
  isPreviewActive: (permissionName: string) => boolean;
  startPreview: (permissionName: string) => Promise<void>;
  stopPreview: (permissionName: string) => void;
  exportResults: () => Promise<void>;
  runBatchTest: (permissionNames: string[]) => Promise<void>;
  permissionStats: {
    granted: number;
    denied: number;
    unsupported: number;
    total: number;
  };
}

const usePermissionTester = (): UsePermissionTesterReturn => {
  const [permissions, setPermissions] = useState<PermissionState[]>([]);
  const [events, setEvents] = useState<PermissionEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [previewStates, setPreviewStates] = useState<Record<string, unknown>>({});
  
  // Use ref to track cleanup and prevent memory leaks
  const cleanupRefs = useRef<Map<string, () => void>>(new Map());

  const addEvent = useCallback((event: PermissionEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
  }, []);

  // Initialize permissions on mount
  useEffect(() => {
    const initializePermissions = async () => {
      const initialStates: PermissionState[] = await Promise.all(
        PERMISSIONS.map(async (permission) => {
          try {
            const status = await checkPermissionStatus(permission.name);
            return {
              permission,
              status,
              lastRequested: undefined,
              data: undefined,
              error: undefined
            };
          } catch (error) {
            return {
              permission,
              status: 'unsupported' as const,
              lastRequested: undefined,
              data: undefined,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      setPermissions(initialStates);
    };

    initializePermissions();
  }, []);

  // Cleanup all resources on unmount
  useEffect(() => () => {
    // Cleanup all active resources
    permissions.forEach(({ permission, data }) => {
      if (data) {
        cleanupPermissionData(permission.name, data);
      }
    });
    
    // Run any additional cleanup functions
    const cleanupMap = cleanupRefs.current;
    cleanupMap.forEach(cleanup => cleanup());
    cleanupMap.clear();
  }, [permissions]); // Include permissions dependency

  const setLoading = useCallback((permissionName: string, loading: boolean) => {
    setLoadingStates(prev => {
      const next = new Set(prev);
      if (loading) {
        next.add(permissionName);
      } else {
        next.delete(permissionName);
      }
      return next;
    });
  }, []);

  const requestPermission = useCallback(async (permissionName: string) => {
    const permissionState = permissions.find(p => p.permission.name === permissionName);
    if (!permissionState) return;

    const { permission } = permissionState;
    
    // Cleanup any existing data first
    if (permissionState.data) {
      cleanupPermissionData(permission.name, permissionState.data);
    }
    
    setLoading(permissionName, true);
    addEvent(createPermissionEvent(permissionName, 'request', `Requesting ${permission.displayName}`));

    try {
      // Use timeout-enhanced request function
      const result = await requestPermissionWithTimeout(permission, 15000);

      // Check the actual permission status after request
      let newStatus = await checkPermissionStatus(permissionName);
      
      // For some permissions, if the request succeeds but status is still 'prompt' or 'unsupported',
      // we can assume it's granted
      if ((newStatus === 'prompt' || newStatus === 'unsupported') && result) {
        newStatus = 'granted';
      }

      setPermissions(prev =>
        prev.map(p =>
          p.permission.name === permissionName
            ? {
                ...p,
                status: newStatus,
                data: newStatus === 'granted' ? result : undefined,
                error: undefined,
                lastRequested: Date.now()
              }
            : p
        )
      );

      addEvent(
        createPermissionEvent(
          permissionName,
          newStatus === 'granted' ? 'grant' : 'deny',
          `${permission.displayName} access ${newStatus}`
        )
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission denied';
      
      setPermissions(prev => 
        prev.map(p => 
          p.permission.name === permissionName
            ? {
                ...p,
                status: 'denied',
                data: undefined,
                error: errorMessage,
                lastRequested: Date.now()
              }
            : p
        )
      );

      addEvent(createPermissionEvent(
        permissionName,
        'error',
        errorMessage
      ));
    } finally {
      setLoading(permissionName, false);
    }
  }, [permissions, addEvent, setLoading]);

  const retryPermission = useCallback(async (permissionName: string) => {
    const permissionState = permissions.find(p => p.permission.name === permissionName);
    if (!permissionState) return;

    const { permission } = permissionState;

    setLoading(permissionName, true);
    addEvent(
      createPermissionEvent(
        permissionName,
        'request',
        `Retrying ${permission.displayName}`
      )
    );

    try {
      let result: unknown;
      switch (permissionName) {
        case 'camera':
          result = await navigator.mediaDevices.getUserMedia({ video: true });
          break;
        case 'microphone':
          result = await navigator.mediaDevices.getUserMedia({ audio: true });
          break;
        case 'geolocation':
          result = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          break;
        case 'notifications':
          result = await Notification.requestPermission();
          break;
        case 'clipboard-read':
          result = await navigator.clipboard.readText();
          break;
        case 'clipboard-write':
          result = await navigator.clipboard.writeText('test');
          break;
        case 'bluetooth':
          result = await (navigator as Navigator & {
            bluetooth?: { requestDevice(o?: unknown): Promise<unknown> };
          }).bluetooth?.requestDevice({ acceptAllDevices: true });
          break;
        case 'midi':
          result = await navigator.requestMIDIAccess?.();
          break;
        case 'persistent-storage':
          result = await navigator.storage?.persist();
          break;
        case 'screen-capture':
          result = await navigator.mediaDevices.getDisplayMedia({ video: true });
          break;
        case 'idle-detection': {
          const Idle = (window as Window & { IdleDetector?: IdleDetectorConstructor }).IdleDetector;
          if (!Idle) throw new Error('IdleDetector not supported');
          const perm = await Idle.requestPermission();
          if (perm !== 'granted') throw new Error('Permission denied');
          const detector = new Idle();
          await detector.start({ threshold: 60000 });
          result = detector;
          break;
        }
        case 'background-sync':
          result = await navigator.permissions.query({
            name: 'background-sync' as PermissionDescriptor['name']
          });
          break;
        default:
          result = await permission.requestFn();
      }

      if (result instanceof MediaStream) {
        // Don't stop tracks here, let the preview component handle it
      }

      let newStatus = await checkPermissionStatus(permissionName);
      if (newStatus === 'prompt' || newStatus === 'unsupported') {
        newStatus = 'granted';
      }

      setPermissions(prev =>
        prev.map(p =>
          p.permission.name === permissionName
            ? {
                ...p,
                status: newStatus,
                data: newStatus === 'granted' ? result : undefined,
                error: undefined,
                lastRequested: Date.now()
              }
            : p
        )
      );

      addEvent(
        createPermissionEvent(
          permissionName,
          newStatus === 'granted' ? 'grant' : 'deny',
          `${permission.displayName} access ${newStatus}`
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission denied';

      setPermissions(prev =>
        prev.map(p =>
          p.permission.name === permissionName
            ? {
                ...p,
                status: 'denied',
                data: undefined,
                error: errorMessage,
                lastRequested: Date.now()
              }
            : p
        )
      );

      addEvent(createPermissionEvent(permissionName, 'error', errorMessage));
    } finally {
      setLoading(permissionName, false);
    }
  }, [permissions, addEvent, setLoading]);

  const copyCodeSnippet = useCallback(async (permissionName: string) => {
    const permission = PERMISSIONS.find(p => p.name === permissionName);
    if (!permission) return;

    const code = generateCodeSnippet(permission);
    
    try {
      await navigator.clipboard.writeText(code);
      addEvent(createPermissionEvent(
        permissionName,
        'request',
        'Code snippet copied to clipboard'
      ));
    } catch {
      // Silent fail for clipboard errors
    }
  }, [addEvent]);

  const copyEventLog = useCallback(async () => {
    const logText = events
      .map(event => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        return `${time} - ${event.permissionName}: ${event.action} ${event.details || ''}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(logText);
      addEvent(createPermissionEvent(
        'system',
        'request',
        'Event log copied to clipboard'
      ));
    } catch {
      // Silent fail for clipboard errors
    }
  }, [events, addEvent]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    addEvent(createPermissionEvent(
      'system',
      'request',
      'Event log cleared'
    ));
  }, [addEvent]);

  const testNotification = useCallback(() => {
    if (Notification.permission !== 'granted') {
      addEvent(createPermissionEvent(
        'notifications',
        'error',
        'Notification permission not granted'
      ));
      return;
    }
    try {
      // eslint-disable-next-line no-new
      new Notification('MyDebugger', {
        body: 'Test notification from Permission Tester'
      });
      addEvent(createPermissionEvent(
        'notifications',
        'request',
        'Test notification sent'
      ));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Notification error';
      addEvent(createPermissionEvent('notifications', 'error', msg));
    }
  }, [addEvent]);

  const getCodeSnippet = useCallback((permissionName: string): string => {
    const permission = PERMISSIONS.find(p => p.name === permissionName);
    return permission ? generateCodeSnippet(permission) : '';
  }, []);

  const isLoading = useCallback((permissionName: string): boolean => 
    loadingStates.has(permissionName), [loadingStates]);

  const getPermissionData = useCallback((permissionName: string) => {
    const permissionState = permissions.find(p => p.permission.name === permissionName);
    return permissionState?.data;
  }, [permissions]);

  const clearPermissionData = useCallback((permissionName: string) => {
    const permissionState = permissions.find(p => p.permission.name === permissionName);
    if (permissionState?.data) {
      cleanupPermissionData(permissionName, permissionState.data);
    }
    
    setPermissions(prev =>
      prev.map(p =>
        p.permission.name === permissionName ? { ...p, data: undefined } : p
      )
    );
  }, [permissions]);

  // Filter permissions based on search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return permissions;
    
    const query = searchQuery.toLowerCase();
    return permissions.filter(({ permission }) => 
      permission.name.toLowerCase().includes(query) ||
      permission.displayName.toLowerCase().includes(query) ||
      permission.description.toLowerCase().includes(query) ||
      permission.category.toLowerCase().includes(query)
    );
  }, [permissions, searchQuery]);

  // Enhanced Preview management functions with comprehensive preview support
  const updatePreviewState = useCallback((permissionName: string, data: unknown) => {
    setPreviewStates(prev => ({
      ...prev,
      [permissionName]: data
    }));
  }, []);

  // Check if preview is active for a permission
  const isPreviewActive = useCallback((permissionName: string): boolean => 
    activePreview === permissionName, [activePreview]);

  // Enhanced preview starter with comprehensive coverage
  const startPreview = useCallback(async (permissionName: string) => {
    const permissionState = permissions.find(p => p.permission.name === permissionName);
    if (!permissionState || permissionState.status !== 'granted') return;

    setActivePreview(permissionName);

    try {
      switch (permissionName) {
        case 'camera': {
          const stream = permissionState.data as MediaStream;
          if (stream) {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            updatePreviewState(permissionName, { stream, video, type: 'camera' });
          }
          break;
        }
        case 'microphone': {
          const stream = permissionState.data as MediaStream;
          if (stream) {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            updatePreviewState(permissionName, { 
              stream, 
              audioContext, 
              analyser, 
              dataArray, 
              type: 'microphone' 
            });
          }
          break;
        }
        case 'screen-capture': {
          const stream = permissionState.data as MediaStream;
          if (stream) {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            updatePreviewState(permissionName, { stream, video, type: 'screen' });
          }
          break;
        }
        case 'geolocation': {
          const position = permissionState.data as GeolocationPosition;
          if (position) {
            updatePreviewState(permissionName, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              type: 'location',
              mapUrl: `https://www.openstreetmap.org/?mlat=${position.coords.latitude}&mlon=${position.coords.longitude}&zoom=15`
            });
          }
          break;
        }
        case 'bluetooth': {
          const device = permissionState.data as { name?: string; id?: string };
          if (device) {
            updatePreviewState(permissionName, {
              device,
              type: 'bluetooth',
              name: device.name || 'Unknown Device',
              id: device.id || 'Unknown ID'
            });
          }
          break;
        }
        case 'usb': {
          const device = permissionState.data as { productName?: string; manufacturerName?: string };
          if (device) {
            updatePreviewState(permissionName, {
              device,
              type: 'usb',
              productName: device.productName || 'Unknown Device',
              manufacturerName: device.manufacturerName || 'Unknown Manufacturer'
            });
          }
          break;
        }
        case 'midi': {
          const access = permissionState.data as { inputs: Map<string, unknown>; outputs: Map<string, unknown> };
          if (access) {
            const inputs = Array.from(access.inputs.values());
            const outputs = Array.from(access.outputs.values());
            updatePreviewState(permissionName, {
              access,
              inputs,
              outputs,
              type: 'midi'
            });
          }
          break;
        }
        case 'storage-access': {
          updatePreviewState(permissionName, {
            type: 'storage',
            hasAccess: true,
            timestamp: Date.now()
          });
          break;
        }
        case 'persistent-storage': {
          const persisted = permissionState.data;
          if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            updatePreviewState(permissionName, {
              persisted,
              quota: estimate.quota,
              usage: estimate.usage,
              type: 'storage-persistent'
            });
          }
          break;
        }
        default:
          updatePreviewState(permissionName, {
            type: 'generic',
            data: permissionState.data,
            timestamp: Date.now()
          });
      }
    } catch (error) {
      // Log error for debugging but don't throw
      updatePreviewState(permissionName, {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [permissions, updatePreviewState]);

  // Stop preview for a permission
  const stopPreview = useCallback((permissionName: string) => {
    if (activePreview === permissionName) {
      setActivePreview(null);
    }
    // Clean up any resources associated with this preview
    const cleanup = cleanupRefs.current.get(permissionName);
    if (cleanup) {
      cleanup();
      cleanupRefs.current.delete(permissionName);
    }
    // Clear preview state
    setPreviewStates(prev => {
      const { [permissionName]: unused, ...rest } = prev;
      return rest;
    });
  }, [activePreview]);

  // Export test results
  const exportResults = useCallback(async () => {
    const results = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      permissions: permissions.map(({ permission, status, error, lastRequested }) => ({
        name: permission.name,
        displayName: permission.displayName,
        category: permission.category,
        status,
        error,
        lastRequested,
        supported: status !== 'unsupported'
      })),
      events: events.slice(0, 50), // Last 50 events
      summary: {
        total: permissions.length,
        granted: permissions.filter(p => p.status === 'granted').length,
        denied: permissions.filter(p => p.status === 'denied').length,
        unsupported: permissions.filter(p => p.status === 'unsupported').length
      }
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `permission-test-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addEvent(createPermissionEvent('system', 'grant', 'Test results exported'));
  }, [permissions, events, addEvent]);

  // Run batch test on multiple permissions
  const runBatchTest = useCallback(async (permissionNames: string[]) => {
    addEvent(createPermissionEvent('system', 'request', `Starting batch test for ${permissionNames.length} permissions`));
    
    // Process permissions sequentially using reduce to avoid for...await
    await permissionNames.reduce(async (previousPromise, permissionName) => {
      await previousPromise;
      await requestPermission(permissionName);
      // Small delay between requests to avoid overwhelming the browser
      return new Promise<void>(resolve => {
        setTimeout(() => resolve(), 500);
      });
    }, Promise.resolve());
    
    addEvent(createPermissionEvent('system', 'grant', 'Batch test completed'));
  }, [requestPermission, addEvent]);

  // Permission statistics
  const permissionStats = useMemo(() => {
    const granted = permissions.filter(p => p.status === 'granted').length;
    const denied = permissions.filter(p => p.status === 'denied').length;
    const unsupported = permissions.filter(p => p.status === 'unsupported').length;
    
    return {
      granted,
      denied,
      unsupported,
      total: permissions.length
    };
  }, [permissions]);

  return {
    permissions,
    filteredPermissions,
    events,
    searchQuery,
    setSearchQuery,
    requestPermission,
    retryPermission,
    copyCodeSnippet,
    copyEventLog,
    clearEvents,
    testNotification,
    getCodeSnippet,
    isLoading,
    getPermissionData,
    clearPermissionData,
    activePreview,
    setActivePreview,
    previewStates,
    updatePreviewState,
    isPreviewActive,
    startPreview,
    stopPreview,
    exportResults,
    runBatchTest,
    permissionStats
  };
};

export default usePermissionTester;
