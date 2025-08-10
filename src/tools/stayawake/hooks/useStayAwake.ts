/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { isWakeLockSupported, requestWakeLock, releaseWakeLock } from '../lib/stayAwake';
import { addAwakeTime, loadStats, resetStats as resetStatsModel } from '../lib/stayAwakeStats';

export interface UseStayAwakeReturn {
  supported: boolean;
  running: boolean;
  timeLeft: number;
  duration: number;
  stats: { todayMin: number; weekHr: number; weekMin: number };
  start: (ms: number) => Promise<void>;
  toggle: () => Promise<void>;
  resetStats: () => void;
}

const useStayAwake = (): UseStayAwakeReturn => {
  const [supported, setSupported] = useState(false);
  const [sentinel, setSentinel] = useState<WakeLockSentinel | null>(null);
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [stats, setStats] = useState(loadStats());
  const intervalRef = useRef<number>();
  const isClient = typeof navigator !== 'undefined';

  const acquire = useCallback(async () => {
    if (!supported || !isClient) return;
    try {
      const s = await requestWakeLock();
      s.addEventListener('release', () => setRunning(false));
      setSentinel(s);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setSentinel(null);
    }
  }, [supported, isClient]);

  const release = useCallback(async () => {
    if (!isClient) return;
    await releaseWakeLock(sentinel);
    setSentinel(null);
  }, [sentinel, isClient]);

  const stop = useCallback(async () => {
    clearInterval(intervalRef.current);
    intervalRef.current = undefined;
    setRunning(false);
    setTimeLeft(0);
    await release();
  }, [release]);

  const tick = useCallback(async () => {
    setTimeLeft((prev) => {
      const next = prev - 1000;
      if (next <= 0) {
        stop();
        return 0;
      }
      const updated = addAwakeTime(1000);
      setStats(updated);
      return next;
    });
  }, [stop]);

  const start = useCallback(
    async (ms: number) => {
      if (!isClient || ms <= 0) return;
      clearInterval(intervalRef.current);
      setDuration(ms);
      setTimeLeft(ms);
      setRunning(true);
      await acquire();
      intervalRef.current = window.setInterval(tick, 1000);
    },
    [acquire, tick, isClient],
  );

  const toggle = useCallback(async () => {
    if (running) {
      await stop();
    } else {
      await start(duration || 30 * 60 * 1000);
    }
  }, [running, start, stop, duration]);

  const resetStats = useCallback(() => {
    resetStatsModel();
    setStats(loadStats());
  }, []);

  useEffect(() => {
    if (isClient) {
      setSupported(isWakeLockSupported());
    }
  }, [isClient]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const statsView = {
    todayMin: Math.round(stats.todayMs / 60000),
    weekHr: Math.floor(stats.weekMs / 3600000),
    weekMin: Math.round((stats.weekMs % 3600000) / 60000),
  };

  return { supported, running, timeLeft, duration, start, toggle, stats: statsView, resetStats };
};

export default useStayAwake;
