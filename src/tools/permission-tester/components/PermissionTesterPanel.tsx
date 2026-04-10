/**
 * © 2025 MyDebugger Contributors – MIT License
 * Main layout panel for the Permission Tester tool.
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Button } from '../../../design-system/components/inputs/Button';
import { TextInput } from '../../../design-system/components/inputs/TextInput';
import { InfoBox } from '../../../design-system/components/display/InfoBox';
import { PermissionTesterVM } from '../hooks/usePermissionTester';
import { PermissionCard } from './PermissionCard';
import { EventLog } from './EventLog';

// ---------------------------------------------------------------------------
// Category filter tabs
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🔐' },
  { id: 'media', label: 'Media', icon: '📷' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'sensors', label: 'Sensors', icon: '📱' },
  { id: 'device', label: 'Device', icon: '🔌' },
  { id: 'storage', label: 'Storage', icon: '💾' },
  { id: 'system', label: 'System', icon: '⚙️' },
];

// ---------------------------------------------------------------------------
// Stat chip
// ---------------------------------------------------------------------------
function StatChip({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${colour}`}>
      <span className="text-2xl font-bold leading-none">{value}</span>
      <span className="text-xs mt-1 font-medium opacity-80">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PermissionTesterPanel(vm: PermissionTesterVM) {
  const {
    filteredPermissions,
    events,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    stats,
    requestPermission,
    togglePreview,
    toggleCode,
    copyCode,
    clearEvents,
    copyEventLog,
    exportResults,
    retryDenied,
  } = vm;

  return (
    <div className={`${TOOL_PANEL_CLASS} space-y-6`}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold heading-gradient">Web Permission Tester</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Request, inspect, and preview browser permissions with live data and code snippets.
          </p>
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-3">
          <StatChip
            label="Granted"
            value={stats.granted}
            colour="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
          />
          <StatChip
            label="Denied"
            value={stats.denied}
            colour="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          />
          <StatChip
            label="Unsupported"
            value={stats.unsupported}
            colour="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          />
          <StatChip
            label="Total"
            value={stats.total}
            colour="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          />
        </div>

        {/* Smart status messages */}
        {stats.granted === stats.total && stats.total > 0 && (
          <InfoBox title="All permissions granted!" variant="success">
            Great — every permission has been granted on this browser.
          </InfoBox>
        )}
        {stats.denied > stats.total / 2 && (
          <InfoBox title="Many permissions denied" variant="warning">
            Over half the permissions are denied. Use the retry buttons or open browser settings to re-enable them.
          </InfoBox>
        )}
      </div>

      {/* ── Two-column layout (cards + sidebar) ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        {/* ── Left: filters + grid ─────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <TextInput
            id="permission-search"
            placeholder="Search permissions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth
          />

          {/* No results */}
          {filteredPermissions.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No permissions match your search.
            </p>
          )}

          {/* Permission grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPermissions.map(pState => (
              <PermissionCard
                key={pState.def.id}
                pState={pState}
                onRequest={requestPermission}
                onTogglePreview={togglePreview}
                onToggleCode={toggleCode}
                onCopyCode={copyCode}
              />
            ))}
          </div>

          {/* Footer quick actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button
              size="sm"
              variant="warning"
              onClick={retryDenied}
              isDisabled={stats.denied === 0}
            >
              Retry All Denied ({stats.denied})
            </Button>
            <Button size="sm" variant="secondary" onClick={exportResults}>
              Export Results JSON
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open('about:settings', '_blank')}
            >
              Open Browser Settings ↗
            </Button>
          </div>

          {/* Permissions-Policy hint */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Permissions-Policy header examples
            </p>
            <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
{`# Block camera and microphone for all origins:
Permissions-Policy: camera=(), microphone=()

# Allow geolocation only for same origin:
Permissions-Policy: geolocation=(self)

# Allow screen capture for specific origins:
Permissions-Policy: display-capture=(self "https://partner.example")`}
            </pre>
          </div>
        </div>

        {/* ── Right: Event log ─────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-4 h-[600px] lg:h-[80vh]">
          <EventLog
            events={events}
            onCopy={copyEventLog}
            onClear={clearEvents}
          />
        </div>
      </div>
    </div>
  );
}
