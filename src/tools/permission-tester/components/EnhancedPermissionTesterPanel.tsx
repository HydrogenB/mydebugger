/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Enhanced Permission Tester with All Preview Types and Real-time Status
 */
import React, { useState, useEffect, useRef } from 'react';

import { Badge } from '../src/design-system/components/display/Badge';
import { Button } from '../src/design-system/components/inputs/Button';
import { Card } from '../src/design-system/components/layout/Card';
import { InfoBox } from '../src/design-system/components/display/InfoBox';
import { PermissionResult } from '../src/design-system/components/display/PermissionResult';
import { StageWrapper, StageIndicator } from '../src/shared/components/StageWrapper';
import { useStageManager } from '../src/shared/hooks/useStageManager';
import { Permission, PermissionState } from '../lib/permissions';

interface PreviewMode {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  requiresUserInteraction: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MediaPreview {
  stream: MediaStream | null;
  error: string | null;
  deviceInfo: MediaDeviceInfo | null;
  isRecording: boolean;
  recordedData?: Blob;
  duration: number;
}

interface LocationPreview {
  position: GeolocationPosition | null;
  error: string | null;
  watchId: number | null;
  accuracy: number;
  isTracking: boolean;
  history: Array<{ lat: number; lng: number; timestamp: number; accuracy: number }>;
}

interface NotificationPreview {
  permission: NotificationPermission;
  lastNotification: Notification | null;
  queue: Array<{ title: string; body: string; timestamp: number }>;
  isSupported: boolean;
}

interface SensorPreview {
  accelerometer: any | null;
  gyroscope: any | null;
  magnetometer: any | null;
  isSupported: boolean;
  error: string | null;
  readings: Array<{ type: string; x?: number; y?: number; z?: number; timestamp: number }>;
}

interface Props {
  permissions: Permission[];
  results: Record<string, PermissionState>;
  requestPermission: (permission: string) => Promise<void>;
  loading: boolean;
  isPermissionSupported: (permission: string) => boolean;
  // Enhanced features
  previewModes: PreviewMode[];
  activePreview: string | null;
  setActivePreview: (id: string | null) => void;
  mediaPreview: MediaPreview;
  locationPreview: LocationPreview;
  notificationPreview: NotificationPreview;
  sensorPreview: SensorPreview;
  enablePreview: (mode: string) => Promise<void>;
  disablePreview: (mode: string) => Promise<void>;
  startMediaRecording: (type: 'video' | 'audio') => Promise<void>;
  stopMediaRecording: () => Promise<Blob | null>;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => void;
  sendTestNotification: (title: string, body: string) => Promise<void>;
  startSensorReading: (type: string) => Promise<void>;
  stopSensorReading: (type: string) => void;
  exportPreviewData: () => void;
  clearPreviewHistory: () => void;
}

function EnhancedPermissionTesterView(props: Props) {
  const {
    permissions,
    results,
    requestPermission,
    loading,
    isPermissionSupported,
    previewModes,
    activePreview,
    setActivePreview,
    mediaPreview,
    locationPreview,
    notificationPreview,
    sensorPreview,
    enablePreview,
    disablePreview,
    startMediaRecording,
    stopMediaRecording,
    startLocationTracking,
    stopLocationTracking,
    sendTestNotification,
    startSensorReading,
    stopSensorReading,
    exportPreviewData,
    clearPreviewHistory
  } = props;

  const [testNotificationTitle, setTestNotificationTitle] = useState('MyDebugger Test');
  const [testNotificationBody, setTestNotificationBody] = useState('Permission testing in progress...');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [selectedSensorType, setSelectedSensorType] = useState('accelerometer');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isFeatureEnabled } = useStageManager();

  // Update video element when media stream changes
  useEffect(() => {
    if (mediaPreview.stream && videoRef.current) {
      videoRef.current.srcObject = mediaPreview.stream;
    }
  }, [mediaPreview.stream]);

  // Real-time sensor updates
  useEffect(() => {
    if (realTimeMode && isFeatureEnabled('real-time-features')) {
      const interval = setInterval(() => {
        if (sensorPreview.accelerometer) {
          // Real-time sensor reading updates would happen here
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [realTimeMode, sensorPreview.accelerometer, isFeatureEnabled]);

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  const getPermissionIcon = (permission: string) => {
    const iconMap: Record<string, string> = {
      camera: '📷',
      microphone: '🎤',
      geolocation: '📍',
      notifications: '🔔',
      accelerometer: '📱',
      gyroscope: '🌀',
      magnetometer: '🧭',
      clipboard: '📋',
      midi: '🎹',
      push: '📢',
      'background-sync': '🔄',
      'persistent-storage': '💾'
    };
    return iconMap[permission] || '🔐';
  };

  const handleTogglePreview = async (modeId: string) => {
    if (activePreview === modeId) {
      await disablePreview(modeId);
      setActivePreview(null);
    } else {
      try {
        await enablePreview(modeId);
        setActivePreview(modeId);
      } catch (error) {
        console.error('Failed to enable preview:', error);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Download snapshot
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `camera-snapshot-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage Management */}
      <StageWrapper requiredFeature="enhanced-ui">
        <StageIndicator showProgress showDescription className="mb-4" />
      </StageWrapper>

      {/* Enhanced Header */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Enhanced Permission Tester
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive permission testing with real-time previews, interactive demos, and detailed analysis
              </p>
            </div>
            <div className="flex gap-2">
              <StageWrapper requiredFeature="advanced-settings">
                <Button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  variant={showAdvancedOptions ? "primary" : "outline-primary"}
                  size="sm"
                >
                  ⚙️ Advanced
                </Button>
              </StageWrapper>
              <StageWrapper requiredFeature="export-functionality">
                <Button
                  onClick={exportPreviewData}
                  variant="outline-secondary"
                  size="sm"
                  disabled={!activePreview}
                >
                  📊 Export Data
                </Button>
              </StageWrapper>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {/* Control Panel */}
          <StageWrapper requiredFeature="advanced-settings">
            {showAdvancedOptions ? (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-3">Advanced Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="real-time-mode"
                      checked={realTimeMode}
                      onChange={(e) => setRealTimeMode(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="real-time-mode" className="text-sm font-medium">
                      🔄 Real-time Updates
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Sensor Type</label>
                    <select
                      value={selectedSensorType}
                      onChange={(e) => setSelectedSensorType(e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                    >
                      <option value="accelerometer">Accelerometer</option>
                      <option value="gyroscope">Gyroscope</option>
                      <option value="magnetometer">Magnetometer</option>
                    </select>
                  </div>
                  
                  <Button
                    onClick={clearPreviewHistory}
                    variant="outline-secondary"
                    size="sm"
                  >
                    🗑️ Clear History
                  </Button>
                </div>
              </div>
            ) : null}
          </StageWrapper>

          {/* Permission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((permission) => {
              const result = results[permission.name];
              const isSupported = isPermissionSupported(permission.name);
              
              return (
                <div
                  key={permission.name}
                  className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getPermissionIcon(permission.name)}</span>
                      <h3 className="font-semibold">{permission.displayName}</h3>
                    </div>
                    
                    <Badge
                      variant={
                        !isSupported ? 'warning' :
                        result?.state === 'granted' ? 'success' :
                        result?.state === 'denied' ? 'danger' : 'default'
                      }
                    >
                      {!isSupported ? 'Not Supported' : result?.state || 'Unknown'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {permission.description}
                  </p>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => requestPermission(permission.name)}
                      isLoading={loading}
                      disabled={!isSupported || result?.state === 'granted'}
                      size="sm"
                      className="w-full"
                    >
                      {result?.state === 'granted' ? '✅ Granted' : '🔒 Request Permission'}
                    </Button>

                    {/* Preview Toggle */}
                    <StageWrapper requiredFeature="interactive-previews">
                      {result?.state === 'granted' && previewModes.find(p => p.id === permission.name) ? (
                        <Button
                          onClick={() => handleTogglePreview(permission.name)}
                          variant={activePreview === permission.name ? "primary" : "outline-primary"}
                          size="sm"
                          className="w-full"
                        >
                          {activePreview === permission.name ? '👁️ Hide Preview' : '👁️ Show Preview'}
                        </Button>
                      ) : null}
                    </StageWrapper>
                  </div>

                  {result?.error ? (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                      {result.error}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Camera/Video Preview */}
      <StageWrapper requiredFeature="interactive-previews">
        {activePreview === 'camera' && mediaPreview.stream ? (
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📷 Camera Preview</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={takeSnapshot}
                    variant="outline-primary"
                    size="sm"
                  >
                    📸 Snapshot
                  </Button>
                  <Button
                    onClick={() => mediaPreview.isRecording ? stopMediaRecording() : startMediaRecording('video')}
                    variant={mediaPreview.isRecording ? "danger" : "primary"}
                    size="sm"
                  >
                    {mediaPreview.isRecording ? '⏹️ Stop' : '🔴 Record'}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full max-w-2xl mx-auto rounded-lg bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {mediaPreview.isRecording ? (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🔴 REC {formatDuration(mediaPreview.duration)}
                  </div>
                ) : null}

                {mediaPreview.deviceInfo ? (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Device Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Label: {mediaPreview.deviceInfo.label || 'Unknown'}</div>
                      <div>Device ID: {mediaPreview.deviceInfo.deviceId.substring(0, 8)}...</div>
                      <div>Kind: {mediaPreview.deviceInfo.kind}</div>
                      <div>Group ID: {mediaPreview.deviceInfo.groupId.substring(0, 8)}...</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </Card.Body>
          </Card>
        ) : null}
      </StageWrapper>

      {/* Microphone Preview */}
      <StageWrapper requiredFeature="interactive-previews">
        {activePreview === 'microphone' && mediaPreview.stream ? (
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">🎤 Microphone Preview</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => mediaPreview.isRecording ? stopMediaRecording() : startMediaRecording('audio')}
                    variant={mediaPreview.isRecording ? "danger" : "primary"}
                    size="sm"
                  >
                    {mediaPreview.isRecording ? '⏹️ Stop Recording' : '🔴 Start Recording'}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {/* Audio visualizer would go here */}
                <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎵</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {mediaPreview.isRecording ? 'Recording audio...' : 'Audio stream active'}
                    </div>
                  </div>
                </div>

                {mediaPreview.recordedData ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recording saved ({Math.round(mediaPreview.recordedData.size / 1024)} KB)</span>
                      <Button
                        onClick={() => {
                          const url = URL.createObjectURL(mediaPreview.recordedData!);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `audio-recording-${Date.now()}.webm`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        variant="outline-primary"
                        size="sm"
                      >
                        💾 Download
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </Card.Body>
          </Card>
        ) : null}
      </StageWrapper>

      {/* Geolocation Preview */}
      <StageWrapper requiredFeature="interactive-previews">
        {activePreview === 'geolocation' ? (
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📍 Location Preview</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => locationPreview.isTracking ? stopLocationTracking() : startLocationTracking()}
                    variant={locationPreview.isTracking ? "danger" : "primary"}
                    size="sm"
                  >
                    {locationPreview.isTracking ? '⏹️ Stop Tracking' : '📍 Start Tracking'}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {locationPreview.position ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Latitude:</span>
                        <span className="font-mono text-sm">{locationPreview.position.coords.latitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Longitude:</span>
                        <span className="font-mono text-sm">{locationPreview.position.coords.longitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Accuracy:</span>
                        <span className="font-mono text-sm">{Math.round(locationPreview.position.coords.accuracy)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Altitude:</span>
                        <span className="font-mono text-sm">
                          {locationPreview.position.coords.altitude ? `${Math.round(locationPreview.position.coords.altitude)}m` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Speed:</span>
                        <span className="font-mono text-sm">
                          {locationPreview.position.coords.speed ? `${(locationPreview.position.coords.speed * 3.6).toFixed(1)} km/h` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Heading:</span>
                        <span className="font-mono text-sm">
                          {locationPreview.position.coords.heading ? `${Math.round(locationPreview.position.coords.heading)}°` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-medium">Location History ({locationPreview.history.length})</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {locationPreview.history.slice(-5).map((pos, i) => (
                          <div key={i} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div>📍 {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}</div>
                            <div className="text-gray-500">
                              {new Date(pos.timestamp).toLocaleTimeString()} | ±{Math.round(pos.accuracy)}m
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Click "Start Tracking" to begin location monitoring
                  </div>
                )}

                {locationPreview.error ? (
                  <InfoBox variant="error" title="Location Error">
                    {locationPreview.error}
                  </InfoBox>
                ) : null}
              </div>
            </Card.Body>
          </Card>
        ) : null}
      </StageWrapper>

      {/* Notification Preview */}
      <StageWrapper requiredFeature="interactive-previews">
        {activePreview === 'notifications' ? (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">🔔 Notification Preview</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={testNotificationTitle}
                      onChange={(e) => setTestNotificationTitle(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Notification title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Body</label>
                    <input
                      type="text"
                      value={testNotificationBody}
                      onChange={(e) => setTestNotificationBody(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Notification body"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => sendTestNotification(testNotificationTitle, testNotificationBody)}
                  disabled={!notificationPreview.isSupported || notificationPreview.permission !== 'granted'}
                  className="w-full"
                >
                  📢 Send Test Notification
                </Button>

                {notificationPreview.queue.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Notification History</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {notificationPreview.queue.slice(-5).map((notif, i) => (
                        <div key={i} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="font-medium">{notif.title}</div>
                          <div className="text-gray-600 dark:text-gray-400">{notif.body}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card.Body>
          </Card>
        ) : null}
      </StageWrapper>

      {/* Sensor Preview */}
      <StageWrapper requiredFeature="interactive-previews">
        {activePreview === selectedSensorType && sensorPreview.isSupported ? (
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedSensorType === 'accelerometer' ? '📱' : 
                   selectedSensorType === 'gyroscope' ? '🌀' : '🧭'} 
                  {' '}{selectedSensorType.charAt(0).toUpperCase() + selectedSensorType.slice(1)} Preview
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => startSensorReading(selectedSensorType)}
                    variant="primary"
                    size="sm"
                    disabled={!!sensorPreview[selectedSensorType as keyof typeof sensorPreview]}
                  >
                    ▶️ Start
                  </Button>
                  <Button
                    onClick={() => stopSensorReading(selectedSensorType)}
                    variant="danger"
                    size="sm"
                    disabled={!sensorPreview[selectedSensorType as keyof typeof sensorPreview]}
                  >
                    ⏹️ Stop
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {sensorPreview.readings.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {['x', 'y', 'z'].map(axis => {
                      const latest = sensorPreview.readings[sensorPreview.readings.length - 1];
                      return (
                        <div key={axis} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-mono">
                            {latest?.[axis as keyof typeof latest]?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">{axis}-axis</div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recent Readings</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {sensorPreview.readings.slice(-10).reverse().map((reading, i) => (
                        <div key={i} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono">
                          X: {reading.x?.toFixed(3) || 'N/A'} | 
                          Y: {reading.y?.toFixed(3) || 'N/A'} | 
                          Z: {reading.z?.toFixed(3) || 'N/A'} | 
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Click "Start" to begin {selectedSensorType} monitoring
                </div>
              )}

              {sensorPreview.error ? (
                <InfoBox variant="error" title="Sensor Error">
                  {sensorPreview.error}
                </InfoBox>
              ) : null}
            </Card.Body>
          </Card>
        ) : null}
      </StageWrapper>

      {/* Permission Results Summary */}
      {Object.keys(results).length > 0 ? (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold">Permission Test Results</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {Object.entries(results).map(([key, result]) => (
                <PermissionResult
                  key={key}
                  title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  result={result}
                />
              ))}
            </div>
          </Card.Body>
        </Card>
      ) : null}

      {/* Preview Mode Status */}
      <StageWrapper requiredFeature="interactive-previews">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold">Preview Mode Status</h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {previewModes.map(mode => (
                <div
                  key={mode.id}
                  className={`p-3 border rounded-lg ${
                    mode.isActive ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{mode.name}</span>
                    <div className="flex items-center gap-1">
                      {mode.requiresUserInteraction ? <span className="text-xs">👤</span> : null}
                      <Badge
                        variant={
                          mode.riskLevel === 'high' ? 'danger' :
                          mode.riskLevel === 'medium' ? 'warning' : 'success'
                        }
                      >
                        {mode.riskLevel}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {mode.description}
                  </div>
                  <div className={`text-xs font-medium ${
                    mode.isActive ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {mode.isActive ? '✅ Active' : '⭕ Inactive'}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </StageWrapper>
    </div>
  );
}

export default EnhancedPermissionTesterView;
