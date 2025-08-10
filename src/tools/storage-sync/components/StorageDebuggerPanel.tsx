/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { StorageEntry } from '../lib/storage';
import { StorageArea } from '../hooks/useStorageDebugger';

interface Props {
  tab: StorageArea;
  setTab: (a: StorageArea) => void;
  search: string;
  setSearch: (v: string) => void;
  entries: StorageEntry[];
  editEntry: (key: string, value: string, area: StorageArea) => void;
  removeEntry: (key: string, area: StorageArea) => void;
  exportJson: () => void;
  exportEnv: () => void;
  events: string[];
  highlights: Record<string, 'changed' | 'removed'>;
  diff: import('../lib/storage').DiffResult | null;
  requestDiff: () => void;
  isJsonValid: (v: string) => boolean;
}

export function StorageDebuggerView({
  tab,
  setTab,
  search,
  setSearch,
  entries,
  editEntry,
  removeEntry,
  exportJson,
  exportEnv,
  events,
  highlights,
  diff,
  requestDiff,
  isJsonValid,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <button
          type="button"
          onClick={() => setTab('localStorage')}
          className={
            tab === 'localStorage'
              ? 'px-3 py-1 bg-primary-500 text-white rounded'
              : 'px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded'
          }
        >
          LocalStorage
        </button>
        <button
          type="button"
          onClick={() => setTab('sessionStorage')}
          className={
            tab === 'sessionStorage'
              ? 'px-3 py-1 bg-primary-500 text-white rounded'
              : 'px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded'
          }
        >
          SessionStorage
        </button>
        <input
          type="text"
          aria-label="Search entries"
          placeholder="Search"
          className="border px-2 py-1 rounded w-full sm:w-48 dark:bg-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-1" />
        <button
          type="button"
          onClick={exportJson}
          className="px-3 py-1 bg-primary-500 text-white rounded"
          aria-label="export as JSON"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={exportEnv}
          className="px-3 py-1 bg-primary-500 text-white rounded"
          aria-label="export as env"
        >
          Export .env
        </button>
        <button
          type="button"
          onClick={requestDiff}
          className="px-3 py-1 bg-secondary-500 text-white rounded"
          aria-label="diff with other tab"
        >
          Diff Tabs
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr>
              <th className="px-2 py-1">Key</th>
              <th className="px-2 py-1">Value</th>
              <th className="px-2 py-1">Domain</th>
              <th className="px-2 py-1">Size</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.key}
                className={`border-b dark:border-gray-700 ${(() => {
                  if (highlights[`${tab}:${e.key}`] === 'changed') return 'bg-green-50 animate-pulse';
                  if (highlights[`${tab}:${e.key}`] === 'removed') return 'bg-red-50 animate-pulse';
                  return '';
                })()}`}
              >
                <td className="px-2 py-1 break-all">{e.key}</td>
                <td className="px-2 py-1">
                  <input
                    className="border p-1 w-full dark:bg-gray-800"
                    value={e.value}
                    onChange={(ev) => editEntry(e.key, ev.target.value, tab)}
                    aria-invalid={!isJsonValid(e.value)}
                  />
                </td>
                <td className="px-2 py-1">{e.domain}</td>
                <td className="px-2 py-1">{e.size}</td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() => removeEntry(e.key, tab)}
                    className="text-red-600 hover:underline"
                    aria-label={`remove ${e.key}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td className="px-2 py-2" colSpan={5}>
                  No entries
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {events.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
          <h3 className="font-bold mb-1">Events</h3>
          <ul className="text-xs space-y-1">
            {events.map((ev) => (
              <li key={ev}>{ev}</li>
            ))}
          </ul>
        </div>
      )}

      {diff && (
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded" aria-live="polite">
          <h3 className="font-bold mb-1">Diff Result</h3>
          <div className="text-xs">
            <p>{`Added: ${diff.added.length}, Removed: ${diff.removed.length}, Changed: ${diff.changed.length}`}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StorageDebuggerView;
