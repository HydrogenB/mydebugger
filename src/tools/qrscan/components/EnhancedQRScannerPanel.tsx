/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Enhanced Interactive QR Scanner with Advanced Features
 */
import React, { useState, useEffect, useRef } from 'react';

import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Button } from '../../../design-system';
import { StageWrapper, StageIndicator } from '../../../shared/components/StageWrapper';
import { useStageManager } from '../../../shared/hooks/useStageManager';

interface QRScanResult {
  id: string;
  text: string;
  timestamp: number;
  type: string;
}

interface QRScanSettings {
  autoCopy: boolean;
  autoOpen: boolean;
  soundEnabled: boolean;
  continuousMode: boolean;
  filterDuplicates: boolean;
  saveHistory: boolean;
}

interface EnhancedQRScannerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  start: () => void;
  stop: () => void;
  flip: () => void;
  result: string;
  error: string;
  scanning: boolean;
  canFlip: boolean;
  devices: Array<{deviceId: string, label: string}>;
  selectedCamera: string;
  switchCamera: (deviceId: string) => void;
  scanHistory: QRScanResult[];
  clearHistory: () => void;
  clearResult: () => void;
  scanCount: number;
  lastScanTime: number | null;
  cameraPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
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
  flashlight: boolean;
  toggleFlashlight: () => void;
  zoom: number;
  adjustZoom: (zoom: number) => void;
}

function EnhancedQRScannerView({
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
}: EnhancedQRScannerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const { isFeatureEnabled } = useStageManager();

  const formatTimestamp = (timestamp: number) => 
    new Date(timestamp).toLocaleString();

  const getTypeIcon = (type: string) => {
    const icons = {
      url: '🌐',
      email: '📧', 
      phone: '📞',
      sms: '💬',
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

  const analyzeQRData = (text: string) => {
    const analysis = {
      length: text.length,
      type: detectQRType(text),
      encoding: 'UTF-8',
      errorCorrection: 'Unknown',
      dataMode: 'Auto',
      isSecure: text.startsWith('https://'),
      containsPersonalData: /email|phone|name|address/i.test(text),
    };
    return analysis;
  };

  const detectQRType = (text: string): string => {
    if (text.startsWith('http://') || text.startsWith('https://')) return 'url';
    if (text.startsWith('mailto:')) return 'email';
    if (text.startsWith('tel:')) return 'phone';
    if (text.startsWith('sms:')) return 'sms';
    if (text.includes('WIFI:')) return 'wifi';
    if (text.startsWith('geo:')) return 'location';
    if (text.includes('BEGIN:VCARD')) return 'vcard';
    return 'text';
  };

  const exportScanData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalScans: scanCount,
      successfulScans: scanHistory.length,
      lastScan: lastScanTime ? new Date(lastScanTime).toISOString() : null,
      scanHistory: scanHistory.map(scan => ({
        ...scan,
        timestamp: new Date(scan.timestamp).toISOString()
      })),
      settings: {
        autoCopy,
        autoOpen,
        soundEnabled,
        continuousMode,
        filterDuplicates
      },
      cameraInfo: {
        permission: cameraPermission,
        selectedCamera: devices.find(d => d.deviceId === selectedCamera)?.label || 'Unknown',
        availableCameras: devices.length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-scan-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Enhanced overlay for QR code detection feedback
  useEffect(() => {
    if (overlayRef.current && videoRef.current && isFeatureEnabled('real-time-features')) {
      const canvas = overlayRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      if (ctx && scanning) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw scanning overlay
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // Scanning area indicator
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = Math.min(canvas.width, canvas.height) * 0.6;
        
        ctx.strokeRect(
          centerX - size / 2,
          centerY - size / 2,
          size,
          size
        );
        
        // Corner markers
        const cornerSize = 20;
        ctx.setLineDash([]);
        ctx.strokeRect(centerX - size / 2, centerY - size / 2, cornerSize, cornerSize);
        ctx.strokeRect(centerX + size / 2 - cornerSize, centerY - size / 2, cornerSize, cornerSize);
        ctx.strokeRect(centerX - size / 2, centerY + size / 2 - cornerSize, cornerSize, cornerSize);
        ctx.strokeRect(centerX + size / 2 - cornerSize, centerY + size / 2 - cornerSize, cornerSize, cornerSize);
      }
    }
  }, [scanning, isFeatureEnabled, videoRef, overlayRef]);

  return (
    <div className={TOOL_PANEL_CLASS}>
      {/* Stage Management */}
      <StageWrapper requiredFeature="enhanced-ui">
        <StageIndicator showProgress className="mb-4" />
      </StageWrapper>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Enhanced QR Scanner
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
          <StageWrapper requiredFeature="advanced-settings">
            <Button 
              onClick={() => setShowStats(!showStats)} 
              size="sm" 
              variant="outline-secondary"
            >
              📊 Stats
            </Button>
          </StageWrapper>
        </div>
      </div>

      {/* Camera Permission Status */}
      {cameraPermission === 'denied' ? (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          Camera permission denied. Please enable camera access in your browser settings.
        </div>
      ) : null}

      {/* Enhanced Statistics Panel */}
      <StageWrapper requiredFeature="real-time-features">
        {showStats ? (
          <div className="mb-4 p-4 border rounded-md bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">Scanning Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white dark:bg-blue-800/30 p-3 rounded">
                <div className="font-semibold text-blue-600 dark:text-blue-300">Total Scans</div>
                <div className="text-2xl font-bold">{scanCount}</div>
              </div>
              <div className="bg-white dark:bg-blue-800/30 p-3 rounded">
                <div className="font-semibold text-blue-600 dark:text-blue-300">Success Rate</div>
                <div className="text-2xl font-bold">
                  {scanCount > 0 ? Math.round((scanHistory.length / scanCount) * 100) : 0}%
                </div>
              </div>
              <div className="bg-white dark:bg-blue-800/30 p-3 rounded">
                <div className="font-semibold text-blue-600 dark:text-blue-300">Avg Session</div>
                <div className="text-lg font-bold">
                  {scanHistory.length > 1 
                    ? `${Math.round((Date.now() - scanHistory[scanHistory.length - 1].timestamp) / 60000)}min`
                    : 'N/A'
                  }
                </div>
              </div>
              <div className="bg-white dark:bg-blue-800/30 p-3 rounded">
                <div className="font-semibold text-blue-600 dark:text-blue-300">Last Scan</div>
                <div className="text-xs">
                  {lastScanTime ? new Date(lastScanTime).toLocaleTimeString() : 'None'}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button onClick={exportScanData} size="sm" variant="outline-primary">
                📊 Export Data
              </Button>
              <Button 
                onClick={() => setAnalysisMode(!analysisMode)} 
                size="sm" 
                variant={analysisMode ? "primary" : "outline-secondary"}
              >
                🔍 Analysis Mode
              </Button>
            </div>
          </div>
        ) : null}
      </StageWrapper>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Enhanced Camera Section */}
        <div className="flex flex-col items-center relative">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-80 h-80 border rounded-md object-cover"
              aria-label="QR code scanner feed"
              style={{ 
                transform: `scale(${zoom})`,
                transition: 'transform 0.3s ease'
              }}
            >
              <track kind="captions" className="sr-only" />
            </video>
            
            {/* Enhanced overlay for scanning feedback */}
            <StageWrapper requiredFeature="real-time-features">
              <canvas
                ref={overlayRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: 'difference' }}
              />
            </StageWrapper>
            
            {/* Scanning indicator */}
            {scanning ? (
              <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-pulse">
                🔍 Scanning...
              </div>
            ) : null}
          </div>
          
          {/* Enhanced Camera Controls */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={start} isDisabled={scanning} size="sm">
              {scanning ? '🟢 Scanning' : '▶️ Start'}
            </Button>
            <Button onClick={stop} isDisabled={!scanning} size="sm" variant="secondary">
              ⏹️ Stop
            </Button>
            {canFlip ? (
              <Button onClick={flip} size="sm" variant="outline-primary">
                🔄 Flip Camera
              </Button>
            ) : null}
            <StageWrapper requiredFeature="advanced-settings">
              <Button 
                onClick={toggleFlashlight} 
                size="sm" 
                variant={flashlight ? "primary" : "outline-primary"}
                title="Toggle flashlight"
              >
                {flashlight ? '🔦' : '💡'}
              </Button>
            </StageWrapper>
          </div>

          {/* Advanced Camera Controls */}
          <StageWrapper requiredFeature="advanced-settings">
            {devices.length > 1 ? (
              <div className="mt-2 w-full max-w-xs">
                <select
                  value={selectedCamera}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="w-full text-xs p-2 border rounded bg-white dark:bg-gray-800"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Zoom Control */}
            <div className="mt-2 w-full max-w-xs">
              <div className="text-xs font-medium mb-1 text-center">Zoom: {zoom.toFixed(1)}x</div>
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
          </StageWrapper>
        </div>

        {/* Enhanced Results Section */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-700 dark:text-gray-300">Scan Result:</p>
            {result ? (
              <Button onClick={clearResult} size="sm" variant="outline-secondary">
                Clear
              </Button>
            ) : null}
          </div>
          
          <div className="p-4 border rounded min-h-[8rem] bg-gray-50 dark:bg-gray-800">
            {result ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500">
                    {getTypeIcon(scanHistory[0]?.type || 'text')} 
                    {scanHistory[0]?.type?.toUpperCase() || 'TEXT'}
                  </div>
                  <StageWrapper requiredFeature="real-time-features">
                    {analysisMode ? (
                      <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Length: {result.length} chars
                      </div>
                    ) : null}
                  </StageWrapper>
                </div>
                
                <div className="font-mono text-sm break-all p-2 bg-white dark:bg-gray-700 rounded border">
                  {result}
                </div>
                
                {/* Enhanced Analysis */}
                <StageWrapper requiredFeature="real-time-features">
                  {analysisMode ? (
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Type: {detectQRType(result)}</div>
                        <div>Secure: {result.startsWith('https://') ? '✅' : '❌'}</div>
                        <div>Length: {result.length} chars</div>
                        <div>Encoding: UTF-8</div>
                      </div>
                    </div>
                  ) : null}
                </StageWrapper>
              </div>
            ) : (
              <div className="text-gray-400 text-center h-full flex items-center justify-center">
                {scanning ? '🔍 Scanning for QR codes...' : '⏳ Waiting for scan...'}
              </div>
            )}
          </div>
          
          {result ? (
            <div className="flex flex-wrap gap-2 mt-3">
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
              {(result.startsWith('http://') || result.startsWith('https://')) ? (
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => window.open(`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(result)}`, '_blank')}
                >
                  🔍 View QR
                </Button>
              ) : null}
              <StageWrapper requiredFeature="export-functionality">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const blob = new Blob([result], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `qr-data-${Date.now()}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  💾 Save
                </Button>
              </StageWrapper>
            </div>
          ) : null}
          
          {error ? (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ⚠️ {error}
            </div>
          ) : null}
        </div>
      </div>

      {/* Enhanced Settings Panel */}
      {showSettings ? (
        <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-3">Scanner Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoCopy}
                  onChange={(e) => setAutoCopy(e.target.checked)}
                />
                <span className="text-sm">Auto-copy results</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoOpen}
                  onChange={(e) => setAutoOpen(e.target.checked)}
                />
                <span className="text-sm">Auto-open URLs</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <span className="text-sm">Success sound</span>
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={continuousMode}
                  onChange={(e) => setContinuousMode(e.target.checked)}
                />
                <span className="text-sm">Continuous scanning</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filterDuplicates}
                  onChange={(e) => setFilterDuplicates(e.target.checked)}
                />
                <span className="text-sm">Filter duplicate scans</span>
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {/* Enhanced History Panel */}
      {showHistory ? (
        <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Scan History</h3>
            {scanHistory.length > 0 ? (
              <div className="flex gap-2">
                <StageWrapper requiredFeature="export-functionality">
                  <Button onClick={exportScanData} size="sm" variant="outline-primary">
                    Export All
                  </Button>
                </StageWrapper>
                <Button onClick={clearHistory} size="sm" variant="outline-secondary">
                  Clear All
                </Button>
              </div>
            ) : null}
          </div>
          
          {scanHistory.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No scans yet</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {scanHistory.slice(0, 20).map((scan) => (
                <div key={scan.id} className="p-3 bg-white dark:bg-gray-700 rounded border">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {getTypeIcon(scan.type)} {scan.type.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(scan.timestamp)}
                    </div>
                  </div>
                  <div className="font-mono text-sm break-all mb-2">
                    {scan.text.length > 100 ? `${scan.text.substring(0, 100)}...` : scan.text}
                  </div>
                  <div className="flex gap-1">
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
              {scanHistory.length > 20 ? (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... and {scanHistory.length - 20} more items
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default EnhancedQRScannerView;
