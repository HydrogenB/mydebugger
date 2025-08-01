/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { IScannerControls } from '@zxing/browser';
import {
  startQrScan,
  stopQrScan,
  listVideoInputDevices,
  VideoDevice,
} from '../model/qrscan';

export const useQrscan = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>();
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<Array<{id: string, text: string, timestamp: number, type: string}>>([]);
  const [autoCopy, setAutoCopy] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [flashlight, setFlashlight] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(false);
  const [filterDuplicates, setFilterDuplicates] = useState(true);
  const controls = useRef<IScannerControls>();

  const checkCameraPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(permissionStatus.state);
      permissionStatus.addEventListener('change', () => {
        setCameraPermission(permissionStatus.state);
      });
    } catch {
      setCameraPermission('unknown');
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('qrscan-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setAutoCopy(settings.autoCopy ?? false);
        setAutoOpen(settings.autoOpen ?? false);
        setSoundEnabled(settings.soundEnabled ?? true);
        setContinuousMode(settings.continuousMode ?? false);
        setFilterDuplicates(settings.filterDuplicates ?? true);
      }
      const history = localStorage.getItem('qrscan-history');
      if (history) {
        setScanHistory(JSON.parse(history));
      }
    } catch (err) {
      setError(`Error loading QR scanner settings: ${(err as Error).message}`);
    }
  };

  const saveSettings = useCallback(() => {
    try {
      const settings = {
        autoCopy,
        autoOpen,
        soundEnabled,
        continuousMode,
        filterDuplicates,
      };
      localStorage.setItem('qrscan-settings', JSON.stringify(settings));
    } catch (err) {
      setError(`Error saving QR scanner settings: ${(err as Error).message}`);
    }
  }, [autoCopy, autoOpen, soundEnabled, continuousMode, filterDuplicates]);

  useEffect(() => {
    listVideoInputDevices()
      .then((d) => {
        setDevices(d);
        if (d.length > 0) {
          setDeviceId(d[0].deviceId);
          setSelectedCamera(d[0].deviceId);
        }
      })
      .catch((e) => setError((e as Error).message));

    checkCameraPermission();
    loadSettings();
  }, []);

  useEffect(() => {
    saveSettings();
  }, [autoCopy, autoOpen, soundEnabled, continuousMode, filterDuplicates, saveSettings]);

  const detectQRType = (text: string): string => {
    if (text.startsWith('http://') || text.startsWith('https://')) return 'url';
    if (text.startsWith('mailto:')) return 'email';
    if (text.startsWith('tel:')) return 'phone';
    if (text.startsWith('sms:')) return 'sms';
    if (text.startsWith('WIFI:')) return 'wifi';
    if (text.startsWith('geo:')) return 'location';
    if (text.includes('BEGIN:VCARD')) return 'vcard';
    if (text.startsWith('bitcoin:')) return 'bitcoin';
    return 'text';
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUdCNNiwt4gBAEa2/e8iCYBKNCtxtdDDgRGe8pIK9cUAAA==');
      if (audio.play) {
        audio.play().catch(() => {}); // Ignore play errors
      }
    } catch {
      // Ignore audio creation errors (e.g., in test environments)
    }
  };

  const addToHistory = (text: string) => {
    const newScan = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      timestamp: Date.now(),
      type: detectQRType(text),
    };

    setScanHistory(prev => {
      const filtered = filterDuplicates ? 
        prev.filter(scan => scan.text !== text) : prev;
      const updated = [newScan, ...filtered].slice(0, 50); // Keep last 50 scans
      
      try {
        localStorage.setItem('qrscan-history', JSON.stringify(updated));
      } catch (err) {
        setError(`Error saving scan history: ${(err as Error).message}`);
      }
      
      return updated;
    });
  };

  const stop = () => {
    stopQrScan(controls.current);
    setScanning(false);
  };

  const handleScanResult = async (text: string) => {
    setResult(text);
    setScanCount(prev => prev + 1);
    setLastScanTime(Date.now());
    
    playSuccessSound();
    addToHistory(text);

    if (autoCopy) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        setError(`Failed to auto-copy: ${(err as Error).message}`);
      }
    }

    if (autoOpen && (text.startsWith('http://') || text.startsWith('https://'))) {
      window.open(text, '_blank');
    }

    if (!continuousMode) {
      stop();
    }
  };

  const start = async () => {
    if (!videoRef.current) return;
    try {
      controls.current = await startQrScan(videoRef.current, handleScanResult, selectedCamera || deviceId);
      setScanning(true);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const flip = async () => {
    if (devices.length <= 1) return;
    const idx = devices.findIndex((d) => d.deviceId === (selectedCamera || deviceId));
    const next = devices[(idx + 1) % devices.length];
    setDeviceId(next.deviceId);
    setSelectedCamera(next.deviceId);
    if (scanning) {
      stop();
      setTimeout(start, 100); // Small delay to ensure camera is released
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    try {
      localStorage.removeItem('qrscan-history');
    } catch (err) {
      setError(`Error clearing history: ${(err as Error).message}`);
    }
  };

  const clearResult = () => {
    setResult('');
  };

  const toggleFlashlight = async () => {
    setFlashlight(!flashlight);
    setError('Flashlight control not available in this browser');
  };

  const adjustZoom = async (newZoom: number) => {
    setZoom(newZoom);
    setError('Zoom control not available in this browser');
  };

  const switchCamera = async (newDeviceId: string) => {
    setSelectedCamera(newDeviceId);
    setDeviceId(newDeviceId);
    if (scanning) {
      stop();
      setTimeout(start, 100);
    }
  };

  return {
    videoRef,
    start,
    stop,
    flip,
    result,
    error,
    scanning,
    canFlip: devices.length > 1,
    // Enhanced features
    devices,
    selectedCamera,
    switchCamera,
    scanHistory,
    clearHistory,
    clearResult,
    scanCount,
    lastScanTime,
    cameraPermission,
    // Settings
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
    // Camera controls
    flashlight,
    toggleFlashlight,
    zoom,
    adjustZoom,
  };
};

export default useQrscan;
