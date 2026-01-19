/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Sensor Provider Abstraction
 *
 * Implements a waterfall strategy for browser sensor compatibility:
 * 1. Generic Sensor API (Chrome/Edge) - Best accuracy, raw data access
 * 2. deviceorientationabsolute (Chrome/Firefox) - Good accuracy, fused data
 * 3. webkit compass (Safari/iOS) - Limited, proprietary implementation
 */

import type {
  SensorProvider,
  SensorCapabilities,
  SensorHandle,
  OrientationHandle,
  MagneticReading,
  AccelerometerReading,
  OrientationReading,
} from './compassTypes';

// Extended Window interface for sensor APIs
interface SensorWindow extends Window {
  Magnetometer?: new (options?: { frequency?: number }) => GenericSensor;
  Accelerometer?: new (options?: { frequency?: number }) => GenericSensor;
  Gyroscope?: new (options?: { frequency?: number }) => GenericSensor;
  AbsoluteOrientationSensor?: new (options?: {
    frequency?: number;
    referenceFrame?: string;
  }) => GenericSensor;
  DeviceOrientationEvent?: DeviceOrientationEventConstructor & {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
}

interface GenericSensor extends EventTarget {
  x?: number;
  y?: number;
  z?: number;
  quaternion?: [number, number, number, number];
  activated: boolean;
  hasReading: boolean;
  timestamp: number;
  start: () => void;
  stop: () => void;
  addEventListener(
    type: 'reading' | 'error' | 'activate',
    listener: EventListener
  ): void;
  removeEventListener(
    type: 'reading' | 'error' | 'activate',
    listener: EventListener
  ): void;
}

interface DeviceOrientationEventConstructor {
  new (type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * Detect available sensor capabilities on the current device
 */
export async function detectSensorCapabilities(): Promise<SensorCapabilities> {
  const win = window as SensorWindow;

  const capabilities: SensorCapabilities = {
    provider: 'none',
    hasMagnetometer: false,
    hasAccelerometer: false,
    hasGyroscope: false,
    hasAbsoluteOrientation: false,
    canGetFieldStrength: false,
    canCompensateTilt: false,
    requiresUserGesture: false,
    supportsWakeLock: 'wakeLock' in navigator,
    supportsVibration: 'vibrate' in navigator,
  };

  // Check for Generic Sensor API (Priority 1)
  if (win.Magnetometer && win.Accelerometer) {
    try {
      // Test if we can instantiate the sensors
      const testMag = new win.Magnetometer({ frequency: 1 });
      testMag.stop();

      capabilities.provider = 'generic-sensor-api';
      capabilities.hasMagnetometer = true;
      capabilities.hasAccelerometer = !!win.Accelerometer;
      capabilities.hasGyroscope = !!win.Gyroscope;
      capabilities.hasAbsoluteOrientation = !!win.AbsoluteOrientationSensor;
      capabilities.canGetFieldStrength = true;
      capabilities.canCompensateTilt = !!win.Accelerometer;
      return capabilities;
    } catch {
      // Generic Sensor API not available or blocked
    }
  }

  // Check for deviceorientationabsolute (Priority 2)
  if ('ondeviceorientationabsolute' in window || 'DeviceOrientationEvent' in window) {
    // Check if iOS requires permission
    if (win.DeviceOrientationEvent?.requestPermission) {
      capabilities.requiresUserGesture = true;
    }

    // Test for absolute orientation support
    const hasAbsolute = await testDeviceOrientationAbsolute();
    if (hasAbsolute) {
      capabilities.provider = 'deviceorientationabsolute';
      capabilities.hasAbsoluteOrientation = true;
      capabilities.canCompensateTilt = true; // deviceorientation provides beta/gamma
      return capabilities;
    }
  }

  // Check for webkit compass (Priority 3 - Safari/iOS)
  if ('DeviceOrientationEvent' in window) {
    if (win.DeviceOrientationEvent?.requestPermission) {
      capabilities.requiresUserGesture = true;
    }
    capabilities.provider = 'webkit-compass';
    capabilities.hasAbsoluteOrientation = true;
    return capabilities;
  }

  return capabilities;
}

/**
 * Test if deviceorientationabsolute event is supported
 */
async function testDeviceOrientationAbsolute(): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;

    const handler = (event: DeviceOrientationEvent) => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener('deviceorientationabsolute', handler);
        // Check if we got valid data
        resolve(event.alpha !== null && event.absolute === true);
      }
    };

    // Listen for the event
    window.addEventListener('deviceorientationabsolute', handler);

    // Timeout after 500ms
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener('deviceorientationabsolute', handler);
        resolve(false);
      }
    }, 500);
  });
}

/**
 * Create a magnetometer provider using Generic Sensor API
 */
export function createMagnetometerProvider(
  onReading: (reading: MagneticReading) => void,
  frequency: number = 50
): SensorHandle | null {
  const win = window as SensorWindow;

  if (!win.Magnetometer) {
    return null;
  }

  let sensor: GenericSensor | null = null;
  let isActive = false;

  const handle: SensorHandle = {
    isActive: false,

    async start() {
      if (isActive) return;

      try {
        sensor = new win.Magnetometer!({ frequency });

        const readingHandler = () => {
          if (sensor && sensor.hasReading) {
            onReading({
              x: sensor.x ?? 0,
              y: sensor.y ?? 0,
              z: sensor.z ?? 0,
              timestamp: sensor.timestamp ?? Date.now(),
            });
          }
        };

        sensor.addEventListener('reading', readingHandler);
        sensor.addEventListener('error', (event) => {
          console.error('Magnetometer error:', event);
        });

        sensor.start();
        isActive = true;
        handle.isActive = true;
      } catch (error) {
        console.error('Failed to start magnetometer:', error);
        throw error;
      }
    },

    stop() {
      if (sensor) {
        sensor.stop();
        sensor = null;
      }
      isActive = false;
      handle.isActive = false;
    },
  };

  return handle;
}

/**
 * Create an accelerometer provider using Generic Sensor API
 */
export function createAccelerometerProvider(
  onReading: (reading: AccelerometerReading) => void,
  frequency: number = 50
): SensorHandle | null {
  const win = window as SensorWindow;

  if (!win.Accelerometer) {
    return null;
  }

  let sensor: GenericSensor | null = null;
  let isActive = false;

  const handle: SensorHandle = {
    isActive: false,

    async start() {
      if (isActive) return;

      try {
        sensor = new win.Accelerometer!({ frequency });

        const readingHandler = () => {
          if (sensor && sensor.hasReading) {
            onReading({
              x: sensor.x ?? 0,
              y: sensor.y ?? 0,
              z: sensor.z ?? 0,
              timestamp: sensor.timestamp ?? Date.now(),
            });
          }
        };

        sensor.addEventListener('reading', readingHandler);
        sensor.addEventListener('error', (event) => {
          console.error('Accelerometer error:', event);
        });

        sensor.start();
        isActive = true;
        handle.isActive = true;
      } catch (error) {
        console.error('Failed to start accelerometer:', error);
        throw error;
      }
    },

    stop() {
      if (sensor) {
        sensor.stop();
        sensor = null;
      }
      isActive = false;
      handle.isActive = false;
    },
  };

  return handle;
}

/**
 * Create an orientation provider using deviceorientation events
 * Supports both absolute and webkit compass variants
 */
export function createOrientationProvider(
  onReading: (reading: OrientationReading) => void,
  preferAbsolute: boolean = true
): OrientationHandle {
  let isActive = false;
  let eventType: 'deviceorientationabsolute' | 'deviceorientation' =
    preferAbsolute ? 'deviceorientationabsolute' : 'deviceorientation';

  const handler = (event: DeviceOrientationEvent) => {
    const reading: OrientationReading = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      absolute: event.absolute,
      timestamp: Date.now(),
    };

    // Safari/iOS specific - webkitCompassHeading
    const webkitEvent = event as DeviceOrientationEvent & {
      webkitCompassHeading?: number;
      webkitCompassAccuracy?: number;
    };

    if (typeof webkitEvent.webkitCompassHeading === 'number') {
      reading.webkitCompassHeading = webkitEvent.webkitCompassHeading;
      reading.webkitCompassAccuracy = webkitEvent.webkitCompassAccuracy;
    }

    onReading(reading);
  };

  const handle: OrientationHandle = {
    isActive: false,

    async start() {
      if (isActive) return;

      const win = window as SensorWindow;

      // iOS 13+ requires permission request
      if (win.DeviceOrientationEvent?.requestPermission) {
        try {
          const permission = await win.DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') {
            throw new Error('Device orientation permission denied');
          }
        } catch (error) {
          throw new Error(
            `Failed to get orientation permission: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Try absolute orientation first
      if (preferAbsolute && 'ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handler);
        eventType = 'deviceorientationabsolute';
      } else {
        window.addEventListener('deviceorientation', handler);
        eventType = 'deviceorientation';
      }

      isActive = true;
      handle.isActive = true;
    },

    stop() {
      window.removeEventListener(eventType, handler);
      isActive = false;
      handle.isActive = false;
    },
  };

  return handle;
}

/**
 * Request permission for device sensors (iOS requirement)
 */
export async function requestSensorPermission(): Promise<boolean> {
  const win = window as SensorWindow;

  // Check if permission API exists (iOS 13+)
  if (win.DeviceOrientationEvent?.requestPermission) {
    try {
      const permission = await win.DeviceOrientationEvent.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  // No permission needed on other platforms
  return true;
}

/**
 * Check if sensors are available on this device
 */
export function isSensorAvailable(): boolean {
  const win = window as SensorWindow;
  return (
    !!win.Magnetometer ||
    'ondeviceorientationabsolute' in window ||
    'ondeviceorientation' in window
  );
}
