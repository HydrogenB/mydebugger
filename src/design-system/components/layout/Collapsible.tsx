import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { getIcon } from '../../icons';

export interface CollapsibleProps {
  /** The collapsible section title or header content */
  title: ReactNode;
  /** The content to be shown/hidden */
  children: ReactNode;
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
  /** Whether to animate the transition */
  animated?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Icon displayed when collapsed */
  expandIcon?: ReactNode;
  /** Icon displayed when expanded */
  collapseIcon?: ReactNode;
  /** Custom CSS class for the container */
  className?: string;
  /** Custom CSS class for the header */
  headerClassName?: string;
  /** Custom CSS class for the content section */
  contentClassName?: string;
  /** Whether this is a controlled component */
  expanded?: boolean;
  /** Function called when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** The HTML element to render the component as */
  as?: 'div' | 'section';
  /** Whether the content auto-collapses on mobile devices */
  collapseOnMobile?: boolean;
  /** Id attribute for the component */
  id?: string;
}

/**
 * Collapsible - A component that toggles visibility of content with smooth animations.
 * Useful for FAQ sections, accordion navigation, and responsive layouts.
 */
export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  children,
  defaultExpanded = false,
  animated = true,
  disabled = false,
  expandIcon,
  collapseIcon,
  className = '',
  headerClassName = '',
  contentClassName = '',
  expanded: controlledExpanded,
  onExpandedChange,
  as: Component = 'div',
  collapseOnMobile = false,
  id,
}) => {
  // State for uncontrolled component
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Determine if component is controlled
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : isExpanded;
  
  // For animation and accessibility
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(
    defaultExpanded ? undefined : 0
  );
  
  // Handle mobile auto-collapse
  useEffect(() => {
    if (!collapseOnMobile) return;
    
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && expanded && !isControlled) {
        setIsExpanded(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [collapseOnMobile, expanded, isControlled]);
  
  // Update height for animation when expanded state changes
  useEffect(() => {
    if (!animated) return;
    
    if (expanded) {
      const contentHeight = contentRef.current?.scrollHeight;
      setHeight(contentHeight);
      
      // Reset height to auto after animation completes
      const timer = setTimeout(() => {
        setHeight(undefined);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      // Set to current height before collapsing
      const contentHeight = contentRef.current?.scrollHeight;
      setHeight(contentHeight);
      
      // Set to 0 on next frame to trigger animation
      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [expanded, animated]);
  
  // Toggle expanded state
  const toggleExpanded = () => {
    if (disabled) return;
    
    const newExpandedState = !expanded;
    
    if (!isControlled) {
      setIsExpanded(newExpandedState);
    }
    
    if (onExpandedChange) {
      onExpandedChange(newExpandedState);
    }
  };
  
  // Icons for expand/collapse
  const defaultExpandIcon = <span className="text-gray-500 dark:text-gray-400">{getIcon('arrow-down')}</span>;
  const defaultCollapseIcon = <span className="text-gray-500 dark:text-gray-400">{getIcon('arrow-up')}</span>;
  const currentIcon = expanded 
    ? (collapseIcon || defaultCollapseIcon)
    : (expandIcon || defaultExpandIcon);
  
  // Animation styles
  const animationStyle = animated && (expanded || height !== undefined)
    ? {
        height: height === undefined ? 'auto' : `${height}px`,
        overflow: 'hidden',
        transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }
    : expanded
      ? {} // No animation, but expanded
      : { display: 'none' }; // No animation and collapsed
  
  // Component classes
  const containerClasses = [
    'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
    disabled ? 'opacity-60 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');
  
  const headerClasses = [
    'flex justify-between items-center p-4 cursor-pointer select-none',
    !disabled && 'hover:bg-gray-50 dark:hover:bg-gray-800',
    headerClassName
  ].filter(Boolean).join(' ');
  
  const contentClasses = [
    'px-4 pb-4',
    contentClassName
  ].filter(Boolean).join(' ');

  // Section ID for accessibility
  const headerId = `${id || 'collapsible'}-header`;
  const contentId = `${id || 'collapsible'}-content`;
  
  return (
    <Component className={containerClasses} id={id}>
      <div
        role="button"
        className={headerClasses}
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-disabled={disabled}
        aria-controls={contentId}
        id={headerId}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </div>
        <div className="ml-4 flex-shrink-0 transition-transform duration-300 transform">
          {currentIcon}
        </div>
      </div>
      
      <div 
        ref={contentRef}
        style={animationStyle}
        aria-labelledby={headerId}
        id={contentId}
        role="region"
        className={contentClasses}
      >
        {children}
      </div>
    </Component>
  );
};

export default Collapsible;