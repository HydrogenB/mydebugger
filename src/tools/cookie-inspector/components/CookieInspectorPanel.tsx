/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { CookieInfo } from '../lib/cookies';

interface Props {
  cookies: CookieInfo[];
  filter: string;
  setFilter: (v: string) => void;
  exportJson: () => void;
  expanded: Record<string, boolean>;
  toggleExpand: (name: string) => void;
  copy: (text: string, label: string) => void;
  toastMessage: string;
}

export function CookieInspectorView({
  cookies,
  filter,
  setFilter,
  exportJson,
  expanded,
  toggleExpand,
  copy,
  toastMessage,
}: Props) {
  return (
    <div className={TOOL_PANEL_CLASS}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Cookie Inspector</h2>
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full mr-4 dark:bg-gray-700 dark:text-gray-200"
          placeholder="Filter cookies"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          type="button"
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          onClick={exportJson}
        >
          Export JSON
        </button>
      </div>
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
          {toastMessage}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200">
          <thead>
            <tr>
              <th className="px-2 py-1">Name</th>
              <th className="px-2 py-1">Value</th>
              <th className="px-2 py-1">Domain</th>
              <th className="px-2 py-1">Path</th>
              <th className="px-2 py-1">Expiry</th>
              <th className="px-2 py-1">Size</th>
              <th className="px-2 py-1">Secure</th>
              <th className="px-2 py-1">HttpOnly</th>
              <th className="px-2 py-1">SameSite</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((c) => (
              <tr key={c.name} className="border-b dark:border-gray-700">
                <td className="px-2 py-1 font-medium">
                  <button type="button" onClick={() => copy(c.name, 'Cookie name')} className="mr-2 hover:underline text-blue-600">
                    {c.name}
                  </button>
                </td>
                <td className="px-2 py-1 break-all">
                  {c.accessible ? (
                    (() => {
                      const truncated = c.value.length > 40 ? `${c.value.slice(0, 40)}…` : c.value;
                      const toShow = expanded[c.name] ? c.value : truncated;
                      return (
                        <>
                          {toShow}
                          {c.value.length > 40 && (
                            <button
                              type="button"
                              className="ml-1 text-xs text-blue-600 hover:underline"
                              onClick={() => toggleExpand(c.name)}
                            >
                              {expanded[c.name] ? 'Collapse' : 'Expand'}
                            </button>
                          )}
                          <button
                            type="button"
                            className="ml-2 text-xs text-blue-600 hover:underline"
                            onClick={() => copy(c.value, 'Cookie value')}
                          >
                            Copy
                          </button>
                        </>
                      );
                    })()
                  ) : (
                    'Inaccessible'
                  )}
                </td>
                <td className="px-2 py-1">{c.domain ?? '-'}</td>
                <td className="px-2 py-1">{c.path ?? '-'}</td>
                <td className="px-2 py-1">{c.expires ? new Date(c.expires).toLocaleString() : '-'}</td>
                <td className="px-2 py-1">{c.size}</td>
                <td className="px-2 py-1">{c.secure ? 'Yes' : 'No'}</td>
                <td className="px-2 py-1">{c.httpOnly ? 'Yes' : 'No'}</td>
                <td className="px-2 py-1">{c.sameSite ?? '-'}</td>
              </tr>
            ))}
            {cookies.length === 0 && (
              <tr>
                <td className="px-2 py-4" colSpan={9}>No cookies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CookieInspectorView;
