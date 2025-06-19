/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Event Log View Component
 */
import React from 'react';
import { FiClock, FiCopy, FiTrash2, FiActivity } from 'react-icons/fi';
import { PermissionEvent } from '../model/permissions';
import { Button } from '../src/design-system/components/inputs/Button';
import { Card } from '../src/design-system/components/layout/Card';

interface EventLogProps {
  events: PermissionEvent[];
  onCopyLog: () => Promise<void>;
  onClearLog: () => void;
}

const getEventIcon = (action: PermissionEvent['action']) => {
  const className = "w-3 h-3";
  
  switch (action) {
    case 'request':
      return <FiClock className={className} />;
    case 'grant':
      return <span className="w-3 h-3 text-green-500">✓</span>;
    case 'deny':
      return <span className="w-3 h-3 text-red-500">✕</span>;
    case 'error':
      return <span className="w-3 h-3 text-orange-500">⚠</span>;
    default:
      return <FiActivity className={className} />;
  }
};

const getEventColor = (action: PermissionEvent['action']) => {
  switch (action) {
    case 'grant':
      return 'text-green-600 dark:text-green-400';
    case 'deny':
      return 'text-red-600 dark:text-red-400';
    case 'error':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

function EventLog({ events, onCopyLog, onClearLog }: EventLogProps) {
  return (
    <Card className="h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Event Log
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopyLog}
              disabled={events.length === 0}
            >
              <FiCopy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearLog}
              disabled={events.length === 0}
            >
              <FiTrash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <FiActivity className="w-8 h-8 mx-auto mb-2" />
            <p>No events yet</p>
            <p className="text-xs">Request permissions to see activity</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 text-sm"
              >
                <div className="mt-1">
                  {getEventIcon(event.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {event.permissionName}
                    </span>
                    <span className={`text-xs ${getEventColor(event.action)}`}>
                      {event.action}
                    </span>
                  </div>
                  {event.details && (
                    <p className="text-gray-600 dark:text-gray-400 truncate">
                      {event.details}
                    </p>
                  )}
                </div>
                <time className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </time>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {events.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          {events.length} events • Last 100 shown
        </div>
      )}
    </Card>
  );
}

export default EventLog;
