import React, { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { getIcon } from '../../icons';
import { getColor } from '../../foundations/colors';

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
  /** Element displayed to the left of children or icon name from emoji icon system */
  icon?: ReactNode | string;
  /** Element displayed to the right of children or icon name from emoji icon system */
  rightIcon?: ReactNode | string;
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
 * Button - A versatile interactive component for triggering actions or navigation
 * 
 * @description
 * Buttons allow users to take actions and make choices with a single tap.
 * They communicate actions that users can take and are typically placed
 * in dialogs, forms, cards, and toolbars. Buttons can be customized with
 * various visual styles, sizes, icons, and states to match design requirements.
 * 
 * @accessibility
 * - Uses native button element for proper keyboard navigation and focus management
 * - Includes ARIA attributes when in loading or disabled states
 * - Maintains proper focus states with visible focus rings
 * - Preserves contrast ratios between text and background colors
 * - Disabled state is visually distinct and indicated to screen readers
 * - Loading state provides visual feedback and prevents multiple submissions
 * - Respects reduced motion preferences for animations
 * 
 * @example
 * ```tsx
 * // Basic button
 * <Button>Click me</Button>
 * 
 * // Button with variant and icon
 * <Button variant="success" icon="check">
 *   Confirm
 * </Button>
 * 
 * // Outline variant with right icon
 * <Button 
 *   variant="outline-primary" 
 *   rightIcon="arrow-right"
 * >
 *   Next Step
 * </Button>
 * 
 * // Full width button with loading state
 * <Button 
 *   variant="primary" 
 *   fullWidth
 *   isLoading={isSubmitting}
 *   loadingText="Submitting..."
 *   onClick={handleSubmit}
 * >
 *   Submit Form
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 motion-reduce:transition-none focus:outline-none';
    
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

    // Shadow classes with transition
    const shadowClass = elevated ? 'shadow-md hover:shadow-lg transition-shadow duration-200 motion-reduce:transition-none' : '';
    
    // Generate the appropriate class for the button variant
    const getVariantClasses = (variant: ButtonVariant) => {
      // Base solid variants
      if (variant === 'primary') {
        return 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 active:bg-blue-800 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }
      if (variant === 'secondary') {
        return 'bg-gray-500 hover:bg-gray-600 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 active:bg-gray-700 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }
      if (variant === 'success') {
        return 'bg-green-600 hover:bg-green-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 active:bg-green-800 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }
      if (variant === 'danger') {
        return 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 active:bg-red-800 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }
      if (variant === 'warning') {
        return 'bg-yellow-500 hover:bg-yellow-600 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 active:bg-yellow-700 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }
      if (variant === 'info') {
        return 'bg-cyan-500 hover:bg-cyan-600 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 active:bg-cyan-700 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }
      if (variant === 'light') {
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300 active:bg-gray-300 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }
      if (variant === 'dark') {
        return 'bg-gray-800 hover:bg-gray-900 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-700 active:bg-black active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }
      if (variant === 'ghost') {
        return 'bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 active:bg-gray-200 dark:active:bg-gray-700 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
      }

      // Outline variants
      if (variant.startsWith('outline-')) {
        const color = variant.split('-')[1];
        if (color === 'primary') {
          return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 active:bg-blue-100 dark:border-blue-500 dark:text-blue-400 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'secondary') {
          return 'border-2 border-gray-500 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 active:bg-gray-100 dark:active:bg-gray-700 dark:border-gray-500 dark:text-gray-400 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'success') {
          return 'border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 active:bg-green-100 dark:border-green-500 dark:text-green-400 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'danger') {
          return 'border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 active:bg-red-100 dark:border-red-500 dark:text-red-400 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'warning') {
          return 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 active:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-400 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'info') {
          return 'border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 active:bg-cyan-100 dark:border-cyan-500 dark:text-cyan-400 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'light') {
          return 'border-2 border-gray-200 text-gray-500 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300 active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'dark') {
          return 'border-2 border-gray-800 text-gray-800 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-700 active:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
      }

      // Text variants (no background, no border)
      if (variant.startsWith('text-')) {
        const color = variant.split('-')[1];
        if (color === 'primary') {
          return 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-blue-100 dark:active:bg-blue-900 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'secondary') {
          return 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-500 active:bg-gray-100 dark:active:bg-gray-700 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'success') {
          return 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-green-500 active:bg-green-100 dark:active:bg-green-900 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'danger') {
          return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-red-500 active:bg-red-100 dark:active:bg-red-900 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'warning') {
          return 'text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-yellow-500 active:bg-yellow-100 dark:active:bg-yellow-900 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
        if (color === 'info') {
          return 'text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950 dark:hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-cyan-500 active:bg-cyan-100 dark:active:bg-cyan-900 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
        }
      }

      // Default to primary if variant is not recognized
      return 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 active:scale-[0.98] transition-transform duration-100 motion-reduce:transform-none';
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
        className={`animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite] ${size === 'xs' || size === 'sm' ? '-ml-0.5 mr-2' : '-ml-1 mr-2'} ${getSpinnerSize()}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    // Process icons - convert string icon names to emoji icons
    const processIcon = (iconProp: ReactNode | string | undefined): ReactNode => {
      if (typeof iconProp === 'string') {
        return <span className="inline-flex">{getIcon(iconProp as any)}</span>;
      }
      return iconProp;
    };

    const processedIcon = processIcon(icon);
    const processedRightIcon = processIcon(rightIcon);

    return (
      <button 
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? "true" : undefined}
        {...rest}
      >
        {isLoading ? (
          <>
            {spinner}
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {(processedIcon && iconPosition === 'left') && (
              <span className="inline-flex transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none">
                {processedIcon}
              </span>
            )}
            {children}
            {(processedRightIcon || (processedIcon && iconPosition === 'right')) && (
              <span className="inline-flex transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none">
                {processedRightIcon || (iconPosition === 'right' ? processedIcon : null)}
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