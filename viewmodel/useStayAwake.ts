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
  const [supported, setSupported] = useState(false);
  const isClient = typeof navigator !== 'undefined';

  const acquire = useCallback(async () => {
    if (!supported || !isClient) return;
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
  }, [supported, isClient]);

  const release = useCallback(async () => {
    if (!isClient) return;
    await releaseWakeLock(sentinel);
    setSentinel(null);
    setEnabled(false);
  }, [sentinel, isClient]);

  const toggle = useCallback(async () => {
    if (!isClient) return;
    if (enabled) {
      await release();
    } else {
      await acquire();
    }
  }, [enabled, acquire, release, isClient]);

  useEffect(() => {
    if (isClient) {
      setSupported(isWakeLockSupported());
    }
  }, [isClient]);

  useEffect(() => {
    if (enabled && supported && isClient) {
      acquire();
    }
  }, [enabled, supported, isClient, acquire]);

  useEffect(() => {
    if (!isClient) return undefined;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && enabled) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, acquire, isClient]);

  return { enabled, supported, toggle };
};

export default useStayAwake;
