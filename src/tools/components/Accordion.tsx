import React, { ReactNode, useState, createContext, useContext } from 'react';

// Context for accordion state management
interface AccordionContextType {
  expandedIndexes: Set<number>;
  toggleItem: (index: number) => void;
  disabled: boolean;
}

const AccordionContext = createContext<AccordionContextType>({
  expandedIndexes: new Set(),
  toggleItem: () => {},
  disabled: false,
});

// Hook for consuming accordion context
const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
};

export interface AccordionProps {
  /** Content of the accordion */
  children: ReactNode;
  /** Whether multiple panels can be open at once */
  allowMultiple?: boolean;
  /** Default index(es) of open panel(s) */
  defaultIndex?: number | number[];
  /** CSS class for the accordion container */
  className?: string;
  /** Whether the accordion should display with a border */
  bordered?: boolean;
  /** Whether the accordion is disabled */
  disabled?: boolean;
  /** Whether to show a divider between items */
  divider?: boolean;
}

export interface AccordionItemProps {
  /** Content of the accordion item */
  children: ReactNode;
  /** Title/header of the accordion item */
  title: ReactNode;
  /** Whether this specific item is disabled */
  disabled?: boolean;
  /** CSS class for the accordion item */
  className?: string;
  /** Optional icon to display on the right side of the header */
  icon?: ReactNode;
  /** Whether the item is initially expanded (only works when not controlled by Accordion) */
  defaultExpanded?: boolean;
  /** Whether the item is expanded (controlled mode) */
  expanded?: boolean;
  /** Function called when expanded state changes (controlled mode) */
  onChange?: (expanded: boolean) => void;
}

/**
 * A collapsible accordion component for organizing content into
 * sections that can be expanded or collapsed
 */
export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  defaultIndex = [],
  className = '',
  bordered = false,
  disabled = false,
  divider = true,
}) => {
  // Convert defaultIndex to a consistent format
  const getDefaultIndexes = (): number[] => {
    if (typeof defaultIndex === 'number') {
      return [defaultIndex];
    }
    return defaultIndex || [];
  };

  // State to track which panels are expanded
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(
    () => new Set(getDefaultIndexes())
  );

  // Toggle panel open/close state
  const toggleItem = (index: number) => {
    if (disabled) return;

    setExpandedIndexes(prevState => {
      const newState = new Set(allowMultiple ? prevState : []);
      
      if (newState.has(index)) {
        newState.delete(index);
      } else {
        newState.add(index);
      }
      
      return newState;
    });
  };
  
  // Context value
  const contextValue: AccordionContextType = {
    expandedIndexes,
    toggleItem,
    disabled,
  };

  // Container classes
  const containerClasses = [
    'w-full',
    bordered ? 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden' : '',
    className,
  ].filter(Boolean).join(' ');

  // Filter and clone children to only include AccordionItems
  const accordionItems = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child) || child.type !== AccordionItem) {
      return null;
    }

    // Add border top to all but the first item if divider is true
    const itemClassName = [
      child.props.className || '',
      divider && index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : '',
    ].filter(Boolean).join(' ');

    return React.cloneElement(child, {
      index,
      className: itemClassName,
    });
  });

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={containerClasses}>
        {accordionItems}
      </div>
    </AccordionContext.Provider>
  );
};

/**
 * Individual accordion item/panel
 */
export const AccordionItem: React.FC<AccordionItemProps & { index?: number }> = ({
  children,
  title,
  disabled = false,
  className = '',
  icon,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onChange,
  index,
}) => {
  // For standalone use outside of Accordion
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  // Get context from parent Accordion if available
  const context = useAccordionContext();
  
  // Determine if item is controlled by parent Accordion or self-controlled
  const isControlledByParent = typeof index === 'number';
  const isControlledExternally = controlledExpanded !== undefined;
  
  // Determine if the item is expanded
  const isExpanded = isControlledExternally
    ? controlledExpanded
    : isControlledByParent
    ? context.expandedIndexes.has(index)
    : internalExpanded;
  
  // Is this item disabled
  const isDisabled = disabled || (isControlledByParent && context.disabled);
  
  // Handle click on the header
  const handleToggle = () => {
    if (isDisabled) return;
    
    if (isControlledExternally) {
      // External controlled mode
      onChange?.(!controlledExpanded);
    } else if (isControlledByParent) {
      // Controlled by parent Accordion
      context.toggleItem(index as number);
    } else {
      // Self-controlled
      setInternalExpanded(!internalExpanded);
    }
  };
  
  // Container classes
  const containerClasses = [
    'w-full',
    className,
  ].filter(Boolean).join(' ');
  
  // Header classes
  const headerClasses = [
    'flex justify-between items-center w-full px-4 py-3',
    'text-left text-gray-800 dark:text-gray-200',
    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
  ].join(' ');
  
  // Content wrapper classes with animation
  const contentClasses = [
    'transition-all duration-200 overflow-hidden',
    isExpanded ? 'max-h-96' : 'max-h-0',
  ].join(' ');
  
  // Render default toggle icon if no custom icon is provided
  const toggleIcon = icon || (
    <svg
      className={`w-5 h-5 transition-transform duration-200 text-gray-500 dark:text-gray-400 ${isExpanded ? 'transform rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
  
  return (
    <div className={containerClasses}>
      <h3>
        <button
          className={headerClasses}
          onClick={handleToggle}
          disabled={isDisabled}
          aria-expanded={isExpanded}
          type="button"
        >
          <span className="font-medium">{title}</span>
          {toggleIcon}
        </button>
      </h3>
      
      <div className={contentClasses}>
        <div className="px-4 py-3">
          {children}
        </div>
      </div>
    </div>
  );
};

// Fix the default export to export the Accordion component directly
export default Accordion;