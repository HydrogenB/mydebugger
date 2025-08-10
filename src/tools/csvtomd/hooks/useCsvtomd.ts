/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useState } from 'react';
import { detectDelimiter, generateMarkdownTable, parseCsv } from '../lib/csvtomd';

export const useCsvtomd = () => {
  const [csv, setCsv] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [alignment, setAlignment] = useState<string[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!csv) {
      setData([]);
      setMarkdown('');
      setAlignment([]);
      return;
    }
    const detected = detectDelimiter(csv);
    setDelimiter((d) => (d === ',' ? detected : d));
    try {
      const res = parseCsv(csv, detected);
      if (res.errors.length) {
        setError('CSV could not be parsed');
      } else {
        setError('');
      }
      setData(res.data);
      if (res.data.length) {
        const cols = Object.keys(res.data[0]);
        setHeaders(cols);
        if (alignment.length === 0) {
          setAlignment(new Array(cols.length).fill('left'));
        }
      }
    } catch {
      setError('CSV could not be parsed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csv]);

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

  const copyMarkdown = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
  };

  const downloadMarkdown = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table.md';
    a.click();
    URL.revokeObjectURL(url);
  };

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
    downloadMarkdown,
    error,
  };
};

export default useCsvtomd;
