/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { ParsedCookie } from '../model/cookieScope';

interface Props {
  cookies: ParsedCookie[];
  search: string;
  setSearch: (v: string) => void;
  showHttpOnly: boolean;
  setShowHttpOnly: (v: boolean) => void;
  duplicates: Set<string>;
  conflicts: Set<string>;
  sameSiteMismatch: Set<string>;
  exportJson: () => void;
  exportHar: () => void;
  copy: (text: string) => void;
  toastMessage: string;
}

export function CookieScopeView({
  cookies,
  search,
  setSearch,
  showHttpOnly,
  setShowHttpOnly,
  duplicates,
  conflicts,
  sameSiteMismatch,
  exportJson,
  exportHar,
  copy,
  toastMessage,
}: Props) {
  const getRowClassName = (name: string) =>
    [
      duplicates.has(name) && 'bg-yellow-50 dark:bg-yellow-900',
      conflicts.has(name) && 'bg-red-50 dark:bg-red-900',
      sameSiteMismatch.has(name) && 'bg-orange-50 dark:bg-orange-900',
    ]
      .filter(Boolean)
      .join(' ');
  return (
    <div className={TOOL_PANEL_CLASS}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Cookie Scope</h2>
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2">
        <input
          type="text"
          aria-label="Search cookies"
          className="border px-3 py-2 rounded flex-1 dark:bg-gray-700 dark:text-gray-200 focus:ring"
          placeholder="Search cookies"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label htmlFor="toggle-httpOnly" className="inline-flex items-center text-sm text-gray-700 dark:text-gray-200">
          <input
            id="toggle-httpOnly"
            type="checkbox"
            checked={showHttpOnly}
            onChange={(e) => setShowHttpOnly(e.target.checked)}
            className="mr-2"
          />
          Show HttpOnly
        </label>
        <button
          type="button"
          className="px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:ring"
          onClick={exportJson}
        >
          Download JSON
        </button>
        <button
          type="button"
          className="px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:ring"
          onClick={exportHar}
        >
          Download HAR
        </button>
        <button
          type="button"
          className="px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:ring"
          onClick={() => copy(JSON.stringify(cookies, null, 2))}
        >
          Copy JSON
        </button>
      </div>
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
          {toastMessage}
        </div>
      )}
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200">
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
            <tr>
              <th className="px-2 py-1">Name</th>
              <th className="px-2 py-1">Value</th>
              <th className="px-2 py-1">Domain</th>
              <th className="px-2 py-1">Path</th>
              <th className="px-2 py-1">SameSite</th>
              <th className="px-2 py-1">Secure</th>
              <th className="px-2 py-1">HttpOnly</th>
              <th className="px-2 py-1">Accessible</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((c) => (
              <tr
                key={`${c.name}-${c.domain ?? 'd'}-${c.path ?? 'p'}`}
                className={`border-b dark:border-gray-700 ${getRowClassName(c.name)}`}
              >
                <td className="px-2 py-1 break-all">{c.name}</td>
                <td className="px-2 py-1 break-all">{c.value}</td>
                <td className="px-2 py-1">{c.domain ?? '-'}</td>
                <td className="px-2 py-1">{c.path ?? '-'}</td>
                <td className="px-2 py-1">{c.sameSite ?? '-'}</td>
                <td className="px-2 py-1">{c.secure ? 'Yes' : 'No'}</td>
                <td className="px-2 py-1">{c.httpOnly ? 'Yes' : 'No'}</td>
                <td className="px-2 py-1">{c.accessible ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {cookies.length === 0 && (
              <tr>
                <td className="px-2 py-4 text-center" colSpan={8}>
                  No cookies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CookieScopeView;
