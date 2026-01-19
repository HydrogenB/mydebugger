/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compass Module - SVG Compass Dial Component
 *
 * High-fidelity compass visualization with:
 * - Smooth needle animation using CSS transforms
 * - Degree tick marks and cardinal directions
 * - Target bearing indicator for haptic lock
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';

interface CompassDialProps {
  heading: number; // Current heading in degrees (0-360)
  targetBearing: number | null; // Target bearing for haptic lock
  isLocked: boolean; // Whether a bearing is locked
  lockDeviation: number; // Deviation from target bearing
  deviationWarning: number; // Threshold for deviation warning
  onDialTap?: (bearing: number) => void; // Callback when dial is tapped
}

const CompassDial: React.FC<CompassDialProps> = ({
  heading,
  targetBearing,
  isLocked,
  lockDeviation,
  deviationWarning,
  onDialTap,
}) => {
  // Track rotation to avoid 359->1 degree jump
  const rotationRef = useRef(0);
  const lastHeadingRef = useRef(heading);

  useEffect(() => {
    // Calculate the shortest rotation path
    let newRotation = -heading;
    const lastRotation = rotationRef.current;
    const diff = newRotation - lastRotation;

    // Normalize the difference to -180 to 180 range
    if (diff > 180) {
      newRotation -= 360;
    } else if (diff < -180) {
      newRotation += 360;
    }

    // If the difference is still large (> 180), we crossed the boundary
    const adjustedDiff = newRotation - lastRotation;
    if (Math.abs(adjustedDiff) > 180) {
      if (adjustedDiff > 0) {
        newRotation -= 360;
      } else {
        newRotation += 360;
      }
    }

    rotationRef.current = newRotation;
    lastHeadingRef.current = heading;
  }, [heading]);
  // Generate tick marks
  const ticks = useMemo(() => {
    const tickElements: JSX.Element[] = [];
    for (let i = 0; i < 360; i += 2) {
      const isMajor = i % 30 === 0;
      const isMedium = i % 10 === 0;
      const length = isMajor ? 20 : isMedium ? 12 : 6;
      const strokeWidth = isMajor ? 2 : 1;
      const opacity = isMajor ? 1 : isMedium ? 0.7 : 0.3;

      tickElements.push(
        <line
          key={i}
          x1="200"
          y1={15}
          x2="200"
          y2={15 + length}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={opacity}
          transform={`rotate(${i} 200 200)`}
        />
      );
    }
    return tickElements;
  }, []);

  // Cardinal and intercardinal directions
  const directions = useMemo(
    () => [
      { angle: 0, label: 'N', primary: true },
      { angle: 45, label: 'NE', primary: false },
      { angle: 90, label: 'E', primary: true },
      { angle: 135, label: 'SE', primary: false },
      { angle: 180, label: 'S', primary: true },
      { angle: 225, label: 'SW', primary: false },
      { angle: 270, label: 'W', primary: true },
      { angle: 315, label: 'NW', primary: false },
    ],
    []
  );

  // Handle dial tap to set bearing
  const handleDialClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!onDialTap) return;

      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const x = event.clientX - rect.left - centerX;
      const y = event.clientY - rect.top - centerY;

      // Calculate angle from center (relative to screen)
      let angle = Math.atan2(x, -y) * (180 / Math.PI);
      if (angle < 0) angle += 360;

      // Add current heading to get actual bearing relative to North
      // The dial is rotated by -heading, so we need to add heading to get world bearing
      let worldBearing = angle + heading;
      if (worldBearing >= 360) worldBearing -= 360;
      if (worldBearing < 0) worldBearing += 360;

      onDialTap(worldBearing);
    },
    [onDialTap, heading]
  );

  // Determine if deviation warning should show
  const showDeviationWarning = isLocked && lockDeviation > deviationWarning;

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full cursor-pointer select-none"
        onClick={handleDialClick}
        role="img"
        aria-label={`Compass showing heading ${Math.round(heading)} degrees`}
      >
        {/* Background circle with ambient glow */}
        <defs>
          <radialGradient id="dialGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--tw-prose-body, #1f2937)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--tw-prose-body, #1f2937)" stopOpacity="0.15" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle
          cx="200"
          cy="200"
          r="185"
          fill="url(#dialGradient)"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 dark:text-gray-600"
        />

        {/* Inner ring */}
        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
          className="text-gray-400 dark:text-gray-500"
        />

        {/* Tick marks - rotated with the dial */}
        <g
          className="text-gray-600 dark:text-gray-400"
          transform={`rotate(${rotationRef.current} 200 200)`}
          style={{
            transition: 'transform 50ms linear',
          }}
        >
          {ticks}

          {/* Cardinal directions */}
          {directions.map(({ angle, label, primary }) => (
            <text
              key={label}
              x="200"
              y={primary ? 55 : 60}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`font-bold ${
                primary
                  ? 'text-lg fill-gray-700 dark:fill-gray-300'
                  : 'text-sm fill-gray-500 dark:fill-gray-400'
              }`}
              transform={`rotate(${angle} 200 200) rotate(${-rotationRef.current} 200 ${primary ? 55 : 60})`}
              style={{ fontSize: primary ? '18px' : '12px' }}
            >
              {label}
            </text>
          ))}

          {/* Target bearing indicator */}
          {targetBearing !== null && (
            <g
              transform={`rotate(${targetBearing} 200 200)`}
              className={showDeviationWarning ? 'text-red-500' : 'text-yellow-500'}
            >
              <polygon
                points="200,20 195,35 205,35"
                fill="currentColor"
                filter="url(#glow)"
              />
            </g>
          )}
        </g>

        {/* Fixed compass needle (always points up = north relative to device) */}
        <g className="pointer-events-none">
          {/* Needle north (red) */}
          <polygon
            points="200,50 192,200 200,180 208,200"
            className="fill-red-500"
            filter="url(#glow)"
          />
          {/* Needle south (white/gray) */}
          <polygon
            points="200,350 192,200 200,220 208,200"
            className="fill-gray-300 dark:fill-gray-500"
          />
        </g>

        {/* Center cap */}
        <circle
          cx="200"
          cy="200"
          r="15"
          className="fill-gray-200 dark:fill-gray-700"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="200"
          cy="200"
          r="8"
          className="fill-gray-400 dark:fill-gray-500"
        />

        {/* Deviation warning ring */}
        {showDeviationWarning && (
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-red-500 animate-pulse"
            opacity="0.6"
          />
        )}
      </svg>
    </div>
  );
};

export default CompassDial;
