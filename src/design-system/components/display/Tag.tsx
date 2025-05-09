import React from 'react';

export interface TagProps {
  /** Tag content */
  children: React.ReactNode;
  /** Tag color scheme */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Size of the tag */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Whether tag is removable */
  removable?: boolean;
  /** Handler for remove action */
  onRemove?: () => void;
  /** Custom CSS class */
  className?: string;
}

/**
 * Tag - A component for categories, attributes, and filtering UI
 */
export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    primary: 'bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800/50',
    success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50',
    danger: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50',
    info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50'
  };
  
  const sizeClasses = {
    xs: 'text-xs py-0.5 px-1.5',
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-2.5',
    lg: 'text-base py-1.5 px-3'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-md border ${variantClasses[variant]} ${sizeClasses[size]} font-medium ${className}`}
    >
      {children}
      
      {removable && (
        <button
          type="button"
          className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-200 hover:text-gray-500 focus:bg-gray-500 focus:text-white focus:outline-none dark:hover:bg-gray-700"
          onClick={onRemove}
          aria-label="Remove tag"
        >
          <svg className="h-2.5 w-2.5" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;
