/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Button } from '../../../design-system/components/inputs';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import type { ScanRecord, SessionStats, UseQrscanReturn } from '../hooks/useQrscan';

const CAMERA_STATUS_STYLES: Record<string, string> = {
  ready: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
  initializing: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
  blocked: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
  'no-device': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800',
  error: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
  idle: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-200 dark:border-slate-800',
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
  if (!ms || ms <= 0) return '—';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const formatTimestamp = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return String(timestamp);
  }
};

const isOpenableLink = (text: string) =>
  text.startsWith('http://') ||
  text.startsWith('https://') ||
  text.startsWith('mailto:') ||
  text.startsWith('tel:');

interface Props extends UseQrscanReturn {}

const QRScannerPanelFixed: React.FC<Props> = (props) => {
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

  const cameraStatusClass = CAMERA_STATUS_STYLES[cameraStatus] ?? CAMERA_STATUS_STYLES.idle;
  const cameraStatusLabel = CAMERA_STATUS_LABEL[cameraStatus] ?? CAMERA_STATUS_LABEL.idle;

  const statsRows: Array<{ label: string; value: string }> = useMemo(
    () => [
      { label: 'Total Scans', value: String(sessionStats.totalScans) },
      { label: 'Unique', value: String(sessionStats.uniqueScans) },
      { label: 'Duplicates', value: String(sessionStats.duplicateCount) },
      { label: 'Avg Interval', value: formatDuration(sessionStats.averageIntervalMs) },
    ],
    [sessionStats],
  );

  const handleStart = () => {
    void start();
  };

  const handleFlip = () => {
    void flip();
  };

  const handleSwitchCamera = (deviceId: string) => {
    void switchCamera(deviceId);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await scanFromFile(file);
    event.target.value = '';
  };

  const handleCopyResult = async () => {
    if (!result) return;
    try {
      setIsCopying(true);
      await navigator.clipboard?.writeText?.(result);
      setTimeout(() => setIsCopying(false), 600);
    } catch {
      setIsCopying(false);
    }
  };

  const handleOpenResult = () => {
    if (!result || !isOpenableLink(result)) return;
    window.open(result, '_blank', 'noopener');
  };

  const headingDescription =
    'Use your device camera to scan QR codes, or import an image to decode. Your history stays in your browser.';

  return (
    <div className={TOOL_PANEL_CLASS}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Scanner</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{headingDescription}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
              cameraStatusClass,
            )}
          >
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
            <span className="text-lg" aria-hidden="true">!</span>
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
              autoPlay
              aria-label="Camera preview"
            />
            {isBusy ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
                Initializing...
              </div>
            ) : null}
            {!scanning && !isBusy ? (
              <div className="absolute inset-x-4 bottom-4 rounded-lg bg-black/60 p-3 text-center text-xs text-gray-100">
                Allow camera access and click <strong>Start Scanner</strong> to begin.
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleStart} disabled={scanning || isBusy || cameraStatus === 'blocked'}>
              {scanning ? 'Scanning...' : 'Start Scanner'}
            </Button>
            <Button variant="outline-secondary" onClick={stop} disabled={!scanning}>
              Stop
            </Button>
            <Button variant="outline-primary" onClick={handleFlip} disabled={!canFlip || isBusy}>
              Switch Camera
            </Button>
            {torch.available ? (
              <Button variant={torch.enabled ? 'secondary' : 'outline-secondary'} onClick={() => void torch.toggle()} disabled={isBusy}>
                {torch.enabled ? 'Torch On' : 'Torch Off'}
              </Button>
            ) : null}
          </div>

          {devices.length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">Camera</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-900"
                    value={selectedCamera}
                    onChange={(e) => handleSwitchCamera(e.target.value)}
                    disabled={isBusy}
                  >
                    {devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 6)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {zoom.available ? (
                  <div className="min-w-[240px]">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      Zoom <span className="text-gray-500 dark:text-gray-400">({zoom.value.toFixed(1)}x)</span>
                    </label>
                    <input
                      type="range"
                      min={zoom.min}
                      max={zoom.max}
                      step={zoom.step}
                      value={zoom.value}
                      onChange={(e) => void zoom.set(parseFloat(e.target.value))}
                      disabled={isBusy}
                      className="mt-2 w-full accent-blue-500"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Import QR image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isBusy}
                  className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 dark:text-gray-300"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Manual input</label>
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-900"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste decoded text here"
                  />
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      processManualText(manualText);
                      setManualText('');
                    }}
                    disabled={!manualText.trim() || isBusy}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {result ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Latest Result</div>
                  <div className="mt-1 break-words font-mono text-sm text-gray-800 dark:text-gray-200">{result}</div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Format: {format} · Source: {lastSource || '—'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void handleCopyResult()} disabled={isCopying}>
                    {isCopying ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" variant="outline-primary" onClick={handleOpenResult} disabled={!isOpenableLink(result)}>
                    Open
                  </Button>
                  <Button size="sm" variant="outline-secondary" onClick={clearResult}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/30">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Session</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {statsRows.map((row) => (
                <div key={row.label} className="rounded-xl border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{row.label}</div>
                  <div className="mt-1 font-semibold text-gray-900 dark:text-white">{row.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Last scan: {lastScanTime ? formatTimestamp(lastScanTime) : '—'}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline-secondary" onClick={exportHistory} disabled={scanHistory.length === 0}>
                Export history
              </Button>
              <Button size="sm" variant="danger" onClick={clearHistory} disabled={scanHistory.length === 0}>
                Clear history
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/30">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Settings</div>
            <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <label className="flex items-center justify-between gap-3">
                <span>Auto-copy results</span>
                <input type="checkbox" checked={autoCopy} onChange={(e) => setAutoCopy(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Auto-open URLs</span>
                <input type="checkbox" checked={autoOpen} onChange={(e) => setAutoOpen(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Success sound</span>
                <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Continuous scanning</span>
                <input type="checkbox" checked={continuousMode} onChange={(e) => setContinuousMode(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Filter duplicates</span>
                <input type="checkbox" checked={filterDuplicates} onChange={(e) => setFilterDuplicates(e.target.checked)} />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/30">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">History</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{scanHistory.length} items</div>
            </div>

            {scanHistory.length === 0 ? (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">No scans yet.</div>
            ) : (
              <ul className="mt-3 divide-y divide-gray-200 text-sm dark:divide-gray-700">
                {scanHistory.slice(0, 20).map((entry) => (
                  <li key={entry.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-mono text-xs text-gray-800 dark:text-gray-200">{entry.text}</div>
                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                          <span>{entry.format}</span>
                          <span>·</span>
                          <span>{entry.source}</span>
                          <span>·</span>
                          <span>{formatTimestamp(entry.timestamp)}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="xs"
                          variant="outline-secondary"
                          onClick={() => void navigator.clipboard?.writeText?.(entry.text)}
                        >
                          Copy
                        </Button>
                        <Button size="xs" variant="danger" onClick={() => removeHistoryEntry(entry.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sr-only" aria-live="polite">{isCopying ? 'Copied to clipboard' : ''}</div>
          <div className="sr-only">Total scans: {scanCount}</div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPanelFixed;

export type { ScanRecord, SessionStats };
