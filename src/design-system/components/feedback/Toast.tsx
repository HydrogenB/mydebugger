import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getIcon } from '../../icons';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'default';
export type ToastPosition = 
  | 'top-right' 
  | 'top-center' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-center' 
  | 'bottom-left';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: ReactNode;
  duration?: number;
  position?: ToastPosition;
  onClose?: () => void;
}

interface ToastContextProps {
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Create the Toast context
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Toast Provider Props
interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
  maxToasts?: number;
}

/**
 * Toast Provider - Manages toast notifications across the application
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'bottom-right',
  defaultDuration = 5000,
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Remove a toast by id
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Add a new toast
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || defaultDuration,
      position: toast.position || defaultPosition,
    };
    
    // If we have too many toasts, remove the oldest ones
    setToasts(prev => {
      const updatedToasts = [...prev, newToast];
      if (updatedToasts.length > maxToasts) {
        return updatedToasts.slice(-maxToasts);
      }
      return updatedToasts;
    });

    return id;
  }, [defaultDuration, defaultPosition, maxToasts]);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  // Group toasts by position
  const getToastsByPosition = useCallback(() => {
    const groups: Record<ToastPosition, Toast[]> = {
      'top-left': [],
      'top-center': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-center': [],
      'bottom-right': [],
    };
    
    toasts.forEach(toast => {
      groups[toast.position || defaultPosition].push(toast);
    });
    
    return groups;
  }, [toasts, defaultPosition]);

  // Value for the context
  const contextValue = {
    addToast,
    removeToast,
    clearToasts,
  };

  const toastGroups = getToastsByPosition();

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast containers for each position */}
      {Object.entries(toastGroups).map(([position, positionToasts]) => (
        positionToasts.length > 0 && (
          <div
            key={position}
            className={`fixed z-50 m-4 flex flex-col ${getPositionClasses(position as ToastPosition)}`}
            aria-live="polite"
          >
            {positionToasts.map(toast => (
              <ToastItem 
                key={toast.id} 
                toast={toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        )
      ))}
    </ToastContext.Provider>
  );
};

// Helper to get position classes
const getPositionClasses = (position: ToastPosition): string => {
  switch (position) {
    case 'top-left':
      return 'top-0 left-0 items-start';
    case 'top-center':
      return 'top-0 left-1/2 -translate-x-1/2 items-center';
    case 'top-right':
      return 'top-0 right-0 items-end';
    case 'bottom-left':
      return 'bottom-0 left-0 items-start';
    case 'bottom-center':
      return 'bottom-0 left-1/2 -translate-x-1/2 items-center';
    case 'bottom-right':
      return 'bottom-0 right-0 items-end';
    default:
      return 'bottom-0 right-0 items-end';
  }
};

// Individual Toast Item Component
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const { id, type, title, message, duration, onClose: toastOnClose } = toast;

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration === Infinity) return;
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  // Handle close action
  const handleClose = useCallback(() => {
    if (toastOnClose) {
      toastOnClose();
    }
    onClose();
  }, [onClose, toastOnClose]);
  
  // Toast type styles
  const toastStyles = {
    default: {
      container: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      icon: getIcon('info'),
      iconClass: 'text-gray-500 dark:text-gray-400',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: getIcon('info'),
      iconClass: 'text-blue-500 dark:text-blue-400',
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: getIcon('check'),
      iconClass: 'text-green-500 dark:text-green-400',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: getIcon('warning'),
      iconClass: 'text-yellow-500 dark:text-yellow-400',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: getIcon('xMark'),
      iconClass: 'text-red-500 dark:text-red-400',
    },
  };

  const { container, icon, iconClass } = toastStyles[type];

  return (
    <div
      id={id}
      className={`flex w-full max-w-xs sm:max-w-sm md:max-w-md items-center p-4 mb-3 rounded-md shadow-lg border ${container} animate-fade-in relative overflow-hidden`}
      role="alert"
    >
      {/* Progress bar */}
      {duration !== Infinity && (
        <div 
          className={`absolute bottom-0 left-0 h-1 ${iconClass.replace('text', 'bg')}`}
          style={{ 
            animation: `shrink ${duration}ms linear forwards`,
            width: '100%'
          }}
        />
      )}
      
      {/* Content */}
      <div className={`mr-3 ${iconClass}`}>{icon}</div>
      <div className="flex-1 mr-2">
        {title && (
          <h4 className="text-sm font-semibold mb-1 dark:text-white">{title}</h4>
        )}
        <div className="text-sm font-normal dark:text-gray-300">{message}</div>
      </div>
      
      {/* Close button */}
      <button
        type="button"
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
        aria-label="Close"
        onClick={handleClose}
      >
        {getIcon('close')}
      </button>
    </div>
  );
};

// Toast loading animation
const globalStyle = `
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out forwards;
}
`;

// Insert global styles
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = globalStyle;
  document.head.appendChild(styleEl);
}

// Hook for using toast functionality
export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Helper function to create toast directly
export const toast = {
  show: (message: ReactNode, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
    const context = useContext(ToastContext);
    if (!context) {
      console.error('Toast provider not found');
      return '';
    }
    return context.addToast({ type: 'default', message, ...options });
  },
  info: (message: ReactNode, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
    const context = useContext(ToastContext);
    if (!context) {
      console.error('Toast provider not found');
      return '';
    }
    return context.addToast({ type: 'info', message, ...options });
  },
  success: (message: ReactNode, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
    const context = useContext(ToastContext);
    if (!context) {
      console.error('Toast provider not found');
      return '';
    }
    return context.addToast({ type: 'success', message, ...options });
  },
  warning: (message: ReactNode, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
    const context = useContext(ToastContext);
    if (!context) {
      console.error('Toast provider not found');
      return '';
    }
    return context.addToast({ type: 'warning', message, ...options });
  },
  error: (message: ReactNode, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
    const context = useContext(ToastContext);
    if (!context) {
      console.error('Toast provider not found');
      return '';
    }
    return context.addToast({ type: 'error', message, ...options });
  },
};

export default ToastProvider;