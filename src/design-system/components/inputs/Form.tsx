import React, { ReactNode, createContext, useContext, useState } from 'react';

// Types and interfaces
interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  handleChange: (name: string, value: any) => void;
  handleBlur: (name: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
}

export interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T, helpers: FormHelpers<T>) => void | Promise<void>;
  onReset?: () => void;
  validate?: (values: T) => Record<string, string | undefined>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  enableReinitialize?: boolean;
  children: ReactNode;
  className?: string;
}

export interface FormHelpers<T> {
  resetForm: () => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  setValues: React.Dispatch<React.SetStateAction<T>>;
}

export interface FormControlProps {
  name: string;
  label?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  helpTextClassName?: string;
  errorClassName?: string;
  children: ReactNode | ((props: FormControlChildProps) => ReactNode);
}

export interface FormControlChildProps {
  id: string;
  name: string;
  value: any;
  error: string | undefined;
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
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Re-initialize form values when initialValues changes
  React.useEffect(() => {
    if (enableReinitialize) {
      setValues(initialValues);
    }
  }, [enableReinitialize, initialValues]);
  
  // Validate on mount if configured
  React.useEffect(() => {
    if (validateOnMount && validate) {
      setErrors(validate(values));
    }
  }, [validateOnMount, validate]);
  
  // Handle form field change
  const handleChange = (name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate on change if configured
    if (validateOnChange && validate) {
      const newErrors = validate({
        ...values,
        [name]: value,
      });
      
      setErrors(prev => ({
        ...prev,
        [name]: newErrors[name],
      }));
    }
  };
  
  // Handle field blur
  const handleBlur = (name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
    
    // Validate on blur if configured
    if (validateOnBlur && validate) {
      const newErrors = validate(values);
      
      setErrors(prev => ({
        ...prev,
        [name]: newErrors[name],
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    
    // Final validation before submission
    let formErrors = {};
    
    if (validate) {
      formErrors = validate(values);
      setErrors(formErrors);
    }
    
    // Check if there are any errors
    const hasErrors = Object.values(formErrors).some(error => error !== undefined);
    
    if (!hasErrors) {
      // Form helpers for the submit handler
      const helpers: FormHelpers<T> = {
        resetForm: resetForm,
        setErrors: setErrors,
        setValues: setValues,
      };
      
      // Submit the form
      onSubmit(values, helpers);
    }
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    
    if (onReset) {
      onReset();
    }
  };
  
  // Form context value
  const contextValue: FormContextType = {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
  
  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {children}
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