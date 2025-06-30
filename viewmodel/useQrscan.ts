/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useRef, useState } from 'react';
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
  const controls = useRef<IScannerControls>();

  useEffect(() => {
    listVideoInputDevices()
      .then((d) => {
        setDevices(d);
        if (d.length > 0) setDeviceId(d[0].deviceId);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  const start = async () => {
    if (!videoRef.current) return;
    try {
      controls.current = await startQrScan(videoRef.current, setResult, deviceId);
      setScanning(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const stop = () => {
    stopQrScan(controls.current);
    setScanning(false);
  };

  const flip = async () => {
    if (devices.length <= 1) return;
    const idx = devices.findIndex((d) => d.deviceId === deviceId);
    const next = devices[(idx + 1) % devices.length];
    setDeviceId(next.deviceId);
    if (scanning) {
      stop();
      await start();
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
  };
};

export default useQrscan;
