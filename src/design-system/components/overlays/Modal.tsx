import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback fired when the modal is closed */
  onClose: () => void;
  /** Title shown in the modal header */
  title?: React.ReactNode;
  /** Optional description shown below the title */
  description?: React.ReactNode;
  /** Content of the modal */
  children: React.ReactNode;
  /** Size of the modal */
  size?: ModalSize;
  /** Whether the modal can be closed by clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether the modal can be closed by pressing Escape */
  closeOnEsc?: boolean;
  /** Whether to render a close button in the header */
  showCloseButton?: boolean;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Whether to center the modal vertically */
  centered?: boolean;
  /** Custom modal header */
  header?: React.ReactNode;
  /** Custom CSS class for the modal container */
  className?: string;
  /** Custom CSS class for the backdrop */
  backdropClassName?: string;
  /** HTML id for the modal */
  id?: string;
  /** Whether the modal is in a loading state */
  loading?: boolean;
  /** Whether the modal should animate */
  animate?: boolean;
  /** Whether the modal should be full height */
  fullHeight?: boolean;
}

// Define types for the subcomponents
type ModalHeaderProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
  className?: string;
};

type ModalFooterProps = {
  children: React.ReactNode;
  className?: string;
};

type ModalBodyProps = {
  children: React.ReactNode;
  className?: string;
};

// Define the Modal component type with subcomponents
interface ModalComponent extends React.FC<ModalProps> {
  Header: React.FC<ModalHeaderProps>;
  Footer: React.FC<ModalFooterProps>;
  Body: React.FC<ModalBodyProps>;
}

/**
 * Modal component for creating accessible dialogs
 */
export const Modal: ModalComponent = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  centered = false, 
  header,
  className = '',
  backdropClassName = '',
  id,
  loading = false,
  animate = true,
  fullHeight = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Mount the modal in the DOM only on the client side
  useEffect(() => {
    setMounted(true);
    
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle click outside the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEsc, isOpen, onClose]);
  
  // Auto-focus the first focusable element in the modal when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);
  
  // Size classes for the modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full min-h-screen w-full m-0',
  };
  
  // Transition classes
  const backdropTransitionClasses = animate 
    ? 'transition-opacity duration-300 ease-in-out'
    : '';
    
  const modalTransitionClasses = animate
    ? 'transition-all duration-300 ease-in-out'
    : '';
  
  // Modal container classes
  const modalContainerClasses = [
    'relative bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden',
    'w-full mx-4',
    size !== 'full' ? sizeClasses[size] : 'rounded-none',
    fullHeight ? 'h-full' : '',
    modalTransitionClasses,
    className,
  ].filter(Boolean).join(' ');
  
  // Backdrop classes
  const backdropClasses = [
    'fixed inset-0 flex items-center bg-black bg-opacity-50 z-50',
    centered ? 'items-center' : 'items-start md:items-center pt-16 md:pt-0',
    backdropClassName,
    backdropTransitionClasses,
  ].filter(Boolean).join(' ');
  
  // Don't render anything if not mounted (SSR case)
  if (!mounted) {
    return null;
  }
  
  // Create the modal content
  const modalContent = (
    <div
      className={backdropClasses}
      style={{ 
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id}-title` : undefined}
      aria-describedby={description ? `${id}-description` : undefined}
    >
      {/* Modal container */}
      <div
        ref={modalRef}
        className={modalContainerClasses}
        style={{ 
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0
        }}
        id={id}
      >
        {/* Modal header */}
        {(title || header || showCloseButton) && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            {header || (
              <div>
                {title && (
                  <h3 
                    id={`${id}-title`} 
                    className="text-lg font-medium text-gray-900 dark:text-gray-100"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p 
                    id={`${id}-description`} 
                    className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                  >
                    {description}
                  </p>
                )}
              </div>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Modal body */}
        <div className={`p-6 ${fullHeight ? 'overflow-y-auto flex-1' : ''}`}>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            children
          )}
        </div>
        
        {/* Modal footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
  
  // Use portal to render the modal at the end of the document body
  return createPortal(modalContent, document.body);
};

/**
 * Modal.Header - A reusable header component for modals
 */
Modal.Header = function ModalHeader({
  title,
  subtitle,
  onClose,
  className = '',
}: ModalHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center ${className}`}>
      <div>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      
      {onClose && (
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Modal.Footer - A reusable footer component for modals
 */
Modal.Footer = function ModalFooter({
  children,
  className = '',
}: ModalFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Modal.Body - A component for the modal's body content
 */
Modal.Body = function ModalBody({
  children,
  className = '',
}: ModalBodyProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Modal;