/**
 * © 2025 MyDebugger Contributors – MIT License
 * Sticky event log sidebar for the Permission Tester.
 */
import React from 'react';
import { Button } from '../../../design-system/components/inputs/Button';
import { EventEntry, EventAction } from '../hooks/usePermissionTester';

// ---------------------------------------------------------------------------
// Action icon + colour
// ---------------------------------------------------------------------------
const ACTION_STYLE: Record<EventAction, { icon: string; colour: string }> = {
  request: { icon: '⏳', colour: 'text-blue-500' },
  grant:   { icon: '✅', colour: 'text-green-500' },
  deny:    { icon: '🚫', colour: 'text-red-500' },
  error:   { icon: '⚠️', colour: 'text-yellow-500' },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface EventLogProps {
  events: EventEntry[];
  onCopy: () => void;
  onClear: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function EventLog({ events, onCopy, onClear }: EventLogProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📋</span> Event Log
          {events.length > 0 && (
            <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full px-2 py-0.5">
              {events.length}
            </span>
          )}
        </h3>
        <div className="flex gap-1.5">
          <Button size="xs" variant="ghost" onClick={onCopy} isDisabled={events.length === 0}>
            Copy
          </Button>
          <Button size="xs" variant="ghost" onClick={onClear} isDisabled={events.length === 0}>
            Clear
          </Button>
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-sm text-gray-400 dark:text-gray-500">No events yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Request a permission to see activity here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {events.map(entry => {
              const style = ACTION_STYLE[entry.action];
              return (
                <li key={entry.id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0 mt-0.5">{style.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1 flex-wrap">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                          {entry.permissionName}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {entry.ts.toLocaleTimeString()}
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium capitalize ${style.colour}`}>
                        {entry.action}
                      </span>
                      {entry.detail && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 break-words leading-relaxed">
                          {entry.detail}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {events.length >= 100 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500 text-center flex-shrink-0">
          Showing last 100 events
        </div>
      )}
    </div>
  );
}
