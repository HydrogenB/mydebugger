/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { Badge } from '../src/design-system/components/display/Badge';
import { Button } from '../src/design-system/components/inputs/Button';
import { DeviceTraceResult, ScenarioResult } from '../src/tools/linktracer/types';

interface Props {
  url: string;
  setUrl: (v: string) => void;
  iosAppId: string;
  setIosAppId: (v: string) => void;
  androidPackage: string;
  setAndroidPackage: (v: string) => void;
  deepLinkScheme: string;
  setDeepLinkScheme: (v: string) => void;
  maxHops: number;
  setMaxHops: (v: number) => void;
  loading: boolean;
  result: DeviceTraceResult | null;
  error: string;
  run: () => void;
  copyJson: () => void;
  exportJson: () => void;
}

function ScenarioTable({ data }: { data: ScenarioResult }) {
  return (
    <details className="border rounded mb-4">
      <summary className="cursor-pointer px-2 py-1 font-medium flex items-center gap-2">
        <span>{data.name}</span>
        <Badge variant={data.isValidOutcome ? 'success' : 'warning'} size="sm" pill>
          {data.status}
        </Badge>
      </summary>
      <div className="overflow-x-auto p-2">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-2 py-1 text-left">Hop</th>
            <th className="px-2 py-1 text-left">URL</th>
            <th className="px-2 py-1 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.hops.map((h) => (
            <tr key={h.n} className="border-b">
              <td className="px-2 py-1">{h.n}</td>
              <td className="px-2 py-1 break-all">{h.url}</td>
              <td className="px-2 py-1">{h.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.deep_link && (
        <p className="mt-2 text-sm break-all">
          Deep Link: <code>{data.deep_link}</code>
        </p>
      )}
      {data.final_url && data.final_url !== data.deep_link && (
        <p className="mt-1 text-sm break-all">
          Final URL: <code>{data.final_url}</code>
        </p>
      )}
        {data.warnings.length > 0 && (
          <p className="mt-1 text-sm text-yellow-700">
            Warnings: {data.warnings.join(', ')}
          </p>
        )}
      </div>
    </details>
  );
}

export function DeviceTraceView({
  url,
  setUrl,
  iosAppId,
  setIosAppId,
  androidPackage,
  setAndroidPackage,
  deepLinkScheme,
  setDeepLinkScheme,
  maxHops,
  setMaxHops,
  loading,
  result,
  error,
  run,
  copyJson,
  exportJson,
}: Props) {
  return (
    <div className={TOOL_PANEL_CLASS}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            className="flex-1 border px-2 py-1 rounded"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            className="border px-2 py-1 rounded"
            placeholder="iOS App ID"
            value={iosAppId}
            onChange={(e) => setIosAppId(e.target.value)}
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Android Package"
            value={androidPackage}
            onChange={(e) => setAndroidPackage(e.target.value)}
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Deep Link Scheme"
            value={deepLinkScheme}
            onChange={(e) => setDeepLinkScheme(e.target.value)}
          />
          <input
            type="number"
            className="border px-2 py-1 rounded"
            placeholder="Max Hops"
            value={maxHops}
            onChange={(e) => setMaxHops(Number(e.target.value))}
            min={1}
            max={50}
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {result && (
          <div>
            <h3 className="font-bold mb-2">Results ({result.overallTimeMs}ms)</h3>
            {result.results.map((r) => (
              <ScenarioTable key={r.scenario} data={r} />
            ))}
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={copyJson} variant="secondary">Copy JSON</Button>
              <Button size="sm" onClick={exportJson} variant="secondary">Download</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeviceTraceView;
