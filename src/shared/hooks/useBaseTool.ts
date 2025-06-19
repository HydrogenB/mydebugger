/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Base hook for common tool functionality
 * Provides standardized patterns for loading, error handling, and state management
 */

import { useState, useCallback } from 'react';

export interface BaseToolState {
  loading: boolean;
  error: string;
}

export interface BaseToolActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  withErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

/**
 * Base hook that provides common functionality for all tools
 * Eliminates repetitive state management and error handling code
 */
export const useBaseTool = (): BaseToolState & BaseToolActions => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const withErrorHandling = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError('');
    
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    setLoading,
    setError,
    clearError,
    withErrorHandling
  };
};

/**
 * Enhanced base hook for tools that work with URLs
 */
export interface UrlToolState extends BaseToolState {
  url: string;
}

export interface UrlToolActions extends BaseToolActions {
  setUrl: (url: string) => void;
  validateUrl: (url: string) => boolean;
}

export const useUrlTool = (initialUrl = ''): UrlToolState & UrlToolActions => {
  const [url, setUrl] = useState(initialUrl);
  const baseHook = useBaseTool();

  const validateUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    ...baseHook,
    url,
    setUrl,
    validateUrl
  };
};

/**
 * Base hook for tools that handle form data
 */
export interface FormToolState<T> extends BaseToolState {
  data: T;
  isValid: boolean;
}

export interface FormToolActions<T> extends BaseToolActions {
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateData: (data: Partial<T>) => void;
  resetData: () => void;
  validate: () => boolean;
}

export const useFormTool = <T extends Record<string, any>>(
  initialData: T,
  validator?: (data: T) => boolean
): FormToolState<T> & FormToolActions<T> => {
  const [data, setData] = useState<T>(initialData);
  const baseHook = useBaseTool();

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateData = useCallback((newData: Partial<T>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const resetData = useCallback(() => {
    setData(initialData);
  }, [initialData]);

  const validate = useCallback((): boolean => {
    return validator ? validator(data) : true;
  }, [data, validator]);

  const isValid = validate();

  return {
    ...baseHook,
    data,
    isValid,
    updateField,
    updateData,
    resetData,
    validate
  };
};
