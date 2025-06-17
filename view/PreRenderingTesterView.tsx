/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { USER_AGENTS } from '../viewmodel/usePreRenderingTester';
import { Snapshot } from '../model/prerender';

interface Props {
  url: string;
  setUrl: (v: string) => void;
  agents: string[];
  toggleAgent: (id: string) => void;
  run: () => void;
  loading: boolean;
  error: string;
  results: Snapshot[];
  copyJson: () => void;
  exportJson: () => void;
}

export function PreRenderingTesterView({
  url,
  setUrl,
  agents,
  toggleAgent,
  run,
  loading,
  error,
  results,
  copyJson,
  exportJson,
}: Props) {
  return (
    <div className={TOOL_PANEL_CLASS}>
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Pre-rendering Tester</h2>
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
        <div className="flex flex-wrap gap-2">
          {Object.keys(USER_AGENTS).map(id => (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label key={id} className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={agents.includes(id)}
                onChange={() => toggleAgent(id)}
                className="mr-1"
              />
              {id}
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch'}
        </button>
        {error && <div className="text-red-600" aria-live="polite">{error}</div>}
        {results.length > 0 && (
          <div className="space-y-2">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-2 py-1 text-left">Agent</th>
                  <th className="px-2 py-1 text-left">Title</th>
                  <th className="px-2 py-1 text-left">Description</th>
                  <th className="px-2 py-1 text-left">H1</th>
                  <th className="px-2 py-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.userAgent} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-2 py-1 break-all">{r.userAgent}</td>
                    <td className="px-2 py-1 break-all">{r.title ?? '-'}</td>
                    <td className="px-2 py-1 break-all">{r.description ?? '-'}</td>
                    <td className="px-2 py-1 break-all">{r.h1 ?? '-'}</td>
                    <td className="px-2 py-1">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2">
              <button type="button" onClick={copyJson} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                Copy JSON
              </button>
              <button type="button" onClick={exportJson} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreRenderingTesterView;
