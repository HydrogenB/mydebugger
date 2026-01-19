/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Haptic Lock Panel Component
 *
 * UI for setting and monitoring target bearing lock.
 * Provides manual input, deviation display, and haptic toggle.
 */

import React, { useState, useCallback } from 'react';
import { getCardinalDirection } from '../lib/compassTypes';

interface HapticLockPanelProps {
  targetBearing: number | null;
  currentHeading: number;
  isLocked: boolean;
  deviation: number;
  deviationWarning: number;
  hapticEnabled: boolean;
  supportsVibration: boolean;
  onSetTarget: (bearing: number | null) => void;
  onToggleHaptic: (enabled: boolean) => void;
}

const HapticLockPanel: React.FC<HapticLockPanelProps> = ({
  targetBearing,
  currentHeading,
  isLocked,
  deviation,
  deviationWarning,
  hapticEnabled,
  supportsVibration,
  onSetTarget,
  onToggleHaptic,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Handle manual bearing input
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = parseFloat(inputValue);
      if (!isNaN(value) && value >= 0 && value < 360) {
        onSetTarget(value);
        setInputValue('');
        setShowInput(false);
      }
    },
    [inputValue, onSetTarget]
  );

  // Lock to current heading
  const lockCurrentHeading = useCallback(() => {
    onSetTarget(Math.round(currentHeading));
  }, [currentHeading, onSetTarget]);

  // Clear lock
  const clearLock = useCallback(() => {
    onSetTarget(null);
  }, [onSetTarget]);

  // Determine deviation status
  const isOnTarget = isLocked && deviation <= 1;
  const isWarning = isLocked && deviation > deviationWarning;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Bearing Lock
        </h4>

        {supportsVibration && (
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Haptic
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={hapticEnabled}
                onChange={(e) => onToggleHaptic(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  hapticEnabled
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    hapticEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </div>
            </div>
          </label>
        )}
      </div>

      {isLocked ? (
        // Locked state - show target and deviation
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Target Bearing
              </div>
              <div className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-200">
                {targetBearing}°{' '}
                <span className="text-lg font-normal text-gray-500">
                  {getCardinalDirection(targetBearing!)}
                </span>
              </div>
            </div>

            <button
              onClick={clearLock}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear lock"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Deviation indicator */}
          <div
            className={`flex items-center gap-2 p-2 rounded-lg ${
              isOnTarget
                ? 'bg-green-100 dark:bg-green-900/30'
                : isWarning
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${
                isOnTarget
                  ? 'bg-green-500'
                  : isWarning
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-yellow-500'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                isOnTarget
                  ? 'text-green-700 dark:text-green-400'
                  : isWarning
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-yellow-700 dark:text-yellow-400'
              }`}
            >
              {isOnTarget
                ? 'On Target'
                : `${deviation > 0 ? '+' : ''}${Math.round(deviation)}° deviation`}
            </span>
          </div>

          {hapticEnabled && supportsVibration && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Vibration when aligned within ±1°
            </p>
          )}
        </div>
      ) : (
        // Unlocked state - show lock options
        <div className="space-y-3">
          {showInput ? (
            // Manual input form
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="number"
                min="0"
                max="359"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter bearing (0-359)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Lock
              </button>
              <button
                type="button"
                onClick={() => setShowInput(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </form>
          ) : (
            // Quick action buttons
            <div className="flex gap-2">
              <button
                onClick={lockCurrentHeading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Lock Current ({Math.round(currentHeading)}°)
              </button>
              <button
                onClick={() => setShowInput(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Manual
              </button>
            </div>
          )}

          {/* Quick cardinal direction buttons */}
          <div className="flex gap-2 justify-center">
            {[
              { label: 'N', value: 0 },
              { label: 'E', value: 90 },
              { label: 'S', value: 180 },
              { label: 'W', value: 270 },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => onSetTarget(value)}
                className="w-10 h-10 text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Tap the compass dial to set a custom bearing
          </p>
        </div>
      )}
    </div>
  );
};

export default HapticLockPanel;
