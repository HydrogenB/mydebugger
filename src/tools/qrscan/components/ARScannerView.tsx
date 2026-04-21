/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * ARScannerView — fullscreen, mobile-first QR scanner UI.
 *
 * Design:
 *   - Camera fills the viewport (object-cover).
 *   - A translucent scrim with a center "window" forms the scan target reticle.
 *   - Animated scan-line sweeps inside the reticle while scanning.
 *   - Top bar: close, flip camera, torch.
 *   - Bottom sheet: performance HUD (engine winner, decode ms, FPS, history).
 *   - When a QR is decoded, a floating result card pops up with contextual
 *     actions: open URL, copy, open map, add to wallet/contact, etc.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import type {
  EngineStat,
  ScanPerformance,
  ScanRecord,
  UseQrscanReturn,
} from '../hooks/useQrscan';
import './ARScannerView.css';

type Props = UseQrscanReturn;

const formatMs = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value < 1) return '<1 ms';
  if (value < 10) return `${value.toFixed(1)} ms`;
  return `${Math.round(value)} ms`;
};

const formatCount = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
};

const detectAction = (text: string): { kind: 'url' | 'tel' | 'mailto' | 'sms' | 'wifi' | 'geo' | 'text'; primary: string; href?: string } => {
  const v = text.trim();
  const lower = v.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) return { kind: 'url', primary: 'Open link', href: v };
  if (lower.startsWith('tel:')) return { kind: 'tel', primary: 'Call', href: v };
  if (lower.startsWith('mailto:')) return { kind: 'mailto', primary: 'Send email', href: v };
  if (lower.startsWith('smsto:')) return { kind: 'sms', primary: 'Send SMS', href: `sms:${v.slice(6).replace(/:.*/, '')}` };
  if (lower.startsWith('sms:')) return { kind: 'sms', primary: 'Send SMS', href: v };
  if (lower.startsWith('geo:')) return { kind: 'geo', primary: 'Open map', href: v };
  if (lower.startsWith('wifi:')) return { kind: 'wifi', primary: 'Copy Wi-Fi details' };
  return { kind: 'text', primary: 'Copy text' };
};

const ENGINE_COLORS: Record<string, string> = {
  BarcodeDetector: 'bg-emerald-500/90 text-emerald-50',
  'jsQR-fast': 'bg-sky-500/90 text-sky-50',
  'jsQR-deep': 'bg-amber-500/90 text-amber-50',
};

const ENGINE_DESCRIPTION: Record<string, string> = {
  BarcodeDetector: 'Native · GPU-accelerated',
  'jsQR-fast': 'jsQR · no-inversion pass',
  'jsQR-deep': 'jsQR · inverted QR pass',
};

const TopButton: React.FC<{
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ label, onClick, active, disabled, children }) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className={clsx(
      'h-12 w-12 rounded-full border border-white/20 backdrop-blur-md',
      'flex items-center justify-center text-xl text-white transition',
      'active:scale-95 disabled:opacity-40',
      active ? 'bg-yellow-300/90 text-slate-900' : 'bg-black/40 hover:bg-black/60',
    )}
  >
    {children}
  </button>
);

const Reticle: React.FC<{ scanning: boolean }> = ({ scanning }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div className="relative aspect-square w-[72vw] max-w-[360px]">
      <div className="absolute inset-0 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
      <div className="absolute inset-0 rounded-3xl border border-white/20" />
      <span className="absolute -top-1 -left-1 h-8 w-8 rounded-tl-2xl border-t-4 border-l-4 border-emerald-300" />
      <span className="absolute -top-1 -right-1 h-8 w-8 rounded-tr-2xl border-t-4 border-r-4 border-emerald-300" />
      <span className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-emerald-300" />
      <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-emerald-300" />
      {scanning && (
        <span
          aria-hidden
          className="absolute inset-x-2 top-0 h-0.5 animate-[scanline_1.8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_16px_rgba(110,231,183,0.8)]"
        />
      )}
    </div>
  </div>
);

const EngineChip: React.FC<{ stat: EngineStat; winner: boolean }> = ({ stat, winner }) => (
  <div
    className={clsx(
      'flex flex-col rounded-xl border px-3 py-2',
      winner ? 'border-yellow-300 bg-yellow-300/10' : 'border-white/10 bg-white/5',
    )}
  >
    <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/70">
      <span>{stat.engine}</span>
      {winner && <span className="text-yellow-300">★ winner</span>}
    </div>
    <div className="mt-1 text-sm font-semibold text-white">
      {formatCount(stat.hits)} hit{stat.hits === 1 ? '' : 's'}
    </div>
    <div className="text-[11px] text-white/60">
      avg {formatMs(stat.averageDecodeMs)} · last {formatMs(stat.lastDecodeMs)}
    </div>
  </div>
);

const PerformanceHUD: React.FC<{ performance: ScanPerformance; scanning: boolean }> = ({
  performance: perf,
  scanning,
}) => (
  <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-white backdrop-blur-lg">
    <div className="flex items-center justify-between">
      <div className="text-xs uppercase tracking-widest text-white/60">
        {scanning ? 'Live performance' : 'Last session'}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span
          className={clsx(
            'inline-block h-2 w-2 rounded-full',
            scanning ? 'animate-pulse bg-emerald-400' : 'bg-slate-500',
          )}
        />
        {scanning ? 'scanning' : 'idle'}
      </div>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
      <div>
        <div className="text-2xl font-bold">{formatMs(perf.lastDecodeMs)}</div>
        <div className="text-[11px] uppercase tracking-wide text-white/60">Last decode</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{perf.scansPerSecond ?? '—'}</div>
        <div className="text-[11px] uppercase tracking-wide text-white/60">Scans / sec</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{formatCount(perf.hits)}</div>
        <div className="text-[11px] uppercase tracking-wide text-white/60">Total hits</div>
      </div>
    </div>
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
      {(Object.values(perf.engines) as EngineStat[]).map((stat) => (
        <EngineChip key={stat.engine} stat={stat} winner={perf.winningEngine === stat.engine} />
      ))}
    </div>
    {perf.winningEngine && (
      <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/80">
        <span className="font-semibold">{perf.winningEngine}</span> is winning —{' '}
        {ENGINE_DESCRIPTION[perf.winningEngine]}
      </div>
    )}
  </div>
);

const ResultCard: React.FC<{
  text: string;
  format: string;
  engine: string | null;
  decodeMs: number | null;
  onCopy: () => void;
  onClear: () => void;
}> = ({ text, format, engine, decodeMs, onCopy, onClear }) => {
  const action = useMemo(() => detectAction(text), [text]);
  const isLink = Boolean(action.href);

  return (
    <div className="rounded-2xl border border-emerald-300/40 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-lg">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-emerald-300">
        <span
          className={clsx(
            'inline-block rounded-full px-2 py-0.5',
            engine ? ENGINE_COLORS[engine] ?? 'bg-white/10' : 'bg-white/10',
          )}
        >
          {engine ?? format}
        </span>
        {decodeMs !== null && <span className="text-white/60">{formatMs(decodeMs)}</span>}
      </div>
      <div className="mt-2 max-h-32 overflow-auto break-all text-sm">{text}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {isLink && (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-emerald-400 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition active:scale-95"
          >
            {action.primary} →
          </a>
        )}
        <button
          type="button"
          onClick={onCopy}
          className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition active:scale-95"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Dismiss result"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition active:scale-95"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const HistoryList: React.FC<{
  history: ScanRecord[];
  onOpen: (text: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}> = ({ history, onOpen, onRemove, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
        No scans yet. Point the camera at a QR code.
      </div>
    );
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-white/60">
          Recent ({history.length})
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-white/60 underline-offset-2 hover:text-white hover:underline"
        >
          Clear
        </button>
      </div>
      <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
        {history.slice(0, 5).map((record) => (
          <li key={record.id} className="flex items-center gap-2 px-3 py-2 text-sm">
            <button
              type="button"
              onClick={() => onOpen(record.text)}
              className="flex-1 truncate text-left text-white/90 hover:text-white"
            >
              {record.text}
            </button>
            <span className="text-[11px] uppercase text-white/40">{record.type}</span>
            <button
              type="button"
              aria-label="Remove entry"
              onClick={() => onRemove(record.id)}
              className="text-white/40 hover:text-white"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ARScannerView: React.FC<Props> = ({
  videoRef,
  start,
  stop,
  flip,
  scanning,
  isBusy,
  canFlip,
  cameraStatus,
  cameraPermission,
  error,
  clearError,
  result,
  format,
  clearResult,
  torch,
  performance: perf,
  scanHistory,
  removeHistoryEntry,
  clearHistory,
  scanFromFile,
  processManualText,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualText, setManualText] = useState('');

  const lastEngine = perf.lastEngine;
  const lastDecodeMs = perf.lastDecodeMs;

  useEffect(() => {
    if (!result) return;
    setCopied(false);
  }, [result]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — most likely insecure context
    }
  }, [result]);

  const onFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await scanFromFile(file);
        event.target.value = '';
      }
    },
    [scanFromFile],
  );

  const statusLabel = useMemo(() => {
    if (cameraStatus === 'initializing') return 'Starting camera…';
    if (cameraStatus === 'blocked' || cameraPermission === 'denied') return 'Camera permission needed';
    if (cameraStatus === 'no-device') return 'No camera found on this device';
    if (cameraStatus === 'error') return 'Camera error — tap to retry';
    if (!scanning) return 'Tap Start to scan';
    return 'Point the camera at a QR code';
  }, [cameraPermission, cameraStatus, scanning]);

  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-black text-white">
      {/* Camera surface */}
      <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/80 p-6 text-center">
            <div className="text-4xl">📷</div>
            <div className="max-w-xs text-sm text-white/70">{statusLabel}</div>
            <button
              type="button"
              disabled={isBusy || cameraStatus === 'no-device'}
              onClick={() => void start()}
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 transition active:scale-95 disabled:opacity-40"
            >
              {isBusy ? 'Starting…' : 'Start camera'}
            </button>
          </div>
        )}

        {scanning && <Reticle scanning={scanning} />}

        {/* Top controls */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-4 pt-[max(env(safe-area-inset-top),0.75rem)]">
          <TopButton label={scanning ? 'Stop camera' : 'Camera idle'} onClick={scanning ? stop : () => void start()}>
            {scanning ? '✕' : '▶'}
          </TopButton>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs backdrop-blur-md">
            <span
              className={clsx(
                'h-2 w-2 rounded-full',
                scanning ? 'animate-pulse bg-emerald-400' : 'bg-white/50',
              )}
            />
            {statusLabel}
          </div>
          <div className="flex gap-2">
            {torch.available && (
              <TopButton label="Toggle torch" onClick={() => void torch.toggle()} active={torch.enabled}>
                ⚡
              </TopButton>
            )}
            <TopButton label="Flip camera" onClick={() => void flip()} disabled={!canFlip}>
              ⇆
            </TopButton>
          </div>
        </div>

        {/* Live HUD (compact) */}
        {scanning && (
          <div className="absolute bottom-[max(env(safe-area-inset-bottom),1rem)] left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-4 py-1.5 text-xs font-mono backdrop-blur-md">
            {lastEngine ? (
              <span className="text-emerald-300">{lastEngine}</span>
            ) : (
              <span className="text-white/60">scanning…</span>
            )}
            <span className="mx-2 text-white/30">·</span>
            <span>{formatMs(lastDecodeMs)}</span>
            <span className="mx-2 text-white/30">·</span>
            <span>{perf.scansPerSecond ?? 0}/s</span>
          </div>
        )}

        {/* Result card */}
        {result && (
          <div className="absolute inset-x-4 bottom-[max(env(safe-area-inset-bottom),1.25rem)] sm:inset-x-6">
            <ResultCard
              text={result}
              format={format}
              engine={lastEngine}
              decodeMs={lastDecodeMs}
              onCopy={copyResult}
              onClear={clearResult}
            />
            {copied && (
              <div className="mt-2 text-center text-xs text-emerald-300">Copied to clipboard</div>
            )}
          </div>
        )}
      </div>

      {/* Bottom sheet trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setSheetOpen((prev) => !prev)}
          aria-expanded={sheetOpen}
          className="flex w-full items-center justify-between gap-2 border-t border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white"
        >
          <span>
            <strong>Performance & history</strong>
            <span className="ml-2 text-white/60">
              {perf.hits} hits · winner:{' '}
              {perf.winningEngine ?? '—'}
            </span>
          </span>
          <span className="text-white/60">{sheetOpen ? '▾' : '▸'}</span>
        </button>

        {sheetOpen && (
          <div className="space-y-4 bg-slate-900/95 p-4">
            <PerformanceHUD performance={perf} scanning={scanning} />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
              <div className="mb-2 text-xs uppercase tracking-widest text-white/60">Scan an image</div>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
              <div className="mb-2 text-xs uppercase tracking-widest text-white/60">Paste text</div>
              <div className="flex gap-2">
                <input
                  value={manualText}
                  onChange={(event) => setManualText(event.target.value)}
                  placeholder="Paste QR content..."
                  className="flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualText.trim()) {
                      processManualText(manualText);
                      setManualText('');
                    }
                  }}
                  className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-40"
                  disabled={!manualText.trim()}
                >
                  Record
                </button>
              </div>
            </div>

            <HistoryList
              history={scanHistory}
              onOpen={(text) => {
                const action = detectAction(text);
                if (action.href) window.open(action.href, '_blank', 'noopener');
              }}
              onRemove={removeHistoryEntry}
              onClear={clearHistory}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="absolute inset-x-4 top-20 rounded-xl border border-red-400/40 bg-red-950/80 p-3 text-sm text-red-100 backdrop-blur-md">
          <div className="flex items-start gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="ml-auto text-red-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARScannerView;
