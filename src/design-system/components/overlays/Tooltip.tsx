import React, { useState, useRef, useEffect } from 'react';
import { durations, easings } from '../../foundations/animations';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';
export type TooltipSize = 'sm' | 'md' | 'lg';

export interface TooltipProps {
  /** The element to attach the tooltip to */
  children: React.ReactNode;
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Position of the tooltip relative to the element */
  position?: TooltipPosition;
  /** Size of the tooltip that determines padding and font size */
  size?: TooltipSize;
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
  /** Whether to show tooltip on touch devices */
  enableOnTouch?: boolean;
  /** Whether to allow HTML content */
  allowHtml?: boolean;
}

/**
 * Tooltip - A component that displays additional information when hovering over an element
 * 
 * @description
 * Tooltips provide additional context and information when users hover over or focus on
 * an element. They are non-modal and disappear when the user moves their cursor away or
 * shifts focus. Tooltips should be used for supplementary information that enhances the
 * user experience but isn't essential for basic functionality.
 * 
 * The tooltip component handles positioning, visibility, and animations automatically.
 * It supports different positions, sizes, delays, and customizable content. Tooltips
 * are designed to be accessible and respect user preferences for reduced motion.
 * 
 * @accessibility
 * - Uses proper ARIA role="tooltip" for screen reader identification
 * - Supports both mouse hover and keyboard focus events
 * - Includes configurable delay to prevent accidental triggering
 * - Handles proper cleanup to prevent memory leaks
 * - Respects reduced motion preferences through adaptive animations
 * - Ensures sufficient color contrast for readability
 * - Uses appropriate font sizes for legibility
 * 
 * @example
 * ```tsx
 * // Basic tooltip
 * <Tooltip content="Additional information">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * 
 * // Positioned tooltip with delay
 * <Tooltip 
 *   content="This appears after a delay" 
 *   position="right"
 *   delay={500}
 * >
 *   <InfoIcon />
 * </Tooltip>
 * 
 * // Rich content tooltip
 * <Tooltip
 *   content={
 *     <div>
 *       <h4 className="font-bold">Heading</h4>
 *       <p>Detailed explanation with multiple lines</p>
 *     </div>
 *   }
 *   maxWidth="max-w-md"
 *   size="lg"
 * >
 *   <TextWithIcon>More details</TextWithIcon>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  size = 'md',
  maxWidth = 'max-w-xs',
  delay = 0,
  disabled = false,
  showArrow = true,
  className = '',
  id,
  enableOnTouch = false,
  allowHtml = false,
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
    }, durations.normal);
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
        return 'left-full top-1/2 -translate-y-1/2 ml-2 transform-gpu';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2 transform-gpu';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2 transform-gpu';
      default: // top
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2 transform-gpu';
    }
  };

  // Size classes based on size prop
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-3 py-2 text-base';
      default: // md
        return 'px-2.5 py-1.5 text-sm';
    }
  };

  // Animation classes based on position
  const getAnimationClasses = () => {
    if (!isVisible) return '';
    
    const animationMap = {
      'top': 'animate-tooltip-fade-down motion-reduce:animate-fade-in',
      'bottom': 'animate-tooltip-fade-up motion-reduce:animate-fade-in',
      'left': 'animate-tooltip-fade-right motion-reduce:animate-fade-in',
      'right': 'animate-tooltip-fade-left motion-reduce:animate-fade-in'
    };
    
    return animationMap[position];
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

  // Touch device handling
  const touchStartEvents = enableOnTouch 
    ? { 
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        showTooltip();
      },
      onTouchEnd: hideTooltip
    } 
    : {};

  // Base tooltip classes
  const tooltipClasses = [
    'absolute z-50',
    'bg-gray-800 dark:bg-gray-700',
    'text-white',
    'rounded shadow-lg',
    getSizeClasses(),
    'transition-all duration-300 ease-emphasized motion-reduce:transition-none',
    getPositionClasses(),
    getAnimationClasses(),
    maxWidth,
    isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
    className
  ].filter(Boolean).join(' ');

  // Arrow classes
  const arrowClasses = [
    'absolute w-0 h-0',
    'border-solid border-[6px]',
    'transition-transform duration-200 motion-reduce:transition-none',
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
      {...touchStartEvents}
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
          {...(allowHtml ? { dangerouslySetInnerHTML: { __html: content as string } } : {})}
        >
          {showArrow && <div className={arrowClasses} />}
          {!allowHtml && content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;