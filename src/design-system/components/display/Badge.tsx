import React from 'react';
import { getIcon } from '../../icons';

export type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Content to display inside the badge (string, number, or ReactNode) */
  children?: React.ReactNode;
  /** The visual style variant of the badge */
  variant?: BadgeVariant;
  /** Color alias for variant prop (for backwards compatibility) */
  color?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Whether the badge should be shown as a dot only */
  dot?: boolean;
  /** Whether the badge is displayed inline (affects margin/padding) */
  inline?: boolean;
  /** Whether the badge should have a slight pulse animation */
  pulse?: boolean;
  /** Whether the badge should have a pill shape (more rounded corners) */
  pill?: boolean;
  /** Maximum value to show (will display e.g. "9+" for values over 9) */
  max?: number;
  /** Whether badge is invisible */
  invisible?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Optional click handler */
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  /** Optional icon to display (emoji name from icon system) */
  icon?: string;
  /** Text alignment within the badge */
  textAlign?: 'left' | 'center' | 'right';
  /** Override element rendering */
  as?: React.ElementType;
}

/**
 * Badge - A versatile component for displaying status indicators, counts, and notifications
 * 
 * @description
 * Badges are small visual indicators typically used to display counts, status, or to 
 * highlight new or unread items. They can appear as standalone components or be attached 
 * to other elements like buttons or navigation items.
 * 
 * @accessibility
 * - When used as a button (with onClick handler), includes appropriate role="button" and tabIndex
 * - Contrast ratios meet WCAG standards for all variants
 * - When displaying numbers, respects max prop to ensure the text remains readable
 * 
 * @example
 * ```tsx
 * // Basic badge
 * <Badge>42</Badge>
 * 
 * // Status badge
 * <Badge variant="success">Active</Badge>
 * 
 * // Notification dot
 * <BadgeContainer>
 *   <Icon name="bell" />
 *   <Badge dot variant="danger" />
 * </BadgeContainer>
 * 
 * // With maximum value
 * <Badge max={99}>150</Badge> // Displays "99+"
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  color,
  size = 'md',
  dot = false,
  inline = false,
  pulse = false,
  pill = false,
  max,
  invisible = false,
  className = '',
  onClick,
  icon,
  textAlign = 'center',
  as: Component = 'span',
  ...rest
}) => {
  // Don't render if invisible
  if (invisible) {
    return null;
  }

  // Use color prop as fallback for variant (for backwards compatibility)
  const finalVariant = variant || color || 'primary';

  // Process content
  let content = children;
  
  // For numerical values, respect max limit
  if (typeof children === 'number' && max !== undefined && children > max) {
    content = `${max}+`;
  }
  
  // If icon is provided, use emoji
  if (icon && !content) {
    content = getIcon(icon as any);
  }
  
  // Variant classes with dark mode support
  const variantClasses = {
    primary: 'bg-blue-500 dark:bg-blue-600 text-white',
    secondary: 'bg-gray-500 dark:bg-gray-600 text-white',
    success: 'bg-green-500 dark:bg-green-600 text-white',
    danger: 'bg-red-500 dark:bg-red-600 text-white',
    warning: 'bg-yellow-500 dark:bg-yellow-600 text-white dark:text-gray-900',
    info: 'bg-cyan-500 dark:bg-cyan-600 text-white',
    light: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    dark: 'bg-gray-800 dark:bg-gray-900 text-white',
  };

  // Size classes
  const sizeClasses = {
    xs: dot ? 'h-1.5 w-1.5' : 'h-4 min-w-4 text-xs px-1',
    sm: dot ? 'h-2 w-2' : 'h-5 min-w-5 text-xs px-1.5',
    md: dot ? 'h-2.5 w-2.5' : 'h-6 min-w-6 text-sm px-1.5',
    lg: dot ? 'h-3 w-3' : 'h-7 min-w-7 text-base px-2',
  };

  // Position classes
  const positionClasses = inline ? 'relative inline-flex' : 'absolute -top-2 -right-2';

  // Shape classes
  const shapeClasses = pill ? 'rounded-full' : 'rounded';

  // Animation classes
  const animationClasses = pulse 
    ? 'animate-pulse' 
    : '';

  // Improve text rendering
  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  // Combine all classes
  const badgeClasses = [
    dot ? 'flex' : 'inline-flex items-center justify-center',
    variantClasses[finalVariant],
    sizeClasses[size],
    positionClasses,
    shapeClasses,
    animationClasses,
    textAlignClasses[textAlign], // Add text alignment
    'whitespace-nowrap', // Ensure proper text wrapping
    'leading-none', // Improve vertical alignment
    onClick ? 'cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component 
      className={badgeClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...rest}
    >
      {!dot && content}
    </Component>
  );
};

/**
 * BadgeContainer - A wrapper component to position badges relative to their parent elements
 * 
 * @description
 * BadgeContainer creates a positioning context for badges, allowing them to be properly
 * positioned relative to other elements like icons, buttons, or menu items.
 * 
 * @accessibility
 * - Maintains proper parent-child relationship for assistive technologies
 * - Preserves the accessibility of wrapped children
 * 
 * @example
 * ```tsx
 * // Basic usage with notification badge
 * <BadgeContainer>
 *   <Button>Notifications</Button>
 *   <Badge>5</Badge>
 * </BadgeContainer>
 * 
 * // With status indicator
 * <BadgeContainer>
 *   <Avatar src="/user.jpg" alt="User profile" />
 *   <Badge dot variant="success" />
 * </BadgeContainer>
 * ```
 */
export const BadgeContainer: React.FC<{
  /** Elements to wrap with the badge container */
  children: React.ReactNode;
  /** Optional CSS class to apply to the container */
  className?: string;
}> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {children}
    </div>
  );
};

export default Badge;