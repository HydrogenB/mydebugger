import React, { ReactNode, forwardRef } from 'react';
import Button, { ButtonProps, ButtonRadius, ButtonSize, ButtonVariant } from './Button';

export interface ButtonGroupProps {
  /** The button components to be grouped */
  children: ReactNode;
  /** Whether the buttons should be attached without space between them */
  attached?: boolean; 
  /** Whether the buttons should take the full width of the container */
  fullWidth?: boolean;
  /** The visual style variant to apply to all buttons that don't specify their own variant */
  variant?: ButtonVariant;
  /** The size to apply to all buttons that don't specify their own size */
  size?: ButtonSize;
  /** The border radius to apply to the button group */
  radius?: ButtonRadius;
  /** Direction of the button group */
  orientation?: 'horizontal' | 'vertical';
  /** Custom CSS class for the container */
  className?: string;
}

/**
 * ButtonGroup component for displaying a row or column of related buttons
 * with consistent styling and spacing
 */
const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({
    children,
    attached = false,
    fullWidth = false,
    variant = 'primary',
    size = 'md',
    radius = 'md',
    orientation = 'horizontal',
    className = '',
  }, ref) => {
    // Base classes
    const baseClasses = 'inline-flex';
    
    // Orientation classes
    const orientationClass = orientation === 'horizontal' ? 'flex-row' : 'flex-col';
    
    // Width class
    const widthClass = fullWidth ? 'w-full' : '';
    
    // Spacing class (when not attached)
    const spacingClass = !attached 
      ? orientation === 'horizontal' 
        ? 'space-x-2' 
        : 'space-y-2'
      : '';
    
    // Custom styling for attached buttons
    const attachedClass = attached ? 'overflow-hidden' : '';
    
    // Combine all classes
    const groupClasses = [
      baseClasses,
      orientationClass,
      widthClass,
      spacingClass,
      attachedClass,
      className
    ].join(' ');

    // Helper function to clone children with proper styling for attached buttons
    const renderChildren = () => {
      return React.Children.map(children, (child, index) => {
        // Skip non-Button components
        if (!React.isValidElement(child)) {
          return child;
        }
        
        // Determine if this is a Button component
        const isButtonComponent = 
          child.type === Button ||
          (typeof child.type === 'object' && 
           child.type !== null &&
           child.type !== undefined &&
           'displayName' in child.type &&
           typeof child.type.displayName === 'string' &&
           child.type.displayName === 'Button');
        
        if (!isButtonComponent) {
          return child;
        }
        
        // Apply special border radius styling for attached buttons
        let radiusOverride: ButtonRadius = radius;
        
        if (attached) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          if (orientation === 'horizontal') {
            if (isFirst && !isLast) {
              radiusOverride = 'none';
              return React.cloneElement(child as React.ReactElement<ButtonProps>, {
                radius: 'none',
                className: `${(child as React.ReactElement).props.className || ''} rounded-r-none border-r-0`,
                size: child.props.size || size,
                variant: child.props.variant || variant,
              });
            } else if (!isFirst && isLast) {
              return React.cloneElement(child as React.ReactElement<ButtonProps>, {
                radius: 'none',
                className: `${(child as React.ReactElement).props.className || ''} rounded-l-none`,
                size: child.props.size || size,
                variant: child.props.variant || variant,
              });
            } else if (!isFirst && !isLast) {
              return React.cloneElement(child as React.ReactElement<ButtonProps>, {
                radius: 'none',
                className: `${(child as React.ReactElement).props.className || ''} rounded-none border-r-0`,
                size: child.props.size || size,
                variant: child.props.variant || variant,
              });
            }
          } else { // vertical
            if (isFirst && !isLast) {
              return React.cloneElement(child as React.ReactElement<ButtonProps>, {
                radius: 'none',
                className: `${(child as React.ReactElement).props.className || ''} rounded-b-none border-b-0`,
                size: child.props.size || size,
                variant: child.props.variant || variant,
              });
            } else if (!isFirst && isLast) {
              return React.cloneElement(child as React.ReactElement<ButtonProps>, {
                radius: 'none',
                className: `${(child as React.ReactElement).props.className || ''} rounded-t-none`,
                size: child.props.size || size,
                variant: child.props.variant || variant,
              });
            } else if (!isFirst && !isLast) {
              return React.cloneElement(child as React.ReactElement<ButtonProps>, {
                radius: 'none',
                className: `${(child as React.ReactElement).props.className || ''} rounded-none border-b-0`,
                size: child.props.size || size,
                variant: child.props.variant || variant,
              });
            }
          }
        }
        
        // For non-attached buttons or the first button in attached mode
        return React.cloneElement(child as React.ReactElement<ButtonProps>, {
          size: child.props.size || size,
          variant: child.props.variant || variant,
          radius: child.props.radius || radiusOverride,
          ...(fullWidth && orientation === 'horizontal' ? { fullWidth: true } : {}),
        });
      });
    };

    return (
      <div ref={ref} className={groupClasses} role="group">
        {renderChildren()}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;