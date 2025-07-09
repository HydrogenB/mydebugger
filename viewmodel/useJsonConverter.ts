/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import {
  convertJsonToCsv,
  convertJsonToExcel,
  fetchJsonFromUrl,
  parseJson,
} from '../model/jsonConverter';

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

  const options = { flatten, header, eol: eol === 'LF' ? '\n' : '\r\n' } as const;

  const format = () => {
    try {
      const data = parseJson(input);
      setInput(JSON.stringify(data.length === 1 ? data[0] : data, null, 2));
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
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
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result || ''));
    reader.readAsText(file);
  };

  const fetchUrl = async () => {
    try {
      const text = await fetchJsonFromUrl(url);
      setInput(text);
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const convert = () => {
    try {
      const csv = convertJsonToCsv(input, options);
      setOutput(csv);
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  const downloadCsv = () => {
    try {
      const csv = convertJsonToCsv(input, options);
      const blob = new Blob([csv], { type: 'text/csv' });
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      a.download = `${filename || 'data'}.csv`;
      a.click();
      URL.revokeObjectURL(urlObj);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const downloadExcel = () => {
    try {
      convertJsonToExcel(input, `${filename || 'data'}.xlsx`, { flatten });
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return {
    input,
    setInput,
    url,
    setUrl,
    output,
    flatten,
    setFlatten,
    header,
    setHeader,
    eol,
    setEol,
    filename,
    setFilename,
    error,
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
