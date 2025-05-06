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
  /** Whether to enable character counting */
  showCharCount?: boolean;
}

/**
 * TextInput component that provides a consistent text input experience
 * with various states, adornments, and responsive design.
 */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
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
      size === 'sm' ? 'text-xs' : '',
      size === 'md' ? 'text-sm' : '',
      size === 'lg' ? 'text-base' : '',
      labelClassName,
    ].filter(Boolean).join(' ');

    // Helper text styles
    const helperTextClasses = [
      'mt-1.5 text-sm',
      error ? 'text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-gray-400',
    ].filter(Boolean).join(' ');
    
    // Calculate input padding based on adornments
    const paddingLeft = startAdornment ? 
      (size === 'sm' ? 'pl-7' : size === 'md' ? 'pl-9' : 'pl-10') : '';
    const paddingRight = (endAdornment || clearable) ?
      (size === 'sm' ? 'pr-7' : size === 'md' ? 'pr-9' : 'pr-10') : '';

    // Size classes
    const sizeClasses = {
      sm: 'h-8 text-xs py-1 px-2.5',
      md: 'h-10 text-sm py-2 px-3',
      lg: 'h-12 text-base py-2.5 px-4',
    };

    // Variant styling
    const variantClasses = {
      default: `bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 ${
        error
          ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
          : success
          ? 'border-green-500 dark:border-green-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-green-500 dark:focus:ring-green-500'
          : ''
      }`,
      filled: `bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 ${
        error
          ? 'bg-red-50 dark:bg-opacity-10 dark:bg-red-900 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
          : success
          ? 'bg-green-50 dark:bg-opacity-10 dark:bg-green-900 focus:border-green-500 dark:focus:border-green-500 focus:ring-green-500 dark:focus:ring-green-500'
          : ''
      }`,
      outlined: `bg-transparent border-2 ${
        error
          ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
          : success
          ? 'border-green-500 dark:border-green-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-green-500 dark:focus:ring-green-500'
          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
      }`,
      underlined: `bg-transparent border-b-2 border-x-0 border-t-0 rounded-none px-1 ${
        error
          ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500'
          : success
          ? 'border-green-500 dark:border-green-500 focus:border-green-500 dark:focus:border-green-500' 
          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
      }`,
    };
    
    // Input classes
    const inputClasses = [
      'block w-full rounded-md shadow-sm outline-none transition-colors duration-150',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      sizeClasses[size],
      variantClasses[variant],
      paddingLeft,
      paddingRight,
      className,
    ].filter(Boolean).join(' ');

    // Count characters if needed
    const characterCount = showCharCount && (
      <div className="absolute right-3 -bottom-6 text-xs text-gray-500">
        {inputValue.length}{maxLength ? `/${maxLength}` : ''}
      </div>
    );

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={rest.id} className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {startAdornment && (
            <div className={`absolute inset-y-0 left-0 flex items-center ${
              size === 'sm' ? 'pl-2' : size === 'md' ? 'pl-3' : 'pl-3.5'
            }`}>
              <span className="text-gray-500 dark:text-gray-400">{startAdornment}</span>
            </div>
          )}
          
          <input
            ref={ref}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={
              helperText ? `${rest.id}-helper` : error ? `${rest.id}-error` : undefined
            }
            maxLength={maxLength}
            {...rest}
          />
          
          {(clearable && inputValue) && (
            <button
              type="button"
              className={`absolute inset-y-0 right-0 flex items-center ${
                endAdornment 
                  ? (size === 'sm' ? 'right-6' : size === 'md' ? 'right-8' : 'right-9') 
                  : (size === 'sm' ? 'pr-2' : size === 'md' ? 'pr-3' : 'pr-3.5')
              } text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
              onClick={handleClear}
              tabIndex={-1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          
          {endAdornment && (
            <div className={`absolute inset-y-0 right-0 flex items-center ${
              size === 'sm' ? 'pr-2' : size === 'md' ? 'pr-3' : 'pr-3.5'
            }`}>
              <span className="text-gray-500 dark:text-gray-400">{endAdornment}</span>
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p
            id={error ? `${rest.id}-error` : `${rest.id}-helper`}
            className={helperTextClasses}
          >
            {error || helperText}
          </p>
        )}
        
        {characterCount}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;