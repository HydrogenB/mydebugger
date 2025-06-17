/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { GroupedResults, CacheSummary } from '../viewmodel/useCacheInspector';

interface Props {
  grouped: GroupedResults[];
  loading: boolean;
  summary: CacheSummary;
  exportJson: () => void;
  exportCsv: () => void;
  copyShareLink: () => void;
}

export function CacheInspectorView({
  grouped,
  loading,
  summary,
  exportJson,
  exportCsv,
  copyShareLink,
}: Props) {
  return (
    <div className={TOOL_PANEL_CLASS}>
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cache Inspector – Analyze HTTP Cache-Control, ETag, and CDN Behavior
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Inspect JavaScript, CSS, images, and API responses for cache status, max-age, and freshness using MyDebugger&apos;s Cache Inspector.
        </p>
      </header>
      <div className="mb-4 bg-gray-50 dark:bg-gray-900/20 p-3 rounded-md text-sm text-gray-800 dark:text-gray-200">
        <p className="font-semibold mb-1">📊 Cache Summary:</p>
        <ul className="space-y-1">
          <li>🔧 Scripts: {summary.counts.script} scanned | {summary.statusCounts.FRESH ?? 0} FRESH</li>
          <li>🎨 Styles: {summary.counts.style} files</li>
          <li>🖼️ Images: {summary.counts.image} total</li>
          <li>🔁 API Fetch: {summary.counts.fetch}</li>
        </ul>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
          onClick={exportJson}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
          onClick={exportCsv}
        >
          Export CSV
        </button>
        <button
          type="button"
          className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
          onClick={copyShareLink}
        >
          Copy Share Link
        </button>
      </div>
      {loading && <p className="text-gray-700 dark:text-gray-300">Analyzing...</p>}
      {!loading &&
        grouped.map((group) => (
          <details key={group.type} className="mb-4 border rounded">
            <summary className="cursor-pointer px-2 py-1 font-medium capitalize text-gray-800 dark:text-gray-200">
              {group.type}
            </summary>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-1">URL</th>
                    <th className="px-2 py-1">Cache-Control</th>
                    <th className="px-2 py-1">ETag</th>
                    <th className="px-2 py-1">Expires</th>
                    <th className="px-2 py-1">SW Caches</th>
                    <th className="px-2 py-1">Origin</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((r) => (
                    <tr key={r.url} className="border-b dark:border-gray-700">
                      <td className="px-2 py-1 break-all">{r.url}</td>
                      <td className="px-2 py-1 break-all">{r.cacheControlLabel ?? r.cacheControl ?? '-'}</td>
                      <td className="px-2 py-1 break-all">{r.etag ?? '-'}</td>
                      <td className="px-2 py-1 break-all">{r.expires ?? '-'}</td>
                      <td className="px-2 py-1 break-all">
                        {r.serviceWorkerCaches.length > 0 ? r.serviceWorkerCaches.join(', ') : '-'}
                      </td>
                      <td className="px-2 py-1 capitalize">{r.origin}</td>
                      <td className="px-2 py-1">
                        {(() => {
                          let cls = 'bg-gray-600';
                          if (r.status === 'FRESH') cls = 'bg-green-600';
                          else if (r.status === 'STALE') cls = 'bg-yellow-600';
                          else if (r.status === 'EXPIRED') cls = 'bg-red-600';
                          return (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs ${cls}`}>
                              {r.status}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-1 break-all text-xs text-red-600 dark:text-red-400">
                        {r.issues.join('; ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
    </div>
  );
}

export default CacheInspectorView;
