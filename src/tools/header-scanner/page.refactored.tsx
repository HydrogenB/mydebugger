/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Example refactored tool page using the new architecture
 * Demonstrates how to eliminate repetitive patterns and improve maintainability
 */

import React from 'react';
import { toolPageFactory } from '../../shared/hoc/withToolPage';
import { useBaseTool } from '../../shared/hooks/useBaseTool';
import { exportData, copyToClipboard } from '../../shared/utils';
import HeaderScannerView from './components/HeaderScannerPanel';
import { analyzeHeaders, HeaderAuditResult } from '../lib/headerScanner';

/**
 * Refactored Header Scanner viewmodel using shared utilities
 */
const useHeaderScanner = () => {
  const [url, setUrl] = React.useState('');
  const [results, setResults] = React.useState<HeaderAuditResult[]>([]);
  const [copied, setCopied] = React.useState(false);
  
  // Use base tool hook for common functionality
  const { loading, error, withErrorHandling } = useBaseTool();
  const scan = React.useCallback(async () => {
    if (!url) return;
    
    await withErrorHandling(async () => {
      const scanResults = await analyzeHeaders(url);
      setResults(scanResults);
    });
  }, [url, withErrorHandling]);

  const copy = React.useCallback(async (text: string) => {
    await copyToClipboard(text, 'text');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Use shared export utility instead of custom implementation
  const exportJson = React.useCallback(() => {
    exportData(results, {
      filename: 'header-scan',
      format: 'json',
      timestamp: true
    });
  }, [results]);

  return {
    url,
    setUrl,
    results,
    loading,
    error,
    copied,
    scan,
    copy,
    exportJson
  };
};

/**
 * Refactored Header Scanner page using factory pattern
 * Eliminates repetitive page structure code
 */
export default toolPageFactory.standard(
  HeaderScannerView,
  useHeaderScanner,
  '/header-scanner',
  {
    showHeader: true,
    showDescription: true,
    showRelatedTools: true
  }
);
