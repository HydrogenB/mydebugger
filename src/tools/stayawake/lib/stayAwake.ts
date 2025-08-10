/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export const isWakeLockSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'wakeLock' in navigator;

export const requestWakeLock = async (): Promise<WakeLockSentinel> => {
  if (!isWakeLockSupported()) {
    throw new Error('Wake Lock not supported');
  }
  const wlNavigator = navigator as Navigator & {
    wakeLock: { request: (type: "screen") => Promise<WakeLockSentinel> };
  };
  const sentinel = await wlNavigator.wakeLock.request('screen');
  return sentinel;
};

export const releaseWakeLock = async (sentinel?: WakeLockSentinel | null): Promise<void> => {
  try {
    await sentinel?.release();
  } catch {
    // ignore
  }
};
