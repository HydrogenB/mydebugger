import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SplitPaneProps {
  /**
   * Content for the left pane
   */
  left: React.ReactNode;
  
  /**
   * Content for the right pane
   */
  right: React.ReactNode;
  
  /**
   * Initial split percentage (1-99)
   */
  initialSplit?: number;
  
  /**
   * Local storage key to persist split position
   */
  storageKey?: string;
  
  /**
   * Custom CSS classes for the component
   */
  className?: string;
  
  /**
   * Direction of the split (horizontal or vertical)
   */
  direction?: 'horizontal' | 'vertical';
}

/**
 * SplitPane component for creating resizable split layouts
 * 
 * Features:
 * - Draggable divider
 * - Persistent split position with localStorage
 * - Supports both horizontal and vertical splits
 * - Responsive design
 * - Keyboard accessibility
 */
const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  initialSplit = 50,
  storageKey,
  className = '',
  direction = 'horizontal'
}) => {
  // Get saved split from localStorage if available
  const getSavedSplit = (): number => {
    if (!storageKey) return initialSplit;
    
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseFloat(saved) : initialSplit;
    } catch {
      return initialSplit;
    }
  };
  
  // State for split percentage
  const [split, setSplit] = useState<number>(getSavedSplit());
  
  // State for dragging
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  
  // Save split to localStorage when it changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, split.toString());
    }
  }, [split, storageKey]);
  
  // Handle mouse movement during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    let percentage: number;
    if (direction === 'horizontal') {
      // Calculate percentage based on mouse X position
      percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    } else {
      // Calculate percentage based on mouse Y position
      percentage = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    }
    
    // Clamp percentage between 10 and 90
    const clampedPercentage = Math.max(10, Math.min(90, percentage));
    
    setSplit(clampedPercentage);
  }, [isDragging, direction]);
  
  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // Track drag completed in analytics
    if (window.gtag) {
      window.gtag('event', 'split_pane_resize', {
        'split': Math.round(split),
        'direction': direction
      });
    }
  }, [split, direction]);
  
  // Set up and clean up event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Change cursor during drag
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Reset cursor
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);
  
  // Handle keyboard controls for accessibility
  const handleDividerKeyDown = (e: React.KeyboardEvent) => {
    // Left/right arrows for horizontal, up/down for vertical
    const step = 1; // 1% step
    
    if (
      (direction === 'horizontal' && e.key === 'ArrowLeft') ||
      (direction === 'vertical' && e.key === 'ArrowUp')
    ) {
      setSplit(prev => Math.max(10, prev - step));
      e.preventDefault();
    } else if (
      (direction === 'horizontal' && e.key === 'ArrowRight') ||
      (direction === 'vertical' && e.key === 'ArrowDown')
    ) {
      setSplit(prev => Math.min(90, prev + step));
      e.preventDefault();
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`split-pane relative ${direction} h-full w-full overflow-hidden ${className}`}
    >
      {/* Left/Top pane */}
      <div
        className="split-pane-left absolute overflow-auto"
        style={{
          left: 0,
          top: 0,
          [direction === 'horizontal' ? 'width' : 'height']: `${split}%`,
          [direction === 'horizontal' ? 'height' : 'width']: '100%'
        }}
        aria-label={direction === 'horizontal' ? 'Left panel' : 'Top panel'}
      >
        {left}
      </div>
      
      {/* Divider */}
      <div
        ref={dividerRef}
        className={`split-pane-divider absolute z-10 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 
                  ${direction === 'horizontal' ? 'cursor-col-resize w-1 h-full' : 'cursor-row-resize h-1 w-full'}`}
        style={{
          [direction === 'horizontal' ? 'left' : 'top']: `calc(${split}% - 2px)`,
          [direction === 'horizontal' ? 'width' : 'height']: '4px',
          [direction === 'horizontal' ? 'top' : 'left']: 0,
          [direction === 'horizontal' ? 'height' : 'width']: '100%',
          transform: direction === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)'
        }}
        onMouseDown={() => setIsDragging(true)}
        onKeyDown={handleDividerKeyDown}
        tabIndex={0}
        role="separator"
        aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
        aria-valuemin={10}
        aria-valuemax={90}
        aria-valuenow={Math.round(split)}
        aria-valuetext={`${Math.round(split)}% - ${100 - Math.round(split)}%`}
        aria-controls="left-panel right-panel"
      />
      
      {/* Right/Bottom pane */}
      <div
        className="split-pane-right absolute overflow-auto"
        style={{
          [direction === 'horizontal' ? 'left' : 'top']: `${split}%`,
          [direction === 'horizontal' ? 'right' : 'bottom']: 0,
          [direction === 'horizontal' ? 'height' : 'width']: '100%',
        }}
        aria-label={direction === 'horizontal' ? 'Right panel' : 'Bottom panel'}
      >
        {right}
      </div>
    </div>
  );
};

export default SplitPane;