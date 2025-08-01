/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Enhanced Permission Card View Component with Interactive Previews
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiCode, FiChevronDown, FiCopy, FiPlay, FiHelpCircle, FiInfo, FiAlertTriangle,
  FiEye, FiEyeOff, FiDownload, FiSettings, FiMonitor
} from 'react-icons/fi';
import { PermissionState } from '../model/permissions';

interface EnhancedPermissionCardProps {
  permission: PermissionState;
  onRequest: () => Promise<void>;
  onRetry: () => Promise<void>;
  onCopy: () => Promise<void>;
  isLoading: boolean;
  activePreview: string | null;
  onPreviewToggle: (permissionName: string | null) => void;
  previewData?: unknown;
  onUpdatePreview: (data: unknown) => void;
  isPreviewActive: boolean;
  onStopPreview: () => void;
}

const EnhancedPermissionCard: React.FC<EnhancedPermissionCardProps> = ({
  permission,
  onRequest,
  onRetry,
  onCopy,
  isLoading,
  activePreview,
  onPreviewToggle,
  previewData,
  onUpdatePreview,
  isPreviewActive,
  onStopPreview
}) => {
  const [showCode, setShowCode] = useState(false);
  const [previewSettings, setPreviewSettings] = useState<Record<string, unknown>>({});

  const { permission: permissionInfo, status, error, data } = permission;

  // Enhanced preview component renderer
  const renderPreview = useCallback(() => {
    if (!isPreviewActive || !data) return null;

    switch (permissionInfo.name) {
      case 'camera':
        return <CameraPreview stream={data as MediaStream} onStop={onStopPreview} />;
      
      case 'microphone':
        return <MicrophonePreview stream={data as MediaStream} onStop={onStopPreview} />;
      
      case 'geolocation':
        return <GeolocationPreview position={data as GeolocationPosition} onStop={onStopPreview} />;
      
      case 'notifications':
        return <NotificationPreview onStop={onStopPreview} onTest={() => {}} />;
      
      case 'bluetooth':
        return <BluetoothPreview device={data as BluetoothDevice} onStop={onStopPreview} />;
      
      case 'usb':
        return <USBPreview device={data as USBDevice} onStop={onStopPreview} />;
      
      case 'screen-wake-lock':
        return <ScreenWakeLockPreview wakeLock={data as WakeLock} onStop={onStopPreview} />;
      
      case 'serial':
        return <SerialPreview port={data as SerialPort} onStop={onStopPreview} />;
      
      case 'accelerometer':
      case 'gyroscope':
      case 'magnetometer':
        return <SensorPreview sensor={data as Sensor} type={permissionInfo.name} onStop={onStopPreview} />;
      
      case 'clipboard-read':
      case 'clipboard-write':
        return <ClipboardPreview onStop={onStopPreview} />;
      
      default:
        return <GenericDataPreview data={data} onStop={onStopPreview} />;
    }
  }, [isPreviewActive, data, permissionInfo.name, onStopPreview]);

  const handlePreviewToggle = () => {
    if (isPreviewActive) {
      onStopPreview();
    } else if (status === 'granted') {
      onPreviewToggle(permissionInfo.name);
    }
  };

  const getStatusColor = (status: PermissionState['status']) => {
    switch (status) {
      case 'granted': return 'bg-green-100 text-green-800 border-green-200';
      case 'denied': return 'bg-red-100 text-red-800 border-red-200';
      case 'prompt': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'unsupported': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: PermissionState['status']) => {
    switch (status) {
      case 'granted': return '✅';
      case 'denied': return '❌';
      case 'prompt': return '❓';
      case 'unsupported': return '⚠️';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {permissionInfo.displayName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {getStatusIcon(status)} {status}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {permissionInfo.description}
          </p>
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
            {permissionInfo.category}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {status === 'granted' && (
            <button
              onClick={handlePreviewToggle}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title={isPreviewActive ? 'Hide Preview' : 'Show Preview'}
            >
              {isPreviewActive ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          )}
          
          <button
            onClick={() => setShowCode(!showCode)}
            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Show Code"
          >
            <FiCode size={16} />
          </button>
          
          <button
            onClick={onCopy}
            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy Code"
          >
            <FiCopy size={16} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <FiAlertTriangle className="text-red-600 flex-shrink-0" size={16} />
          <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {/* Request Button */}
      <div className="flex gap-2">
        {status === 'prompt' || status === 'denied' ? (
          <button
            onClick={status === 'denied' ? onRetry : onRequest}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiPlay size={16} />
            )}
            {status === 'denied' ? 'Retry' : 'Request Permission'}
          </button>
        ) : null}
        
        {status === 'granted' && !isPreviewActive && (
          <button
            onClick={handlePreviewToggle}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FiMonitor size={16} />
            Start Preview
          </button>
        )}
      </div>

      {/* Code Snippet */}
      {showCode && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Example</span>
            <button
              onClick={onCopy}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <FiCopy size={12} />
              Copy
            </button>
          </div>
          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
            <code>{getCodeSnippet(permissionInfo.name)}</code>
          </pre>
        </div>
      )}

      {/* Enhanced Preview */}
      {renderPreview()}

      {/* Additional Info */}
      {status === 'granted' && data && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <FiInfo className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Permission Active</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This permission is currently active and being used by the application.
          </p>
        </div>
      )}
    </div>
  );
};

// Enhanced preview components
const CameraPreview: React.FC<{ stream: MediaStream; onStop: () => void }> = ({ stream, onStop }) => {
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef && stream) {
      videoRef.srcObject = stream;
      videoRef.play().catch(console.error);
    }
  }, [videoRef, stream]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Camera Preview</h4>
        <button
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Stop
        </button>
      </div>
      <div className="bg-black rounded-lg overflow-hidden">
        <video
          ref={setVideoRef}
          className="w-full h-48 object-cover"
          autoPlay
          muted
          playsInline
        />
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <p>Resolution: {stream.getVideoTracks()[0]?.getSettings().width}x{stream.getVideoTracks()[0]?.getSettings().height}</p>
        <p>Frame Rate: {stream.getVideoTracks()[0]?.getSettings().frameRate} fps</p>
      </div>
    </div>
  );
};

const MicrophonePreview: React.FC<{ stream: MediaStream; onStop: () => void }> = ({ stream, onStop }) => {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const level = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(level);
      requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Microphone Preview</h4>
        <button
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Stop
        </button>
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">Audio Level:</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-100"
              style={{ width: `${(audioLevel / 255) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">{Math.round((audioLevel / 255) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

const GeolocationPreview: React.FC<{ position: GeolocationPosition; onStop: () => void }> = ({ position, onStop }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Location Data</h4>
        <button
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Stop
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-300">Latitude:</span>
          <p className="font-mono">{position.coords.latitude.toFixed(6)}</p>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-300">Longitude:</span>
          <p className="font-mono">{position.coords.longitude.toFixed(6)}</p>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-300">Accuracy:</span>
          <p className="font-mono">{position.coords.accuracy}m</p>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-300">Timestamp:</span>
          <p className="font-mono">{new Date(position.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );

const SensorPreview: React.FC<{ sensor: Sensor; type: string; onStop: () => void }> = ({ sensor, type, onStop }) => {
  const [reading, setReading] = useState<any>(null);

  useEffect(() => {
    if (!sensor) return;

    const updateReading = () => {
      // @ts-ignore - sensor reading properties vary by type
      setReading({
        x: sensor.x || 0,
        y: sensor.y || 0,
        z: sensor.z || 0,
        timestamp: sensor.timestamp || Date.now()
      });
    };

    // @ts-ignore
    sensor.addEventListener('reading', updateReading);
    // @ts-ignore
    sensor.start?.();

    return () => {
      // @ts-ignore
      sensor.removeEventListener('reading', updateReading);
      // @ts-ignore
      sensor.stop?.();
    };
  }, [sensor]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">{type.charAt(0).toUpperCase() + type.slice(1)} Data</h4>
        <button
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Stop
        </button>
      </div>
      {reading && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <span className="text-gray-600 dark:text-gray-300">X</span>
            <p className="font-mono text-lg">{reading.x?.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <span className="text-gray-600 dark:text-gray-300">Y</span>
            <p className="font-mono text-lg">{reading.y?.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <span className="text-gray-600 dark:text-gray-300">Z</span>
            <p className="font-mono text-lg">{reading.z?.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const GenericDataPreview: React.FC<{ data: unknown; onStop: () => void }> = ({ data, onStop }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Data Preview</h4>
        <button
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Stop
        </button>
      </div>
      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

// Interfaces for type safety
interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
  };
}

interface USBDevice {
  vendorId: number;
  productId: number;
  productName?: string;
}

interface WakeLock {
  type: string;
  released: boolean;
}

interface SerialPort {
  readable?: ReadableStream;
  writable?: WritableStream;
}

interface Sensor {
  timestamp?: number;
  [key: string]: any;
}

// Helper function to get code snippets
const getCodeSnippet = (permissionName: string): string => {
  const snippets: Record<string, string> = {
    camera: `// Request camera access
const stream = await navigator.mediaDevices.getUserMedia({ video: true });`,
    microphone: `// Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });`,
    geolocation: `// Request location access
const position = await new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(resolve, reject);
});`,
    notifications: `// Request notification permission
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  new Notification('Test notification');
}`,
    bluetooth: `// Request Bluetooth access
const device = await navigator.bluetooth.requestDevice({
  acceptAllDevices: true
});`,
  };

  return snippets[permissionName] || `// Request ${permissionName} permission\n// Implementation depends on the specific API`;
};

export default EnhancedPermissionCard;
