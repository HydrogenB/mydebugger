import React, { useState, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  /** The element to attach the tooltip to */
  children: React.ReactNode;
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Position of the tooltip relative to the element */
  position?: TooltipPosition;
  /** Maximum width of the tooltip */
  maxWidth?: string;
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Whether to show the arrow */
  showArrow?: boolean;
  /** Custom CSS class for the tooltip */
  className?: string;
  /** ID attribute for the tooltip */
  id?: string;
}

/**
 * Tooltip - A component that displays additional information when hovering over an element.
 * 
 * @example
 * ```tsx
 * <Tooltip content="Additional information">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  maxWidth = 'max-w-xs',
  delay = 0,
  disabled = false,
  showArrow = true,
  className = '',
  id,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Show tooltip
  const showTooltip = () => {
    if (disabled) return;
    
    setShouldRender(true);
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  };
  
  // Hide tooltip
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
    
    // Small delay before unmounting to allow for exit animations
    setTimeout(() => {
      setShouldRender(false);
    }, 200);
  };

  // Ensure we clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Position classes based on position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      default: // top
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  // Arrow position classes
  const getArrowClasses = () => {
    switch (position) {
      case 'right':
        return 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-r-gray-800 dark:border-r-gray-700 border-t-transparent border-b-transparent border-l-transparent';
      case 'bottom':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-gray-800 dark:border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-l-gray-800 dark:border-l-gray-700 border-t-transparent border-b-transparent border-r-transparent';
      default: // top
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-gray-800 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  // Base tooltip classes
  const tooltipClasses = [
    'absolute z-50',
    'bg-gray-800 dark:bg-gray-700',
    'text-white text-sm',
    'rounded px-2 py-1 shadow-lg',
    'transition-opacity duration-200 ease-in-out',
    getPositionClasses(),
    maxWidth,
    isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
    className
  ].filter(Boolean).join(' ');

  // Arrow classes
  const arrowClasses = [
    'absolute w-0 h-0',
    'border-solid border-[6px]',
    getArrowClasses()
  ].join(' ');

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      ref={triggerRef}
    >
      {/* Trigger element */}
      {children}
      
      {/* Tooltip content */}
      {shouldRender && (
        <div
          ref={tooltipRef}
          className={tooltipClasses}
          role="tooltip"
          id={id}
        >
          {showArrow && <div className={arrowClasses} />}
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;