/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - TypeScript Type Definitions
 */

// State machine states for the compass
export type CompassState =
  | 'IDLE'
  | 'REQUESTING'
  | 'CALIBRATING'
  | 'ACTIVE_TRUSTED'
  | 'ACTIVE_UNTRUSTED'
  | 'BACKGROUND';

// Sensor provider types (waterfall priority order)
export type SensorProvider =
  | 'generic-sensor-api'
  | 'deviceorientationabsolute'
  | 'webkit-compass'
  | 'none';

// Raw magnetometer reading
export interface MagneticReading {
  x: number; // µT (microteslas)
  y: number;
  z: number;
  timestamp: number;
}

// Raw accelerometer reading
export interface AccelerometerReading {
  x: number; // m/s²
  y: number;
  z: number;
  timestamp: number;
}

// Device orientation reading (from deviceorientation events)
export interface OrientationReading {
  alpha: number | null; // Compass heading (degrees) - rotation around Z axis
  beta: number | null; // Front-to-back tilt (degrees) - rotation around X axis
  gamma: number | null; // Left-to-right tilt (degrees) - rotation around Y axis
  absolute: boolean;
  webkitCompassHeading?: number; // Safari-specific compass heading
  webkitCompassAccuracy?: number; // Safari-specific accuracy
  timestamp: number;
}

// Phone posture types
export type PhonePosture = 'flat' | 'upright-portrait' | 'upright-landscape';

// Processed compass data for UI consumption
export interface CompassData {
  heading: number; // 0-359.99 degrees (magnetic or true based on config)
  headingMagnetic: number; // Always magnetic north
  headingTrue: number | null; // True north (when declination available)
  fieldStrength: number; // µT (microteslas)
  confidence: 'high' | 'medium' | 'low';
  tiltCompensated: boolean;
  tiltAngle: number; // Device tilt in degrees from horizontal/vertical
  pitch: number; // Front-to-back tilt
  roll: number; // Left-to-right tilt
  declination: number | null; // Geomagnetic declination offset
  posture: PhonePosture; // Phone holding posture
}

// Configuration options for the compass
export interface CompassConfig {
  sensorFrequency: number; // Hz (default 50)
  lowPassAlpha: number; // Filter coefficient (0-1), lower = smoother
  showTrueNorth: boolean; // Whether to display true north vs magnetic
  enableHaptics: boolean; // Enable vibration feedback
  targetBearing: number | null; // Locked target bearing (null = no lock)
  lockTolerance: number; // Degrees tolerance for haptic feedback (default 1)
  deviationWarning: number; // Degrees deviation to show warning (default 5)
}

// Sensor capabilities detected on the device
export interface SensorCapabilities {
  provider: SensorProvider;
  hasMagnetometer: boolean;
  hasAccelerometer: boolean;
  hasGyroscope: boolean;
  hasAbsoluteOrientation: boolean;
  canGetFieldStrength: boolean; // Only with Generic Sensor API
  canCompensateTilt: boolean; // Requires accelerometer
  requiresUserGesture: boolean; // iOS requires user interaction
  supportsWakeLock: boolean;
  supportsVibration: boolean;
}

// Sensor handle for managing sensor lifecycle
export interface SensorHandle {
  start: () => Promise<void>;
  stop: () => void;
  isActive: boolean;
}

// Orientation handle (slightly different interface for event-based)
export interface OrientationHandle {
  start: () => Promise<void>;
  stop: () => void;
  isActive: boolean;
}

// Declination data from location
export interface DeclinationData {
  declination: number; // Degrees (positive = east, negative = west)
  latitude: number;
  longitude: number;
  accuracy: number; // Approximate accuracy in degrees
  timestamp: number;
}

// Compass hook return type
export interface UseCompassReturn {
  // State
  state: CompassState;
  data: CompassData | null;
  error: string | null;
  provider: SensorProvider;
  capabilities: SensorCapabilities | null;

  // Configuration
  config: CompassConfig;
  updateConfig: (updates: Partial<CompassConfig>) => void;

  // Actions
  start: () => Promise<void>;
  stop: () => void;
  requestCalibration: () => void;

  // Haptic lock
  setTargetBearing: (bearing: number | null) => void;
  isLocked: boolean;
  lockDeviation: number;

  // Screen wake lock
  wakeLockActive: boolean;
  toggleWakeLock: () => Promise<void>;

  // Calibration
  isCalibrating: boolean;
  calibrationProgress: number;
}

// Default configuration values
export const DEFAULT_COMPASS_CONFIG: CompassConfig = {
  sensorFrequency: 50, // 50Hz = 20ms polling
  lowPassAlpha: 0.15, // Moderate smoothing
  showTrueNorth: true, // Default to true north for hikers
  enableHaptics: true,
  targetBearing: null,
  lockTolerance: 1, // ±1° for haptic feedback
  deviationWarning: 5, // Show warning at 5° deviation
};

// Magnetic field strength thresholds (µT)
export const FIELD_STRENGTH_THRESHOLDS = {
  // Earth's normal magnetic field range
  NORMAL_MIN: 25,
  NORMAL_MAX: 65,
  // Warning thresholds
  WARNING_LOW: 20,
  WARNING_HIGH: 80,
  // Interference thresholds
  INTERFERENCE_LOW: 15,
  INTERFERENCE_HIGH: 100,
};

// Tilt threshold for showing tilt indicator
export const TILT_THRESHOLD_DEGREES = 15;

// Cardinal direction labels
export const CARDINAL_DIRECTIONS = [
  { min: 337.5, max: 360, label: 'N' },
  { min: 0, max: 22.5, label: 'N' },
  { min: 22.5, max: 67.5, label: 'NE' },
  { min: 67.5, max: 112.5, label: 'E' },
  { min: 112.5, max: 157.5, label: 'SE' },
  { min: 157.5, max: 202.5, label: 'S' },
  { min: 202.5, max: 247.5, label: 'SW' },
  { min: 247.5, max: 292.5, label: 'W' },
  { min: 292.5, max: 337.5, label: 'NW' },
] as const;

// Get cardinal direction label for a heading
export function getCardinalDirection(heading: number): string {
  const normalized = ((heading % 360) + 360) % 360;
  for (const dir of CARDINAL_DIRECTIONS) {
    if (normalized >= dir.min && normalized < dir.max) {
      return dir.label;
    }
  }
  return 'N'; // Fallback
}
