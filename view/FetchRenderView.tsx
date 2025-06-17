/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { ResponsiveContainer } from '../src/design-system/components/layout/ResponsiveContainer';

/* eslint-disable react/require-default-props */

interface Props {
  url: string;
  setUrl: (v: string) => void;
  delay: number;
  setDelay: (v: number) => void;
  run: () => void;
  loading: boolean;
  error: string;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  srcDoc?: string;
  rawHtml: string;
  renderedHtml: string;
  logs: string[];
  copyHtml: () => void;
  exportHtml: () => void;
}

export function FetchRenderView({
  url,
  setUrl,
  delay,
  setDelay,
  run,
  loading,
  error,
  iframeRef,
  srcDoc,
  rawHtml,
  renderedHtml,
  logs,
  copyHtml,
  exportHtml,
}: Props) {
  return (
    <ResponsiveContainer maxWidth="5xl" className="py-6">
      <div className={TOOL_PANEL_CLASS}>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Fetch &amp; Render</h2>
        <div className="space-y-4">
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="url" className="text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="delay" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Delay (s)
          </label>
          <input
            id="delay"
            type="number"
            min="0"
            max="10"
            value={delay}
            onChange={e => setDelay(Number(e.target.value))}
            className="border p-1 w-20 ml-2 rounded dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch & Render'}
        </button>
        {error && <div className="text-red-600" aria-live="polite">{error}</div>}
        {srcDoc && (
          <iframe ref={iframeRef} srcDoc={srcDoc} title="render" className="w-full h-64 border" />
        )}
        {rawHtml && (
          <div>
            <h3 className="font-semibold mb-1">Raw HTML</h3>
            <div className="rounded-md border bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto max-h-96 text-sm font-mono">
              <pre>{rawHtml}</pre>
            </div>
          </div>
        )}
        {renderedHtml && (
          <div>
            <h3 className="font-semibold mb-1">Rendered HTML</h3>
            <div className="rounded-md border bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto max-h-96 text-sm font-mono">
              <pre>{renderedHtml}</pre>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={copyHtml} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                Copy
              </button>
              <button type="button" onClick={exportHtml} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                Download
              </button>
            </div>
          </div>
        )}
        {logs.length > 0 && (
          <div>
            <h3 className="font-semibold">Console</h3>
            <pre className="rounded-md border bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto max-h-64 text-sm font-mono">{logs.join('\n')}</pre>
          </div>
        )}
        </div>
      </div>
    </ResponsiveContainer>
  );
}

export default FetchRenderView;
