/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Confidence Monitor Component
 *
 * Displays magnetic field strength and sensor confidence level.
 * Shows warnings when interference is detected.
 */

import React from 'react';
import type { SensorProvider } from '../lib/compassTypes';
import { FIELD_STRENGTH_THRESHOLDS } from '../lib/compassTypes';

interface ConfidenceMonitorProps {
  fieldStrength: number; // Magnetic field strength in µT
  confidence: 'high' | 'medium' | 'low';
  provider: SensorProvider;
  showTrueNorth: boolean;
  declination: number | null;
}

const ConfidenceMonitor: React.FC<ConfidenceMonitorProps> = ({
  fieldStrength,
  confidence,
  provider,
  showTrueNorth,
  declination,
}) => {
  const { NORMAL_MIN, NORMAL_MAX } = FIELD_STRENGTH_THRESHOLDS;

  // Calculate bar percentage (0-100)
  const barPercent = Math.min(100, Math.max(0, (fieldStrength / 100) * 100));

  // Determine bar color based on field strength
  const getBarColor = () => {
    if (fieldStrength >= NORMAL_MIN && fieldStrength <= NORMAL_MAX) {
      return 'bg-green-500';
    }
    if (confidence === 'medium') {
      return 'bg-yellow-500';
    }
    return 'bg-red-500';
  };

  // Confidence badge colors
  const getConfidenceBadge = () => {
    switch (confidence) {
      case 'high':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          label: 'Trusted',
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          label: 'Marginal',
        };
      case 'low':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          label: 'Interference',
        };
    }
  };

  // Provider display name
  const getProviderName = () => {
    switch (provider) {
      case 'generic-sensor-api':
        return 'Magnetometer API';
      case 'deviceorientationabsolute':
        return 'Device Orientation';
      case 'webkit-compass':
        return 'WebKit Compass';
      default:
        return 'Unknown';
    }
  };

  const badge = getConfidenceBadge();

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getProviderName()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {showTrueNorth ? (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              True North
            </span>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">
              Magnetic North
            </span>
          )}
          {declination !== null && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({declination >= 0 ? '+' : ''}{declination.toFixed(1)}°)
            </span>
          )}
        </div>
      </div>

      {/* Field strength display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Magnetic Field</span>
          <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
            {fieldStrength.toFixed(1)} µT
          </span>
        </div>

        {/* Field strength bar */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Normal range indicator */}
          <div
            className="absolute h-full bg-gray-300 dark:bg-gray-600"
            style={{
              left: `${(NORMAL_MIN / 100) * 100}%`,
              width: `${((NORMAL_MAX - NORMAL_MIN) / 100) * 100}%`,
            }}
          />
          {/* Current value bar */}
          <div
            className={`h-full rounded-full transition-all duration-200 ${getBarColor()}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>0</span>
          <span className="text-green-600 dark:text-green-400">{NORMAL_MIN}-{NORMAL_MAX} (normal)</span>
          <span>100</span>
        </div>
      </div>

      {/* Warning message for low confidence */}
      {confidence === 'low' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Magnetic Interference Detected
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Move away from metal objects or electronics for accurate readings.
              </p>
            </div>
          </div>
        </div>
      )}

      {confidence === 'medium' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Marginal Signal
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                Readings may be less accurate. Consider calibrating.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceMonitor;
