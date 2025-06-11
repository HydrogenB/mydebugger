/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Badge } from '../src/design-system/components/display/Badge';
import { Button } from '../src/design-system/components/inputs/Button';
import { Card } from '../src/design-system/components/layout/Card';
import { LoadingSpinner } from '../src/design-system/components/feedback/LoadingSpinner';
import { HeaderAuditResult } from '../model/headerScanner';

interface Props {
  url: string;
  setUrl: (u: string) => void;
  results: HeaderAuditResult[];
  loading: boolean;
  error: string;
  copied: boolean;
  scan: () => void;
  copy: (text: string) => void;
  exportJson: () => void;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'ok':
      return <Badge variant="success" pill>✅</Badge>;
    case 'missing':
      return <Badge variant="danger" pill>❌</Badge>;
    default:
      return <Badge variant="warning" pill>⚠️</Badge>;
  }
};

export function HeaderScannerView({
  url,
  setUrl,
  results,
  loading,
  error,
  copied,
  scan,
  copy,
  exportJson,
}: Props) {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') scan();
  };
  return (
    <div className="space-y-6">
      <Card isElevated>
          <div className="space-y-4">
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="scan-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <div className="flex">
                <input
                  id="scan-url"
                  type="text"
                  className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                  placeholder="example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKey}
                  disabled={loading}
                />
                <Button onClick={scan} isLoading={loading} disabled={loading || !url} className="rounded-l-none">Scan</Button>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            {loading && (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            )}
            {results.length > 0 && !loading && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button size="sm" onClick={exportJson}>Export JSON</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((r) => (
                    <div key={r.name} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 dark:text-gray-100">{r.name}</span>
                        {statusBadge(r.status)}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 break-all font-mono">
                        {r.value ?? 'Not present'}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.fix}</p>
                      <button
                        type="button"
                        onClick={() => copy(r.value ?? '')}
                        className="self-start text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >{copied ? 'Copied' : 'Copy value'}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
  );
}

export default HeaderScannerView;
