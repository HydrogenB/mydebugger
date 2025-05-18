import { useState, useEffect, useCallback } from 'react';
import { ValidationResult, HistoryEntry } from '../types';
import { 
  loadValidationHistory, 
  saveToHistory, 
  clearHistory,
  formatUrl,
  hasClickjackingProtection
} from '../utils';

/**
 * Custom hook for clickjacking validation functionality
 */
export const useClickjackingValidator = (initialUrl?: string) => {
  // State
  const [url, setUrl] = useState<string>(initialUrl || '');
  const [formattedUrl, setFormattedUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Load validation history on mount
  useEffect(() => {
    setHistory(loadValidationHistory());
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  // Format URL when it changes
  useEffect(() => {
    setFormattedUrl(formatUrl(url));
  }, [url]);

  /**
   * Validate a URL for clickjacking vulnerability
   */
  const validateUrl = useCallback(async () => {
    if (!formattedUrl) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call the API to validate the URL
      const response = await fetch('/api/security/clickjacking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate URL');
      }

      const data = await response.json();
      const validationResult: ValidationResult = {
        ...data,
        timestamp: new Date(),
      };

      setResult(validationResult);
      
      // Save to history
      const updatedHistory = saveToHistory(validationResult);
      setHistory(updatedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [formattedUrl]);

  /**
   * Load a specific entry from history
   */
  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setUrl(entry.result.url);
    setResult(entry.result);
  }, []);

  /**
   * Clear validation history
   */
  const handleClearHistory = useCallback(() => {
    const emptyHistory = clearHistory();
    setHistory(emptyHistory);
  }, []);

  return {
    // State
    url,
    formattedUrl,
    loading,
    result,
    error,
    history,
    showHistory,
    showHelp,

    // Actions
    setUrl,
    validateUrl,
    loadFromHistory,
    clearHistory: handleClearHistory,
    setShowHistory,
    setShowHelp
  };
};
