/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Geomagnetic Declination Calculator
 *
 * Calculates the magnetic declination (difference between true north and magnetic north)
 * based on the user's geographic location.
 *
 * Uses a simplified dipole model for approximation. For higher accuracy in production,
 * consider using the World Magnetic Model (WMM) or fetching from NOAA's API.
 */

import type { DeclinationData } from './compassTypes';

// Cache for declination data to avoid repeated calculations
let cachedDeclination: DeclinationData | null = null;

/**
 * World Magnetic Model (WMM) 2020-2025 epoch simplified coefficients
 * These are approximate values for a tilted dipole model
 */
const WMM_COEFFICIENTS = {
  // Magnetic north pole location (approximate for 2025)
  POLE_LAT: 86.5, // degrees
  POLE_LON: -164.0, // degrees (west)
  // Magnetic field parameters
  DIPOLE_STRENGTH: 29500, // nT at Earth's surface (approximate)
  // Secular variation (annual change)
  SECULAR_VARIATION: 0.08, // degrees/year (approximate)
  // Reference epoch
  EPOCH: 2020,
};

/**
 * Calculate magnetic declination using a simplified dipole model
 *
 * @param latitude - Geographic latitude in degrees (-90 to 90)
 * @param longitude - Geographic longitude in degrees (-180 to 180)
 * @param altitude - Altitude in meters above sea level (optional, default 0)
 * @param date - Date for calculation (optional, default now)
 * @returns Declination in degrees (positive = east, negative = west)
 */
export function calculateDeclination(
  latitude: number,
  longitude: number,
  altitude: number = 0,
  date: Date = new Date()
): number {
  // Convert to radians
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;
  const poleLatRad = (WMM_COEFFICIENTS.POLE_LAT * Math.PI) / 180;
  const poleLonRad = (WMM_COEFFICIENTS.POLE_LON * Math.PI) / 180;

  // Calculate the great circle bearing from the location to the magnetic pole
  // This is a simplified dipole approximation

  // Difference in longitude
  const dLon = poleLonRad - lonRad;

  // Calculate bearing using spherical trigonometry
  const y = Math.sin(dLon) * Math.cos(poleLatRad);
  const x =
    Math.cos(latRad) * Math.sin(poleLatRad) -
    Math.sin(latRad) * Math.cos(poleLatRad) * Math.cos(dLon);

  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;

  // The declination is the difference between this bearing and true north (0°)
  let declination = bearing;

  // Normalize to -180 to 180 range
  if (declination > 180) declination -= 360;
  if (declination < -180) declination += 360;

  // Apply secular variation correction for current date
  const yearsSinceEpoch =
    (date.getFullYear() - WMM_COEFFICIENTS.EPOCH) +
    (date.getMonth() / 12);
  declination += yearsSinceEpoch * WMM_COEFFICIENTS.SECULAR_VARIATION;

  // Apply altitude correction (declination decreases slightly with altitude)
  // This is a minor effect, approximately 0.01° per km
  const altitudeKm = altitude / 1000;
  declination *= 1 - 0.01 * altitudeKm;

  return declination;
}

/**
 * Request user's location and calculate declination
 * Caches the result for the session
 */
export async function getDeclination(): Promise<DeclinationData | null> {
  // Return cached value if available
  if (cachedDeclination) {
    return cachedDeclination;
  }

  // Check for geolocation support
  if (!navigator.geolocation) {
    console.warn('Geolocation not supported');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, altitude, accuracy } = position.coords;

        const declination = calculateDeclination(
          latitude,
          longitude,
          altitude ?? 0
        );

        const data: DeclinationData = {
          declination,
          latitude,
          longitude,
          accuracy: estimateDeclinationAccuracy(latitude, accuracy ?? 1000),
          timestamp: Date.now(),
        };

        // Cache the result
        cachedDeclination = data;

        resolve(data);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: false, // Coarse location is sufficient
        timeout: 10000,
        maximumAge: 3600000, // 1 hour cache
      }
    );
  });
}

/**
 * Estimate the accuracy of the declination calculation
 * Based on location accuracy and distance from magnetic poles
 */
function estimateDeclinationAccuracy(
  latitude: number,
  positionAccuracy: number
): number {
  // Base accuracy from the simplified model (approximately ±1-2° in most areas)
  let baseAccuracy = 1.5;

  // Accuracy degrades near magnetic poles
  const absLat = Math.abs(latitude);
  if (absLat > 60) {
    baseAccuracy += (absLat - 60) * 0.1;
  }

  // Factor in position accuracy (1 degree of lat/lon ≈ 111 km)
  const positionDegrees = positionAccuracy / 111000;
  baseAccuracy += positionDegrees * 0.5;

  return Math.min(baseAccuracy, 10); // Cap at 10°
}

/**
 * Check if declination data is available and valid
 */
export function hasDeclinationSupport(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Clear the cached declination data
 * Call this if the user moves to a different location
 */
export function clearDeclinationCache(): void {
  cachedDeclination = null;
}

/**
 * Get cached declination without requesting new location
 */
export function getCachedDeclination(): DeclinationData | null {
  return cachedDeclination;
}

/**
 * Apply declination correction to convert magnetic heading to true heading
 */
export function magneticToTrue(
  magneticHeading: number,
  declination: number
): number {
  let trueHeading = magneticHeading + declination;

  // Normalize to 0-360 range
  if (trueHeading < 0) trueHeading += 360;
  if (trueHeading >= 360) trueHeading -= 360;

  return trueHeading;
}

/**
 * Apply declination correction to convert true heading to magnetic heading
 */
export function trueToMagnetic(
  trueHeading: number,
  declination: number
): number {
  let magneticHeading = trueHeading - declination;

  // Normalize to 0-360 range
  if (magneticHeading < 0) magneticHeading += 360;
  if (magneticHeading >= 360) magneticHeading -= 360;

  return magneticHeading;
}

/**
 * Format declination for display
 * Example: "5.2° E" or "12.8° W"
 */
export function formatDeclination(declination: number): string {
  const abs = Math.abs(declination);
  const direction = declination >= 0 ? 'E' : 'W';
  return `${abs.toFixed(1)}° ${direction}`;
}
