/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState, useMemo } from 'react';
import {
  runCorsPreflight,
  CorsResult,
  generateCurlCommand,
  analyzeCors,
  CorsAnalysis,
} from '../model/cors';

const presets: Record<string, Record<string, string>> = {
  Authorization: { Authorization: 'Bearer <token>' },
  'Content-Type': { 'Content-Type': 'application/json' },
  'X-Custom': { 'X-Custom': 'test' },
};

export const useCorsTester = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headerJson, setHeaderJson] = useState('{}');
  const [result, setResult] = useState<CorsResult | null>(null);
  const [analysis, setAnalysis] = useState<CorsAnalysis | null>(null);
  const [error, setError] = useState('');

  const runTest = async () => {
    setError('');
    setResult(null);
    setAnalysis(null);
    let headers: Record<string, string> = {};
    try {
      headers = JSON.parse(headerJson || '{}');
    } catch {
      setError('Invalid JSON for headers');
      return;
    }
    try {
      const res = await runCorsPreflight(url, method, headers);
      setResult(res);
      setAnalysis(analyzeCors(res, window.location.origin, headers));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const addPreset = (key: string) => {
    const preset = presets[key];
    if (!preset) return;
    try {
      const obj = JSON.parse(headerJson || '{}');
      Object.assign(obj, preset);
      setHeaderJson(JSON.stringify(obj, null, 2));
    } catch {
      setError('Invalid JSON for headers');
    }
  };

  const curlCommand = useMemo(() => {
    const headers = (() => {
      try {
        return JSON.parse(headerJson || '{}');
      } catch {
        return {};
      }
    })();
    return generateCurlCommand(url, method, headers);
  }, [url, method, headerJson]);

  return {
    url,
    setUrl,
    method,
    setMethod,
    headerJson,
    setHeaderJson,
    addPreset,
    runTest,
    result,
    analysis,
    curlCommand,
    error,
  };
};

export default useCorsTester;
