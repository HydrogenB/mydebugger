import React, { ReactNode, FormHTMLAttributes, createContext, useContext } from 'react';

export type FormLayout = 'vertical' | 'horizontal' | 'inline' | 'compact';
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';
export type FormSize = 'xs' | 'sm' | 'md' | 'lg';
export type FormTheme = 'default' | 'ghost' | 'bordered';

interface FormContextType {
  layout: FormLayout;
  status: FormStatus;
  disabled: boolean;
  size: FormSize;
  theme: FormTheme;
  requiredMark: boolean | ReactNode;
  labelAlign: 'left' | 'right' | 'center';
  requiredIndicator: ReactNode;
  showErrorMessages: boolean;
  showSuccessIndicator: boolean;
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Form content */
  children: ReactNode;
  /** Form layout mode */
  layout?: FormLayout;
  /** Current status of the form */
  status?: FormStatus;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Size of form controls */
  size?: FormSize;
  /** Visual style theme */
  theme?: FormTheme;
  /** Whether to show a required mark next to labels */
  requiredMark?: boolean | ReactNode;
  /** Alignment of form labels */
  labelAlign?: 'left' | 'right' | 'center';
  /** Required field indicator */
  requiredIndicator?: ReactNode;
  /** Whether to show error messages below fields */
  showErrorMessages?: boolean;
  /** Whether to show success indicator on valid fields */
  showSuccessIndicator?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Form submission handler */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>, formData: FormData) => void;
  /** Event triggered when form validation fails */
  onValidationFailed?: (invalidFields: string[]) => void;
}

// Form component with Item property added to the type
interface FormComponent extends React.FC<FormProps> {
  Item: React.FC<FormItemProps>;
}

// Create form context
const FormContext = createContext<FormContextType>({
  layout: 'vertical',
  status: 'idle',
  disabled: false,
  size: 'md',
  theme: 'default',
  requiredMark: true,
  labelAlign: 'left',
  requiredIndicator: <span className="text-red-500 ml-1">*</span>,
  showErrorMessages: true,
  showSuccessIndicator: true
});

export const useFormContext = () => useContext(FormContext);

/**
 * Form - A responsive form component with support for different layouts,
 * validation states, and field styling.
 */
export const Form = (({
  children,
  layout = 'vertical',
  status = 'idle',
  disabled = false,
  size = 'md',
  theme = 'default',
  requiredMark = true,
  labelAlign = 'left',
  requiredIndicator = <span className="text-red-500 ml-1">*</span>,
  showErrorMessages = true,
  showSuccessIndicator = true,
  className = '',
  onSubmit,
  onValidationFailed,
  ...rest
}) => {
  // Form layout classes
  const layoutClasses = {
    vertical: 'flex flex-col gap-4',
    horizontal: 'grid grid-cols-1 md:grid-cols-[30%_1fr] lg:grid-cols-[25%_1fr] gap-3',
    inline: 'flex flex-wrap items-end gap-3',
    compact: 'flex flex-col gap-2',
  };

  // Form theme classes
  const themeClasses = {
    default: '',
    ghost: 'bg-transparent',
    bordered: 'border p-6 rounded-lg'
  };

  // Combine all classes
  const formClasses = [
    layoutClasses[layout],
    themeClasses[theme],
    disabled ? 'opacity-60 pointer-events-none' : '',
    className
  ].filter(Boolean).join(' ');

  // Process form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check HTML form validation
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      
      // Get all invalid field names
      const invalidFields = Array.from(form.elements)
        .filter((element) => {
          const el = element as HTMLInputElement;
          return el.validity && !el.validity.valid && el.name;
        })
        .map((element) => (element as HTMLInputElement).name);
      
      if (onValidationFailed) {
        onValidationFailed(invalidFields);
      }
      
      return;
    }
    
    if (onSubmit) {
      const formData = new FormData(form);
      onSubmit(e, formData);
    }
  };

  return (
    <FormContext.Provider
      value={{
        layout,
        status,
        disabled,
        size,
        theme,
        requiredMark,
        labelAlign,
        requiredIndicator,
        showErrorMessages,
        showSuccessIndicator
      }}
    >
      <form 
        className={formClasses} 
        onSubmit={handleSubmit}
        noValidate={rest.noValidate !== undefined ? rest.noValidate : true}
        {...rest}
      >
        {/* Form status indicator - shown when loading or after success/error */}
        {status !== 'idle' && (
          <div className={`form-status ${status === 'loading' ? 'animate-pulse' : ''}`}>
            {status === 'loading' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-3 rounded-md flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            )}
            
            {status === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-md">
                Form submitted successfully
              </div>
            )}
            
            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-md">
                An error occurred while submitting the form
              </div>
            )}
          </div>
        )}

        {children}
      </form>
    </FormContext.Provider>
  );
}) as FormComponent;

// Form.Item component for form fields
export interface FormItemProps {
  /** Form field content */
  children: ReactNode;
  /** Label for the form item */
  label?: ReactNode;
  /** Whether the field is required */
  required?: boolean;
  /** Help text to show below the field */
  help?: ReactNode;
  /** Error message */
  error?: string | string[];
  /** Success status override */
  success?: boolean;
  /** Whether to hide the label */
  hideLabel?: boolean;
  /** Unique identifier for the form item */
  id?: string;
  /** Custom CSS class */
  className?: string;
  /** For certain field types, automatically display the field's validation message */
  autoValidationMessage?: boolean;
}

export const FormItem: React.FC<FormItemProps> = ({
  children,
  label,
  required = false,
  help,
  error,
  success = false,
  hideLabel = false,
  id,
  className = '',
  autoValidationMessage = true,
}) => {
  const {
    layout,
    requiredMark,
    requiredIndicator,
    labelAlign,
    showErrorMessages,
    showSuccessIndicator,
  } = useFormContext();

  // Process errors to display
  const hasError = error && (Array.isArray(error) ? error.length > 0 : true);
  const errorMessages = Array.isArray(error) ? error : error ? [error] : [];

  // Handle label alignment
  const labelAlignClass = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  };

  // Layout-specific classes
  const itemLayoutClasses = {
    vertical: '',
    horizontal: 'contents',
    inline: 'flex-grow min-w-fit',
    compact: '',
  };

  // Label styles based on layout
  const labelLayoutClasses = {
    vertical: 'block mb-1',
    horizontal: 'py-2',
    inline: 'mb-1',
    compact: 'text-sm mb-1',
  };

  // Item container classes
  const itemClasses = [
    itemLayoutClasses[layout],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClasses}>
      {/* Label */}
      {label && !hideLabel && (
        <label
          htmlFor={id}
          className={`
            ${labelLayoutClasses[layout]} 
            ${labelAlignClass[labelAlign]} 
            text-gray-700 dark:text-gray-300 font-medium
          `}
        >
          {label}
          {required && requiredMark && requiredIndicator}
        </label>
      )}

      {/* Field container */}
      <div className="relative">
        {/* Field content */}
        {children}
        
        {/* Success indicator */}
        {showSuccessIndicator && success && !hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
          </div>
        )}
      </div>
      
      {/* Help text */}
      {help && !hasError && (
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {help}
        </div>
      )}
      
      {/* Error messages */}
      {showErrorMessages && hasError && (
        <div className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errorMessages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// FormControl component for various input controls
export interface FormControlProps {
  /** Control content */
  children: ReactNode;
  /** Error state */
  error?: boolean;
  /** Success state */
  success?: boolean;
  /** Custom CSS class */
  className?: string;
}

export const FormControl: React.FC<FormControlProps> = ({ 
  children,
  error = false,
  success = false,
  className = ''
}) => {
  // Styling for the control container
  const controlClasses = [
    'form-control',
    error ? 'form-control-error' : '',
    success ? 'form-control-success' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={controlClasses}>
      {children}
    </div>
  );
};

Form.Item = FormItem;

export default Form;