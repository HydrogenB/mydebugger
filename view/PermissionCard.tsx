/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Permission Card View Component
 */
import React, { useState, useEffect } from 'react';
import { 
  FiCode, FiChevronDown, FiCopy, FiPlay, FiHelpCircle, FiInfo, FiAlertTriangle 
} from 'react-icons/fi';
import { PermissionState, revokePermissionGuidance } from '../model/permissions';
import { Button } from '../src/design-system/components/inputs/Button';
import { Badge } from '../src/design-system/components/display/Badge';
import { Card } from '../src/design-system/components/layout/Card';
import { LoadingSpinner } from '../src/design-system/components/feedback/LoadingSpinner';
import { CameraPreview, MicMeter, GeoPanel, SensorTable, LightSpark, ComputePressure, IdlePanel, WindowPanel, ClipboardPreview, NotificationPreview, BluetoothPreview, USBPreview, ScreenWakeLockPreview, SerialPreview, HIDPreview, MIDIPreview, NFCPreview, SpeakerSelectionPreview } from './DataPreview';
import type { IdleDetectorLike } from '../model/permissions';

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
  };
}

interface USBDevice {
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
  usbVersionMajor: number;
  usbVersionMinor: number;
  usbVersionSubminor: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  configurations: unknown[];
}

interface WakeLock {
  type: 'screen';
  released: boolean;
  release: () => Promise<void>;
}

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

// Helper function to get permission-specific guidance
const getPermissionGuidance = (permissionName: string, status: PermissionState['status']): string => {
  const guidanceMap: Record<string, Record<string, string>> = {
    'camera': {
      'denied': 'Camera access was denied. Check if other apps are using your camera, or grant permission in browser settings.',
      'prompt': 'Click "Request" to allow camera access. You may see a browser prompt.',
      'unsupported': 'Camera access is not supported in this browser or device.',
      'granted': 'Camera access granted! You can now see live preview below.'
    },
    'microphone': {
      'denied': 'Microphone access was denied. Check if other apps are using your microphone, or grant permission in browser settings.',
      'prompt': 'Click "Request" to allow microphone access. You may see a browser prompt.',
      'unsupported': 'Microphone access is not supported in this browser or device.',
      'granted': 'Microphone access granted! You can see audio levels below.'
    },
    'geolocation': {
      'denied': 'Location access was denied. You can enable it in your browser settings or by clicking the location icon in the address bar.',
      'prompt': 'Click "Request" to share your location. Your browser will ask for permission.',
      'unsupported': 'Geolocation is not supported in this browser.',
      'granted': 'Location access granted! Your coordinates are shown below.'
    },
    'notifications': {
      'denied': 'Notifications were blocked. Click the notification icon in your address bar to allow them.',
      'prompt': 'Click "Request" to enable browser notifications.',
      'unsupported': 'Notifications are not supported in this browser.',
      'granted': 'Notifications enabled! Use "Test Push" to send a test notification.'
    },
    'bluetooth': {
      'denied': 'Bluetooth access was denied. Make sure Bluetooth is enabled on your device and grant permission in browser settings.',
      'prompt': 'Click "Request" to connect to Bluetooth devices. Make sure Bluetooth is enabled.',
      'unsupported': 'Web Bluetooth is not supported in this browser. Try Chrome or Edge.',
      'granted': 'Bluetooth access granted! Device information shown below.'
    }
  };

  const defaultGuidance: Record<string, string> = {
    'denied': 'Permission was denied. You can reset it in your browser settings.',
    'prompt': 'Click "Request" to grant this permission.',
    'unsupported': 'This feature is not supported in your current browser.',
    'granted': 'Permission granted successfully!'
  };

  return guidanceMap[permissionName]?.[status] || defaultGuidance[status] || '';
};

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
  const [showRevokeHelp, setShowRevokeHelp] = useState(false);

  const { permission: permissionInfo, status, error } = permission;
  const statusBadgeProps = getStatusBadgeProps(status);
  const guidance = getPermissionGuidance(permissionInfo.name, status);

  const getStatusClassNames = () => {
    switch (status) {
      case 'granted':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400';
      case 'denied':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400';
      case 'unsupported':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400';
    }
  };

  useEffect(() => {
    if (permission.status === 'granted' && permission.permission.hasLivePreview) {
      // Automatically show preview when permission is granted
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
    if (permissionData instanceof MediaStream) {
      permissionData.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
    }

    if (permissionInfo.name === 'window-management' && permissionData) {
      const win = permissionData as Window;
      if (!win.closed) win.close();
    }

    if (permissionInfo.name === 'screen-wake-lock' && permissionData) {
      (permissionData as { release: () => Promise<void> }).release?.()
        .catch(() => {
          // Ignore cleanup errors
        });
    }

    if (['accelerometer', 'gyroscope', 'magnetometer', 'ambient-light-sensor'].includes(permissionInfo.name) && permissionData) {
      (permissionData as { stop?: () => void }).stop?.();
    }

    if (permissionInfo.name === 'compute-pressure' && permissionData) {
      const data = permissionData as { observer?: { disconnect(): void } };
      data.observer?.disconnect();
    }

    if (permissionInfo.name === 'idle-detection' && permissionData) {
      (permissionData as { stop?: () => void }).stop?.();
    }

    setShowPreview(false);
    onClearData();
  };

  // Clean up active streams or sensors when component unmounts
  useEffect(
    () => () => {
      if (permissionData instanceof MediaStream) {
        permissionData.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      }
      
      if (permissionInfo.name === 'screen-wake-lock' && permissionData) {
        (permissionData as { release: () => Promise<void> }).release?.()
          .catch(() => {
            // Ignore cleanup errors
          });
      }
      
      if (permissionInfo.name === 'window-management' && permissionData) {
        const win = permissionData as Window;
        if (!win.closed) {
          try {
            win.close();
          } catch {
            // Ignore errors if window can't be closed
          }
        }
      }
      
      if (['accelerometer', 'gyroscope', 'magnetometer', 'ambient-light-sensor'].includes(permissionInfo.name) && permissionData) {
        try {
          (permissionData as { stop?: () => void }).stop?.();
        } catch {
          // Ignore sensor cleanup errors
        }
      }

      if (permissionInfo.name === 'compute-pressure' && permissionData) {
        try {
          const data = permissionData as { observer?: { disconnect(): void } };
          data.observer?.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }

      if (permissionInfo.name === 'idle-detection' && permissionData) {
        try {
          (permissionData as { stop?: () => void }).stop?.();
        } catch {
          // Ignore cleanup errors
        }
      }
      
      onClearData();
    },
    [permissionData, permissionInfo.name, onClearData]
  );

  const renderLivePreview = () => {
    if (!permissionData || !showPreview) return null;

    switch (permissionInfo.name) {
      case 'camera':
        return <CameraPreview stream={permissionData as MediaStream} onStop={handleStopPreview} />;

      case 'display-capture':
        if (permissionData instanceof MediaStream) {
          return <CameraPreview stream={permissionData} onStop={handleStopPreview} />;
        }
        break;
        
      case 'microphone':
        return <MicMeter stream={permissionData as MediaStream} onStop={handleStopPreview} />;
        
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

      case 'clipboard-read':
      case 'clipboard-write':
        return <ClipboardPreview onStop={handleStopPreview} />;

      case 'notifications':
        return <NotificationPreview onStop={handleStopPreview} onTest={onTestNotification} />;

      case 'bluetooth':
        return (
          <BluetoothPreview 
            device={permissionData as BluetoothDevice} 
            onStop={handleStopPreview} 
          />
        );

      case 'usb':
        return (
          <USBPreview 
            device={permissionData as USBDevice} 
            onStop={handleStopPreview} 
          />
        );

      case 'screen-wake-lock':
        return (
          <ScreenWakeLockPreview 
            wakeLock={permissionData as WakeLock} 
            onStop={handleStopPreview} 
          />
        );

      case 'persistent-storage':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Storage Usage
              </h4>
              <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
                {JSON.stringify(permissionData, null, 2)}
              </pre>
            </div>
          );
        }
        break;

      case 'serial':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <SerialPreview 
              port={permissionData as { readable: ReadableStream | null; getInfo(): { usbVendorId?: number; usbProductId?: number } }} 
              onStop={handleStopPreview} 
            />
          );
        }
        break;

      case 'hid':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <HIDPreview 
              device={permissionData as { vendorId: number; productId: number; productName?: string; opened: boolean; collections: Array<{ usage: number; usagePage: number }> }} 
              onStop={handleStopPreview} 
            />
          );
        }
        break;

      case 'midi':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <MIDIPreview 
              midiAccess={permissionData as { inputs: Map<string, { name: string; manufacturer: string; state: string; connection: string }>; outputs: Map<string, { name: string; manufacturer: string; state: string; connection: string }>; sysexEnabled: boolean }} 
              onStop={handleStopPreview} 
            />
          );
        }
        break;

      case 'nfc':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <NFCPreview 
              reader={permissionData as { scan: () => Promise<void>; addEventListener: (event: string, handler: (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer; mediaType?: string }> } }) => void) => void; removeEventListener: (event: string, handler: (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer; mediaType?: string }> } }) => void) => void }} 
              onStop={handleStopPreview} 
            />
          );
        }
        break;

      case 'speaker-selection':
        if (permissionData && typeof permissionData === 'object') {
          return (
            <SpeakerSelectionPreview 
              device={permissionData as { deviceId: string; label: string; kind: string; groupId: string }} 
              onStop={handleStopPreview} 
            />
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

        {/* User Guidance */}
        {guidance && (
          <div className={`mb-4 p-3 rounded-lg border ${getStatusClassNames()}`}>
            <div className="flex items-start gap-2">
              <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{guidance}</p>
            </div>
          </div>
        )}

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

        {/* Revoke Permission Help */}
        {status === 'denied' && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevokeHelp(!showRevokeHelp)}
              className="w-full"
            >
              <FiAlertTriangle className="w-4 h-4 mr-2" />
              How to Enable This Permission
            </Button>
            
            {showRevokeHelp && (
              <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  <div className="font-medium mb-2">To enable this permission:</div>
                  <div className="whitespace-pre-line">
                    {revokePermissionGuidance(permissionInfo.name)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

PermissionCard.defaultProps = { permissionData: undefined, onTestNotification: undefined, onClearData: () => {} } as Partial<PermissionCardProps>;

export default PermissionCard;
