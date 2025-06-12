/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { GroupedResults } from '../viewmodel/useCacheInspector';

interface Props {
  grouped: GroupedResults[];
  loading: boolean;
  exportJson: () => void;
}

export function CacheInspectorView({ grouped, loading, exportJson }: Props) {
  return (
    <div className={TOOL_PANEL_CLASS}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cache Inspector</h2>
        <button
          type="button"
          className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
          onClick={exportJson}
        >
          Export JSON
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
