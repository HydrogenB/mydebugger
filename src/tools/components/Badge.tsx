import React from 'react';

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
  /** Content to display inside the badge */
  children?: React.ReactNode;
  /** The visual style variant of the badge */
  variant?: BadgeVariant;
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
}

/**
 * Badge component for displaying counts and status indicators
 * Supports different variants, sizes, and display modes
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  inline = false,
  pulse = false,
  pill = false,
  max,
  invisible = false,
  className = '',
  onClick,
  ...rest
}) => {
  // Don't render if invisible
  if (invisible) {
    return null;
  }

  // For numerical values, respect max limit
  const content = typeof children === 'number' && max !== undefined && children > max 
    ? `${max}+` 
    : children;
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-cyan-500 text-white',
    light: 'bg-gray-200 text-gray-800',
    dark: 'bg-gray-800 text-white',
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

  // Combine all classes
  const badgeClasses = [
    dot ? 'flex' : 'inline-flex items-center justify-center',
    variantClasses[variant],
    sizeClasses[size],
    positionClasses,
    shapeClasses,
    animationClasses,
    onClick ? 'cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span 
      className={badgeClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...rest}
    >
      {!dot && content}
    </span>
  );
};

/**
 * Badge container component to position badges relative to their containers
 */
export const BadgeContainer: React.FC<{
  children: React.ReactNode;
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