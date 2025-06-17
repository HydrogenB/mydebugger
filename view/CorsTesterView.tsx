/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { CodeBlock } from '../src/design-system/components/display/CodeBlock';
import { CorsResult, CorsAnalysis } from '../model/cors';

interface Props {
  url: string;
  setUrl: (v: string) => void;
  method: string;
  setMethod: (v: string) => void;
  headerJson: string;
  setHeaderJson: (v: string) => void;
  runTest: () => void;
  addPreset: (key: string) => void;
  result: CorsResult | null;
  analysis: CorsAnalysis | null;
  curlCommand: string;
  error: string;
}

export function CorsTesterView({
  url,
  setUrl,
  method,
  setMethod,
  headerJson,
  setHeaderJson,
  runTest,
  addPreset,
  result,
  analysis,
  curlCommand,
  error,
}: Props) {
  const mismatches = analysis ? analysis.mismatches : { origin: false, method: false, headers: false, credentials: false };
  const guides = analysis?.guides || {};
  const blockedBrowsers = analysis?.blockedBrowsers || [];

  return (
    <div className={`space-y-4 ${TOOL_PANEL_CLASS}`}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">CORS Tester</h2>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
          placeholder="https://api.example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-200"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          className="border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-200"
          onChange={(e) => { addPreset(e.target.value); e.currentTarget.selectedIndex = 0; }}
        >
          <option value="">Add header...</option>
          {['Authorization', 'Content-Type', 'X-Custom'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          type="button"
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          onClick={runTest}
        >
          Run Preflight
        </button>
      </div>
      <textarea
        className="border px-3 py-2 rounded w-full h-24 dark:bg-gray-700 dark:text-gray-200"
        placeholder='{"Content-Type": "application/json"}'
        value={headerJson}
        onChange={(e) => setHeaderJson(e.target.value)}
      />
      {error && <div className="text-red-600">{error}</div>}
      {result && (
        <>
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr>
                <th className="px-2 py-1">Header</th>
                <th className="px-2 py-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.response.headers).map(([k, v]) => {
                const keyMap: Record<string, 'origin' | 'method' | 'headers' | 'credentials' | ''> = {
                  'access-control-allow-origin': 'origin',
                  'access-control-allow-methods': 'method',
                  'access-control-allow-headers': 'headers',
                  'access-control-allow-credentials': 'credentials',
                };
                const mismatchKey = keyMap[k] || '';
                const highlight = mismatchKey && mismatches[mismatchKey] ? 'text-red-600' : '';
                return (
                  <React.Fragment key={k}>
                    <tr className="border-b">
                      <td className="px-2 py-1 font-medium">{k}</td>
                      <td className={`px-2 py-1 ${highlight}`}>{v ?? '-'}</td>
                    </tr>
                    {mismatchKey && mismatches[mismatchKey] && (
                      <tr className="bg-red-50 text-xs text-red-600">
                        <td colSpan={2} className="px-2 py-1">{guides[mismatchKey]}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {blockedBrowsers.length > 0 && (
            <div className="mt-2 text-sm text-red-700">
              Blocked browsers: {blockedBrowsers.join(', ')}
            </div>
          )}
          <details className="mt-4">
            <summary className="cursor-pointer">Request Flow & cURL</summary>
            <CodeBlock className="mt-2 text-xs" maxHeight="16rem">
              {JSON.stringify(result, null, 2)}
            </CodeBlock>
            <div className="mt-2 flex items-center gap-2">
              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded text-xs break-all">{curlCommand}</code>
              <button
                type="button"
                className="px-2 py-1 bg-primary-500 text-white text-xs rounded"
                onClick={() => navigator.clipboard.writeText(curlCommand)}
              >
                Copy curl
              </button>
            </div>
          </details>
        </>
      )}
    </div>
  );
}

export default CorsTesterView;
