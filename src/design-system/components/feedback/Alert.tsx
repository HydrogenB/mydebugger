import React from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /** Type of alert */
  type?: AlertType;
  /** Alert title */
  title?: React.ReactNode;
  /** Alert content */
  children?: React.ReactNode;
  /** Whether to show an icon */
  showIcon?: boolean;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS for container */
  containerClassName?: string;
  /** Whether alert is outlined style */
  outlined?: boolean;
  /** ID attribute */
  id?: string;
  /** Optional action component like a button */
  action?: React.ReactNode;
}

/**
 * Alert - A component that displays important messages or feedback to users
 * 
 * @description
 * Alerts are used to communicate status, provide feedback, or give information to users 
 * about actions they've taken or issues they need to address. They can be informational, 
 * confirmational (success), cautionary (warning), or error notifications.
 * 
 * Alerts support different visual styles based on their purpose, optional icons, 
 * dismissibility, actions, and both filled and outlined appearances. They're designed 
 * to draw appropriate attention while fitting into the UI seamlessly.
 * 
 * @accessibility
 * - Uses appropriate ARIA role="alert" for dynamic alerts
 * - Provides clear visual indications through color coding and icons
 * - Close buttons include aria-label and visible text for screen readers
 * - Color contrasts meet WCAG standards for all alert types
 * - Supports keyboard navigation for interactive elements
 * - Animations respect reduced motion preferences
 * 
 * @example
 * ```tsx
 * // Basic info alert
 * <Alert type="info">
 *   This is an informational message.
 * </Alert>
 * 
 * // Success alert with title
 * <Alert 
 *   type="success" 
 *   title="Operation completed"
 * >
 *   Your changes have been saved successfully.
 * </Alert>
 * 
 * // Dismissible warning alert
 * <Alert 
 *   type="warning" 
 *   dismissible 
 *   onDismiss={() => console.log('Alert dismissed')}
 * >
 *   Your session will expire in 5 minutes.
 * </Alert>
 * 
 * // Error alert with action button
 * <Alert 
 *   type="error" 
 *   title="Connection failed"
 *   action={<Button size="sm">Retry</Button>}
 * >
 *   Unable to connect to the server. Please check your connection.
 * </Alert>
 * 
 * // Outlined style alert
 * <Alert type="info" outlined>
 *   This is an outlined informational alert.
 * </Alert>
 * ```
 */
export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  showIcon = true,
  dismissible = false,
  onDismiss,
  className = '',
  containerClassName = '',
  outlined = false,
  id,
  action,
}) => {
  const [visible, setVisible] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false);
  
  if (!visible) {
    return null;
  }
  
  // Handle close button click with exit animation
  const handleDismiss = () => {
    setIsExiting(true);
    
    // Wait for animation to complete
    setTimeout(() => {
      setVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 300); // Match transition duration
  };
  
  // Configure styles based on alert type
  const alertStyles = {
    info: {
      solid: 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
      outlined: 'bg-transparent border-blue-500 text-blue-700 dark:text-blue-400',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
        </svg>
      ),
    },
    success: {
      solid: 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300',
      outlined: 'bg-transparent border-green-500 text-green-700 dark:text-green-400',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      ),
    },
    warning: {
      solid: 'bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300',
      outlined: 'bg-transparent border-yellow-500 text-yellow-700 dark:text-yellow-400',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
        </svg>
      ),
    },
    error: {
      solid: 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
      outlined: 'bg-transparent border-red-500 text-red-700 dark:text-red-400',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
        </svg>
      ),
    },
  };
  
  const style = outlined ? alertStyles[type].outlined : alertStyles[type].solid;
  
  // Animation classes
  const animationClasses = isExiting
    ? 'animate-fade-out motion-reduce:opacity-0 motion-reduce:transition-opacity'
    : 'animate-fade-in motion-reduce:animate-none';
  
  return (
    <div id={id} className={`${containerClassName}`}>
      <div
        className={`flex p-4 mb-4 border-l-4 rounded-md ${style} ${animationClasses} transition-all duration-300 motion-reduce:transition-none ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start">
          {showIcon && (
            <div className="flex-shrink-0 mr-3">
              <div className="transition-transform duration-200 ease-in-out motion-reduce:transform-none">
                {alertStyles[type].icon}
              </div>
            </div>
          )}
          <div className="flex-1">
            {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
            <div className="text-sm">{children}</div>
            {action && <div className="mt-3">{action}</div>}
          </div>
        </div>
        
        {dismissible && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 motion-reduce:transition-none"
            onClick={handleDismiss}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg
              aria-hidden="true"
              className="w-5 h-5 transform transition-transform duration-200 hover:scale-110 motion-reduce:transform-none"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};