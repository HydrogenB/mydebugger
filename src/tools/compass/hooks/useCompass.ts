/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Main ViewModel Hook
 *
 * Manages all compass state, sensor coordination, and user interactions.
 * Implements state machine for compass lifecycle.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  CompassState,
  CompassData,
  CompassConfig,
  SensorProvider,
  SensorCapabilities,
  UseCompassReturn,
  MagneticReading,
  AccelerometerReading,
  OrientationReading,
} from '../lib/compassTypes';
import { DEFAULT_COMPASS_CONFIG, TILT_THRESHOLD_DEGREES } from '../lib/compassTypes';
import {
  detectSensorCapabilities,
  createMagnetometerProvider,
  createAccelerometerProvider,
  createOrientationProvider,
  requestSensorPermission,
} from '../lib/sensorProviders';
import { SensorFusionPipeline, normalizeAngle, angularDifference } from '../lib/sensorFusion';
import { getDeclination, magneticToTrue } from '../lib/declination';

export default function useCompass(): UseCompassReturn {
  // State
  const [state, setState] = useState<CompassState>('IDLE');
  const [data, setData] = useState<CompassData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<SensorProvider>('none');
  const [capabilities, setCapabilities] = useState<SensorCapabilities | null>(null);
  const [config, setConfig] = useState<CompassConfig>(DEFAULT_COMPASS_CONFIG);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  // Refs for sensor data (avoid React re-renders at high frequency)
  const sensorBuffer = useRef<{
    magnetic: MagneticReading | null;
    accelerometer: AccelerometerReading | null;
    orientation: OrientationReading | null;
  }>({ magnetic: null, accelerometer: null, orientation: null });

  // Refs for sensor handles
  const magnetometerHandle = useRef<ReturnType<typeof createMagnetometerProvider>>(null);
  const accelerometerHandle = useRef<ReturnType<typeof createAccelerometerProvider>>(null);
  const orientationHandle = useRef<ReturnType<typeof createOrientationProvider>>(null);

  // Refs for processing
  const fusionPipeline = useRef(new SensorFusionPipeline(config.lowPassAlpha));
  const animationFrameId = useRef<number | null>(null);
  const wakeLockSentinel = useRef<WakeLockSentinel | null>(null);
  const declinationRef = useRef<number | null>(null);
  const lastStateBeforeBackground = useRef<CompassState>('IDLE');

  // Derived state
  const isLocked = config.targetBearing !== null;
  const lockDeviation = isLocked && data
    ? Math.abs(angularDifference(data.heading, config.targetBearing!))
    : 0;
  const isCalibrating = state === 'CALIBRATING';

  /**
   * Update configuration
   */
  const updateConfig = useCallback((updates: Partial<CompassConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };

      // Update fusion pipeline alpha if changed
      if (updates.lowPassAlpha !== undefined) {
        fusionPipeline.current.setAlpha(updates.lowPassAlpha);
      }

      return newConfig;
    });
  }, []);

  /**
   * Animation loop for UI updates (60fps)
   */
  const startAnimationLoop = useCallback(() => {
    const loop = () => {
      // Process sensor data
      const processed = fusionPipeline.current.process();

      if (processed) {
        // Calculate true north heading if declination available
        let headingTrue: number | null = null;
        if (declinationRef.current !== null) {
          headingTrue = magneticToTrue(processed.heading, declinationRef.current);
        }

        // Determine which heading to display based on config
        const displayHeading = config.showTrueNorth && headingTrue !== null
          ? headingTrue
          : processed.heading;

        setData({
          heading: displayHeading,
          headingMagnetic: processed.heading,
          headingTrue,
          fieldStrength: processed.fieldStrength,
          confidence: processed.confidence,
          tiltCompensated: processed.tiltCompensated,
          tiltAngle: processed.tiltAngle,
          pitch: processed.pitch,
          roll: processed.roll,
          declination: declinationRef.current,
          posture: processed.posture,
        });

        // Update state based on confidence
        if (state === 'ACTIVE_TRUSTED' && processed.confidence === 'low') {
          setState('ACTIVE_UNTRUSTED');
        } else if (state === 'ACTIVE_UNTRUSTED' && processed.confidence === 'high') {
          setState('ACTIVE_TRUSTED');
        }
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);
  }, [config.showTrueNorth, config.enableHaptics, config.targetBearing, config.lockTolerance, state]);

  /**
   * Stop animation loop
   */
  const stopAnimationLoop = useCallback(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  /**
   * Start sensors based on detected capabilities
   */
  const startSensors = useCallback(async (caps: SensorCapabilities) => {
    if (caps.provider === 'generic-sensor-api') {
      // We have real magnetometer data
      fusionPipeline.current.setHasRealMagnetometer(true);

      // Create magnetometer provider
      magnetometerHandle.current = createMagnetometerProvider(
        (reading) => {
          sensorBuffer.current.magnetic = reading;
          fusionPipeline.current.updateMagnetic(reading);
        },
        config.sensorFrequency
      );

      // Create accelerometer provider if available
      if (caps.hasAccelerometer) {
        accelerometerHandle.current = createAccelerometerProvider(
          (reading) => {
            sensorBuffer.current.accelerometer = reading;
            fusionPipeline.current.updateAccelerometer(reading);
          },
          config.sensorFrequency
        );
      }

      // Start sensors
      await magnetometerHandle.current?.start();
      await accelerometerHandle.current?.start();
    } else {
      // Using deviceorientation - no real magnetometer field strength data
      fusionPipeline.current.setHasRealMagnetometer(false);
      // Use deviceorientation events
      orientationHandle.current = createOrientationProvider(
        (reading) => {
          sensorBuffer.current.orientation = reading;

          // Convert orientation to magnetic reading for fusion pipeline
          if (reading.webkitCompassHeading !== undefined) {
            // Safari/iOS - use webkitCompassHeading directly
            // Create a synthetic magnetic reading from the heading
            const headingRad = (reading.webkitCompassHeading * Math.PI) / 180;
            const syntheticMagnetic: MagneticReading = {
              x: Math.sin(headingRad) * 50, // Simulate 50µT field
              y: Math.cos(headingRad) * 50,
              z: 0,
              timestamp: reading.timestamp,
            };
            fusionPipeline.current.updateMagnetic(syntheticMagnetic);
          } else if (reading.alpha !== null) {
            // Standard deviceorientation - alpha is compass heading
            const headingRad = ((360 - reading.alpha) * Math.PI) / 180;
            const syntheticMagnetic: MagneticReading = {
              x: Math.sin(headingRad) * 50,
              y: Math.cos(headingRad) * 50,
              z: 0,
              timestamp: reading.timestamp,
            };
            fusionPipeline.current.updateMagnetic(syntheticMagnetic);

            // Use beta/gamma for tilt if available
            if (reading.beta !== null && reading.gamma !== null) {
              const syntheticAccelerometer: AccelerometerReading = {
                x: Math.sin((reading.gamma * Math.PI) / 180) * 9.8,
                y: Math.sin((reading.beta * Math.PI) / 180) * 9.8,
                z: Math.cos((reading.beta * Math.PI) / 180) * Math.cos((reading.gamma * Math.PI) / 180) * 9.8,
                timestamp: reading.timestamp,
              };
              fusionPipeline.current.updateAccelerometer(syntheticAccelerometer);
            }
          }
        },
        caps.provider === 'deviceorientationabsolute'
      );

      await orientationHandle.current?.start();
    }
  }, [config.sensorFrequency]);

  /**
   * Stop all sensors
   */
  const stopSensors = useCallback(() => {
    magnetometerHandle.current?.stop();
    accelerometerHandle.current?.stop();
    orientationHandle.current?.stop();
    magnetometerHandle.current = null;
    accelerometerHandle.current = null;
    orientationHandle.current = null;
  }, []);

  /**
   * Start the compass
   */
  const start = useCallback(async () => {
    if (state !== 'IDLE') return;

    setError(null);
    setState('REQUESTING');

    try {
      // Detect sensor capabilities
      const caps = await detectSensorCapabilities();
      setCapabilities(caps);
      setProvider(caps.provider);

      if (caps.provider === 'none') {
        throw new Error('No compass sensors available on this device');
      }

      // Request permission if needed (iOS)
      if (caps.requiresUserGesture) {
        const granted = await requestSensorPermission();
        if (!granted) {
          throw new Error('Sensor permission denied. Please allow access to device orientation.');
        }
      }

      // Start sensors
      await startSensors(caps);

      // Request declination (async, don't block)
      getDeclination().then((decData) => {
        if (decData) {
          declinationRef.current = decData.declination;
        }
      });

      // Enter calibration state
      setState('CALIBRATING');
      setCalibrationProgress(0);

      // Simulate calibration progress (in real app, would check sensor variance)
      const calibrationInterval = setInterval(() => {
        setCalibrationProgress((prev) => {
          const next = prev + 10;
          if (next >= 100) {
            clearInterval(calibrationInterval);
            setState('ACTIVE_TRUSTED');
          }
          return Math.min(next, 100);
        });
      }, 200);

      // Start animation loop
      startAnimationLoop();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start compass');
      setState('IDLE');
      stopSensors();
    }
  }, [state, startSensors, startAnimationLoop, stopSensors]);

  /**
   * Stop the compass
   */
  const stop = useCallback(() => {
    stopAnimationLoop();
    stopSensors();
    fusionPipeline.current.reset();
    setState('IDLE');
    setData(null);
    setCalibrationProgress(0);
  }, [stopAnimationLoop, stopSensors]);

  /**
   * Request calibration
   */
  const requestCalibration = useCallback(() => {
    if (state !== 'ACTIVE_TRUSTED' && state !== 'ACTIVE_UNTRUSTED') return;

    setState('CALIBRATING');
    setCalibrationProgress(0);
    fusionPipeline.current.reset();

    // Simulate calibration
    const calibrationInterval = setInterval(() => {
      setCalibrationProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(calibrationInterval);
          setState('ACTIVE_TRUSTED');
        }
        return Math.min(next, 100);
      });
    }, 200);
  }, [state]);

  /**
   * Set target bearing for haptic lock
   */
  const setTargetBearing = useCallback((bearing: number | null) => {
    updateConfig({
      targetBearing: bearing !== null ? normalizeAngle(bearing) : null,
    });
  }, [updateConfig]);

  /**
   * Toggle screen wake lock
   */
  const toggleWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      setError('Screen wake lock not supported on this device');
      return;
    }

    try {
      if (wakeLockActive && wakeLockSentinel.current) {
        await wakeLockSentinel.current.release();
        wakeLockSentinel.current = null;
        setWakeLockActive(false);
      } else {
        wakeLockSentinel.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);

        // Listen for release event (e.g., when tab becomes inactive)
        wakeLockSentinel.current.addEventListener('release', () => {
          setWakeLockActive(false);
          wakeLockSentinel.current = null;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle wake lock');
    }
  }, [wakeLockActive]);

  /**
   * Handle visibility change (background/foreground)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Going to background
        if (
          state === 'ACTIVE_TRUSTED' ||
          state === 'ACTIVE_UNTRUSTED' ||
          state === 'CALIBRATING'
        ) {
          lastStateBeforeBackground.current = state;
          stopAnimationLoop();
          stopSensors();
          setState('BACKGROUND');
        }
      } else {
        // Coming to foreground
        if (state === 'BACKGROUND' && capabilities) {
          startSensors(capabilities).then(() => {
            startAnimationLoop();
            setState(lastStateBeforeBackground.current);
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state, capabilities, startSensors, startAnimationLoop, stopAnimationLoop, stopSensors]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopAnimationLoop();
      stopSensors();
      if (wakeLockSentinel.current) {
        wakeLockSentinel.current.release();
      }
    };
  }, [stopAnimationLoop, stopSensors]);

  return {
    // State
    state,
    data,
    error,
    provider,
    capabilities,

    // Configuration
    config,
    updateConfig,

    // Actions
    start,
    stop,
    requestCalibration,

    // Haptic lock
    setTargetBearing,
    isLocked,
    lockDeviation,

    // Screen wake lock
    wakeLockActive,
    toggleWakeLock,

    // Calibration
    isCalibrating,
    calibrationProgress,
  };
}
