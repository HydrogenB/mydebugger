/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState } from 'react';
import { RedirectHop, OpenGraphPreview } from '../model/deepLinkChain';

interface Props {
  url: string;
  setUrl: (v: string) => void;
  chain: RedirectHop[];
  loading: boolean;
  error: string;
  run: () => void;
  exportJson: () => void;
  exportMarkdown: () => void;
  copyMarkdown: () => void;
  utmParams: Record<string, string>;
  openGraph: OpenGraphPreview | null;
}

export function DeepLinkChainView({
  url,
  setUrl,
  chain,
  loading,
  error,
  run,
  exportJson,
  exportMarkdown,
  copyMarkdown,
  utmParams,
  openGraph,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleChain =
    !expanded && chain.length > 6
      ? [...chain.slice(0, 2), ...chain.slice(-2)]
      : chain;

  const statusClass = (status?: number) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400) return 'text-red-600';
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border px-2 py-1 rounded"
          placeholder="https://example.com"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Trace
        </button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {chain.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left">Hop</th>
                <th className="px-2 py-1 text-left">URL</th>
                <th className="px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleChain.map((h) => {
                const realIndex = chain.indexOf(h);
                return (
                  <tr
                    key={`${h.url}-${realIndex}`}
                    className={`border-b ${realIndex === chain.length - 1 ? 'bg-green-50 dark:bg-green-900' : ''}`}
                  >
                    <td className="px-2 py-1">{realIndex + 1}</td>
                    <td className="px-2 py-1 break-all">{h.url}</td>
                    <td className={`px-2 py-1 ${statusClass(h.status)}`}>{h.status ?? '—'}</td>
                  </tr>
                );
              })}
              {!expanded && chain.length > visibleChain.length && (
                <tr>
                  <td colSpan={3} className="text-center py-1">
                    <button
                      type="button"
                      className="underline text-sm"
                      onClick={() => setExpanded(true)}
                    >
                      Show all {chain.length} hops
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={exportJson} className="text-sm underline">Export JSON</button>
            <button type="button" onClick={exportMarkdown} className="text-sm underline">Export Markdown</button>
            <button type="button" onClick={copyMarkdown} className="text-sm underline">Copy Markdown</button>
          </div>
        </div>
      )}
      {Object.keys(utmParams).length > 0 && (
        <div>
          <h3 className="font-bold">UTM Parameters</h3>
          <ul className="list-disc ml-5">
            {Object.entries(utmParams).map(([k, v]) => (
              <li key={k}><span className="font-mono">{k}</span>: {v}</li>
            ))}
          </ul>
        </div>
      )}
      {openGraph && (
        <div className="border rounded p-3 max-w-sm" aria-label="Open Graph preview">
          {openGraph.image && (
            <img src={openGraph.image} alt="Open Graph" className="w-full h-auto mb-2 rounded" />
          )}
          <div className="font-bold">{openGraph.title}</div>
          <div className="text-sm text-gray-500">{openGraph.domain}</div>
        </div>
      )}
    </div>
  );
}

export default DeepLinkChainView;

