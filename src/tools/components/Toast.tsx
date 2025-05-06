import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// Toast types and interfaces
type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';

interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  isClosable?: boolean;
  onClose?: () => void;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
}

interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
  maxToasts?: number;
}

interface ToastComponentProps extends Toast {
  onClose: () => void;
  position: ToastPosition;
}

// Context to make toast functions available throughout the app
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Hook for accessing toast functionality
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Individual toast component with animation
 */
const ToastComponent: React.FC<ToastComponentProps> = ({
  id,
  title,
  message,
  type,
  onClose,
  isClosable = true,
  position
}) => {
  // Style configurations
  const toastTypeStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-400 dark:border-green-800',
      icon: (
        <svg className="w-5 h-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-400 dark:border-red-800',
      icon: (
        <svg className="w-5 h-5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-400 dark:border-yellow-800',
      icon: (
        <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-400 dark:border-blue-800',
      icon: (
        <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const style = toastTypeStyles[type];

  // Animation class based on position
  const getAnimationClass = () => {
    if (position.includes('top')) {
      return 'animate-slide-in-down';
    } else if (position.includes('bottom')) {
      return 'animate-slide-in-up';
    } else if (position.includes('left')) {
      return 'animate-slide-in-right';
    } else if (position.includes('right')) {
      return 'animate-slide-in-left';
    }
    return 'animate-fade-in';
  };

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className={`
        flex items-start p-4 mb-3 rounded-lg shadow-md border 
        ${style.bg} ${style.border} ${getAnimationClass()}
        transition-all duration-300 transform max-w-sm w-full
      `}
      data-test-id={`toast-${id}`}
    >
      <div className="flex-shrink-0 mr-3">
        {style.icon}
      </div>
      <div className="flex-1">
        {title && <h4 className="text-sm font-medium mb-1">{title}</h4>}
        <div className="text-sm">{message}</div>
      </div>
      {isClosable && (
        <button
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Container for toast notifications
 */
const ToastContainer: React.FC<{
  toasts: Toast[];
  position: ToastPosition;
  removeToast: (id: string) => void;
}> = ({ toasts, position, removeToast }) => {
  // Position classes
  const positionClasses = {
    'top': 'top-0 left-1/2 -translate-x-1/2 pt-4 items-center',
    'top-right': 'top-0 right-0 p-4 items-end',
    'top-left': 'top-0 left-0 p-4 items-start',
    'bottom': 'bottom-0 left-1/2 -translate-x-1/2 pb-4 items-center',
    'bottom-right': 'bottom-0 right-0 p-4 items-end',
    'bottom-left': 'bottom-0 left-0 p-4 items-start',
  };

  const positionStyle = positionClasses[position] || positionClasses['top-right'];

  return (
    <div
      className={`fixed flex flex-col z-50 transform ${positionStyle}`}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          position={position}
          onClose={() => {
            removeToast(toast.id);
            toast.onClose?.();
          }}
          {...toast}
        />
      ))}
    </div>
  );
};

/**
 * Provider component that makes toast available throughout the app
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  defaultDuration = 5000,
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Remove a toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Create a new toast
  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = {
        id,
        ...toast,
        duration: toast.duration ?? defaultDuration,
      };

      setToasts((prevToasts) => {
        // Enforce max toast limit
        let updatedToasts = [...prevToasts, newToast];
        if (updatedToasts.length > maxToasts) {
          updatedToasts = updatedToasts.slice(updatedToasts.length - maxToasts);
        }
        return updatedToasts;
      });
      
      return id;
    },
    [defaultDuration, maxToasts],
  );

  // Update an existing toast
  const updateToast = useCallback((id: string, toast: Partial<Omit<Toast, 'id'>>) => {
    setToasts((prevToasts) =>
      prevToasts.map((prevToast) =>
        prevToast.id === id ? { ...prevToast, ...toast } : prevToast
      )
    );
  }, []);

  // Remove all toasts
  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Auto-dismiss toasts after duration
  useEffect(() => {
    const timers: number[] = [];
    
    toasts.forEach((toast) => {
      if (toast.duration !== Infinity) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, removeToast]);

  // Context value
  const value = {
    addToast,
    removeToast,
    updateToast,
    removeAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={defaultPosition} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Export default with addToast convenience function
export default {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    const context = useContext(ToastContext);
    if (!context) {
      throw new Error('Toast functions must be used within a ToastProvider');
    }
    return context.addToast({ message, type: 'success', ...options });
  },
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    const context = useContext(ToastContext);
    if (!context) {
      throw new Error('Toast functions must be used within a ToastProvider');
    }
    return context.addToast({ message, type: 'error', ...options });
  },
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    const context = useContext(ToastContext);
    if (!context) {
      throw new Error('Toast functions must be used within a ToastProvider');
    }
    return context.addToast({ message, type: 'warning', ...options });
  },
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    const context = useContext(ToastContext);
    if (!context) {
      throw new Error('Toast functions must be used within a ToastProvider');
    }
    return context.addToast({ message, type: 'info', ...options });
  },
};