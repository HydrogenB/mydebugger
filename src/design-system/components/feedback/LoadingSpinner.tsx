import React from 'react';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Color class name for the spinner */
  color?: string;
  /** Whether the spinner should cover the full screen with an overlay */
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component for indicating loading states
 * 
 * @example
 * ```tsx
 * // Basic spinner
 * <LoadingSpinner />
 * 
 * // Custom size and color
 * <LoadingSpinner size="lg" color="text-primary-500" />
 * 
 * // Full screen overlay spinner
 * <LoadingSpinner fullScreen />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-primary-600',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${color} animate-spin rounded-full border-4 border-t-transparent border-current`}
        role="status"
        aria-label="loading"
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[10rem] flex items-center justify-center">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;