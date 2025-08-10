/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState } from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { CodeBlock } from '../../../design-system/components/display/CodeBlock';
import { Button, SelectInput, TextInput } from '../../../design-system/components/inputs';
import { InfoBox } from '../../../design-system/components/display/InfoBox';
import { CorsResult, CorsAnalysis } from '../lib/cors';

interface Props {
  url: string;
  setUrl: (v: string) => void;
  method: string;
  setMethod: (v: string) => void;
  mode: 'browser' | 'server';
  setMode: (m: 'browser' | 'server') => void;
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
  mode,
  setMode,
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
  const [format, setFormat] = useState<'kv' | 'json'>('kv');
  const [preset, setPreset] = useState('');
  const parseHeaders = () => {
    try { return JSON.parse(headerJson || '{}'); } catch { return {}; }
  };

  return (
    <div className={`space-y-5 ${TOOL_PANEL_CLASS}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold heading-gradient">CORS Tester</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setHeaderJson('{}')}>Reset</Button>
          <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(curlCommand)}>Copy cURL</Button>
        </div>
      </div>
      <div className="space-y-4">
        <TextInput
          id="cors-url"
          label="Target URL"
          placeholder="https://api.example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <SelectInput
            id="cors-method"
            label="Method"
            value={method}
            onChange={setMethod}
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'DELETE', label: 'DELETE' },
              { value: 'PATCH', label: 'PATCH' },
            ]}
          />
          <SelectInput
            id="cors-mode"
            label="Mode"
            value={mode}
            onChange={(v) => setMode(v as 'browser' | 'server')}
            options={[
              { value: 'browser', label: 'Browser' },
              { value: 'server', label: 'Server curl' },
            ]}
          />
          <SelectInput
            id="cors-preset"
            label="Preset Headers"
            value={preset}
            onChange={(v) => { setPreset(''); addPreset(v); }}
            options={[
              { value: 'Authorization', label: 'Authorization' },
              { value: 'Content-Type', label: 'Content-Type' },
              { value: 'X-Custom', label: 'X-Custom' },
            ]}
            placeholder="Add header..."
          />
          <div className="self-end">
            <Button onClick={runTest} className="w-full">Run Preflight</Button>
          </div>
        </div>
      </div>
        <SelectInput
          id="header-format"
          label="Headers Format"
          value={format}
          onChange={(v) => setFormat(v as 'kv' | 'json')}
          options={[
            { value: 'kv', label: 'Key/Value' },
            { value: 'json', label: 'JSON' },
          ]}
        />
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Headers
        </label>
      {format === 'json' ? (
        <textarea
          className="border px-3 py-2 rounded w-full h-24 dark:bg-gray-700 dark:text-gray-200"
          placeholder='{"Content-Type": "application/json"}'
          value={headerJson}
          onChange={(e) => setHeaderJson(e.target.value)}
        />
      ) : (
        <div className="space-y-2">
          {Object.entries(parseHeaders()).map(([k, v], idx) => (
            <div key={k || idx} className="flex gap-2">
              <input
                className="border px-2 py-1 rounded w-1/2 dark:bg-gray-700 dark:text-gray-200"
                value={k}
                onChange={(e) => {
                  const entries = Object.entries(parseHeaders());
                  entries[idx][0] = e.target.value;
                  setHeaderJson(JSON.stringify(Object.fromEntries(entries), null, 2));
                }}
              />
              <input
                className="border px-2 py-1 rounded w-1/2 dark:bg-gray-700 dark:text-gray-200"
                value={v as string}
                onChange={(e) => {
                  const entries = Object.entries(parseHeaders());
                  entries[idx][1] = e.target.value;
                  setHeaderJson(JSON.stringify(Object.fromEntries(entries), null, 2));
                }}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              className="px-2 py-1 text-sm bg-primary-500 text-white rounded"
              onClick={() => {
                const entries = Object.entries(parseHeaders());
                entries.push(['', '']);
                setHeaderJson(JSON.stringify(Object.fromEntries(entries), null, 2));
              }}
            >
              Add header
            </button>
            <button
              type="button"
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-800 dark:text-gray-100 rounded"
              onClick={() => setHeaderJson('{}')}
            >
              Clear
            </button>
          </div>
        </div>
      )}
      {error && (
        <InfoBox title="Error" variant="error" className="mt-2">
          {error}
        </InfoBox>
      )}
      {result && (
        <>
          <h3 className="font-semibold text-lg">Results</h3>
          <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
              <tr className="bg-gray-50 dark:bg-gray-900">
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
                const rowClass = mismatchKey && mismatches[mismatchKey] ? 'bg-red-50 dark:bg-red-900/20' : '';
                return (
                  <React.Fragment key={k}>
                    <tr className={`border-b ${rowClass}`}>
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
          </div>
          {blockedBrowsers.length > 0 && (
            <div className="mt-2 text-sm text-red-700">
              Blocked browsers: {blockedBrowsers.join(', ')}
            </div>
          )}
          <details className="mt-4 summary-no-marker">
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
