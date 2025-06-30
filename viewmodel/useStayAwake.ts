/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useState } from 'react';
import { isWakeLockSupported, requestWakeLock, releaseWakeLock } from '../model/stayAwake';

export interface UseStayAwakeReturn {
  enabled: boolean;
  supported: boolean;
  toggle: () => Promise<void>;
}

const useStayAwake = (): UseStayAwakeReturn => {
  const [enabled, setEnabled] = useState(true);
  const [sentinel, setSentinel] = useState<WakeLockSentinel | null>(null);
  const supported = isWakeLockSupported();

  const acquire = useCallback(async () => {
    if (!supported) return;
    try {
      const s = await requestWakeLock();
      s.addEventListener('release', () => setEnabled(false));
      setSentinel(s);
      setEnabled(true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setEnabled(false);
      setSentinel(null);
    }
  }, [supported]);

  const release = useCallback(async () => {
    await releaseWakeLock(sentinel);
    setSentinel(null);
    setEnabled(false);
  }, [sentinel]);

  const toggle = useCallback(async () => {
    if (enabled) {
      await release();
    } else {
      await acquire();
    }
  }, [enabled, acquire, release]);

  useEffect(() => {
    if (enabled) acquire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && enabled) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, acquire]);

  return { enabled, supported, toggle };
};

export default useStayAwake;
