/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState, useCallback, useEffect } from 'react';
import {
  analyzeDynamicLink,
  DynamicLinkAnalysis,
  HistoryItem,
  loadHistory,
  saveToHistory,
  clearHistory as clearStoredHistory,
  buildDynamicLink,
  LinkBuilderParams,
} from '../lib/dynamicLink';

export interface UseDynamicLinkProbeReturn {
  // Input state
  inputUrl: string;
  setInputUrl: (url: string) => void;
  
  // Analysis state
  analysis: DynamicLinkAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  
  // History
  history: HistoryItem[];
  
  // Actions
  analyze: () => void;
  analyzeUrl: (url: string) => void;
  clearAnalysis: () => void;
  clearHistory: () => void;
  loadFromHistory: (item: HistoryItem) => void;
  
  // URL Builder
  buildUrl: (params: LinkBuilderParams) => string;
  
  // Utilities
  copyToClipboard: (text: string) => Promise<boolean>;
}

export function useDynamicLinkProbe(): UseDynamicLinkProbeReturn {
  const [inputUrl, setInputUrl] = useState('');
  const [analysis, setAnalysis] = useState<DynamicLinkAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Check for URL params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    
    if (urlParam) {
      setInputUrl(urlParam);
      // Auto-analyze if URL is provided
      const result = analyzeDynamicLink(urlParam);
      setAnalysis(result);
      if (result.isValid) {
        saveToHistory(result);
        setHistory(loadHistory());
      }
    }
  }, []);

  const analyze = useCallback(() => {
    if (!inputUrl.trim()) {
      setError('Please enter a URL to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = analyzeDynamicLink(inputUrl);
      setAnalysis(result);
      
      if (result.isValid) {
        saveToHistory(result);
        setHistory(loadHistory());
      } else {
        setError(result.warnings[0] || 'Invalid URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputUrl]);

  const analyzeUrl = useCallback((url: string) => {
    setInputUrl(url);
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = analyzeDynamicLink(url);
      setAnalysis(result);
      
      if (result.isValid) {
        saveToHistory(result);
        setHistory(loadHistory());
      } else {
        setError(result.warnings[0] || 'Invalid URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setInputUrl('');
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    clearStoredHistory();
    setHistory([]);
  }, []);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setInputUrl(item.url);
    analyzeUrl(item.url);
  }, [analyzeUrl]);

  const buildUrl = useCallback((params: LinkBuilderParams) => {
    return buildDynamicLink(params);
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    inputUrl,
    setInputUrl,
    analysis,
    isAnalyzing,
    error,
    history,
    analyze,
    analyzeUrl,
    clearAnalysis,
    clearHistory,
    loadFromHistory,
    buildUrl,
    copyToClipboard,
  };
}

export default useDynamicLinkProbe;
