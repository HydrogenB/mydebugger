/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Badge } from '../../../design-system/components/display/Badge';
import { Button } from '../../../design-system/components/inputs/Button';
import { Card } from '../../../design-system/components/layout/Card';
import { Tooltip } from '../../../design-system/components/overlays/Tooltip';
import { InfoBox } from '../../../design-system/components/display/InfoBox';
import { DeviceTraceResult } from '../types';

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
  clear: () => void;
  copyJson: () => void;
  exportJson: () => void;
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
  clear,
  copyJson,
  exportJson,
}: Props) {
  return (
    <div className={`${TOOL_PANEL_CLASS} mx-auto max-w-screen-lg overflow-x-auto box-border`}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex-1">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="trace-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                URL
                <Tooltip content="Starting URL to trace" className="ml-1">
                  <span className="cursor-help">ℹ️</span>
                </Tooltip>
              </span>
            </label>
            <input
              id="trace-url"
              className="mt-1 w-full border px-2 py-1 rounded"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={run} isDisabled={loading}>Trace</Button>
            <Button variant="secondary" onClick={clear}>Clear</Button>
          </div>
        </div>

        <fieldset className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="ios-app" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                iOS App ID
                <Tooltip content="App Store ID used to detect install" className="ml-1">
                  <span className="cursor-help">ℹ️</span>
                </Tooltip>
              </span>
            </label>
            <input
              id="ios-app"
              className="mt-1 w-full border px-2 py-1 rounded"
              placeholder="1234567890"
              value={iosAppId}
              onChange={(e) => setIosAppId(e.target.value)}
            />
          </div>
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="android-package" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                Android Package
                <Tooltip content="Package name of your Android app" className="ml-1">
                  <span className="cursor-help">ℹ️</span>
                </Tooltip>
              </span>
            </label>
            <input
              id="android-package"
              className="mt-1 w-full border px-2 py-1 rounded"
              placeholder="com.example.app"
              value={androidPackage}
              onChange={(e) => setAndroidPackage(e.target.value)}
            />
          </div>
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="scheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                Deep Link Scheme
                <Tooltip content="e.g. myapp://" className="ml-1">
                  <span className="cursor-help">ℹ️</span>
                </Tooltip>
              </span>
            </label>
            <input
              id="scheme"
              className="mt-1 w-full border px-2 py-1 rounded"
              placeholder="myapp"
              value={deepLinkScheme}
              onChange={(e) => setDeepLinkScheme(e.target.value)}
            />
          </div>
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="hops" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                Max Hops
                <Tooltip content="Stop tracing after this many redirects" className="ml-1">
                  <span className="cursor-help">ℹ️</span>
                </Tooltip>
              </span>
            </label>
            <input
              id="hops"
              type="number"
              className="mt-1 w-full border px-2 py-1 rounded"
              placeholder="20"
              value={maxHops}
              onChange={(e) => setMaxHops(Number(e.target.value))}
              min={1}
              max={50}
            />
          </div>
        </fieldset>

        {error && <div className="text-red-600" aria-live="polite">{error}</div>}

        {result && (
          <div className="space-y-4">
            <h3 className="font-bold mb-2">Showing {result.overallTimeMs}ms</h3>
            {result.results.map((r) => (
              <Card key={r.scenario} shadowed>
                <Card.Header
                  title={<span className="flex items-center gap-2"><span>{r.name}</span><Badge variant={r.isValidOutcome ? 'success' : 'warning'} size="sm" pill>{r.status}</Badge></span>}
                />
                <Card.Body padded={false} className="overflow-x-auto p-2">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-1 text-left">Hop</th>
                        <th className="px-2 py-1 text-left">URL</th>
                        <th className="px-2 py-1 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {r.hops.map((h) => (
                        <tr key={h.n} className="border-b">
                          <td className="px-2 py-1">{h.n}</td>
                          <td className="px-2 py-1 break-all">{h.url}</td>
                          <td className="px-2 py-1">{h.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.deep_link && (
                    <p className="mt-2 text-sm break-all font-mono">Deep Link: <code>{r.deep_link}</code></p>
                  )}
                  {r.final_url && r.final_url !== r.deep_link && (
                    <p className="mt-1 text-sm break-all font-mono">Final URL: <code>{r.final_url}</code></p>
                  )}
                  {r.warnings.length > 0 && (
                    <div className="mt-2">
                      <InfoBox title="Warning" variant="warning" icon="⚠️">
                        {r.warnings.join(', ')}
                      </InfoBox>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="secondary" onClick={copyJson}>Copy JSON</Button>
              <Button size="sm" variant="secondary" onClick={exportJson}>Download</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeviceTraceView;
