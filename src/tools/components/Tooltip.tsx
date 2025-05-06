import React, { useState, ReactNode, useRef, useEffect } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
  maxWidth?: string;
}

/**
 * Tooltip component to display additional information on hover
 * Follows the design system and supports both light and dark themes
 */
const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
  maxWidth = 'max-w-xs'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Position classes for the tooltip
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2'
  };

  // Arrow classes based on position
  const arrowClasses = {
    top: 'bottom-[-6px] left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-0',
    right: 'left-[-6px] top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-0',
    bottom: 'top-[-6px] left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-0',
    left: 'right-[-6px] top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-0'
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    setIsHovering(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setIsVisible(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-flex" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`
            absolute z-50 px-3 py-2 text-sm rounded-md shadow-md
            bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-800
            animate-fade-in ${positionClasses[position]} ${maxWidth} ${className}
          `}
          role="tooltip"
        >
          {/* Tooltip content */}
          {content}
          
          {/* Tooltip arrow */}
          <div 
            className={`
              absolute w-0 h-0 border-solid border-4 
              border-gray-800 dark:border-gray-100 ${arrowClasses[position]}
            `} 
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;