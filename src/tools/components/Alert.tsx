import React, { ReactNode, useState } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'default';

export interface AlertProps {
  /** Content of the alert */
  children: ReactNode;
  /** Visual style variant based on severity */
  variant?: AlertVariant;
  /** Alert title/heading */
  title?: ReactNode;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Function called when the alert is dismissed */
  onDismiss?: () => void;
  /** Whether the alert is outlined */
  outlined?: boolean;
  /** Optional icon to display */
  icon?: ReactNode;
  /** Optional actions to display (typically buttons) */
  actions?: ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Whether the alert is compact (less padding) */
  compact?: boolean;
  /** Custom ID for the alert */
  id?: string;
}

/**
 * Alert component for displaying important messages with various
 * severity levels and visual styles
 */
const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  outlined = false,
  icon,
  actions,
  className = '',
  compact = false,
  id,
}) => {
  const [dismissed, setDismissed] = useState(false);
  
  // Don't render if dismissed
  if (dismissed) {
    return null;
  }
  
  // Handle close button click
  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };
  
  // Get styles based on variant
  const getAlertStyles = (variant: AlertVariant, outlined: boolean) => {
    if (outlined) {
      switch (variant) {
        case 'info':
          return 'border-blue-500 text-blue-800 dark:text-blue-300 bg-transparent';
        case 'success':
          return 'border-green-500 text-green-800 dark:text-green-300 bg-transparent';
        case 'warning':
          return 'border-yellow-500 text-yellow-800 dark:text-yellow-300 bg-transparent';
        case 'error':
          return 'border-red-500 text-red-800 dark:text-red-300 bg-transparent';
        default:
          return 'border-gray-300 text-gray-800 dark:text-gray-300 bg-transparent dark:border-gray-600';
      }
    } else {
      switch (variant) {
        case 'info':
          return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
        case 'success':
          return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300';
        case 'error':
          return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300';
        default:
          return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300';
      }
    }
  };
  
  // Get default icon based on variant if no custom icon is provided
  const getDefaultIcon = (variant: AlertVariant) => {
    switch (variant) {
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Default icon or custom icon
  const alertIcon = icon || getDefaultIcon(variant);
  
  // Base alert classes
  const alertClasses = [
    // Base styling
    'border rounded-lg animate-fade-in',
    
    // Variant styling
    getAlertStyles(variant, outlined),
    
    // Padding based on compact mode
    compact ? 'p-3' : 'p-4',
    
    // Custom class
    className,
  ].join(' ');
  
  return (
    <div 
      className={alertClasses} 
      role="alert"
      id={id}
    >
      <div className="flex">
        {/* Icon */}
        {alertIcon && (
          <div className="flex-shrink-0 mr-3">
            {alertIcon}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4 className={`font-medium ${compact ? 'text-sm' : 'text-base'} mb-1`}>
              {title}
            </h4>
          )}
          <div className={compact ? 'text-sm' : ''}>{children}</div>
          
          {/* Action buttons */}
          {actions && (
            <div className={`flex ${compact ? 'mt-2' : 'mt-3'} space-x-2`}>
              {actions}
            </div>
          )}
        </div>
        
        {/* Dismiss button */}
        {dismissible && (
          <button
            type="button"
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
            onClick={handleDismiss}
            aria-label="Close alert"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;