import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

/**
 * Loading spinner component that provides visual feedback during asynchronous operations
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  ariaLabel = 'Loading'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className={`flex justify-center items-center ${className}`} role="status">
      <svg 
        className={`animate-spin text-primary-500 ${sizeClasses[size]}`} 
        xmlns="http://www.w3.org/2000/svg"
        fill="none" 
        viewBox="0 0 24 24"
        aria-label={ariaLabel}
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export default LoadingSpinner;
