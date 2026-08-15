/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useRef, useState } from 'react';
import { analyzeHeaders, HeaderAuditResult } from '../lib/headerScanner';
import { copyText } from '../../../shared/utils/clipboard';

const COPY_FEEDBACK_MS = 2000;

export interface CopyStatus {
  key: string;
  ok: boolean;
}

export const useHeaderScanner = () => {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<HeaderAuditResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState<CopyStatus | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  const scan = async () => {
    if (!url) {
      setError('URL required');
      return;
    }
    setLoading(true);
    setCopyStatus(null);
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

  // `key` identifies which row triggered the copy (the header name) so feedback
  // stays scoped to that row instead of flipping every row to "Copied".
  const copy = async (key: string, text: string) => {
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    const ok = await copyText(text);
    setCopyStatus({ key, ok });
    copyTimerRef.current = setTimeout(() => {
      setCopyStatus(null);
      copyTimerRef.current = null;
    }, COPY_FEEDBACK_MS);
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
    copyStatus,
    scan,
    copy,
    exportJson,
  };
};

export default useHeaderScanner;
