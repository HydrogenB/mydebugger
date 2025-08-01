/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Enhanced Permission Tester Main View Component with Stage Management
 */
import React, { useState } from 'react';
import { FiSearch, FiFilter, FiDownload, FiPlay } from 'react-icons/fi';

import type { UsePermissionTesterReturn } from '../viewmodel/usePermissionTester';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import PermissionCardEnhanced from './PermissionCardEnhanced';
import EventLog from './EventLog';
import { StageWrapper, StageIndicator } from '../src/shared/components/StageWrapper';

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
  testNotification,
  activePreview,
  setActivePreview,
  previewStates,
  updatePreviewState,
  isPreviewActive,
  stopPreview,
  exportResults,
  runBatchTest,
  permissionStats
}: PermissionTesterViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBatchActions, setShowBatchActions] = useState(false);
  
  // Get unique categories
  const categories = ['all', ...new Set(filteredPermissions.map(p => p.permission.category))];
  
  // Filter by category
  const categoryFilteredPermissions = selectedCategory === 'all' 
    ? filteredPermissions 
    : filteredPermissions.filter(p => p.permission.category === selectedCategory);

  const handleBatchTest = async () => {
    const testablePermissions = categoryFilteredPermissions
      .filter(p => p.status === 'prompt' || p.status === 'denied')
      .map(p => p.permission.name);
    
    if (testablePermissions.length > 0) {
      await runBatchTest(testablePermissions);
    }
  };
  
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
              Some permissions may require user interaction or specific browser features.
            </p>
          </div>

          {/* User Journey Guidance */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              🚀 How to Use Permission Tester
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <div>• <strong>Request:</strong> Click to trigger browser permission prompts</div>
              <div>• <strong>Preview:</strong> View live data when permission is granted</div>
              <div>• <strong>Denied?:</strong> Click &ldquo;How to Enable&rdquo; for step-by-step instructions</div>
              <div>• <strong>Retry:</strong> Try again after enabling permissions in browser settings</div>
              <div>• <strong>Code:</strong> Copy implementation snippets for your projects</div>
            </div>
          </div>
          
          {/* Enhanced Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="text-lg font-bold text-green-700 dark:text-green-400">{permissionStats.granted}</div>
              <div className="text-xs text-green-600 dark:text-green-500">Granted</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="text-lg font-bold text-red-700 dark:text-red-400">{permissionStats.denied}</div>
              <div className="text-xs text-red-600 dark:text-red-500">Denied</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{permissionStats.unsupported}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-500">Unsupported</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{permissionStats.total}</div>
              <div className="text-xs text-blue-600 dark:text-blue-500">Total</div>
            </div>
          </div>

          {/* Filter and Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleBatchTest}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                disabled={categoryFilteredPermissions.filter(p => p.status === 'prompt' || p.status === 'denied').length === 0}
              >
                <FiPlay size={14} />
                Test All
              </button>
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                <FiDownload size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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

          {/* Helpful Tips for Denied Permissions */}
          {(() => {
            const deniedCount = filteredPermissions.filter(p => p.status === 'denied').length;
            const grantedCount = filteredPermissions.filter(p => p.status === 'granted').length;
            const totalCount = filteredPermissions.length;
            
            // Success message when all are granted
            if (grantedCount === totalCount && totalCount > 0) {
              return (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-green-600 dark:text-green-400 text-lg">🎉</div>
                    <div>
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                        All Permissions Granted! ({grantedCount}/{totalCount})
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Excellent! You can now explore all permission previews and copy code snippets for your projects.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Warning for many denied permissions
            if (deniedCount > 0 && totalCount > 0) {
              const percentage = Math.round((deniedCount / totalCount) * 100);
              
              if (percentage > 50) {
                return (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-amber-600 dark:text-amber-400 text-lg">⚠️</div>
                      <div>
                        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                          Many Permissions Denied ({deniedCount}/{totalCount})
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Consider resetting all browser permissions or testing in an incognito window. 
                          Each denied permission shows specific instructions to re-enable.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Permission Cards Grid */}
        <div className="xl:col-span-3">
          {/* Quick Actions for Large Permission Lists */}
          {filteredPermissions.length > 5 && (
            <div className={`${TOOL_PANEL_CLASS} mb-4`}>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const pendingPermissions = filteredPermissions
                      .filter(p => p.status === 'prompt')
                      .slice(0, 5); // Limit to 5 to avoid overwhelming
                    pendingPermissions.forEach(p => requestPermission(p.permission.name));
                  }}
                  className="px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Request Next 5 Pending
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const deniedPermissions = filteredPermissions
                      .filter(p => p.status === 'denied')
                      .slice(0, 3); // Limit retries to avoid overwhelming
                    deniedPermissions.forEach(p => retryPermission(p.permission.name));
                  }}
                  className="px-3 py-1.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                >
                  Retry 3 Denied
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open('chrome://settings/content', '_blank');
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Browser Settings
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Tip: If stuck, try incognito mode or reset browser permissions
              </p>
            </div>
          )}

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
