/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';

export interface ProgressBarProps {
  /** Progress percentage (0-100) */
  value: number;
  /** Accessible label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Simple progress bar component using Tailwind styles
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label = 'progress',
  className = ''
}) => {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      aria-label={label}
      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}
    >
      <div
        className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
};

export default ProgressBar;
