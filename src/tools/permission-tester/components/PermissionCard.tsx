/**
 * © 2025 MyDebugger Contributors – MIT License
 * Single-permission card: status badge, request button, code snippet, live preview.
 */
import React from 'react';
import { Card } from '../../../design-system/components/layout/Card';
import { Badge } from '../../../design-system/components/display/Badge';
import { Button } from '../../../design-system/components/inputs/Button';
import { InfoBox } from '../../../design-system/components/display/InfoBox';
import { PermissionState } from '../hooks/usePermissionTester';
import { generateCodeSnippet, revokePermissionGuidance } from '../lib/permissions';
import { LivePreview } from './LivePreview';

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  PermissionState['status'],
  { label: string; variant: 'success' | 'danger' | 'warning' | 'secondary' | 'info' }
> = {
  granted: { label: 'Granted', variant: 'success' },
  denied: { label: 'Denied', variant: 'danger' },
  loading: { label: 'Requesting…', variant: 'info' },
  unsupported: { label: 'Unsupported', variant: 'secondary' },
  idle: { label: 'Not Tested', variant: 'warning' },
};

// ---------------------------------------------------------------------------
// Category colour pill
// ---------------------------------------------------------------------------
const CATEGORY_COLORS: Record<string, string> = {
  media: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  location: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  sensors: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  device: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  storage: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  system: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface PermissionCardProps {
  pState: PermissionState;
  onRequest: (id: string) => void;
  onTogglePreview: (id: string) => void;
  onToggleCode: (id: string) => void;
  onCopyCode: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PermissionCard({
  pState,
  onRequest,
  onTogglePreview,
  onToggleCode,
  onCopyCode,
}: PermissionCardProps) {
  const { def, status, error, data, showPreview, showCode } = pState;
  const cfg = STATUS_CONFIG[status];
  const snippet = generateCodeSnippet(def.id);
  const guide = status === 'denied' ? revokePermissionGuidance(def.id) : null;

  const canRequest = status === 'idle' || status === 'denied';
  const isLoading = status === 'loading';

  return (
    <Card className="flex flex-col h-full" shadowed bordered>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0" aria-hidden="true">{def.icon}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">
                {def.displayName}
              </h3>
              <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${CATEGORY_COLORS[def.category]}`}>
                {def.category}
              </span>
            </div>
          </div>
          <Badge variant={cfg.variant} size="sm" className="flex-shrink-0 whitespace-nowrap">
            {cfg.label}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {def.description}
        </p>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Error message */}
        {error && status !== 'denied' && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-2 break-words">
            {error}
          </p>
        )}

        {/* Revoke guidance */}
        {status === 'denied' && guide && (
          <InfoBox title="How to re-enable" variant="warning">
            {guide}
          </InfoBox>
        )}

        {/* Live preview */}
        {status === 'granted' && def.hasLivePreview && !!data && (
          <div className="space-y-2">
            <button
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              onClick={() => onTogglePreview(def.id)}
            >
              <span>{showPreview ? '▾' : '▸'}</span>
              {showPreview ? 'Hide Preview' : 'Show Live Preview'}
            </button>
            {showPreview && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <LivePreview id={def.id} data={data} />
              </div>
            )}
          </div>
        )}

        {/* Code snippet toggle */}
        <div className="space-y-2">
          <button
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline"
            onClick={() => onToggleCode(def.id)}
          >
            <span>{showCode ? '▾' : '▸'}</span>
            {showCode ? 'Hide Code' : 'Show Code Snippet'}
          </button>
          {showCode && (
            <div className="relative">
              <pre className="text-xs font-mono bg-gray-900 text-green-300 rounded-lg p-3 overflow-auto max-h-40 leading-relaxed">
                {snippet}
              </pre>
              <button
                onClick={() => onCopyCode(def.id)}
                className="absolute top-2 right-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-0.5 transition-colors"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer / Action ─────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        {status === 'unsupported' ? (
          <Button size="sm" variant="secondary" isDisabled className="w-full">
            Not Supported
          </Button>
        ) : status === 'granted' ? (
          <Button size="sm" variant="success" isDisabled className="w-full">
            ✓ Granted
          </Button>
        ) : (
          <Button
            size="sm"
            variant={status === 'denied' ? 'warning' : 'primary'}
            onClick={() => onRequest(def.id)}
            isLoading={isLoading}
            isDisabled={isLoading}
            className="w-full"
          >
            {status === 'denied' ? 'Retry Request' : 'Request Permission'}
          </Button>
        )}
      </div>
    </Card>
  );
}
