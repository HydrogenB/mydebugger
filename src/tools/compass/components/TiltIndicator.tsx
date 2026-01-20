/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - Tilt Indicator Component
 *
 * Shows crosshairs overlay when device is tilted beyond threshold.
 * Helps user level the device for accurate readings.
 */

import React, { useState, useEffect } from 'react';
import type { PhonePosture } from '../lib/compassTypes';

interface TiltIndicatorProps {
  tiltAngle: number; // Current tilt angle in degrees
  pitch: number; // Front-to-back tilt
  roll: number; // Left-to-right tilt
  posture: PhonePosture; // Phone holding posture
  threshold?: number; // Tilt threshold in degrees (default 15)
}

const TiltIndicator: React.FC<TiltIndicatorProps> = ({
  tiltAngle,
  pitch,
  roll,
  posture,
  threshold = 15,
}) => {
  // Only show if tilt exceeds threshold
  if (tiltAngle < threshold) {
    return null;
  }

  // Calculate bubble position (clamped to visible range)
  // Bubble behaves like air bubble - moves opposite to tilt direction (floats "up")
  const maxOffset = 40; // Maximum pixel offset

  let bubbleX: number;
  let bubbleY: number;

  if (posture === 'flat') {
    // Phone is flat on table
    // Bubble moves opposite to tilt: if phone tilts right (positive roll), bubble goes left
    bubbleX = Math.max(-maxOffset, Math.min(maxOffset, -roll * 2));
    bubbleY = Math.max(-maxOffset, Math.min(maxOffset, -pitch * 2));
  } else if (posture === 'upright-portrait') {
    // Phone held upright in portrait mode
    // When perfectly upright: pitch=0, roll=0
    // If phone tilts away from user (top goes back): pitch > 0, bubble should go up (negative Y)
    // If phone tilts left: roll < 0, bubble should go right (positive X)
    bubbleX = Math.max(-maxOffset, Math.min(maxOffset, roll * 2));
    bubbleY = Math.max(-maxOffset, Math.min(maxOffset, -pitch * 2));
  } else {
    // Phone held upright in landscape mode
    // When perfectly upright: pitch=0, roll=0
    // Adjust for landscape: axes are rotated 90 degrees
    bubbleX = Math.max(-maxOffset, Math.min(maxOffset, pitch * 2));
    bubbleY = Math.max(-maxOffset, Math.min(maxOffset, roll * 2));
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20 rounded-lg" />

      {/* Level indicator */}
      <div className="relative w-32 h-32">
        {/* Crosshairs */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white/60"
        >
          {/* Outer circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Inner circle (target zone) */}
          <circle
            cx="50"
            cy="50"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-green-400"
          />

          {/* Crosshair lines */}
          <line x1="50" y1="5" x2="50" y2="35" stroke="currentColor" strokeWidth="1" />
          <line x1="50" y1="65" x2="50" y2="95" stroke="currentColor" strokeWidth="1" />
          <line x1="5" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="1" />
          <line x1="65" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1" />

          {/* Bubble indicator */}
          <circle
            cx={50 + bubbleX}
            cy={50 + bubbleY}
            r="8"
            className={
              tiltAngle < threshold
                ? 'fill-green-500'
                : tiltAngle < threshold * 2
                  ? 'fill-yellow-500'
                  : 'fill-red-500'
            }
            style={{
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))',
            }}
          />
        </svg>

        {/* Tilt angle label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-sm font-mono text-white bg-black/50 px-2 py-1 rounded">
            Tilt: {Math.round(tiltAngle)}°
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-white/80 bg-black/40 mx-4 py-2 px-4 rounded-lg">
          Level your device for accurate readings
        </p>
      </div>
    </div>
  );
};

export default TiltIndicator;
