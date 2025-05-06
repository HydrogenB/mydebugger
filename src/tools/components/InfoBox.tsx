import React, { ReactNode } from 'react';
import Tooltip from './Tooltip';

interface InfoBoxProps {
  title: string;
  children: ReactNode;
  infoTooltip?: string | ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

/**
 * InfoBox component for displaying information with optional tooltips
 * Integrates with the Tooltip component and follows the design system
 */
const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  children,
  infoTooltip,
  variant = 'info',
  className = '',
}) => {
  // Variant styles mapping
  const variantStyles = {
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-200',
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-800 dark:text-green-200',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-200',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-800 dark:text-red-200',
    }
  };

  // Icon mapping based on variant
  const getIcon = () => {
    switch (variant) {
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`rounded-md border p-4 ${variantStyles[variant].container} ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${variantStyles[variant].icon}`}>
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <h3 className={`text-sm font-medium ${variantStyles[variant].title} mr-1`}>{title}</h3>
            
            {infoTooltip && (
              <Tooltip content={infoTooltip} position="top">
                <div className={`cursor-help ${variantStyles[variant].icon}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </Tooltip>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;