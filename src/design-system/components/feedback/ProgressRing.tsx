/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';

export interface ProgressRingProps {
  /** Progress between 0 and 1 */
  progress: number;
  /** Radius of the circle */
  radius?: number;
  /** Stroke width */
  stroke?: number;
  className?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  radius = 96,
  stroke = 16,
  className = '',
}) => {
  const normalized = Math.max(0, Math.min(1, progress));
  const r = radius - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - normalized);

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      className={`transform -rotate-90 ${className}`}
      style={{ transformOrigin: `${radius}px ${radius}px` }}
    >
      <circle
        cx={radius}
        cy={radius}
        r={r}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ProgressRing;
