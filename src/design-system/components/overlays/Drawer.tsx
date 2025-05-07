import React, { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getIcon } from '../../icons';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  /** Content to display inside the drawer */
  children: ReactNode;
  /** Whether the drawer is visible */
  isOpen: boolean;
  /** Function to call when the drawer should be closed */
  onClose: () => void;
  /** Title displayed in the drawer header */
  title?: ReactNode;
  /** Placement of the drawer */
  placement?: DrawerPlacement;
  /** Size of the drawer */
  size?: DrawerSize;
  /** Whether clicking the overlay should close the drawer */
  closeOnOverlayClick?: boolean;
  /** Whether pressing escape should close the drawer */
  closeOnEsc?: boolean;
  /** Whether the drawer should have a close button */
  showCloseButton?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Function called after the drawer has opened completely */
  onOpened?: () => void;
  /** Function called after the drawer has closed completely */
  onClosed?: () => void;
  /** Whether the drawer is nested inside another drawer */
  isNested?: boolean;
  /** ID for the drawer element */
  id?: string;
  /** Whether the drawer should have a backdrop */
  hasBackdrop?: boolean;
  /** Element to render the drawer into */
  portalTarget?: HTMLElement;
  /** Whether to show a footer with a close button */
  showFooter?: boolean;
  /** Content for the footer */
  footer?: ReactNode;
  /** Whether to render a fullscreen drawer on mobile */
  fullScreenOnMobile?: boolean;
}

/**
 * Drawer - A responsive slide-in panel component that appears from
 * the edge of the screen.
 */
export const Drawer: React.FC<DrawerProps> = ({
  children,
  isOpen,
  onClose,
  title,
  placement = 'right',
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
  onOpened,
  onClosed,
  isNested = false,
  id,
  hasBackdrop = true,
  portalTarget,
  showFooter = false,
  footer,
  fullScreenOnMobile = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen && !isNested && hasBackdrop) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen, isNested, hasBackdrop]);

  // Focus management
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // Trigger animations and callbacks
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const onTransitionEnd = () => {
        if (isOpen && onOpened) {
          onOpened();
        }
      };
      
      drawerRef.current.addEventListener('transitionend', onTransitionEnd, { once: true });
      
      return () => {
        drawerRef.current?.removeEventListener('transitionend', onTransitionEnd);
      };
    }
  }, [isOpen, onOpened]);

  // Size classes based on placement
  const getSizeClass = () => {
    // For left and right drawers (controls width)
    if (placement === 'left' || placement === 'right') {
      const sizes = {
        xs: 'w-64',
        sm: 'w-72',
        md: 'w-80',
        lg: 'w-96',
        xl: 'w-[28rem]',
        full: 'w-screen',
      };
      
      const mobileSizes = fullScreenOnMobile 
        ? 'w-full sm:w-auto sm:' + sizes[size] 
        : sizes[size];
        
      return mobileSizes;
    }
    
    // For top and bottom drawers (controls height)
    const sizes = {
      xs: 'h-1/4',
      sm: 'h-1/3',
      md: 'h-1/2',
      lg: 'h-2/3',
      xl: 'h-3/4',
      full: 'h-screen',
    };
    
    const mobileSizes = fullScreenOnMobile 
      ? 'h-full sm:h-auto sm:' + sizes[size] 
      : sizes[size];
      
    return mobileSizes;
  };

  // Transform classes for animations
  const getTransformClass = () => {
    const transforms = {
      left: isOpen ? 'translate-x-0' : '-translate-x-full',
      right: isOpen ? 'translate-x-0' : 'translate-x-full',
      top: isOpen ? 'translate-y-0' : '-translate-y-full',
      bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
    };
    
    return transforms[placement];
  };

  // Position classes
  const getPositionClass = () => {
    const positions = {
      left: 'left-0 top-0 bottom-0',
      right: 'right-0 top-0 bottom-0',
      top: 'top-0 left-0 right-0',
      bottom: 'bottom-0 left-0 right-0',
    };
    
    return positions[placement];
  };

  // Combine all classes
  const drawerClasses = [
    'fixed z-50 bg-white dark:bg-gray-800 shadow-xl',
    'flex flex-col',
    'transition-transform duration-300 ease-in-out',
    getPositionClass(),
    getSizeClass(),
    getTransformClass(),
    className
  ].join(' ');

  // Backdrop classes
  const backdropClasses = [
    'fixed inset-0 bg-black/50 z-40',
    'transition-opacity duration-300',
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
    isNested ? 'z-[51]' : 'z-40',
  ].join(' ');

  // Create the drawer component
  const drawer = (
    <>
      {/* Backdrop/overlay */}
      {hasBackdrop && (
        <div 
          className={backdropClasses} 
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={drawerClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id || 'drawer'}-title` : undefined}
        id={id}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
          {title && (
            <h2 id={`${id || 'drawer'}-title`} className="text-xl font-semibold dark:text-white">
              {title}
            </h2>
          )}
          
          {showCloseButton && (
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close drawer"
            >
              {getIcon('close')}
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {/* Footer */}
        {showFooter && (
          <div className="px-6 py-4 border-t dark:border-gray-700">
            {footer || (
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Don't render anything if not open and not animating close
  if (!isOpen && onClosed) {
    onClosed();
    return null;
  }

  // Use portal to render at the document body
  if (typeof document !== 'undefined') {
    const target = portalTarget || document.body;
    return createPortal(drawer, target);
  }

  return null;
};

export default Drawer;