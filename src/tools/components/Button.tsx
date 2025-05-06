import React, { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark'
  | 'ghost'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info'
  | 'outline-light'
  | 'outline-dark'
  | 'text-primary'
  | 'text-secondary'
  | 'text-success' 
  | 'text-danger'
  | 'text-warning'
  | 'text-info';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The content of the button */
  children: ReactNode;
  /** The visual style variant of the button */
  variant?: ButtonVariant;
  /** The size of the button */
  size?: ButtonSize;
  /** Border radius of the button */
  radius?: ButtonRadius;
  /** Whether the button should take the full width of its container */
  fullWidth?: boolean;
  /** Element displayed to the left of children */
  icon?: ReactNode;
  /** Element displayed to the right of children */
  rightIcon?: ReactNode;
  /** Position of the icon when only one icon is provided */
  iconPosition?: 'left' | 'right';
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Text to display when button is loading */
  loadingText?: string;
  /** Whether the button is elevated with a shadow */
  elevated?: boolean;
  /** Whether the button is active (pressed/selected) */
  active?: boolean;
}

/**
 * A versatile Button component with multiple variants, states, and accessibility features
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    radius = 'md',
    fullWidth = false,
    icon,
    rightIcon,
    iconPosition = 'left',
    isLoading = false,
    loadingText = 'Loading...',
    elevated = false,
    active = false,
    className = '',
    disabled,
    type = 'button',
    ...rest
  }, ref) => {
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center font-medium transition focus:outline-none';
    
    // Border radius classes
    const radiusClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };
    
    // Size classes
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs gap-1.5',
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-5 py-2.5 text-lg gap-2',
      xl: 'px-6 py-3 text-xl gap-3',
    };

    // Shadow classes
    const shadowClass = elevated ? 'shadow-md hover:shadow-lg' : '';
    
    // Generate the appropriate class for the button variant
    const getVariantClasses = (variant: ButtonVariant) => {
      // Base solid variants
      if (variant === 'primary') {
        return 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 active:bg-blue-800';
      }
      if (variant === 'secondary') {
        return 'bg-gray-500 hover:bg-gray-600 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 active:bg-gray-700';
      }
      if (variant === 'success') {
        return 'bg-green-600 hover:bg-green-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 active:bg-green-800';
      }
      if (variant === 'danger') {
        return 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 active:bg-red-800';
      }
      if (variant === 'warning') {
        return 'bg-yellow-500 hover:bg-yellow-600 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 active:bg-yellow-700';
      }
      if (variant === 'info') {
        return 'bg-cyan-500 hover:bg-cyan-600 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 active:bg-cyan-700';
      }
      if (variant === 'light') {
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300 active:bg-gray-300';
      }
      if (variant === 'dark') {
        return 'bg-gray-800 hover:bg-gray-900 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-700 active:bg-black';
      }
      if (variant === 'ghost') {
        return 'bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 active:bg-gray-200 dark:active:bg-gray-700';
      }

      // Outline variants
      if (variant.startsWith('outline-')) {
        const color = variant.split('-')[1];
        if (color === 'primary') {
          return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 active:bg-blue-100 dark:border-blue-500 dark:text-blue-400';
        }
        if (color === 'secondary') {
          return 'border-2 border-gray-500 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 active:bg-gray-100 dark:active:bg-gray-700 dark:border-gray-500 dark:text-gray-400';
        }
        if (color === 'success') {
          return 'border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 active:bg-green-100 dark:border-green-500 dark:text-green-400';
        }
        if (color === 'danger') {
          return 'border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 active:bg-red-100 dark:border-red-500 dark:text-red-400';
        }
        if (color === 'warning') {
          return 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 active:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-400';
        }
        if (color === 'info') {
          return 'border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 active:bg-cyan-100 dark:border-cyan-500 dark:text-cyan-400';
        }
        if (color === 'light') {
          return 'border-2 border-gray-200 text-gray-500 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300 active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800';
        }
        if (color === 'dark') {
          return 'border-2 border-gray-800 text-gray-800 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-700 active:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800';
        }
      }

      // Text variants (no background, no border)
      if (variant.startsWith('text-')) {
        const color = variant.split('-')[1];
        if (color === 'primary') {
          return 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-blue-100 dark:active:bg-blue-900';
        }
        if (color === 'secondary') {
          return 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-500 active:bg-gray-100 dark:active:bg-gray-700';
        }
        if (color === 'success') {
          return 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-green-500 active:bg-green-100 dark:active:bg-green-900';
        }
        if (color === 'danger') {
          return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-red-500 active:bg-red-100 dark:active:bg-red-900';
        }
        if (color === 'warning') {
          return 'text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-yellow-500 active:bg-yellow-100 dark:active:bg-yellow-900';
        }
        if (color === 'info') {
          return 'text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-cyan-500 active:bg-cyan-100 dark:active:bg-cyan-900';
        }
      }

      // Default to primary if variant is not recognized
      return 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500';
    };
    
    // Active state
    const activeClass = active ? 'ring-2 ring-offset-2 ring-opacity-50' : '';
    
    // Width class
    const widthClass = fullWidth ? 'w-full' : '';
    
    // Disabled class
    const disabledClass = (disabled || isLoading) 
      ? 'opacity-60 cursor-not-allowed pointer-events-none' 
      : '';
    
    // Combine all classes
    const buttonClasses = [
      baseClasses,
      radiusClasses[radius],
      sizeClasses[size],
      getVariantClasses(variant),
      widthClass,
      shadowClass,
      activeClass,
      disabledClass,
      className
    ].join(' ');

    // Loading spinner with appropriate size
    const getSpinnerSize = () => {
      if (size === 'xs' || size === 'sm') return 'h-3.5 w-3.5';
      if (size === 'md') return 'h-4 w-4';
      if (size === 'lg') return 'h-5 w-5';
      if (size === 'xl') return 'h-6 w-6';
      return 'h-4 w-4';
    };
    
    const spinner = (
      <svg 
        className={`animate-spin ${size === 'xs' || size === 'sm' ? '-ml-0.5 mr-2' : '-ml-1 mr-2'} ${getSpinnerSize()}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    return (
      <button 
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? (
          <>
            {spinner}
            {loadingText}
          </>
        ) : (
          <>
            {(icon && iconPosition === 'left') && <span className="inline-flex">{icon}</span>}
            {children}
            {(rightIcon || (icon && iconPosition === 'right')) && (
              <span className="inline-flex">
                {rightIcon || (iconPosition === 'right' ? icon : null)}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;