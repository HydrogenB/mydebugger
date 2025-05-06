import React, { useState, useEffect, useRef, ReactNode, Fragment } from 'react';

// Modal Props Definition
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  hideOverlay?: boolean;
  allowPinchZoom?: boolean;
  scrollBehavior?: 'inside' | 'outside';
  className?: string;
  overlayClassName?: string;
  motionPreset?: 'fade' | 'slideInBottom' | 'slideInRight' | 'scale' | 'none';
  zIndex?: number;
}

/**
 * Modal Component - A flexible, accessible modal dialog
 * 
 * Features:
 * - Focus trapping for a11y
 * - Keyboard navigation and escape key support
 * - Various animation options
 * - Responsive sizing
 * - Scroll locking
 * - Dark mode support
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnOutsideClick = true,
  showCloseButton = true,
  preventScroll = true,
  initialFocusRef,
  hideOverlay = false,
  allowPinchZoom = false,
  scrollBehavior = 'inside',
  className = '',
  overlayClassName = '',
  motionPreset = 'fade',
  zIndex = 50
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  
  // Store the currently focused element to return focus when modal closes
  useEffect(() => {
    if (isOpen) {
      returnFocusRef.current = document.activeElement as HTMLElement;
      setIsMounted(true);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  // Set initial focus when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const focusTimeout = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (modalRef.current) {
        // Find the first focusable element in the modal
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => clearTimeout(focusTimeout);
  }, [isOpen, initialFocusRef]);

  // Return focus to element when modal closes
  useEffect(() => {
    if (!isOpen && returnFocusRef.current) {
      const returnFocusTimeout = setTimeout(() => {
        returnFocusRef.current?.focus();
      }, 10);
      
      return () => clearTimeout(returnFocusTimeout);
    }
  }, [isOpen]);

  // Handle scroll locking
  useEffect(() => {
    if (isOpen && preventScroll) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Store current body styles
      const originalStyle = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        // Restore original styles
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.paddingRight = originalStyle.paddingRight;
      };
    }
  }, [isOpen, preventScroll]);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEsc]);

  // Handle focus trap inside modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return;
      
      const focusableElements = Array.from(
        modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      // Shift + Tab
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } 
      // Tab
      else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  // Size classes lookup
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-5'
  };

  // Animation classes lookup
  const animationClasses = {
    fade: 'animate-fade-in',
    slideInBottom: 'animate-slide-in-up',
    slideInRight: 'animate-slide-in-right',
    scale: 'animate-bounce-in',
    none: ''
  };

  // If not mounted or not open, don't render anything
  if (!isMounted) {
    return null;
  }

  // Handle clicking outside the modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${hideOverlay ? '' : 'bg-black bg-opacity-50'} ${overlayClassName} ${animationClasses[motionPreset]}`}
      style={{ zIndex }}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={typeof title === 'string' ? 'modal-title' : undefined}
    >
      <div 
        ref={modalRef}
        className={`
          relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full 
          mx-auto overflow-hidden
          ${sizeClasses[size]} ${className} ${animationClasses[motionPreset]}
        `}
        tabIndex={-1}
      >
        {/* Modal Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                onClick={onClose}
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div 
          className={`px-6 py-4 ${scrollBehavior === 'inside' ? 'max-h-[70vh] overflow-y-auto' : ''}`}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;