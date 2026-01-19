/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Calibration Overlay Component
 *
 * Full-screen overlay with figure-8 calibration animation.
 * Guides the user through the calibration process.
 */

import React from 'react';

interface CalibrationOverlayProps {
  progress: number; // 0-100 calibration progress
  onSkip: () => void; // Skip calibration (go to untrusted state)
}

const CalibrationOverlay: React.FC<CalibrationOverlayProps> = ({
  progress,
  onSkip,
}) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-6 z-10">
      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">
        Calibrating Compass
      </h3>
      <p className="text-sm text-gray-300 text-center mb-6">
        Move your device in a figure-8 pattern to calibrate the magnetometer
      </p>

      {/* Figure-8 animation */}
      <div className="relative w-48 h-32 mb-6">
        <svg
          viewBox="0 0 200 100"
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          {/* Figure-8 path */}
          <path
            d="M50,50 C50,25 75,10 100,10 C125,10 150,25 150,50 C150,75 125,90 100,90 C75,90 50,75 50,50"
            className="text-gray-500"
            strokeDasharray="8 4"
          />

          {/* Animated dot following the path */}
          <circle
            r="8"
            className="text-blue-500 fill-current"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M50,50 C50,25 75,10 100,10 C125,10 150,25 150,50 C150,75 125,90 100,90 C75,90 50,75 50,50"
            />
          </circle>

          {/* Phone icon that follows the path */}
          <g>
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M50,50 C50,25 75,10 100,10 C125,10 150,25 150,50 C150,75 125,90 100,90 C75,90 50,75 50,50"
              rotate="auto"
            />
            {/* Simple phone outline */}
            <rect
              x="-12"
              y="-20"
              width="24"
              height="40"
              rx="4"
              className="text-white stroke-current fill-gray-800"
              strokeWidth="2"
            />
            <circle
              cx="0"
              cy="14"
              r="3"
              className="text-gray-500 fill-current"
            />
          </g>
        </svg>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
          <span>Calibrating...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-6">
        <p className="text-xs text-gray-400">
          Rotate your device slowly through all orientations
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Keep away from metal objects and electronics
        </p>
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        Skip Calibration
      </button>
    </div>
  );
};

export default CalibrationOverlay;
