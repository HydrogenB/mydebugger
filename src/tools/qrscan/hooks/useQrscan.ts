/**
 * ? 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IScannerControls } from '@zxing/browser';

import {
  decodeFile,
  getZoomCapability,
  isTorchSupported,
  listVideoInputDevices,
  setZoom as applyZoomToTrack,
  startQrScan,
  stopQrScan,
  toggleTorch as toggleTorchOnTrack,
  type VideoDevice,
} from '../lib/qrscan';

const SETTINGS_KEY = 'qrscan-settings';
const HISTORY_KEY = 'qrscan-history';
const HISTORY_LIMIT = 100;

const isBrowser = typeof window !== 'undefined';

const SUCCESS_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUdCNNiwt4gBAEa2/e8iCYBKNCtxtdDDgRGe8pIK9cUAAA==';

export type CameraStatus = 'idle' | 'initializing' | 'ready' | 'blocked' | 'no-device' | 'error';
export type ScanSource = 'camera' | 'file' | 'manual';

type CameraPermission = 'granted' | 'denied' | 'prompt' | 'unknown';

export interface ScanRecord {
  id: string;
  text: string;
  timestamp: number;
  format: string;
  type: string;
  source: ScanSource;
}

export interface SessionStats {
  totalScans: number;
  uniqueScans: number;
  duplicateCount: number;
  averageIntervalMs: number | null;
  lastScanAgoMs: number | null;
}

export interface UseQrscanReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  start: () => Promise<void>;
  stop: () => void;
  flip: () => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  refreshDevices: () => Promise<void>;
  scanning: boolean;
  isBusy: boolean;
  canFlip: boolean;
  cameraStatus: CameraStatus;
  cameraPermission: CameraPermission;
  error: string;
  clearError: () => void;
  result: string;
  format: string;
  lastSource: ScanSource | null;
  clearResult: () => void;
  devices: VideoDevice[];
  selectedCamera: string;
  scanHistory: ScanRecord[];
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  exportHistory: () => void;
  sessionStats: SessionStats;
  scanCount: number;
  lastScanTime: number | null;
  autoCopy: boolean;
  setAutoCopy: (value: boolean) => void;
  autoOpen: boolean;
  setAutoOpen: (value: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  continuousMode: boolean;
  setContinuousMode: (value: boolean) => void;
  filterDuplicates: boolean;
  setFilterDuplicates: (value: boolean) => void;
  torch: {
    enabled: boolean;
    available: boolean;
    toggle: () => Promise<void>;
  };
  zoom: {
    value: number;
    min: number;
    max: number;
    step: number;
    available: boolean;
    set: (value: number) => Promise<void>;
  };
  scanFromFile: (file: File) => Promise<void>;
  processManualText: (text: string) => void;
}

export const detectQrType = (text: string): string => {
  const value = text.trim().toLowerCase();
  if (value.startsWith('http://') || value.startsWith('https://')) return 'url';
  if (value.startsWith('mailto:')) return 'email';
  if (value.startsWith('tel:')) return 'phone';
  if (value.startsWith('sms:') || value.startsWith('smsto:')) return 'sms';
  if (value.includes('wifi:')) return 'wifi';
  if (value.startsWith('geo:')) return 'location';
  if (value.includes('begin:vcard')) return 'vcard';
  if (value.startsWith('bitcoin:')) return 'bitcoin';
  return 'text';
};

export const computeSessionStats = (
  history: ScanRecord[],
  scanCount: number,
  lastScanTime: number | null,
): SessionStats => {
  if (history.length === 0) {
    return {
      totalScans: scanCount,
      uniqueScans: 0,
      duplicateCount: 0,
      averageIntervalMs: null,
      lastScanAgoMs: lastScanTime ? Date.now() - lastScanTime : null,
    };
  }

  const unique = new Set<string>();
  history.forEach((entry) => unique.add(entry.text));

  let totalInterval = 0;
  let intervalCount = 0;
  let previousTimestamp: number | null = null;

  history.forEach((entry) => {
    if (previousTimestamp !== null) {
      totalInterval += Math.abs(previousTimestamp - entry.timestamp);
      intervalCount += 1;
    }
    previousTimestamp = entry.timestamp;
  });

  const averageIntervalMs = intervalCount > 0 ? Math.round(totalInterval / intervalCount) : null;

  return {
    totalScans: scanCount,
    uniqueScans: unique.size,
    duplicateCount: Math.max(scanCount - unique.size, 0),
    averageIntervalMs,
    lastScanAgoMs: lastScanTime ? Date.now() - lastScanTime : null,
  };
};

const playSuccessSound = (() => {
  if (!isBrowser || typeof Audio === 'undefined') {
    return (_soundEnabled: boolean) => {};
  }

  let audio: HTMLAudioElement | null = null;
  return (soundEnabled: boolean) => {
    if (!soundEnabled) return;
    try {
      if (!audio) {
        audio = new Audio(SUCCESS_SOUND);
        audio.preload = 'auto';
      }
      audio.currentTime = 0;
      void audio.play();
    } catch {
      // Ignore playback failures (e.g., autoplay restrictions).
    }
  };
})();

const generateRecordId = () =>
  'scan-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

const normaliseCameraError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes('permission')) {
    return 'Camera permission denied. Please allow access in your browser settings.';
  }
  if (message.toLowerCase().includes('not found')) {
    return 'No compatible camera device was found.';
  }
  return message || 'Unable to access the camera.';
};

const createRecord = (text: string, format: string, source: ScanSource): ScanRecord => ({
  id: generateRecordId(),
  text,
  timestamp: Date.now(),
  format,
  type: detectQrType(text),
  source,
});

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const useQrscan = (): UseQrscanReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls>();

  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [scanning, setScanning] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>('unknown');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [format, setFormat] = useState('QR_CODE');
  const [lastSource, setLastSource] = useState<ScanSource | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);
  const [autoCopy, setAutoCopy] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(false);
  const [filterDuplicates, setFilterDuplicates] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [zoomValue, setZoomValue] = useState(1);
  const [zoomCapability, setZoomCapability] = useState<{ min: number; max: number; step: number } | null>(null);

  const historyRef = useRef<ScanRecord[]>([]);
  useEffect(() => {
    historyRef.current = scanHistory;
  }, [scanHistory]);

  const persistHistory = useCallback((records: ScanRecord[]) => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
    } catch (persistError) {
      setError('Failed to save scan history: ' + (persistError as Error).message);
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!isBrowser || !navigator.mediaDevices) {
      setDevices([]);
      setCameraStatus('no-device');
      return;
    }

    try {
      const deviceList = await listVideoInputDevices();
      setDevices(deviceList);

      if (deviceList.length === 0) {
        setCameraStatus('no-device');
        return;
      }

      if (!selectedCamera) {
        setSelectedCamera(deviceList[0].deviceId);
      }

      if (cameraStatus === 'no-device') {
        setCameraStatus('idle');
      }
    } catch (deviceError) {
      setError('Unable to enumerate cameras: ' + (deviceError as Error).message);
      setCameraStatus('error');
      setDevices([]);
    }
  }, [cameraStatus, selectedCamera]);

  const clearError = useCallback(() => setError(''), []);

  useEffect(() => {
    if (!isBrowser) return;

    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as {
          autoCopy?: boolean;
          autoOpen?: boolean;
          soundEnabled?: boolean;
          continuousMode?: boolean;
          filterDuplicates?: boolean;
        };
        setAutoCopy(Boolean(parsed.autoCopy));
        setAutoOpen(Boolean(parsed.autoOpen));
        setSoundEnabled(parsed.soundEnabled !== false);
        setContinuousMode(Boolean(parsed.continuousMode));
        setFilterDuplicates(parsed.filterDuplicates !== false);
      }

      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as ScanRecord[];
        if (Array.isArray(parsedHistory)) {
          setScanHistory(parsedHistory);
          setScanCount(parsedHistory.length);
        }
      }
    } catch (loadError) {
      setError('Error loading QR scanner settings: ' + (loadError as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          autoCopy,
          autoOpen,
          soundEnabled,
          continuousMode,
          filterDuplicates,
        }),
      );
    } catch (persistError) {
      setError('Error saving QR scanner settings: ' + (persistError as Error).message);
    }
  }, [autoCopy, autoOpen, soundEnabled, continuousMode, filterDuplicates]);

  useEffect(() => {
    if (!filterDuplicates) return;
    setScanHistory((previous) => {
      const seen = new Set<string>();
      const deduped: ScanRecord[] = [];
      previous.forEach((record) => {
        if (seen.has(record.text)) return;
        seen.add(record.text);
        deduped.push(record);
      });
      if (deduped.length !== previous.length) {
        persistHistory(deduped);
      }
      return deduped;
    });
  }, [filterDuplicates, persistHistory]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  useEffect(() => {
    if (!isBrowser || !navigator.permissions) {
      setCameraPermission('unknown');
      return;
    }

    let permissionStatus: PermissionStatus | undefined;
    let cancelled = false;

    const listen = async () => {
      try {
        permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (cancelled) return;
        setCameraPermission(permissionStatus.state as CameraPermission);
        const handler = () => setCameraPermission(permissionStatus ? permissionStatus.state as CameraPermission : 'unknown');
        permissionStatus.addEventListener('change', handler);
      } catch {
        setCameraPermission('unknown');
      }
    };

    listen();

    return () => {
      cancelled = true;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  const updateCapabilities = useCallback(() => {
    if (!isBrowser) return;
    const video = videoRef.current;
    if (!video) return;

    const torchSupport = isTorchSupported(video);
    setTorchAvailable(torchSupport);
    if (!torchSupport) {
      setTorchEnabled(false);
    }

    const capability = getZoomCapability(video);
    setZoomCapability(capability);
    if (capability) {
      setZoomValue((prev) => clamp(prev, capability.min, capability.max));
    } else {
      setZoomValue(1);
    }
  }, []);

  const stop = useCallback(() => {
    stopQrScan(controlsRef.current);
    controlsRef.current = undefined;
    setScanning(false);
    setCameraStatus((previous) => (previous === 'ready' ? 'idle' : previous));
    setTorchEnabled(false);
  }, []);

  const processDecodedValue = useCallback(async (text: string, barcodeFormat: string, source: ScanSource) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setResult(trimmed);
    setFormat(barcodeFormat);
    setLastSource(source);
    setScanCount((previous) => previous + 1);
    const timestamp = Date.now();
    setLastScanTime(timestamp);

    const record = createRecord(trimmed, barcodeFormat, source);

    setScanHistory((previous) => {
      const base = filterDuplicates ? previous.filter((entry) => entry.text !== trimmed) : previous;
      const next = [record, ...base].slice(0, HISTORY_LIMIT);
      persistHistory(next);
      return next;
    });

    playSuccessSound(soundEnabled);

    if (autoCopy && isBrowser && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(trimmed);
      } catch (copyError) {
        setError('Failed to copy result: ' + (copyError as Error).message);
      }
    }

    if (autoOpen && isBrowser && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
      window.open(trimmed, '_blank', 'noopener');
    }
  }, [autoCopy, autoOpen, filterDuplicates, persistHistory, soundEnabled]);

  const handleCameraResult = useCallback((text: string, barcodeFormat?: string) => {
    void processDecodedValue(text, barcodeFormat || 'UNKNOWN', 'camera');
    if (!continuousMode) {
      stop();
    }
  }, [continuousMode, processDecodedValue, stop]);

  const startInternal = useCallback(async (cameraOverride?: string) => {
    if (!isBrowser) return;
    const video = videoRef.current;
    if (!video) return;

    if (cameraPermission === 'denied') {
      setError('Camera permission denied. Please enable access in your browser.');
      setCameraStatus('blocked');
      return;
    }

    setIsBusy(true);
    setCameraStatus('initializing');
    setError('');

    const cameraId = cameraOverride || selectedCamera || (devices[0]?.deviceId ?? '');
    if (cameraId) {
      setSelectedCamera(cameraId);
    }

    stopQrScan(controlsRef.current);
    controlsRef.current = undefined;

    try {
      controlsRef.current = await startQrScan(video, handleCameraResult, cameraId || undefined, true);
      setScanning(true);
      setCameraStatus('ready');
      updateCapabilities();
    } catch (startError) {
      const message = normaliseCameraError(startError);
      setError(message);
      setCameraStatus(message.toLowerCase().includes('permission') ? 'blocked' : 'error');
      setScanning(false);
    } finally {
      setIsBusy(false);
    }
  }, [cameraPermission, devices, handleCameraResult, selectedCamera, updateCapabilities]);

  const start = useCallback(async () => {
    await startInternal();
  }, [startInternal]);

  const switchCamera = useCallback(async (deviceId: string) => {
    if (!deviceId || deviceId === selectedCamera) {
      setSelectedCamera(deviceId);
      return;
    }

    setSelectedCamera(deviceId);

    if (!scanning) {
      return;
    }

    stop();
    await sleep(120);
    await startInternal(deviceId);
  }, [scanning, selectedCamera, startInternal, stop]);

  const flip = useCallback(async () => {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex((device) => device.deviceId === selectedCamera);
    const nextDevice = devices[(currentIndex + 1) % devices.length];
    await switchCamera(nextDevice.deviceId);
  }, [devices, selectedCamera, switchCamera]);

  const toggleTorch = useCallback(async () => {
    if (!torchAvailable) {
      setError('Torch is not available for the current camera.');
      return;
    }

    try {
      await toggleTorchOnTrack(videoRef.current, !torchEnabled);
      setTorchEnabled((previous) => !previous);
    } catch (torchError) {
      setError('Unable to toggle torch: ' + (torchError as Error).message);
      setTorchAvailable(false);
    }
  }, [torchAvailable, torchEnabled]);

  const setZoom = useCallback(async (value: number) => {
    if (!zoomCapability) {
      setError('Zoom is not available for the current camera.');
      return;
    }

    const clampedValue = clamp(value, zoomCapability.min, zoomCapability.max);
    try {
      await applyZoomToTrack(videoRef.current, clampedValue);
      setZoomValue(clampedValue);
    } catch (zoomError) {
      setError('Unable to adjust zoom: ' + (zoomError as Error).message);
    }
  }, [zoomCapability]);

  const scanFromFile = useCallback(async (file: File) => {
    if (!file) return;
    setIsBusy(true);
    setError('');
    try {
      const decoded = await decodeFile(file, true);
      await processDecodedValue(decoded.text, decoded.format, 'file');
    } catch (decodeError) {
      setError('Unable to decode the selected file: ' + (decodeError as Error).message);
    } finally {
      setIsBusy(false);
    }
  }, [processDecodedValue]);

  const processManualText = useCallback((text: string) => {
    if (!text.trim()) return;
    void processDecodedValue(text, 'MANUAL', 'manual');
  }, [processDecodedValue]);

  const removeHistoryEntry = useCallback((id: string) => {
    setScanHistory((previous) => {
      const next = previous.filter((record) => record.id !== id);
      persistHistory(next);
      return next;
    });
  }, [persistHistory]);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
    if (!isBrowser) return;
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (clearError) {
      setError('Error clearing history: ' + (clearError as Error).message);
    }
  }, []);

  const exportHistory = useCallback(() => {
    if (!isBrowser || scanHistory.length === 0) return;

    const payload = {
      exportedAt: new Date().toISOString(),
      total: scanHistory.length,
      records: scanHistory.map((record) => ({
        ...record,
        timestamp: new Date(record.timestamp).toISOString(),
      })),
      settings: {
        autoCopy,
        autoOpen,
        soundEnabled,
        continuousMode,
        filterDuplicates,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'qrscan-history.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [autoCopy, autoOpen, continuousMode, filterDuplicates, scanHistory, soundEnabled]);

  const clearResult = useCallback(() => {
    setResult('');
    setFormat('QR_CODE');
    setLastSource(null);
  }, []);

  const sessionStats = useMemo(
    () => computeSessionStats(scanHistory, scanCount, lastScanTime),
    [scanHistory, scanCount, lastScanTime],
  );

  const torch = useMemo(() => ({
    enabled: torchEnabled,
    available: torchAvailable,
    toggle: toggleTorch,
  }), [torchAvailable, torchEnabled, toggleTorch]);

  const zoom = useMemo(() => ({
    value: zoomValue,
    min: zoomCapability ? zoomCapability.min : 1,
    max: zoomCapability ? zoomCapability.max : 1,
    step: zoomCapability ? zoomCapability.step : 0.1,
    available: Boolean(zoomCapability && zoomCapability.max > zoomCapability.min),
    set: setZoom,
  }), [setZoom, zoomCapability, zoomValue]);

  const canFlip = devices.length > 1;

  return {
    videoRef,
    start,
    stop,
    flip,
    switchCamera,
    refreshDevices,
    scanning,
    isBusy,
    canFlip,
    cameraStatus,
    cameraPermission,
    error,
    clearError,
    result,
    format,
    lastSource,
    clearResult,
    devices,
    selectedCamera,
    scanHistory,
    removeHistoryEntry,
    clearHistory,
    exportHistory,
    sessionStats,
    scanCount,
    lastScanTime,
    autoCopy,
    setAutoCopy,
    autoOpen,
    setAutoOpen,
    soundEnabled,
    setSoundEnabled,
    continuousMode,
    setContinuousMode,
    filterDuplicates,
    setFilterDuplicates,
    torch,
    zoom,
    scanFromFile,
    processManualText,
  };
};

export default useQrscan;
