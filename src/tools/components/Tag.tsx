import React, { ReactNode } from 'react';

export type TagVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark';

export type TagSize = 'xs' | 'sm' | 'md' | 'lg';

export interface TagProps {
  /** Tag content */
  children: ReactNode;
  /** Visual style variant */
  variant?: TagVariant;
  /** Size of the tag */
  size?: TagSize;
  /** Whether to show an outline style */
  outlined?: boolean;
  /** Optional icon to display at the start of the tag */
  icon?: ReactNode;
  /** Whether the tag is removable */
  removable?: boolean;
  /** Function called when the remove button is clicked */
  onRemove?: () => void;
  /** Whether the tag is clickable */
  clickable?: boolean;
  /** Function called when the tag is clicked */
  onClick?: () => void;
  /** Optional custom CSS class */
  className?: string;
  /** Whether to truncate long text */
  truncate?: boolean;
  /** Maximum width of the tag */
  maxWidth?: string;
}

/**
 * Tag/Chip component for compact representation of attributes, filters,
 * categories, or small bits of information
 */
const Tag: React.FC<TagProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  outlined = false,
  icon,
  removable = false,
  onRemove,
  clickable = false,
  onClick,
  className = '',
  truncate = false,
  maxWidth,
}) => {
  // Color classes for different variants
  const getColorClasses = (variant: TagVariant, outlined: boolean) => {
    if (outlined) {
      switch (variant) {
        case 'primary':
          return 'bg-transparent border border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400';
        case 'secondary':
          return 'bg-transparent border border-gray-500 text-gray-600 dark:border-gray-400 dark:text-gray-400';
        case 'success':
          return 'bg-transparent border border-green-500 text-green-600 dark:border-green-400 dark:text-green-400';
        case 'danger':
          return 'bg-transparent border border-red-500 text-red-600 dark:border-red-400 dark:text-red-400';
        case 'warning':
          return 'bg-transparent border border-yellow-500 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400';
        case 'info':
          return 'bg-transparent border border-cyan-500 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400';
        case 'light':
          return 'bg-transparent border border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400';
        case 'dark':
          return 'bg-transparent border border-gray-700 text-gray-700 dark:border-gray-500 dark:text-gray-300';
        default:
          return 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300';
      }
    } else {
      switch (variant) {
        case 'primary':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'secondary':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800/70 dark:text-gray-300';
        case 'success':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'danger':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'warning':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'info':
          return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
        case 'light':
          return 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300';
        case 'dark':
          return 'bg-gray-700 text-gray-100 dark:bg-gray-800 dark:text-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      }
    }
  };

  // Size classes
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Close button size classes
  const closeButtonSizeClasses = {
    xs: 'w-3 h-3 ml-1',
    sm: 'w-3.5 h-3.5 ml-1.5',
    md: 'w-4 h-4 ml-2',
    lg: 'w-5 h-5 ml-2',
  };

  // Handle tag click
  const handleTagClick = (e: React.MouseEvent) => {
    if (clickable && onClick) {
      onClick();
      e.stopPropagation();
    }
  };

  // Handle remove click
  const handleRemoveClick = (e: React.MouseEvent) => {
    if (onRemove) {
      onRemove();
      e.stopPropagation();
    }
  };

  // Tag classes
  const tagClasses = [
    // Base styling
    'inline-flex items-center rounded-full font-medium',
    
    // Colors
    getColorClasses(variant, outlined),
    
    // Size
    sizeClasses[size],
    
    // Clickable
    clickable && onClick ? 'cursor-pointer hover:opacity-80' : '',
    
    // Custom class
    className,
  ].filter(Boolean).join(' ');

  // Container style for max width
  const style = maxWidth ? { maxWidth } : {};
  
  return (
    <span 
      className={tagClasses} 
      onClick={handleTagClick}
      style={style}
    >
      {/* Icon if provided */}
      {icon && <span className="mr-1.5">{icon}</span>}
      
      {/* Content */}
      <span className={truncate ? 'truncate' : ''}>{children}</span>
      
      {/* Remove button */}
      {removable && (
        <button
          type="button"
          className={`
            ${closeButtonSizeClasses[size]} 
            inline-flex items-center justify-center
            rounded-full hover:bg-black/10 dark:hover:bg-white/10
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
          `}
          onClick={handleRemoveClick}
          aria-label="Remove tag"
        >
          <svg 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-full h-full"
          >
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      )}
    </span>
  );
};

/**
 * TagGroup component for displaying a group of related tags
 */
export interface TagGroupProps {
  /** Tags to display */
  children: ReactNode;
  /** Spacing between tags */
  spacing?: 'tight' | 'normal' | 'loose';
  /** Optional custom CSS class */
  className?: string;
  /** Whether tags should wrap to multiple lines */
  wrap?: boolean;
}

export const TagGroup: React.FC<TagGroupProps> = ({
  children,
  spacing = 'normal',
  className = '',
  wrap = true,
}) => {
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-3',
  };

  const wrapClass = wrap ? 'flex-wrap' : 'overflow-x-auto';

  return (
    <div className={`flex ${wrapClass} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export default { Tag, TagGroup };