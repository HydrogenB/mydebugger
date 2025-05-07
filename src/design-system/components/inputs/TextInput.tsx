import React, { InputHTMLAttributes, ReactNode, forwardRef, useState } from 'react';

export type TextInputSize = 'sm' | 'md' | 'lg';
export type TextInputVariant = 'default' | 'filled' | 'outlined' | 'underlined';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Size of the input */
  size?: TextInputSize;
  /** Visual style variant */
  variant?: TextInputVariant;
  /** Full width of container */
  fullWidth?: boolean;
  /** Left icon or element */
  startAdornment?: ReactNode;
  /** Right icon or element */
  endAdornment?: ReactNode;
  /** Whether to show a clear button when input has text */
  clearable?: boolean;
  /** Whether to show success state */
  success?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Custom CSS class for the container */
  containerClassName?: string;
  /** Custom CSS class for the label */
  labelClassName?: string;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Whether to show character count */
  showCharCount?: boolean;
}

/**
 * TextInput component that provides a consistent text input experience
 * with various states, adornments, and responsive design.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      variant = 'default',
      fullWidth = false,
      startAdornment,
      endAdornment,
      clearable = false,
      success = false,
      required = false,
      disabled = false,
      className = '',
      containerClassName = '',
      labelClassName = '',
      value,
      defaultValue,
      onClear,
      showCharCount = false,
      maxLength,
      ...rest
    },
    ref
  ) => {
    // Track input value for clearable and character count
    const [inputValue, setInputValue] = useState<string>(
      (value as string) || (defaultValue as string) || ''
    );
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      rest.onChange?.(e);
    };

    const handleClear = () => {
      setInputValue('');
      onClear?.();
      
      // Create a synthetic change event
      const syntheticEvent = {
        target: { value: '', name: rest.name },
      } as React.ChangeEvent<HTMLInputElement>;
      
      rest.onChange?.(syntheticEvent);
    };

    // Container styles
    const containerClasses = [
      'relative',
      fullWidth ? 'w-full' : '',
      containerClassName,
    ].filter(Boolean).join(' ');
    
    // Label styles
    const labelClasses = [
      'block mb-1.5 font-medium',
      error ? 'text-red-600 dark:text-red-500' : 'text-gray-700 dark:text-gray-300',
      disabled ? 'opacity-60' : '',
      labelClassName,
    ].filter(Boolean).join(' ');
    
    // Input wrapper styles for adornments
    const inputWrapperClasses = [
      'relative flex items-center',
      startAdornment ? 'pl-9' : '',
      endAdornment || (clearable && inputValue) ? 'pr-9' : '',
    ].filter(Boolean).join(' ');
    
    // Size classes
    const sizeClasses = {
      sm: 'py-1 px-2 text-sm',
      md: 'py-2 px-3',
      lg: 'py-2.5 px-4 text-lg',
    };
    
    // Variant styles
    const getVariantClasses = () => {
      const baseClasses = [
        'w-full rounded-md focus:outline-none transition-colors',
        sizeClasses[size],
        disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : '',
      ];
      
      if (error) {
        baseClasses.push('border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900');
      } else if (success) {
        baseClasses.push('border-green-500 focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-900');
      }
      
      switch (variant) {
        case 'filled':
          baseClasses.push(
            'border border-transparent',
            error
              ? 'bg-red-50 dark:bg-red-900/20'
              : success
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-gray-100 dark:bg-gray-800',
            !disabled && !error && !success
              ? 'focus:bg-white dark:focus:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-750'
              : ''
          );
          break;
          
        case 'outlined':
          baseClasses.push(
            'bg-transparent',
            error
              ? 'border-red-500'
              : success
                ? 'border-green-500'
                : 'border-gray-300 dark:border-gray-600',
            !disabled && !error && !success
              ? 'hover:border-gray-400 dark:hover:border-gray-500 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-900'
              : ''
          );
          break;
          
        case 'underlined':
          baseClasses.push(
            'rounded-none border-0 border-b-2 px-1',
            'bg-transparent',
            error
              ? 'border-red-500'
              : success
                ? 'border-green-500'
                : 'border-gray-300 dark:border-gray-600',
            !disabled && !error && !success
              ? 'hover:border-gray-500 focus:border-primary-500 dark:focus:border-primary-400'
              : ''
          );
          break;
          
        default: // default variant
          baseClasses.push(
            'border',
            error
              ? 'border-red-500'
              : success
                ? 'border-green-500'
                : 'border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-900',
            !disabled && !error && !success
              ? 'hover:border-gray-400 dark:hover:border-gray-500 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-900'
              : ''
          );
      }
      
      return baseClasses.filter(Boolean).join(' ');
    };
    
    // Adornment styles
    const adornmentClasses = 'absolute inset-y-0 flex items-center pointer-events-none text-gray-500 dark:text-gray-400';
    const startAdornmentClasses = `${adornmentClasses} left-0 pl-2.5`;
    const endAdornmentClasses = `${adornmentClasses} right-0 pr-2.5`;
    
    // Clear button styles
    const clearButtonClasses = [
      'absolute inset-y-0 right-0 flex items-center pr-2.5',
      'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
      'cursor-pointer transition-colors duration-150',
    ].join(' ');
    
    // Helper/error text
    const helperTextClasses = [
      'mt-1 text-sm',
      error 
        ? 'text-red-600 dark:text-red-500' 
        : success 
          ? 'text-green-600 dark:text-green-500' 
          : 'text-gray-500 dark:text-gray-400',
    ].join(' ');
    
    // Character count classes
    const charCountClasses = 'text-xs text-right mt-1 text-gray-500 dark:text-gray-400';
    
    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label htmlFor={rest.id} className={labelClasses}>
            {label}
            {required && <span className="ml-0.5 text-red-600 dark:text-red-500">*</span>}
          </label>
        )}
        
        {/* Input with adornments */}
        <div className={inputWrapperClasses}>
          {/* Start adornment */}
          {startAdornment && (
            <div className={startAdornmentClasses}>{startAdornment}</div>
          )}
          
          {/* Input element */}
          <input
            ref={ref}
            className={`${getVariantClasses()} ${className}`}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={helperText ? `${rest.id}-helper` : undefined}
            maxLength={maxLength}
            onChange={handleChange}
            {...rest}
          />
          
          {/* End adornment */}
          {endAdornment && (
            <div className={endAdornmentClasses}>{endAdornment}</div>
          )}
          
          {/* Clear button */}
          {clearable && inputValue && !disabled && (
            <div className={clearButtonClasses} onClick={handleClear}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
          )}
        </div>
        
        {/* Helper text, error or character count */}
        <div className="flex justify-between">
          {(error || helperText) && (
            <p 
              id={`${rest.id}-helper`}
              className={helperTextClasses}
            >
              {error || helperText}
            </p>
          )}
          
          {/* Character counter */}
          {showCharCount && maxLength && (
            <p className={charCountClasses}>
              {inputValue.length}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);