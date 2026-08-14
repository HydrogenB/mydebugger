/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { detectDelimiter, generateMarkdownTable, parseCsv } from '../lib/csvtomd';
import { copyText } from '../../../shared/utils/clipboard';

export const useCsvtomd = () => {
  const [csv, setCsv] = useState('');
  const [delimiter, setDelimiterState] = useState(',');
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [alignment, setAlignment] = useState<string[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // Tracks whether the current delimiter was explicitly chosen by the user
  // (via setDelimiter below) rather than auto-detected. Cleared whenever the
  // CSV is emptied so the next fresh paste/upload re-runs auto-detection.
  const userChoseDelimiter = useRef(false);

  const setDelimiter = useCallback((d: string) => {
    userChoseDelimiter.current = true;
    setDelimiterState(d);
  }, []);

  useEffect(() => {
    if (!csv) {
      setData([]);
      setHeaders([]);
      setMarkdown('');
      setAlignment([]);
      userChoseDelimiter.current = false;
      return;
    }

    let effectiveDelimiter = delimiter;
    if (!userChoseDelimiter.current) {
      const detected = detectDelimiter(csv);
      effectiveDelimiter = detected;
      if (detected !== delimiter) {
        setDelimiterState(detected);
      }
    }

    try {
      const res = parseCsv(csv, effectiveDelimiter);
      if (res.errors.length) {
        setError('CSV could not be parsed');
      } else {
        setError('');
      }
      setData(res.data);
      if (res.data.length) {
        const cols = Object.keys(res.data[0]);
        setHeaders(cols);
        setAlignment((prev) => {
          if (prev.length === cols.length) return prev;
          const next = cols.map((_, i) => prev[i] ?? 'left');
          return next;
        });
      } else {
        setHeaders([]);
        setAlignment([]);
      }
    } catch {
      setError('CSV could not be parsed');
    }
  }, [csv, delimiter]);

  useEffect(() => {
    if (data.length) {
      setMarkdown(generateMarkdownTable(data, alignment));
    } else {
      setMarkdown('');
    }
  }, [data, alignment]);

  const uploadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCsv(String(reader.result || ''));
    };
    reader.onerror = () => {
      setError('Could not read the selected file');
    };
    reader.readAsText(file);
  }, []);

  const toggleAlignment = (index: number) => {
    setAlignment((prev) =>
      prev.map((a, i) => {
        if (i !== index) return a;
        if (a === 'left') return 'center';
        if (a === 'center') return 'right';
        return 'left';
      }),
    );
  };

  const copyMarkdown = useCallback(async () => {
    if (!markdown) return;
    const ok = await copyText(markdown);
    setCopyStatus(ok ? 'success' : 'error');
  }, [markdown]);

  const downloadMarkdown = useCallback(() => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown]);

  return {
    csv,
    setCsv,
    uploadFile,
    delimiter,
    setDelimiter,
    data,
    headers,
    alignment,
    toggleAlignment,
    markdown,
    copyMarkdown,
    copyStatus,
    downloadMarkdown,
    error,
  };
};

export default useCsvtomd;
