/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import { analyzeHeaders, HeaderAuditResult } from '../model/headerScanner';

export const useHeaderScanner = () => {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<HeaderAuditResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const scan = async () => {
    if (!url) {
      setError('URL required');
      return;
    }
    setLoading(true);
    setCopied(false);
    setError('');
    try {
      const res = await analyzeHeaders(url);
      setResults(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'header-scan.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return {
    url,
    setUrl,
    results,
    loading,
    error,
    copied,
    scan,
    copy,
    exportJson,
  };
};

export default useHeaderScanner;
