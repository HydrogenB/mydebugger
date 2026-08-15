/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { act, renderHook } from '@testing-library/react';
import type { SensorCapabilities } from '../src/tools/compass/lib/compassTypes';

const fakeCapabilities: SensorCapabilities = {
  provider: 'webkit-compass',
  hasMagnetometer: false,
  hasAccelerometer: false,
  hasGyroscope: false,
  hasAbsoluteOrientation: false,
  canGetFieldStrength: false,
  canCompensateTilt: false,
  requiresUserGesture: false,
  supportsWakeLock: false,
  supportsVibration: false,
};

jest.mock('../src/tools/compass/lib/sensorProviders', () => ({
  detectSensorCapabilities: jest.fn(async () => fakeCapabilities),
  createMagnetometerProvider: jest.fn(),
  createAccelerometerProvider: jest.fn(),
  createOrientationProvider: jest.fn(() => ({
    start: jest.fn(async () => {}),
    stop: jest.fn(),
    isActive: true,
  })),
  requestSensorPermission: jest.fn(async () => true),
}));

jest.mock('../src/tools/compass/lib/declination', () => ({
  getDeclination: jest.fn(async () => null),
  magneticToTrue: jest.fn((heading: number) => heading),
}));

// eslint-disable-next-line import/first
import useCompass from '../src/tools/compass/hooks/useCompass';

beforeEach(() => {
  jest.useFakeTimers();
  // The hook drives a real-time animation loop via requestAnimationFrame; stub it so
  // it neither recurses in the test environment nor depends on jsdom's rAF support.
  (global as unknown as { requestAnimationFrame: (cb: FrameRequestCallback) => number })
    .requestAnimationFrame = jest.fn(() => 1);
  (global as unknown as { cancelAnimationFrame: (handle: number) => void })
    .cancelAnimationFrame = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('useCompass calibration interval', () => {
  test('stop() during calibration leaves state IDLE and it never later flips to ACTIVE_TRUSTED', async () => {
    const { result } = renderHook(() => useCompass());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state).toBe('CALIBRATING');

    // Let calibration progress partway (200ms per tick, 10% per tick) — not yet 100%.
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.calibrationProgress).toBeGreaterThan(0);
    expect(result.current.calibrationProgress).toBeLessThan(100);

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe('IDLE');
    expect(result.current.calibrationProgress).toBe(0);

    // If the calibration interval were still alive, enough elapsed time would let it
    // count to 100 and flip the state to ACTIVE_TRUSTED behind a torn-down sensor set.
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.state).toBe('IDLE');
  });
});
