/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useMemo, useState, useCallback, useRef } from 'react';
import clsx from 'clsx';

import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Button } from '../../../design-system/components/inputs';
import type { ScanRecord, SessionStats, UseQrscanReturn } from '../hooks/useQrscan';

const CAMERA_STATUS_STYLES: Record<string, string> = {
  ready: 'bg-green-100 text-green-800 border-green-200',
  initializing: 'bg-blue-100 text-blue-800 border-blue-200',
  blocked: 'bg-red-100 text-red-700 border-red-200',
  'no-device': 'bg-gray-100 text-gray-700 border-gray-300',
  error: 'bg-red-100 text-red-700 border-red-200',
  idle: 'bg-slate-100 text-slate-700 border-slate-200',
};

const CAMERA_STATUS_LABEL: Record<string, string> = {
  ready: 'Camera Ready',
  initializing: 'Starting Camera...',
  blocked: 'Permission Required',
  'no-device': 'No Camera Found',
  error: 'Camera Error',
  idle: 'Camera Idle',
};

const formatDuration = (ms: number | null): string => {
  if (!ms || Number.isNaN(ms)) return '-';
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleString();

const typeIcon = (type: string): string => {
  switch (type) {
    case 'url':
      return '[link]';
    case 'email':
      return '[email]';
    case 'phone':
      return '[phone]';
    case 'sms':
      return '[sms]';
    case 'wifi':
      return '[wifi]';
    case 'location':
      return '[loc]';
    case 'vcard':
      return '[vcard]';
    case 'bitcoin':
      return '[btc]';
    default:
      return '[text]';
  }
};

const isOpenableLink = (text: string) => text.startsWith('http://') || text.startsWith('https://') || text.startsWith('mailto:') || text.startsWith('tel:');

type ScanMode = 'camera' | 'file';

interface Props extends UseQrscanReturn {}

const QRScannerPanel: React.FC<Props> = (props) => {
  const {
    videoRef,
    start,
    stop,
    flip,
    switchCamera,
    refreshDevices,
    scanning,
    isBusy,
    canFlip,
    cameraStatus,
    cameraPermission,
    error,
    clearError,
    result,
    format,
    lastSource,
    clearResult,
    devices,
    selectedCamera,
    scanHistory,
    removeHistoryEntry,
    clearHistory,
    exportHistory,
    sessionStats,
    scanCount,
    lastScanTime,
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
    torch,
    zoom,
    scanFromFile,
    processManualText,
  } = props;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [manualText, setManualText] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  // New state for scan mode
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const permissionLabel = useMemo(() => {
    switch (cameraPermission) {
      case 'granted':
        return 'Permission Granted';
      case 'denied':
        return 'Permission Denied';
      case 'prompt':
        return 'Permission Needed';
      default:
        return 'Permission Unknown';
    }
  }, [cameraPermission]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await scanFromFile(file);
    event.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      return;
    }

    await scanFromFile(file);
  }, [scanFromFile]);

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = manualText.trim();
    if (!text) return;
    processManualText(text);
    setManualText('');
  };

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(value);
    } finally {
      setIsCopying(false);
    }
  };

  const openResult = () => {
    if (!result) return;
    if (!isOpenableLink(result)) return;
    window.open(result, '_blank', 'noopener');
  };

  const startScan = () => start();

  const cameraStatusClass = CAMERA_STATUS_STYLES[cameraStatus] ?? CAMERA_STATUS_STYLES.idle;
  const cameraStatusLabel = CAMERA_STATUS_LABEL[cameraStatus] ?? CAMERA_STATUS_LABEL.idle;

  const statsRows: Array<{ label: string; value: string }> = [
    { label: 'Total Scans', value: String(sessionStats.totalScans) },
    { label: 'Unique Results', value: String(sessionStats.uniqueScans) },
    { label: 'Duplicates Filtered', value: String(sessionStats.duplicateCount) },
    { label: 'Average Interval', value: formatDuration(sessionStats.averageIntervalMs) },
    { label: 'Last Scan Ago', value: formatDuration(sessionStats.lastScanAgoMs) },
  ];

  const showTorchControl = torch.available;
  const showZoomControl = zoom.available && zoom.max > zoom.min;

  const headingDescription = 'Scan QR codes with live camera preview, import images, and manage a persistent scan history.';

  return (
    <div className={TOOL_PANEL_CLASS}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Scanner</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{headingDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={clsx('flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium', cameraStatusClass)}>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-current opacity-70" />
            {cameraStatusLabel}
          </span>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            {permissionLabel}
          </span>
          <Button size="sm" variant="outline-secondary" onClick={refreshDevices} disabled={isBusy}>
            Refresh Cameras
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-start gap-2">
            <span className="text-lg">Warning</span>
            <p>{error}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {/* Mode Selector Tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => setScanMode('camera')}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            scanMode === 'camera'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          )}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Camera Scan
        </button>
        <button
          type="button"
          onClick={() => setScanMode('file')}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            scanMode === 'file'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          )}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          File Upload
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {/* Camera Mode */}
          {scanMode === 'camera' && (
            <>
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-black/80 shadow-sm dark:border-gray-700">
                <video
                  ref={videoRef}
                  className="aspect-video w-full bg-black object-cover"
                  muted
                  playsInline
                />
                {isBusy ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
                    Initialising...
                  </div>
                ) : null}
                {!scanning && !isBusy ? (
                  <div className="absolute inset-x-4 bottom-4 rounded-lg bg-black/60 p-3 text-center text-xs text-gray-100">
                    Allow camera access and click <strong>Start Scanner</strong> to begin.
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={startScan} disabled={scanning || isBusy || cameraStatus === 'blocked'}>
                  {scanning ? 'Scanning...' : 'Start Scanner'}
                </Button>
                <Button variant="outline-secondary" onClick={stop} disabled={!scanning}>
                  Stop
                </Button>
                <Button variant="outline-primary" onClick={flip} disabled={!canFlip || isBusy}>
                  Switch Camera
                </Button>
                <Button variant="ghost" onClick={() => switchCamera(selectedCamera)} disabled={isBusy}>
                  Reconnect
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="camera-select">
                    Active Camera
                  </label>
                  <select
                    id="camera-select"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                    value={selectedCamera}
                    onChange={(event) => switchCamera(event.target.value)}
                    disabled={devices.length === 0 || isBusy}
                  >
                    {devices.length === 0 ? (
                      <option>No camera detected</option>
                    ) : (
                      devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || 'Camera'}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid gap-4">
                  {showTorchControl ? (
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                      <span>Torch</span>
                      <Button size="sm" variant="outline-secondary" onClick={torch.toggle}>
                        {torch.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  ) : null}
                  {showZoomControl ? (
                    <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Zoom</span>
                        <span className="font-medium">{zoom.value.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={zoom.min}
                        max={zoom.max}
                        step={zoom.step || 0.1}
                        value={zoom.value}
                        onChange={(event) => zoom.set(Number(event.target.value))}
                        className="mt-2 w-full"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}

          {/* File Upload Mode */}
          {scanMode === 'file' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
              className={clsx(
                'relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200',
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/10'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className={clsx(
                'mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors',
                isDragging
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              )}>
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className={clsx(
                'text-lg font-semibold transition-colors',
                isDragging
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-200'
              )}>
                {isDragging ? 'Drop your image here' : 'Drag & drop an image'}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                or click to browse files
              </p>
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                Supported: PNG, JPG, JPEG, GIF, WebP
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scanner Output</h2>
              {result ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="rounded-full border border-gray-300 px-2 py-0.5 uppercase">
                    {format}
                  </span>
                  <span className="rounded-full border border-gray-300 px-2 py-0.5 capitalize">
                    {lastSource || 'camera'}
                  </span>
                </div>
              ) : null}
            </div>

            {result ? (
              <>
                <p className="mt-3 break-words rounded-lg bg-gray-50 p-3 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                  {result}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => copyToClipboard(result)} disabled={isCopying}>
                    {isCopying ? 'Copying...' : 'Copy'}
                  </Button>
                  <Button size="sm" variant="outline-primary" onClick={openResult} disabled={!isOpenableLink(result)}>
                    Open
                  </Button>
                  <Button size="sm" variant="outline-secondary" onClick={clearResult}>
                    Clear
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                No scans yet. Hold a QR code in front of the camera or drop an image to decode.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Decode</h2>
            </div>
            <form onSubmit={handleManualSubmit} className="mt-3">
              <textarea
                value={manualText}
                onChange={(event) => setManualText(event.target.value)}
                rows={3}
                placeholder="Paste QR content manually to record it"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" type="submit" disabled={!manualText.trim()}>
                  Save Manual Entry
                </Button>
              </div>
            </form>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Session Stats</h2>
              <Button size="sm" variant="ghost" onClick={() => setStatsOpen((previous) => !previous)}>
                {statsOpen ? 'Hide' : 'Show'}
              </Button>
            </div>
            {statsOpen ? (
              <dl className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {statsRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800">
                    <dt>{row.label}</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-100">{row.value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <span>Last Scan</span>
                  <span>{lastScanTime ? formatTimestamp(lastScanTime) : '-'}</span>
                </div>
              </dl>
            ) : null}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
              <Button size="sm" variant="ghost" onClick={() => setSettingsOpen((previous) => !previous)}>
                {settingsOpen ? 'Hide' : 'Show'}
              </Button>
            </div>
            {settingsOpen ? (
              <div className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <label className="flex items-center justify-between">
                  <span>Auto-copy results</span>
                  <input type="checkbox" checked={autoCopy} onChange={(event) => setAutoCopy(event.target.checked)} />
                </label>
                <label className="flex items-center justify-between">
                  <span>Auto-open URLs</span>
                  <input type="checkbox" checked={autoOpen} onChange={(event) => setAutoOpen(event.target.checked)} />
                </label>
                <label className="flex items-center justify-between">
                  <span>Success sound</span>
                  <input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} />
                </label>
                <label className="flex items-center justify-between">
                  <span>Continuous scanning</span>
                  <input type="checkbox" checked={continuousMode} onChange={(event) => setContinuousMode(event.target.checked)} />
                </label>
                <label className="flex items-center justify-between">
                  <span>Filter duplicate results</span>
                  <input type="checkbox" checked={filterDuplicates} onChange={(event) => setFilterDuplicates(event.target.checked)} />
                </label>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scan History</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setHistoryOpen((previous) => !previous)}>
              {historyOpen ? 'Hide' : 'Show'}
            </Button>
            <Button size="sm" variant="outline-primary" onClick={exportHistory} disabled={scanHistory.length === 0}>
              Export
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={clearHistory} disabled={scanHistory.length === 0}>
              Clear
            </Button>
          </div>
        </div>

        {historyOpen ? (
          <div className="mt-3">
            {scanHistory.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                No history yet. Scans will appear here with quick actions.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 text-sm dark:divide-gray-700">
                {scanHistory.map((entry) => (
                  <li key={entry.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{typeIcon(entry.type)} {entry.type.toUpperCase()}</span>
                          <span className="rounded-full border border-gray-200 px-2 py-0.5 dark:border-gray-600">{entry.format}</span>
                          <span className="rounded-full border border-gray-200 px-2 py-0.5 capitalize dark:border-gray-600">{entry.source}</span>
                          <span>{formatTimestamp(entry.timestamp)}</span>
                        </div>
                        <p className="mt-2 break-words font-mono text-gray-900 dark:text-gray-100">
                          {entry.text}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Button size="sm" onClick={() => copyToClipboard(entry.text)}>Copy</Button>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => isOpenableLink(entry.text) && window.open(entry.text, '_blank', 'noopener')}
                          disabled={!isOpenableLink(entry.text)}
                        >
                          Open
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeHistoryEntry(entry.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default QRScannerPanel;
