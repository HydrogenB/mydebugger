/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from 'react';
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

  // Declarative reset, keyed on the status value itself (same shape as
  // useCookieInspector's toast effect): React clears the *previous*
  // status's timer (via this effect's own cleanup) before scheduling a new
  // one whenever copyStatus changes. That holds even when two `copy()`
  // calls overlap and resolve out of order — there is only ever one live
  // timer, tied to whichever status is currently displayed, so a slower
  // call's late resolution can never leave a stray timer that clears a
  // newer row's feedback early. It also covers unmount for free.
  useEffect(() => {
    if (!copyStatus) return undefined;
    const timer = setTimeout(() => setCopyStatus(null), COPY_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copyStatus]);

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
    const ok = await copyText(text);
    setCopyStatus({ key, ok });
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
