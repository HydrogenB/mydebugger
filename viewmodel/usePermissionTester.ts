/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Permission Tester ViewModel Hook
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PERMISSIONS,
  PermissionState,
  PermissionEvent,
  checkPermissionStatus,
  generateCodeSnippet,
  createPermissionEvent,
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
}

const usePermissionTester = (): UsePermissionTesterReturn => {
  const [permissions, setPermissions] = useState<PermissionState[]>([]);
  const [events, setEvents] = useState<PermissionEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());

  const addEvent = useCallback((event: PermissionEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
  }, []);

  // Initialize permissions on mount
  useEffect(() => {
    const initializePermissions = async () => {
      const initialStates: PermissionState[] = await Promise.all(
        PERMISSIONS.map(async (permission) => {
          const status = await checkPermissionStatus(permission.name);
          return {
            permission,
            status,
            lastRequested: undefined,
            data: undefined,
            error: undefined
          };
        })
      );
      
      setPermissions(initialStates);
    };

    initializePermissions();
  }, []);

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
    
    setLoading(permissionName, true);
    addEvent(createPermissionEvent(permissionName, 'request', `Requesting ${permission.displayName}`));

    try {
      const result = await permission.requestFn();
      let status = await checkPermissionStatus(permissionName);
      if (status === 'unsupported' || status === 'prompt') {
        status = 'granted';
      }

      setPermissions(prev =>
        prev.map(p =>
          p.permission.name === permissionName
            ? {
                ...p,
                status,
                data: status === 'granted' ? result : undefined,
                error: undefined,
                lastRequested: Date.now()
              }
            : p
        )
      );

      addEvent(
        createPermissionEvent(
          permissionName,
          status === 'granted' ? 'grant' : 'deny',
          `${permission.displayName} access ${status}`
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
    setPermissions(prev =>
      prev.map(p =>
        p.permission.name === permissionName ? { ...p, data: undefined } : p
      )
    );
  }, []);

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
    clearPermissionData
  };
};

export default usePermissionTester;
