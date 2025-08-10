/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState } from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Button } from '../../../design-system/components/inputs';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  start: () => void;
  stop: () => void;
  flip: () => void;
  result: string;
  error: string;
  scanning: boolean;
  canFlip: boolean;
  // Enhanced features
  devices: Array<{deviceId: string, label: string}>;
  selectedCamera: string;
  switchCamera: (deviceId: string) => void;
  scanHistory: Array<{id: string, text: string, timestamp: number, type: string}>;
  clearHistory: () => void;
  clearResult: () => void;
  scanCount: number;
  lastScanTime: number | null;
  cameraPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  // Settings
  autoCopy: boolean;
  setAutoCopy: (value: boolean) => void;
  autoOpen: boolean;
  setAutoOpen: (value: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  continuousMode: boolean;
  setContinuousMode: (value: boolean) => void;
  filterDuplicates: boolean;
  setFilterDuplicates: (value: boolean) => void;
  // Camera controls
  flashlight: boolean;
  toggleFlashlight: () => void;
  zoom: number;
  adjustZoom: (zoom: number) => void;
}

export function QrscanView({
  videoRef,
  start,
  stop,
  flip,
  result,
  error,
  scanning,
  canFlip,
  devices,
  selectedCamera,
  switchCamera,
  scanHistory,
  clearHistory,
  clearResult,
  scanCount,
  lastScanTime,
  cameraPermission,
  autoCopy,
  setAutoCopy,
  autoOpen,
  setAutoOpen,
  soundEnabled,
  setSoundEnabled,
  continuousMode,
  setContinuousMode,
  filterDuplicates,
  setFilterDuplicates,
  flashlight,
  toggleFlashlight,
  zoom,
  adjustZoom,
}: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const formatTimestamp = (timestamp: number) => 
    new Date(timestamp).toLocaleString();

  const getTypeIcon = (type: string) => {
    const icons = {
      url: '🌐',
      email: '📧', 
      phone: '📞',
      wifi: '📶',
      location: '📍',
      vcard: '👤',
      text: '📝',
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const openLink = (text: string) => {
    if (text.startsWith('http://') || text.startsWith('https://')) {
      window.open(text, '_blank');
    } else if (text.startsWith('mailto:')) {
      window.location.href = text;
    } else if (text.startsWith('tel:')) {
      window.location.href = text;
    }
  };

  return (
    <div className={TOOL_PANEL_CLASS}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          QR Scanner
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowSettings(!showSettings)} 
            size="sm" 
            variant="outline-primary"
          >
            ⚙️ Settings
          </Button>
          <Button 
            onClick={() => setShowHistory(!showHistory)} 
            size="sm" 
            variant="outline-primary"
          >
            📋 History ({scanHistory.length})
          </Button>
        </div>
      </div>

      {/* Camera Permission Status */}
      {cameraPermission === 'denied' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          Camera permission denied. Please enable camera access in your browser settings.
        </div>
      )}

      {/* Statistics */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
          <div className="font-semibold">Scans</div>
          <div className="text-lg">{scanCount}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
          <div className="font-semibold">Last Scan</div>
          <div className="text-xs">
            {lastScanTime ? new Date(lastScanTime).toLocaleTimeString() : 'None'}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
          <div className="font-semibold">Camera</div>
          <div className="text-xs">
            {devices.find(d => d.deviceId === selectedCamera)?.label || 'Default'}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
          <div className="font-semibold">Status</div>
          <div className={scanning ? 'text-green-600' : 'text-red-600'}>
            {scanning ? '🟢 Active' : '🔴 Inactive'}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Camera Section */}
        <div className="flex flex-col items-center">
          <video
            ref={videoRef}
            className="w-64 h-64 border rounded-md"
            aria-label="QR code scanner feed"
            style={{ 
              transform: `scale(${zoom})`,
              transition: 'transform 0.3s ease'
            }}
          >
            <track kind="captions" className="sr-only" />
          </video>
          
          {/* Camera Controls */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Button onClick={start} isDisabled={scanning} size="sm">
              {scanning ? '🟢 Scanning' : '▶️ Start'}
            </Button>
            <Button onClick={stop} isDisabled={!scanning} size="sm" variant="secondary">
              ⏹️ Stop
            </Button>
            {canFlip && (
              <Button onClick={flip} size="sm" variant="outline-primary">
                🔄 Flip
              </Button>
            )}
            <Button 
              onClick={toggleFlashlight} 
              size="sm" 
              variant={flashlight ? "primary" : "outline-primary"}
              title="Toggle flashlight"
            >
              {flashlight ? '🔦' : '💡'}
            </Button>
          </div>

          {/* Camera Selection */}
          {devices.length > 1 && (
            <div className="mt-2 w-full max-w-xs">
              <select
                value={selectedCamera}
                onChange={(e) => switchCamera(e.target.value)}
                className="w-full text-xs p-1 border rounded"
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Zoom Control */}
          <div className="mt-2 w-full max-w-xs">
            <div className="text-xs font-medium mb-1">Zoom: {zoom}x</div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => adjustZoom(parseFloat(e.target.value))}
              className="w-full"
              aria-label="Camera zoom control"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-700 dark:text-gray-300">Result:</p>
            {result && (
              <Button onClick={clearResult} size="sm" variant="outline-secondary">
                Clear
              </Button>
            )}
          </div>
          
          <div className="p-3 border rounded min-h-[4rem] break-all bg-gray-50 dark:bg-gray-800">
            {result ? (
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  {getTypeIcon(scanHistory[0]?.type || 'text')} 
                  {scanHistory[0]?.type?.toUpperCase() || 'TEXT'}
                </div>
                <div className="font-mono text-sm">{result}</div>
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                {scanning ? '🔍 Scanning for QR codes...' : '⏳ Waiting for scan...'}
              </div>
            )}
          </div>
          
          {result && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                📋 Copy
              </Button>
              <Button 
                size="sm" 
                variant="outline-primary" 
                onClick={() => openLink(result)}
              >
                🔗 Open
              </Button>
              {(result.startsWith('http://') || result.startsWith('https://')) && (
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => window.open(`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(result)}`, '_blank')}
                >
                  🔍 View QR
                </Button>
              )}
            </div>
          )}
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-3">Scanner Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-copy"
                checked={autoCopy}
                onChange={(e) => setAutoCopy(e.target.checked)}
              />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="auto-copy" className="text-sm">Auto-copy results</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-open"
                checked={autoOpen}
                onChange={(e) => setAutoOpen(e.target.checked)}
              />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="auto-open" className="text-sm">Auto-open URLs</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sound-enabled"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="sound-enabled" className="text-sm">Success sound</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="continuous-mode"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
              />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="continuous-mode" className="text-sm">Continuous scanning</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="filter-duplicates"
                checked={filterDuplicates}
                onChange={(e) => setFilterDuplicates(e.target.checked)}
              />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="filter-duplicates" className="text-sm">Filter duplicate scans</label>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Scan History</h3>
            {scanHistory.length > 0 && (
              <Button onClick={clearHistory} size="sm" variant="outline-secondary">
                Clear All
              </Button>
            )}
          </div>
          
          {scanHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No scans yet</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="p-3 bg-white dark:bg-gray-700 rounded border">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs text-gray-500">
                      {getTypeIcon(scan.type)} {scan.type.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(scan.timestamp)}
                    </div>
                  </div>
                  <div className="font-mono text-sm break-all">{scan.text}</div>
                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(scan.text)}
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => openLink(scan.text)}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QrscanView;
