/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Main View Component
 *
 * Assembles all compass UI components into a cohesive view.
 */

import React from 'react';
import type { UseCompassReturn } from '../lib/compassTypes';
import { getCardinalDirection, TILT_THRESHOLD_DEGREES } from '../lib/compassTypes';
import CompassDial from './CompassDial';
import ConfidenceMonitor from './ConfidenceMonitor';
import CalibrationOverlay from './CalibrationOverlay';
import TiltIndicator from './TiltIndicator';
import HapticLockPanel from './HapticLockPanel';

const CompassView: React.FC<UseCompassReturn> = (props) => {
  const {
    state,
    data,
    error,
    provider,
    capabilities,
    config,
    updateConfig,
    start,
    stop,
    setTargetBearing,
    isLocked,
    lockDeviation,
    wakeLockActive,
    toggleWakeLock,
    calibrationProgress,
  } = props;

  const isActive =
    state === 'ACTIVE_TRUSTED' ||
    state === 'ACTIVE_UNTRUSTED' ||
    state === 'CALIBRATING';

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Error
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Idle state - Start button */}
      {state === 'IDLE' && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <polygon
                points="12,4 14,12 12,20 10,12"
                fill="currentColor"
                strokeWidth={1}
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Digital Compass
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            High-fidelity compass with sensor fusion, tilt compensation, and True North support.
          </p>

          <button
            onClick={start}
            className="px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
          >
            Start Compass
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Requires device motion sensors and permissions
          </p>
        </div>
      )}

      {/* Background state */}
      {state === 'BACKGROUND' && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Compass paused while tab is in background
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Return to this tab to resume
          </p>
        </div>
      )}

      {/* Active states */}
      {isActive && data && (
        <>
          {/* Header panel - Confidence Monitor */}
          <div className="card-ambient bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-lg">
            <ConfidenceMonitor
              fieldStrength={data.fieldStrength}
              confidence={data.confidence}
              provider={provider}
              showTrueNorth={config.showTrueNorth}
              declination={data.declination}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-4">
            {/* True/Magnetic North toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showTrueNorth}
                  onChange={(e) =>
                    updateConfig({ showTrueNorth: e.target.checked })
                  }
                  disabled={data.declination === null}
                  className="sr-only"
                />
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    config.showTrueNorth
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  } ${data.declination === null ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      config.showTrueNorth ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  True North
                </span>
              </label>
              {data.declination === null && (
                <span className="text-xs text-gray-400">
                  (Location needed)
                </span>
              )}
            </div>

            {/* Wake lock toggle */}
            {capabilities?.supportsWakeLock && (
              <button
                onClick={toggleWakeLock}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  wakeLockActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      wakeLockActive
                        ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                        : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                    }
                  />
                </svg>
                {wakeLockActive ? 'Screen On' : 'Keep Screen On'}
              </button>
            )}
          </div>

          {/* Main compass dial */}
          <div className="card-ambient bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg">
            <div className="relative">
              <CompassDial
                heading={data.heading}
                targetBearing={config.targetBearing}
                isLocked={isLocked}
                lockDeviation={lockDeviation}
                deviationWarning={config.deviationWarning}
                onDialTap={setTargetBearing}
              />

              {/* Tilt indicator overlay */}
              {data.tiltAngle > TILT_THRESHOLD_DEGREES && (
                <TiltIndicator
                  tiltAngle={data.tiltAngle}
                  pitch={data.pitch}
                  roll={data.roll}
                />
              )}

              {/* Calibration overlay */}
              {state === 'CALIBRATING' && (
                <CalibrationOverlay
                  progress={calibrationProgress}
                  onSkip={() => {
                    // Skip calibration - handled in hook
                  }}
                />
              )}
            </div>

            {/* Heading text display */}
            <div className="text-center mt-4">
              <div className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-200">
                {Math.round(data.heading)}°
              </div>
              <div className="text-lg text-gray-500 dark:text-gray-400">
                {getCardinalDirection(data.heading)}
              </div>
            </div>
          </div>

          {/* Haptic lock panel */}
          <div className="card-ambient bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-lg">
            <HapticLockPanel
              targetBearing={config.targetBearing}
              currentHeading={data.heading}
              isLocked={isLocked}
              deviation={lockDeviation}
              deviationWarning={config.deviationWarning}
              hapticEnabled={config.enableHaptics}
              supportsVibration={capabilities?.supportsVibration ?? false}
              onSetTarget={setTargetBearing}
              onToggleHaptic={(enabled) =>
                updateConfig({ enableHaptics: enabled })
              }
            />
          </div>

          {/* Stop button */}
          <div className="text-center">
            <button
              onClick={stop}
              className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Stop Compass
            </button>
          </div>
        </>
      )}

      {/* Requesting state */}
      {state === 'REQUESTING' && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg
              className="w-12 h-12 text-blue-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Requesting sensor access...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Please allow sensor permissions if prompted
          </p>
        </div>
      )}
    </div>
  );
};

export default CompassView;
