/**
 * ? 2025 MyDebugger Contributors � MIT License
 */
import React, { useMemo, useState } from 'react';
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
  initializing: 'Starting Camera�',
  blocked: 'Permission Required',
  'no-device': 'No Camera Found',
  error: 'Camera Error',
  idle: 'Camera Idle',
};

const formatDuration = (ms: number | null): string => {
  if (!ms || Number.isNaN(ms)) return '�';
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
      return '??';
    case 'email':
      return '??';
    case 'phone':
      return '??';
    case 'sms':
      return '??';
    case 'wifi':
      return '??';
    case 'location':
      return '??';
    case 'vcard':
      return '??';
    case 'bitcoin':
      return '?';
    default:
      return '??';
  }
};

const isOpenableLink = (text: string) => text.startsWith('http://') || text.startsWith('https://') || text.startsWith('mailto:') || text.startsWith('tel:');

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
            <span className="text-lg">??</span>
            <p>{error}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-black/80 shadow-sm dark:border-gray-700">
            <video
              ref={videoRef}
              className="aspect-video w-full bg-black object-cover"
              muted
              playsInline
            />
            {isBusy ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
                Initialising�
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
              {scanning ? 'Scanning�' : 'Start Scanner'}
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
                    <span className="font-medium">{zoom.value.toFixed(2)}?</span>
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
                    {isCopying ? 'Copying�' : 'Copy'}
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import or Manual Decode</h2>
            </div>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-medium text-gray-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                Upload Image
              </label>
              <form onSubmit={handleManualSubmit} className="flex-1">
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
                  <span>{lastScanTime ? formatTimestamp(lastScanTime) : '�'}</span>
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
