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
      'h-9 w-9 rounded-full border border-white/20 backdrop-blur-md',
      'flex items-center justify-center text-base text-white transition',
      'active:scale-95 disabled:opacity-40',
      active ? 'bg-yellow-300/90 text-slate-900' : 'bg-black/40 hover:bg-black/60',
    )}
  >
    {children}
  </button>
);

const Reticle: React.FC<{ scanning: boolean }> = ({ scanning }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div className="relative aspect-square w-[60vmin] max-w-[300px]">
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
  scanHint,
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
    if (cameraStatus === 'error') return 'Camera error — tap retry';
    if (!scanning) return 'Starting…';
    return 'Point the camera at a QR code';
  }, [cameraPermission, cameraStatus, scanning]);

  const blocked = !scanning && (cameraStatus === 'blocked' || cameraStatus === 'error' || cameraStatus === 'no-device' || cameraPermission === 'denied');

  const recent = scanHistory.slice(0, 3);
  const openLink = useCallback((text: string) => {
    const action = detectAction(text);
    if (action.href) window.open(action.href, '_blank', 'noopener');
  }, []);

  return (
    <div className="relative isolate flex h-[calc(100vh-180px)] min-h-[520px] flex-col overflow-hidden rounded-2xl bg-black text-white">
      {/* Camera surface */}
      <div className="relative w-full flex-1 overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
        />
        {blocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/85 p-6 text-center">
            <div className="text-3xl">📷</div>
            <div className="max-w-xs text-sm text-white/70">{statusLabel}</div>
            <button
              type="button"
              disabled={isBusy || cameraStatus === 'no-device'}
              onClick={() => void start()}
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 transition active:scale-95 disabled:opacity-40"
            >
              {isBusy ? 'Starting…' : 'Retry camera'}
            </button>
          </div>
        )}

        {scanning && <Reticle scanning={scanning} />}

        {scanning && scanHint && !result && (
          <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-6">
            <div className="max-w-xs rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-center text-[11px] text-white/90 backdrop-blur-md">
              {scanHint}
            </div>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3 pt-[max(env(safe-area-inset-top),0.5rem)]">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[11px] backdrop-blur-md">
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

        {/* Live HUD (compact, bottom) */}
        {scanning && !result && (
          <div className="absolute bottom-[max(env(safe-area-inset-bottom),0.6rem)] left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-mono backdrop-blur-md">
            {lastEngine ? (
              <span className="text-emerald-300">{lastEngine}</span>
            ) : (
              <span className="text-white/60">searching…</span>
            )}
            <span className="mx-1.5 text-white/30">·</span>
            <span>{formatMs(lastDecodeMs)}</span>
            <span className="mx-1.5 text-white/30">·</span>
            <span>{perf.scansPerSecond ?? 0}/s</span>
            <span className="mx-1.5 text-white/30">·</span>
            <span>{formatCount(perf.attempts)}f</span>
          </div>
        )}

        {/* Result card (auto-dismisses in continuous mode) */}
        {result && (
          <div className="absolute inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] sm:inset-x-6">
            <ResultCard
              text={result}
              format={format}
              engine={lastEngine}
              decodeMs={lastDecodeMs}
              onCopy={copyResult}
              onClear={clearResult}
            />
            {copied && (
              <div className="mt-1 text-center text-[11px] text-emerald-300">Copied to clipboard</div>
            )}
          </div>
        )}

        {error && (
          <div className="absolute inset-x-3 top-14 rounded-lg border border-red-400/40 bg-red-950/80 p-2 text-xs text-red-100 backdrop-blur-md">
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

      {/* Compact HUD strip — always visible, fits in one screen */}
      <div className="flex shrink-0 flex-col gap-1.5 border-t border-white/10 bg-slate-950/95 p-2 text-xs text-white">
        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
          <span className="text-[10px] uppercase tracking-wider text-white/50">HITS</span>
          <span className="font-mono text-sm">{formatCount(perf.hits)}</span>
          <span className="text-white/30">·</span>
          <span className="text-[10px] uppercase tracking-wider text-white/50">WIN</span>
          <span
            className={clsx(
              'rounded-full px-2 py-0.5 font-mono text-[11px]',
              perf.winningEngine ? ENGINE_COLORS[perf.winningEngine] ?? 'bg-white/10' : 'bg-white/5 text-white/40',
            )}
          >
            {perf.winningEngine ?? '—'}
          </span>
          <span className="text-white/30">·</span>
          <span className="font-mono">{perf.scansPerSecond ?? 0}/s</span>
          <span className="text-white/30">·</span>
          <span className="font-mono">{formatMs(perf.lastDecodeMs)}</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-white/40">
            {(Object.values(perf.engines) as EngineStat[])
              .filter((engine) => engine.attempts > 0)
              .map((engine) => (
                <span key={engine.engine} className="rounded bg-white/5 px-1.5 py-0.5 font-mono">
                  {engine.engine.replace('jsQR-', '')}:{engine.hits}
                </span>
              ))}
          </span>
        </div>

        {/* Controls row: scan image + paste text */}
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white hover:bg-white/10">
            <span aria-hidden>📁</span>
            <span>Scan image</span>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
          <input
            value={manualText}
            onChange={(event) => setManualText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && manualText.trim()) {
                processManualText(manualText);
                setManualText('');
              }
            }}
            placeholder="Paste QR content…"
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-slate-900/60 px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={() => {
              if (manualText.trim()) {
                processManualText(manualText);
                setManualText('');
              }
            }}
            disabled={!manualText.trim()}
            className="rounded-md bg-emerald-400 px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 disabled:opacity-40"
          >
            Record
          </button>
        </div>

        {/* Recent row — collapsible if there are many */}
        {recent.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] uppercase tracking-wider text-white/50">RECENT</span>
            <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {recent.map((record) => (
                <li
                  key={record.id}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px]"
                >
                  <button
                    type="button"
                    onClick={() => openLink(record.text)}
                    className="max-w-[180px] truncate text-left text-white/90 hover:text-white"
                    title={record.text}
                  >
                    {record.text}
                  </button>
                  <span className="text-[9px] uppercase text-white/40">{record.type}</span>
                  <button
                    type="button"
                    aria-label="Remove entry"
                    onClick={() => removeHistoryEntry(record.id)}
                    className="text-white/40 hover:text-white"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setSheetOpen((prev) => !prev)}
              className="text-[10px] text-white/50 hover:text-white"
            >
              {sheetOpen ? 'less ▴' : `all (${scanHistory.length}) ▾`}
            </button>
          </div>
        )}

        {sheetOpen && (
          <div className="border-t border-white/10 pt-2">
            <HistoryList
              history={scanHistory}
              onOpen={openLink}
              onRemove={removeHistoryEntry}
              onClear={clearHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ARScannerView;
