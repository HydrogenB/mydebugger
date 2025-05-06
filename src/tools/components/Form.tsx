import React, { ReactNode, createContext, useContext, useState } from 'react';

// Types and interfaces
interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  handleChange: (name: string, value: any) => void;
  handleBlur: (name: string) => void;
  setFieldValue: (name: string, value: any) => void;
  setFieldError: (name: string, error: string) => void;
  setFieldTouched: (name: string, isTouched?: boolean) => void;
  resetForm: () => void;
}

interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T, formHelpers: FormHelpers<T>) => void | Promise<any>;
  onReset?: () => void;
  validate?: (values: T) => Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  enableReinitialize?: boolean;
  children: ReactNode | ((formContext: FormContextType) => ReactNode);
  className?: string;
}

interface FormHelpers<T> {
  setSubmitting: (isSubmitting: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Record<string, string>) => void;
  resetForm: () => void;
}

interface FormControlProps {
  name: string;
  label?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  helpTextClassName?: string;
  errorClassName?: string;
  children: ReactNode | ((controlProps: FormControlChildProps) => ReactNode);
}

interface FormControlChildProps {
  id: string;
  name: string;
  value: any;
  error?: string;
  touched: boolean;
  required: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

// Context creation
const FormContext = createContext<FormContextType | undefined>(undefined);

/**
 * Form component - Manages form state, validation and submission
 */
export function Form<T extends Record<string, any> = Record<string, any>>({
  initialValues,
  onSubmit,
  onReset,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
  validateOnMount = false,
  enableReinitialize = false,
  children,
  className = '',
}: FormProps<T>) {
  // State management
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reinitialize form values when initialValues prop changes
  React.useEffect(() => {
    if (enableReinitialize) {
      setValues(initialValues);
    }
  }, [enableReinitialize, initialValues]);

  // Validate form on mount if enabled
  React.useEffect(() => {
    if (validateOnMount && validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [validateOnMount, validate, values]);

  // Run validation logic
  const runValidation = (): Record<string, string> => {
    if (validate) {
      return validate(values);
    }
    return {};
  };

  // Handle form field change
  const handleChange = (name: string, value: any) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    if (!isDirty) {
      setIsDirty(true);
    }

    // Validate on change if enabled
    if (validateOnChange && validate) {
      const validationErrors = runValidation();
      setErrors(validationErrors);
    }
  };

  // Handle form field blur
  const handleBlur = (name: string) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    // Validate on blur if enabled
    if (validateOnBlur && validate) {
      const validationErrors = runValidation();
      setErrors(validationErrors);
    }
  };

  // Set field value directly
  const setFieldValue = (name: string, value: any) => {
    handleChange(name, value);
  };

  // Set field error directly
  const setFieldError = (name: string, error: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // Set field as touched
  const setFieldTouched = (name: string, isTouched = true) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: isTouched,
    }));
  };

  // Reset the form
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    if (onReset) {
      onReset();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate all fields
    const validationErrors = runValidation();
    setErrors(validationErrors);

    // Don't submit if there are errors
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    // Form helpers for the onSubmit callback
    const formHelpers: FormHelpers<T> = {
      setSubmitting: setIsSubmitting,
      setValues: (newValues) => setValues({ ...values, ...newValues }),
      setErrors: setErrors,
      resetForm,
    };

    try {
      await onSubmit(values, formHelpers);
    } finally {
      // If onSubmit didn't call setSubmitting(false), we'll do it here
      setIsSubmitting(false);
    }
  };

  // Form context value
  const formContextValue: FormContextType = {
    values,
    errors,
    touched,
    isDirty,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
  };

  return (
    <FormContext.Provider value={formContextValue}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {typeof children === 'function' ? children(formContextValue) : children}
      </form>
    </FormContext.Provider>
  );
}

/**
 * Custom hook to access form context
 */
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
}

/**
 * FormControl - Component to manage form field layout and display
 */
export function FormControl({
  name,
  label,
  helpText,
  required = false,
  className = '',
  labelClassName = '',
  helpTextClassName = '',
  errorClassName = '',
  children,
}: FormControlProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
  } = useFormContext();

  const id = `form-control-${name}`;
  const error = touched[name] ? errors[name] : undefined;
  const hasError = !!error;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleChange(name, e.target.value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleBlur(name);
  };

  // Props passed to child render function
  const childProps: FormControlChildProps = {
    id,
    name,
    value: values[name],
    error,
    touched: touched[name] || false,
    required,
    onChange: handleInputChange,
    onBlur: handleInputBlur,
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-1 ${hasError ? 'text-red-600 dark:text-red-500' : 'text-gray-700 dark:text-gray-300'} ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {typeof children === 'function' ? children(childProps) : children}

      {hasError && (
        <p className={`mt-1 text-sm text-red-600 dark:text-red-500 ${errorClassName}`}>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${helpTextClassName}`}>
          {helpText}
        </p>
      )}
    </div>
  );
}

/**
 * FormSubmitButton - Styled button with automatic loading state
 */
export const FormSubmitButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loadingText?: string;
}> = ({ 
  children, 
  className = '', 
  disabled, 
  loadingText = 'Submitting...',
  ...rest 
}) => {
  const { isSubmitting } = useFormContext();
  
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className={`
        px-4 py-2 text-white bg-blue-600 hover:bg-blue-700
        rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...rest}
    >
      {isSubmitting ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
};