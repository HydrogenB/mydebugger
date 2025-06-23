/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Permission Tester Main View Component
 */
import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import type { UsePermissionTesterReturn } from '../viewmodel/usePermissionTester';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import PermissionCard from './PermissionCard';
import EventLog from './EventLog';

type PermissionTesterViewProps = UsePermissionTesterReturn;

function PermissionTesterView({
  filteredPermissions,
  events,
  searchQuery,
  setSearchQuery,
  requestPermission,
  retryPermission,
  copyCodeSnippet,
  copyEventLog,
  clearEvents,
  getCodeSnippet,
  isLoading,
  getPermissionData,
  clearPermissionData,
  testNotification
}: PermissionTesterViewProps) {
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={TOOL_PANEL_CLASS}>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Web Permission Tester
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Test and inspect browser permissions with live previews and code snippets.
              Click Request to trigger permission prompts and view real-time data.
            </p>
          </div>
          
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Info */}
          {searchQuery && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiFilter className="w-4 h-4" />
              <span>
                {filteredPermissions.length} permissions match &ldquo;{searchQuery}&rdquo;
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Permission Cards Grid */}
        <div className="xl:col-span-3">
          {filteredPermissions.length === 0 ? (
            <div className={`${TOOL_PANEL_CLASS} text-center py-12`}>
              <FiSearch className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No permissions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery 
                  ? `No permissions match "${searchQuery}". Try a different search term.`
                  : 'No permissions available.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPermissions.map((permission) => (
                <PermissionCard
                  key={permission.permission.name}
                  permission={permission}
                  onRequest={() => requestPermission(permission.permission.name)}
                  onRetry={() => retryPermission(permission.permission.name)}
                  onCopyCode={() => copyCodeSnippet(permission.permission.name)}
                  codeSnippet={getCodeSnippet(permission.permission.name)}
                  isLoading={isLoading(permission.permission.name)}
                  permissionData={getPermissionData(permission.permission.name)}
                  onClearData={() => clearPermissionData(permission.permission.name)}
                  onTestNotification={
                    permission.permission.name === 'notifications'
                      ? testNotification
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Event Log Sidebar */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <EventLog
              events={events}
              onCopyLog={copyEventLog}
              onClearLog={clearEvents}
            />
          </div>
        </div>
      </div>

      {/* Permissions Policy Demo */}
      <div className={TOOL_PANEL_CLASS}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Permissions Policy Examples
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Control permission access using Permissions Policy headers:
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Block Camera Access
            </h4>
          </div>
          <pre className="p-4 text-sm overflow-x-auto">
            <code className="text-gray-800 dark:text-gray-200">
              Permissions-Policy: camera=()
            </code>
          </pre>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden mt-3">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Allow Geolocation for Self Only
            </h4>
          </div>
          <pre className="p-4 text-sm overflow-x-auto">
            <code className="text-gray-800 dark:text-gray-200">
              Permissions-Policy: geolocation=(self)
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default PermissionTesterView;
