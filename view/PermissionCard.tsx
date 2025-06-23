/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Permission Card View Component
 */
import React, { useState, useEffect } from 'react';
import { 
  FiCode, FiChevronDown, FiCopy, FiPlay, FiHelpCircle 
} from 'react-icons/fi';
import { PermissionState } from '../model/permissions';
import { Button } from '../src/design-system/components/inputs/Button';
import { Badge } from '../src/design-system/components/display/Badge';
import { Card } from '../src/design-system/components/layout/Card';
import { LoadingSpinner } from '../src/design-system/components/feedback/LoadingSpinner';
import { CameraPreview, MicMeter, GeoPanel, SensorTable, LightSpark, ComputePressure, IdlePanel, WindowPanel } from './DataPreview';
import type { IdleDetectorLike } from '../model/permissions';

interface PermissionCardProps {
  permission: PermissionState;
  onRequest: () => Promise<void>;
  onRetry: () => Promise<void>;
  onCopyCode: () => Promise<void>;
  codeSnippet: string;
  isLoading: boolean;
  permissionData?: unknown;
  onTestNotification?: () => void;
  onClearData: () => void;
}

// Helper function to get OS-specific reset instructions
const getResetInstructionsUrl = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('mac')) {
    return 'https://support.apple.com/guide/safari/manage-website-settings-sfri11471/mac';
  }
  if (userAgent.includes('win')) {
    return 'https://support.microsoft.com/en-us/microsoft-edge/view-and-delete-browser-history-in-microsoft-edge-00cf7943-a9e1-975a-a33d-ac10ce454ca4';
  }
  return 'https://support.google.com/chrome/answer/114662';
};

const getStatusBadgeProps = (status: PermissionState['status']) => {
  switch (status) {
    case 'granted':
      return { variant: 'success' as const, children: '✅ Granted' };
    case 'denied':
      return { variant: 'danger' as const, children: '✕ Denied' };
    case 'prompt':
      return { variant: 'warning' as const, children: '? Prompt' };
    case 'unsupported':
      return { variant: 'light' as const, children: '– Unsupported' };
    default:
      return { variant: 'light' as const, children: '– Unknown' };
  }
};

function PermissionCard({
  permission,
  onRequest,
  onRetry,
  onCopyCode,
  codeSnippet,
  isLoading,
  permissionData = undefined,
  onTestNotification,
  onClearData
}: PermissionCardProps) {
  const [showCode, setShowCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { permission: permissionInfo, status, error } = permission;
  const statusBadgeProps = getStatusBadgeProps(status);

  useEffect(() => {
    if (permission.status === 'granted' && permission.permission.hasLivePreview) {
      setShowPreview(true);
    } else if (permission.status !== 'granted') {
      setShowPreview(false);
    }
  }, [permission.status, permission.permission.hasLivePreview]);

  const handleRequest = async () => {
    await onRequest();
  };
  const handleRetry = async () => {
    await onRetry();
  };

  const handleStopPreview = () => {
    // Stop media streams
    if (permissionData instanceof MediaStream) {
      permissionData.getTracks().forEach(track => track.stop());
    }

    if (permissionInfo.name === 'window-management' && permissionData) {
      const win = permissionData as Window;
      if (!win.closed) win.close();
    }

    // For sensors, they should be stopped by the parent component
    setShowPreview(false);
    onClearData?.();
  };

  // Clean up active streams or sensors when component unmounts
  useEffect(
    () => () => {
      if (permissionData instanceof MediaStream) {
        permissionData.getTracks().forEach(track => track.stop());
      }
      if (permissionInfo.name === 'screen-wake-lock' && permissionData) {
        (permissionData as { release: () => Promise<void> }).release?.();
      }
      if (permissionInfo.name === 'window-management' && permissionData) {
        const win = permissionData as Window;
        if (!win.closed) win.close();
      }
      if (showPreview) setShowPreview(false);
      onClearData?.();
    },
    [permissionData, showPreview, permissionInfo.name, onClearData]
  );

  const renderLivePreview = () => {
    if (!permissionData || !showPreview) return null;

    switch (permissionInfo.name) {
      case 'camera':
        if (permissionData instanceof MediaStream) {
          return <CameraPreview stream={permissionData} onStop={handleStopPreview} />;
        }
        break;

      case 'display-capture':
        if (permissionData instanceof MediaStream) {
          return <CameraPreview stream={permissionData} onStop={handleStopPreview} />;
        }
        break;
        
      case 'microphone':
        if (permissionData instanceof MediaStream) {
          return <MicMeter stream={permissionData} onStop={handleStopPreview} />;
        }
        break;
        
      case 'geolocation':
        if (permissionData && typeof permissionData === 'object' && 'coords' in permissionData) {
          return (
            <GeoPanel 
              position={permissionData as GeolocationPosition} 
              onRefresh={onRetry}
            />
          );
        }
        break;
          case 'accelerometer':
      case 'gyroscope':
      case 'magnetometer':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <SensorTable 
              sensor={permissionData as {
                x?: number;
                y?: number;
                z?: number;
                addEventListener: (event: string, handler: () => void) => void;
                removeEventListener: (event: string, handler: () => void) => void;
                start: () => void;
                stop: () => void;
              }}
              sensorType={permissionInfo.name as 'accelerometer' | 'gyroscope' | 'magnetometer'}
              onStop={handleStopPreview}
            />
          );
        }
        break;
        
      case 'ambient-light-sensor':
        if (permissionData && typeof permissionData === 'object') {
          return <LightSpark
            sensor={permissionData as {
              illuminance?: number;
              addEventListener: (event: string, handler: () => void) => void;
              removeEventListener: (event: string, handler: () => void) => void;
              start: () => void;
              stop: () => void;
            }}
            onStop={handleStopPreview}
          />;
        }
        break;

      case 'compute-pressure':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <ComputePressure
              data={permissionData as { observer: { disconnect(): void }; readings: unknown[] }}
              onStop={handleStopPreview}
            />
          );
        }
        break;

      case 'idle-detection':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <IdlePanel
              detector={permissionData as unknown as IdleDetectorLike}
              onStop={handleStopPreview}
            />
          );
        }
        break;

      case 'window-management':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <WindowPanel win={permissionData as Window} onClose={handleStopPreview} />
          );
        }
        break;
        
      default:
        // Generic data display for other permissions
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permission Data:
            </p>
            <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
              {JSON.stringify(permissionData, null, 2)}
            </pre>
          </div>
        );
    }
    
    return null;
  };

  return (
    <Card className="h-fit">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <FiHelpCircle className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {permissionInfo.displayName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {permissionInfo.description}
              </p>
            </div>
          </div>
          <Badge 
            variant={statusBadgeProps.variant}
          >
            {statusBadgeProps.children}
          </Badge>
        </div>

        {/* Category */}
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
            {permissionInfo.category}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Code Snippet Toggle */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiCode className="w-4 h-4" />
            <span>{showCode ? 'Hide' : 'Show'} JavaScript snippet</span>
            <FiChevronDown 
              className={`w-4 h-4 transition-transform ${showCode ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {showCode && (
            <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  JavaScript snippet
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onCopyCode}
                  className="text-xs"
                >
                  <FiCopy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="p-3 text-xs overflow-x-auto">
                <code className="text-gray-800 dark:text-gray-200">
                  {codeSnippet}
                </code>
              </pre>
            </div>
          )}
        </div>

        {/* Live Preview Toggle */}
        {status === 'granted' && permissionInfo.hasLivePreview && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FiPlay className="w-4 h-4" />
              <span>{showPreview ? 'Hide' : 'Show'} live preview</span>
              <FiChevronDown 
                className={`w-4 h-4 transition-transform ${showPreview ? 'rotate-180' : ''}`} 
              />
            </button>
              {showPreview && (
              <div className="mt-3">
                {renderLivePreview()}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {status === 'prompt' || status === 'unsupported' ? (
            <Button
              onClick={handleRequest}
              disabled={isLoading}
              variant="primary"
              size="sm"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Requesting...
                </>
              ) : (
                'Request'
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleRetry} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Requesting...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const resetUrl = getResetInstructionsUrl();
              if (resetUrl) window.open(resetUrl, '_blank');
            }}
          >
            Reset
          </Button>
          {permissionInfo.name === 'screen-wake-lock' && permissionData ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                (permissionData as { release: () => Promise<void> }).release?.();
              }}
            >
              Release
            </Button>
          ) : null}
          {permissionInfo.name === 'notifications' && status === 'granted' && onTestNotification && (
            <Button variant="ghost" size="sm" onClick={onTestNotification}>
              Test Push
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

PermissionCard.defaultProps = { permissionData: undefined, onTestNotification: undefined, onClearData: () => {} } as Partial<PermissionCardProps>;

export default PermissionCard;
