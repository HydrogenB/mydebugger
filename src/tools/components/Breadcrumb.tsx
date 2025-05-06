import React, { ReactNode } from 'react';

export interface BreadcrumbItemProps {
  /** Content of the breadcrumb item */
  children: ReactNode;
  /** URL for the breadcrumb item */
  href?: string;
  /** Whether this is the current/active page */
  isCurrent?: boolean;
  /** Optional icon to display before text */
  icon?: ReactNode;
  /** Optional custom CSS class */
  className?: string;
  /** Click handler for the breadcrumb item */
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  children: ReactNode;
  /** Separator between items */
  separator?: ReactNode;
  /** Maximum number of items to show before collapsing */
  maxItems?: number;
  /** Optional custom CSS class */
  className?: string;
  /** Optional custom CSS class for the separator */
  separatorClassName?: string;
}

/**
 * Individual breadcrumb item
 */
export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  children,
  href,
  isCurrent = false,
  icon,
  className = '',
  onClick,
}) => {
  // Classes for the breadcrumb item
  const itemClasses = [
    'flex items-center',
    isCurrent 
      ? 'text-gray-800 dark:text-gray-200 font-medium' 
      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
    className,
  ].filter(Boolean).join(' ');
  
  // Render the breadcrumb item content
  const content = (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      <span className={isCurrent ? "font-medium" : ""}>{children}</span>
    </>
  );
  
  if (isCurrent) {
    return (
      <li className={itemClasses} aria-current="page">
        {content}
      </li>
    );
  }
  
  if (href) {
    return (
      <li className={itemClasses}>
        <a 
          href={href} 
          className="hover:underline focus:outline-none focus:underline"
          onClick={onClick ? (e) => {
            e.preventDefault();
            onClick();
          } : undefined}
        >
          {content}
        </a>
      </li>
    );
  }
  
  return (
    <li className={itemClasses}>
      <button 
        className="hover:underline focus:outline-none focus:underline bg-transparent border-none p-0 cursor-pointer" 
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    </li>
  );
};

/**
 * Breadcrumb - A navigation aid that helps users track their location
 * within the application's hierarchy
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  children,
  separator = '/',
  maxItems,
  className = '',
  separatorClassName = '',
}) => {
  const items = React.Children.toArray(children);
  const totalItems = items.length;
  let displayItems = items;
  
  // Handle max items and add ellipsis when needed
  if (maxItems && totalItems > maxItems) {
    // Show first item, ellipsis, and last (maxItems - 1) items
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));
    
    displayItems = [
      firstItem,
      // Ellipsis item
      <li 
        key="ellipsis" 
        className="flex items-center text-gray-500 dark:text-gray-400"
        aria-hidden="true"
      >
        ...
      </li>,
      ...lastItems
    ];
  }
  
  // Separator element
  const separatorElement = (
    <li 
      className={`mx-2 text-gray-400 dark:text-gray-600 select-none ${separatorClassName}`}
      aria-hidden="true"
    >
      {separator}
    </li>
  );
  
  // Build the final breadcrumbs with separators
  const breadcrumbItems = displayItems.reduce((result: ReactNode[], item, index) => {
    if (index !== 0) {
      result.push(React.cloneElement(separatorElement, { key: `separator-${index}` }));
    }
    result.push(React.cloneElement(item as React.ReactElement, { key: `item-${index}` }));
    return result;
  }, []);
  
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center text-sm sm:text-base">
        {breadcrumbItems}
      </ol>
    </nav>
  );
};

export default { Breadcrumb, BreadcrumbItem };