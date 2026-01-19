/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Sensor Fusion Algorithms
 *
 * Implements:
 * - Low-pass filtering for noise reduction
 * - Tilt compensation using accelerometer data
 * - Heading calculation from magnetometer vectors
 * - Smooth interpolation with shortest arc handling
 */

import type { MagneticReading, AccelerometerReading } from './compassTypes';
import { FIELD_STRENGTH_THRESHOLDS } from './compassTypes';

/**
 * Low-pass filter for smoothing scalar values
 */
export class LowPassFilter {
  private alpha: number;
  private previousValue: number | null = null;

  constructor(alpha: number = 0.15) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  filter(value: number): number {
    if (this.previousValue === null) {
      this.previousValue = value;
      return value;
    }

    const filtered = this.alpha * value + (1 - this.alpha) * this.previousValue;
    this.previousValue = filtered;
    return filtered;
  }

  reset(): void {
    this.previousValue = null;
  }

  setAlpha(alpha: number): void {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }
}

/**
 * 3D vector low-pass filter for smoothing sensor readings
 */
export class Vector3Filter {
  private xFilter: LowPassFilter;
  private yFilter: LowPassFilter;
  private zFilter: LowPassFilter;

  constructor(alpha: number = 0.15) {
    this.xFilter = new LowPassFilter(alpha);
    this.yFilter = new LowPassFilter(alpha);
    this.zFilter = new LowPassFilter(alpha);
  }

  filter(x: number, y: number, z: number): { x: number; y: number; z: number } {
    return {
      x: this.xFilter.filter(x),
      y: this.yFilter.filter(y),
      z: this.zFilter.filter(z),
    };
  }

  reset(): void {
    this.xFilter.reset();
    this.yFilter.reset();
    this.zFilter.reset();
  }

  setAlpha(alpha: number): void {
    this.xFilter.setAlpha(alpha);
    this.yFilter.setAlpha(alpha);
    this.zFilter.setAlpha(alpha);
  }
}

/**
 * Calculate pitch and roll from accelerometer data
 * Returns angles in radians
 */
export function calculateTiltAngles(
  accelerometer: AccelerometerReading
): { pitch: number; roll: number; tiltAngle: number } {
  const { x, y, z } = accelerometer;

  // Normalize the accelerometer vector
  const norm = Math.sqrt(x * x + y * y + z * z);
  if (norm === 0) {
    return { pitch: 0, roll: 0, tiltAngle: 0 };
  }

  const ax = x / norm;
  const ay = y / norm;
  const az = z / norm;

  // Calculate pitch (rotation around X axis) - front-to-back tilt
  const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));

  // Calculate roll (rotation around Y axis) - left-to-right tilt
  const roll = Math.atan2(ay, az);

  // Calculate total tilt angle from vertical
  // When phone is flat, az ≈ 1, so acos(|az|) ≈ 0
  const tiltAngle = Math.acos(Math.min(1, Math.abs(az))) * (180 / Math.PI);

  return { pitch, roll, tiltAngle };
}

/**
 * Compensate magnetometer readings for device tilt
 * Projects the 3D magnetic vector onto the horizontal plane
 */
export function compensateTilt(
  magnetic: MagneticReading,
  accelerometer: AccelerometerReading
): { x: number; y: number } {
  const { pitch, roll } = calculateTiltAngles(accelerometer);
  const { x: mx, y: my, z: mz } = magnetic;

  // Rotate magnetic vector to horizontal plane
  // Using rotation matrices for pitch and roll compensation
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosRoll = Math.cos(roll);
  const sinRoll = Math.sin(roll);

  // Horizontal X component (pointing forward in device frame)
  const Hx =
    mx * cosPitch + my * sinRoll * sinPitch - mz * cosRoll * sinPitch;

  // Horizontal Y component (pointing right in device frame)
  const Hy = my * cosRoll + mz * sinRoll;

  return { x: Hx, y: Hy };
}

/**
 * Calculate compass heading from horizontal magnetic components
 * Returns heading in degrees (0-360, 0 = North, increasing clockwise)
 */
export function calculateHeading(Hx: number, Hy: number): number {
  // atan2(y, x) gives angle from positive X axis
  // We want angle from positive Y axis (North), clockwise
  // So we use atan2(Hy, Hx) and adjust
  let heading = Math.atan2(Hy, Hx) * (180 / Math.PI);

  // Convert from math convention (CCW from East) to compass convention (CW from North)
  heading = 90 - heading;

  // Normalize to 0-360 range
  heading = normalizeAngle(heading);

  return heading;
}

/**
 * Calculate compass heading directly from raw magnetometer (no tilt compensation)
 * Use this when accelerometer is unavailable
 */
export function calculateHeadingSimple(magnetic: MagneticReading): number {
  // Assume device is held flat, use X and Y components
  return calculateHeading(magnetic.x, magnetic.y);
}

/**
 * Calculate magnetic field strength in microteslas
 */
export function calculateFieldStrength(reading: MagneticReading): number {
  const { x, y, z } = reading;
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Assess confidence level based on magnetic field strength
 */
export function assessConfidence(
  fieldStrength: number
): 'high' | 'medium' | 'low' {
  const { NORMAL_MIN, NORMAL_MAX, WARNING_LOW, WARNING_HIGH } =
    FIELD_STRENGTH_THRESHOLDS;

  if (fieldStrength >= NORMAL_MIN && fieldStrength <= NORMAL_MAX) {
    return 'high';
  }

  if (fieldStrength >= WARNING_LOW && fieldStrength <= WARNING_HIGH) {
    return 'medium';
  }

  return 'low';
}

/**
 * Check if magnetic interference is detected
 */
export function hasInterference(fieldStrength: number): boolean {
  const { INTERFERENCE_LOW, INTERFERENCE_HIGH } = FIELD_STRENGTH_THRESHOLDS;
  return fieldStrength < INTERFERENCE_LOW || fieldStrength > INTERFERENCE_HIGH;
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/**
 * Calculate the shortest angular difference between two angles
 * Returns value in range -180 to 180
 */
export function angularDifference(from: number, to: number): number {
  let diff = normalizeAngle(to) - normalizeAngle(from);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

/**
 * Linear interpolation (LERP) between two angles using shortest arc
 * This ensures smooth rotation without jumping across 0°/360° boundary
 */
export function lerpHeading(
  current: number,
  target: number,
  factor: number
): number {
  const diff = angularDifference(current, target);
  return normalizeAngle(current + diff * factor);
}

/**
 * Damped spring interpolation for smooth needle movement
 * Returns the new heading and updates velocity
 */
export function springInterpolation(
  current: number,
  target: number,
  velocity: { value: number },
  stiffness: number = 0.1,
  damping: number = 0.8
): number {
  const diff = angularDifference(current, target);

  // Spring force
  const springForce = diff * stiffness;

  // Apply damping to velocity
  velocity.value = velocity.value * damping + springForce;

  // Clamp velocity to prevent overshooting
  const maxVelocity = 10; // degrees per frame
  velocity.value = Math.max(-maxVelocity, Math.min(maxVelocity, velocity.value));

  return normalizeAngle(current + velocity.value);
}

/**
 * Exponential moving average for heading smoothing
 * Handles wrap-around at 0°/360°
 */
export class HeadingEMA {
  private alpha: number;
  private currentHeading: number | null = null;
  private velocity = { value: 0 };
  private useSpring: boolean;

  constructor(alpha: number = 0.15, useSpring: boolean = true) {
    this.alpha = alpha;
    this.useSpring = useSpring;
  }

  update(targetHeading: number): number {
    if (this.currentHeading === null) {
      this.currentHeading = targetHeading;
      return targetHeading;
    }

    if (this.useSpring) {
      this.currentHeading = springInterpolation(
        this.currentHeading,
        targetHeading,
        this.velocity,
        this.alpha,
        0.75
      );
    } else {
      this.currentHeading = lerpHeading(
        this.currentHeading,
        targetHeading,
        this.alpha
      );
    }

    return this.currentHeading;
  }

  reset(): void {
    this.currentHeading = null;
    this.velocity.value = 0;
  }

  setAlpha(alpha: number): void {
    this.alpha = alpha;
  }

  getCurrent(): number | null {
    return this.currentHeading;
  }
}

/**
 * Complete sensor fusion pipeline
 * Takes raw sensor data and produces filtered, compensated heading
 */
export class SensorFusionPipeline {
  private magneticFilter: Vector3Filter;
  private accelerometerFilter: Vector3Filter;
  private headingFilter: HeadingEMA;
  private lastMagnetic: MagneticReading | null = null;
  private lastAccelerometer: AccelerometerReading | null = null;
  private hasRealMagnetometer: boolean = false;

  constructor(alpha: number = 0.15) {
    this.magneticFilter = new Vector3Filter(alpha);
    this.accelerometerFilter = new Vector3Filter(alpha);
    this.headingFilter = new HeadingEMA(alpha, true);
  }

  setHasRealMagnetometer(hasReal: boolean): void {
    this.hasRealMagnetometer = hasReal;
  }

  updateMagnetic(reading: MagneticReading): void {
    const filtered = this.magneticFilter.filter(reading.x, reading.y, reading.z);
    this.lastMagnetic = {
      ...reading,
      x: filtered.x,
      y: filtered.y,
      z: filtered.z,
    };
  }

  updateAccelerometer(reading: AccelerometerReading): void {
    const filtered = this.accelerometerFilter.filter(
      reading.x,
      reading.y,
      reading.z
    );
    this.lastAccelerometer = {
      ...reading,
      x: filtered.x,
      y: filtered.y,
      z: filtered.z,
    };
  }

  /**
   * Get the current processed heading and related data
   */
  process(): {
    heading: number;
    fieldStrength: number;
    confidence: 'high' | 'medium' | 'low';
    tiltAngle: number;
    pitch: number;
    roll: number;
    tiltCompensated: boolean;
  } | null {
    if (!this.lastMagnetic) return null;

    let heading: number;
    let tiltAngle = 0;
    let pitch = 0;
    let roll = 0;
    let tiltCompensated = false;

    if (this.lastAccelerometer) {
      // Full tilt compensation
      const tilt = calculateTiltAngles(this.lastAccelerometer);
      tiltAngle = tilt.tiltAngle;
      pitch = tilt.pitch * (180 / Math.PI);
      roll = tilt.roll * (180 / Math.PI);

      const compensated = compensateTilt(
        this.lastMagnetic,
        this.lastAccelerometer
      );
      heading = calculateHeading(compensated.x, compensated.y);
      tiltCompensated = true;
    } else {
      // Simple heading without tilt compensation
      heading = calculateHeadingSimple(this.lastMagnetic);
    }

    // Smooth the heading
    const smoothedHeading = this.headingFilter.update(heading);

    // Calculate field strength and confidence
    // Only calculate field strength if we have real magnetometer data
    const fieldStrength = this.hasRealMagnetometer
      ? calculateFieldStrength(this.lastMagnetic)
      : -1; // -1 indicates unavailable
    const confidence = this.hasRealMagnetometer
      ? assessConfidence(fieldStrength)
      : 'medium' as const; // Default to medium when no real magnetometer

    return {
      heading: smoothedHeading,
      fieldStrength,
      confidence,
      tiltAngle,
      pitch,
      roll,
      tiltCompensated,
    };
  }

  reset(): void {
    this.magneticFilter.reset();
    this.accelerometerFilter.reset();
    this.headingFilter.reset();
    this.lastMagnetic = null;
    this.lastAccelerometer = null;
  }

  setAlpha(alpha: number): void {
    this.magneticFilter.setAlpha(alpha);
    this.accelerometerFilter.setAlpha(alpha);
    this.headingFilter.setAlpha(alpha);
  }
}
