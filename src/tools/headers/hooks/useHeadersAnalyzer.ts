import { useState, useEffect, useCallback } from 'react';
import { HeadersAnalysisResult, ParsedHeaders } from '../types';
import { 
  formatUrl, 
  isValidUrl, 
  enrichHeader, 
  loadAnalysisHistory, 
  saveToHistory, 
  clearHistory 
} from '../utils';

/**
 * Custom hook for headers analyzer functionality
 */
export const useHeadersAnalyzer = (initialUrl?: string) => {
  // State
  const [url, setUrl] = useState<string>(initialUrl || '');
  const [formattedUrl, setFormattedUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HeadersAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HeadersAnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadAnalysisHistory());
    
    // Format initial URL if provided
    if (initialUrl) {
      const formatted = formatUrl(initialUrl);
      setUrl(initialUrl);
      setFormattedUrl(formatted);
    }
  }, [initialUrl]);
  
  /**
   * Set URL and format it
   */
  const handleUrlChange = useCallback((newUrl: string) => {
    setUrl(newUrl);
    setFormattedUrl(formatUrl(newUrl));
  }, []);
  
  /**
   * Analyze headers for the current URL
   */
  const analyzeHeaders = useCallback(async () => {
    if (!formattedUrl) return;
    
    if (!isValidUrl(formattedUrl)) {
      setError('Please enter a valid URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Use our API endpoint to fetch headers
      const apiUrl = `/api/header-audit?url=${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process and enrich headers with metadata
      const processedHeaders: ParsedHeaders = {
        request: Object.entries(data.requestHeaders || {}).map(
          ([name, value]) => enrichHeader(name, value as string, 'request')
        ),
        response: Object.entries(data.responseHeaders || {}).map(
          ([name, value]) => enrichHeader(name, value as string, 'response')
        )
      };
      
      // Create final result
      const analysisResult: HeadersAnalysisResult = {
        url: formattedUrl,
        headers: processedHeaders,
        statusCode: data.status,
        statusText: data.statusText,
        timestamp: new Date()
      };
      
      setResult(analysisResult);
      
      // Save to history
      const updatedHistory = saveToHistory(analysisResult);
      setHistory(updatedHistory);
      
    } catch (err) {
      setError(`Error analyzing headers: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [formattedUrl]);
  
  /**
   * Clear current results
   */
  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);
  
  /**
   * Clear all history entries
   */
  const clearHistoryEntries = useCallback(() => {
    setHistory(clearHistory());
  }, []);
  
  /**
   * Selects a historical result
   */
  const selectHistoryItem = useCallback((item: HeadersAnalysisResult) => {
    setUrl(item.url);
    setFormattedUrl(item.url);
    setResult(item);
    setShowHistory(false);
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
    setUrl: handleUrlChange,
    analyzeHeaders,
    clearResults,
    clearHistoryEntries,
    selectHistoryItem,
    setShowHistory,
    setShowHelp
  };
};
