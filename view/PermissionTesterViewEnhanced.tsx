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
      {/* Stage Management */}
      <StageWrapper requiredFeature="enhanced-ui">
        <StageIndicator showProgress showDescription className="mb-4" />
      </StageWrapper>

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

          {/* Category Filter and Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
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
                type="button"
                onClick={handleBatchTest}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                disabled={categoryFilteredPermissions.filter(p => p.status === 'prompt' || p.status === 'denied').length === 0}
              >
                <FiPlay size={14} />
                Test All
              </button>
              <button
                type="button"
                onClick={exportResults}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                <FiDownload size={14} />
                Export Results
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Info */}
          {searchQuery ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiFilter className="w-4 h-4" />
              <span>
                {filteredPermissions.length} permissions match &ldquo;{searchQuery}&rdquo;
              </span>
            </div>
          ) : null}

          {/* Enhanced Batch Actions */}
          <StageWrapper requiredFeature="advanced-settings">
            {filteredPermissions.length > 5 ? (
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
                </div>
              </div>
            ) : null}
          </StageWrapper>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Permission Cards Grid */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryFilteredPermissions.map(({ permission, status, error, lastRequested, data }) => (
              <PermissionCardEnhanced
                key={permission.name}
                permission={permission}
                status={status}
                error={error}
                lastRequested={lastRequested}
                data={data}
                onRequest={requestPermission}
                onRetry={retryPermission}
                onCopyCode={copyCodeSnippet}
                getCodeSnippet={getCodeSnippet}
                isLoading={isLoading(permission.name)}
                getPermissionData={getPermissionData}
                clearPermissionData={clearPermissionData}
                activePreview={activePreview}
                setActivePreview={setActivePreview}
                previewStates={previewStates}
                updatePreviewState={updatePreviewState}
                isPreviewActive={isPreviewActive}
                stopPreview={stopPreview}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Event Log Panel */}
        <div className="xl:col-span-1">
          <StageWrapper requiredFeature="data-persistence">
            <EventLog
              events={events}
              onCopy={copyEventLog}
              onClear={clearEvents}
              testNotification={testNotification}
            />
          </StageWrapper>
        </div>
      </div>
    </div>
  );
}

export default PermissionTesterView;
