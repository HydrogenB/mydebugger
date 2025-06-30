import { requestWakeLock, releaseWakeLock, isWakeLockSupported } from '../model/stayAwake';

describe('stayAwake model', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'navigator', { value: {}, writable: true });
  });

  test('detects support', () => {
    expect(isWakeLockSupported()).toBe(false);
    (navigator as any).wakeLock = {};
    expect(isWakeLockSupported()).toBe(true);
  });

  test('requests wake lock', async () => {
    const release = jest.fn();
    (navigator as any).wakeLock = { request: jest.fn().mockResolvedValue({ release }) };
    const sentinel = await requestWakeLock();
    expect((navigator as any).wakeLock.request).toHaveBeenCalledWith('screen');
    expect(sentinel.release).toBe(release);
  });

  test('throws when unsupported', async () => {
    await expect(requestWakeLock()).rejects.toThrow('Wake Lock not supported');
  });

  test('releases wake lock', async () => {
    const release = jest.fn().mockResolvedValue(undefined);
    const sentinel = { release } as unknown as WakeLockSentinel;
    await releaseWakeLock(sentinel);
    expect(release).toHaveBeenCalled();
  });
});
