import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { Card } from '../../design-system/components/layout';
import { Alert } from '../../design-system/components/feedback';
import { UrlForm, TraceResults, DeviceSelector } from './components';
import { useLinkTracer } from './hooks';

/**
 * Link Tracer Tool
 * Traces URL redirect chains to analyze link behavior
 */
const LinkTracer: React.FC = () => {
  const tool = getToolByRoute('/linktracer');
  
  const {
    url,
    userAgent,
    isLoading,
    error,
    traceResult,
    deviceProfiles,
    selectedDevice,
    setUrl,
    setUserAgent,
    trace,
    clearResults,
    loadDeviceProfiles,
    setSelectedDevice
  } = useLinkTracer();
  
  // Load device profiles on mount
  useEffect(() => {
    loadDeviceProfiles();
  }, [loadDeviceProfiles]);
  
  return (
    <>
      <Helmet>
        <title>Link Tracer | MyDebugger</title>
        <meta name="description" content="Trace URL redirect chains and analyze link behavior across different devices" />
      </Helmet>
        <ToolLayout tool={tool!}>
        <div className="space-y-6">
          <Card title="Link Tracer" isElevated>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This tool traces link redirects step by step to help you understand the complete redirect chain.
            </p>
            
            {error && (
              <Alert 
                type="error" 
                title="Error" 
                message={error}
                className="mb-6" 
              />
            )}
            
            {traceResult && traceResult.warnings && traceResult.warnings.length > 0 && (
              <Alert
                type="warning"
                title="Warning"
                message={traceResult.warnings.join(' ')}
                className="mb-6"
              />
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <UrlForm
                  url={url}
                  userAgent={userAgent}
                  onUrlChange={setUrl}
                  onUserAgentChange={setUserAgent}
                  onSubmit={trace}
                  isLoading={isLoading}
                />
                
                {deviceProfiles.length > 0 && (
                  <div className="mt-6">
                    <DeviceSelector
                      devices={deviceProfiles}
                      selectedDevice={selectedDevice}
                      onSelectDevice={setSelectedDevice}
                    />
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-2">
                {(isLoading || traceResult) && (
                  <TraceResults
                    hops={traceResult?.hops || []}
                    isLoading={isLoading}
                    totalTimeMs={traceResult?.totalTimeMs || 0}
                  />
                )}
              </div>
            </div>
          </Card>
          
          <Card title="About Link Tracing" isElevated>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Link tracing helps you understand how URLs behave when clicked, revealing:
              </p>
              
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>Redirect chains and their status codes</li>
                <li>Latency between each hop</li>
                <li>Final destination URL after all redirects</li>
                <li>User agent-specific behavior differences</li>
                <li>Potential tracking parameters added during redirects</li>
              </ul>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  <strong>Tip:</strong> Testing links with different user agents can reveal conditional redirects that may send mobile users to different destinations than desktop users.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default LinkTracer;