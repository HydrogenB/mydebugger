import React, { useId } from 'react';

export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info';

export interface SwitchProps {
  /** Whether the switch is checked */
  checked: boolean;
  /** Function called when the switch is toggled */
  onChange: (checked: boolean) => void;
  /** Optional label text */
  label?: string;
  /** Size of the switch */
  size?: SwitchSize;
  /** Visual style variant */
  variant?: SwitchVariant;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Label position relative to switch */
  labelPosition?: 'left' | 'right';
  /** Optional custom CSS class */
  className?: string;
  /** Optional helper text below the switch */
  helperText?: string;
  /** ID for the switch input */
  id?: string;
}

/**
 * Switch component that serves as a visually enhanced checkbox
 * Perfect for boolean settings and toggles
 */
const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  size = 'md',
  variant = 'primary',
  disabled = false,
  labelPosition = 'right',
  className = '',
  helperText,
  id: providedId,
}) => {
  // Generate a unique ID for accessibility if not provided
  const generatedId = useId();
  const id = providedId || `switch-${generatedId}`;
  
  // Size classes for the switch
  const sizeClasses = {
    sm: {
      switch: 'w-8 h-4',
      dot: 'h-3 w-3',
      translate: 'translate-x-4',
      padding: 'p-0.5',
      label: 'text-sm',
    },
    md: {
      switch: 'w-11 h-6', 
      dot: 'h-5 w-5',
      translate: 'translate-x-5',
      padding: 'p-0.5',
      label: 'text-base',
    }, 
    lg: {
      switch: 'w-14 h-7',
      dot: 'h-6 w-6', 
      translate: 'translate-x-7',
      padding: 'p-0.5',
      label: 'text-lg',
    }
  };

  // Variant color classes
  const variantClasses = {
    primary: {
      on: 'bg-blue-600 dark:bg-blue-500',
      off: 'bg-gray-200 dark:bg-gray-700',
    },
    success: {
      on: 'bg-green-600 dark:bg-green-500',
      off: 'bg-gray-200 dark:bg-gray-700',
    },
    danger: {
      on: 'bg-red-600 dark:bg-red-500',
      off: 'bg-gray-200 dark:bg-gray-700',
    },
    warning: {
      on: 'bg-yellow-500 dark:bg-yellow-500',
      off: 'bg-gray-200 dark:bg-gray-700',
    },
    info: {
      on: 'bg-cyan-600 dark:bg-cyan-500',
      off: 'bg-gray-200 dark:bg-gray-700',
    },
  };

  // Handle switch toggle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  // Container classes
  const containerClasses = [
    'flex items-center',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row',
    className,
  ].filter(Boolean).join(' ');

  // Switch classes
  const switchClasses = [
    sizeClasses[size].switch,
    sizeClasses[size].padding,
    'rounded-full transition-colors duration-200 ease-in-out relative',
    checked ? variantClasses[variant].on : variantClasses[variant].off,
  ].join(' ');

  return (
    <div className="flex flex-col">
      <label className={containerClasses} htmlFor={id}>
        {/* The actual checkbox (hidden) */}
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={helperText ? `${id}-description` : undefined}
        />
        
        {/* The visual switch component */}
        <div className={switchClasses}>
          <span 
            className={`
              ${sizeClasses[size].dot} 
              bg-white rounded-full transform transition-transform duration-200 ease-in-out block
              ${checked ? sizeClasses[size].translate : 'translate-x-0'}
              shadow-sm
            `}
          />
        </div>
        
        {/* Label */}
        {label && (
          <span 
            id={`${id}-label`}
            className={`
              ${sizeClasses[size].label}
              ${labelPosition === 'left' ? 'mr-3' : 'ml-3'} 
              select-none
              ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}
            `}
          >
            {label}
          </span>
        )}
      </label>
      
      {/* Helper text */}
      {helperText && (
        <p 
          id={`${id}-description`} 
          className={`
            mt-1 text-sm text-gray-500 dark:text-gray-400
            ${labelPosition === 'left' ? 'text-right' : 'text-left'}
          `}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Switch;