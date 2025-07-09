/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import { fetchJsonFromUrl, parseJson } from '../model/jsonConverter';
import { convertToCSV } from '../src/utils/convertToCSV';
import { exportToExcel } from '../src/utils/exportToExcel';

const EXAMPLE = [
  { name: 'Alice', age: 30, city: 'NY' },
  { name: 'Bob', age: 25, city: 'LA' },
];

export const useJsonConverter = () => {
  const [input, setInput] = useState('');
  const [url, setUrl] = useState('');
  const [output, setOutput] = useState('');
  const [flatten, setFlatten] = useState(false);
  const [header, setHeader] = useState(true);
  const [eol, setEol] = useState<'LF' | 'CRLF'>('LF');
  const [filename, setFilename] = useState('data');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState('');
  const [previewNotice, setPreviewNotice] = useState('');

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const options = { flatten, header, eol: eol === 'LF' ? '\n' : '\r\n' } as const;

  const validateSize = (size: number) => {
    if (size > MAX_SIZE) {
      setError('File too large! Limit = 10MB');
      setLoading(false);
      return false;
    }
    return true;
  };

  const parseAsync = (text: string, cb: (data: Record<string, unknown>[]) => void) => {
    if (!validateSize(text.length)) return;
    setLoading(true);
    setTimeout(() => {
      try {
        const data = parseJson(text);
        cb(data);
        setError('');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  const format = () => {
    parseAsync(input, (data) => {
      setInput(JSON.stringify(data.length === 1 ? data[0] : data, null, 2));
    });
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const loadExample = () => {
    setInput(JSON.stringify(EXAMPLE, null, 2));
    setError('');
  };

  const uploadFile = (file: File) => {
    if (!validateSize(file.size)) return;
    const reader = new FileReader();
    setFileInfo(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    reader.onload = () => setInput(String(reader.result || ''));
    reader.readAsText(file);
  };

  const fetchUrl = async () => {
    setLoading(true);
    try {
      const text = await fetchJsonFromUrl(url);
      if (!validateSize(text.length)) return;
      setInput(text);
      setFileInfo(`${(text.length / 1024 / 1024).toFixed(2)}MB from URL`);
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const convert = () => {
    parseAsync(input, (data) => {
      if (data.length > 10000) {
        const csvPreview = convertToCSV(data.slice(0, 50), options);
        setOutput(csvPreview);
        setPreviewNotice('Showing first 50 rows');
      } else {
        setOutput(convertToCSV(data, options));
        setPreviewNotice('');
      }
    });
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  const downloadCsv = () => {
    parseAsync(input, (data) => {
      const csv = convertToCSV(data, options);
      const blob = new Blob([csv], { type: 'text/csv' });
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      a.download = `${filename || 'data'}.csv`;
      a.click();
      URL.revokeObjectURL(urlObj);
    });
  };

  const downloadExcel = () => {
    parseAsync(input, (data) => {
      exportToExcel(data, `${filename || 'data'}.xlsx`, { flatten });
    });
  };

  return {
    input,
    setInput,
    url,
    setUrl,
    output,
    previewNotice,
    flatten,
    setFlatten,
    header,
    setHeader,
    eol,
    setEol,
    filename,
    setFilename,
    error,
    fileInfo,
    loading,
    format,
    clear,
    loadExample,
    uploadFile,
    fetchUrl,
    convert,
    copyOutput,
    downloadCsv,
    downloadExcel,
  };
};

export default useJsonConverter;
