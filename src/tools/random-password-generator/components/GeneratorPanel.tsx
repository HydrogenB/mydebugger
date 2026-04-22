/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Single-viewport password / UUID / key generator with an interactive
 * entropy canvas. Pointer and touch events seed a pool that is XORed
 * against crypto.getRandomValues() output when the user forges a key.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@design-system/components/inputs/Button';
import './CopyAnimation.css';
import {
  generatePassword,
  estimateStrength,
  PasswordOptions,
  generateUUIDv4,
  generateKey,
  KeyOptions,
} from '../lib/generators';
import { EntropyPool } from '../lib/entropy';
import { EntropyCanvas } from './EntropyCanvas';
import { logEvent } from '../../../lib/analytics';

type Mode = 'password' | 'uuid' | 'key';

const defaultPasswordOptions: PasswordOptions = {
  length: 20,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: true,
};

const strengthStyles: Record<string, { bg: string; text: string }> = {
  'Very weak': { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-200' },
  Weak: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-200' },
  Good: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-200' },
  Strong: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-200' },
  'Very strong': { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-200' },
};

export const GeneratorPanel: React.FC = () => {
  const [mode, setMode] = useState<Mode>('password');
  const [passOpts, setPassOpts] = useState<PasswordOptions>(() => {
    try {
      const raw = localStorage.getItem('rpg_options');
      return raw ? { ...defaultPasswordOptions, ...JSON.parse(raw) } : defaultPasswordOptions;
    } catch {
      return defaultPasswordOptions;
    }
  });
  const [keyOpts, setKeyOpts] = useState<KeyOptions>({ bits: 256, format: 'hex' });
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [seedUsed, setSeedUsed] = useState(0);
  const [entropyVersion, setEntropyVersion] = useState(0);

  const poolRef = useRef<EntropyPool>(new EntropyPool());
  const copyBurstRef = useRef<HTMLDivElement | null>(null);

  const regenerate = useCallback(() => {
    const pool = poolRef.current;
    const snapshot = pool.snapshot();
    const seededEvents = pool.events;
    let next = '';
    if (mode === 'uuid') next = generateUUIDv4(snapshot);
    else if (mode === 'key') next = generateKey(keyOpts, snapshot);
    else next = generatePassword(passOpts, snapshot);
    setOutput(next);
    setSeedUsed(seededEvents);
    try { logEvent('rpg_regenerate', { mode, seeded_events: seededEvents }); } catch { /* noop */ }
  }, [mode, passOpts, keyOpts]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  useEffect(() => {
    try { localStorage.setItem('rpg_options', JSON.stringify(passOpts)); } catch { /* noop */ }
  }, [passOpts]);

  const strength = useMemo(
    () => (mode === 'password' ? estimateStrength(passOpts, output || '') : null),
    [mode, passOpts, output],
  );

  const strengthBadge = useMemo(() => {
    if (!strength) return null;
    return strengthStyles[strength.label] ?? {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-200',
    };
  }, [strength]);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(output);
      } else {
        const ta = document.createElement('textarea');
        ta.value = output;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      const container = copyBurstRef.current;
      if (container) {
        const burst = document.createElement('div');
        burst.className = 'copy-burst';
        for (let i = 0; i < 8; i += 1) {
          const dot = document.createElement('span');
          const angle = (i / 8) * 2 * Math.PI;
          const radius = 14;
          dot.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
          dot.style.setProperty('--y', `${Math.sin(angle) * radius}px`);
          burst.appendChild(dot);
        }
        container.appendChild(burst);
        setTimeout(() => burst.remove(), 650);
      }
      setTimeout(() => setCopied(false), 1600);
      try { logEvent('rpg_copy', { mode, length: output.length }); } catch { /* noop */ }
    } catch { /* noop */ }
  };

  const handleEntropyEvent = useCallback(() => {
    // throttle state updates — only re-render every 6 events for perf
    const pool = poolRef.current;
    if (pool.events % 6 === 0) {
      setEntropyVersion((v) => v + 1);
    }
  }, []);

  // Referenced to avoid unused-variable lint when reading progress
  void entropyVersion;

  const resetPool = () => {
    poolRef.current.reset();
    setEntropyVersion((v) => v + 1);
  };

  const charSetCount = [
    passOpts.includeUppercase,
    passOpts.includeLowercase,
    passOpts.includeNumbers,
    passOpts.includeSymbols,
  ].filter(Boolean).length;

  const noCharSetSelected = mode === 'password' && charSetCount === 0;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-4 lg:gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* LEFT: key display + entropy canvas */}
        <div className="flex flex-col gap-4">
          {/* Final render key card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-lg">🔑</span>
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  Final render key
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-200 px-2 py-0.5">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
                  Seeded · {seedUsed} events
                </span>
              </div>
            </div>
            <div
              className="mt-3 rounded-xl bg-gray-950 text-gray-100 font-mono text-base sm:text-lg leading-7 p-4 break-all min-h-[88px] select-all shadow-inner"
              onDoubleClick={regenerate}
              aria-live="polite"
            >
              {output || <span className="text-gray-500">Move your cursor over the entropy canvas to seed your first key.</span>}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5">Length {output.length}</span>
                {mode === 'password' && strength && strengthBadge && (
                  <span className={`rounded-full px-2 py-0.5 ${strengthBadge.bg} ${strengthBadge.text}`}>
                    {strength.label}
                  </span>
                )}
                {mode === 'password' && strength && (
                  <span className="hidden sm:inline text-[11px] text-gray-400">
                    ~{Math.round(strength.entropy)} bits
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative" ref={copyBurstRef}>
                  <Button size="sm" onClick={copyToClipboard} disabled={!output}>
                    {copied ? 'Copied ✓' : 'Copy'}
                  </Button>
                </div>
                <Button size="sm" variant="outline-primary" onClick={regenerate} disabled={noCharSetSelected}>
                  <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 10-7.906 8" /></svg>
                  Forge key
                </Button>
              </div>
            </div>
          </div>

          {/* Entropy canvas */}
          <EntropyCanvas
            pool={poolRef.current}
            onEvent={handleEntropyEvent}
            progress={poolRef.current.progress}
            events={poolRef.current.events}
            className="h-[180px] sm:h-[220px] lg:h-[260px]"
          />
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span>Pointer data XORs against Web Crypto — CSPRNG still guarantees security.</span>
            <button
              type="button"
              onClick={resetPool}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 underline underline-offset-2"
            >
              Reset pool
            </button>
          </div>
        </div>

        {/* RIGHT: settings */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                Output type
              </h2>
            </div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="rpg-mode" className="sr-only">Output type</label>
            <select
              id="rpg-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="password">Password</option>
              <option value="uuid">UUID v4</option>
              <option value="key">Crypto key</option>
            </select>

            {mode === 'password' && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Length</span>
                    <span className="text-sm tabular-nums text-gray-900 dark:text-gray-100">{passOpts.length}</span>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label htmlFor="rpg-length" className="sr-only">Password length</label>
                  <input
                    id="rpg-length"
                    type="range"
                    min={8}
                    max={64}
                    value={passOpts.length}
                    onChange={(e) => setPassOpts({ ...passOpts, length: parseInt(e.target.value, 10) })}
                    className="w-full accent-primary-500"
                  />
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {[12, 16, 20, 24, 32, 48].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPassOpts({ ...passOpts, length: v })}
                        className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                          passOpts.length === v
                            ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-200'
                            : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Character sets</div>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {[
                      { key: 'includeUppercase' as const, label: 'A–Z' },
                      { key: 'includeLowercase' as const, label: 'a–z' },
                      { key: 'includeNumbers' as const, label: '0–9' },
                      { key: 'includeSymbols' as const, label: '!@#$' },
                    ].map((opt) => {
                      const active = passOpts[opt.key];
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setPassOpts({ ...passOpts, [opt.key]: !active })}
                          className={`rounded-lg border px-2.5 py-1.5 text-sm transition-colors text-left ${
                            active
                              ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-100'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      aria-pressed={passOpts.excludeAmbiguous}
                      onClick={() => setPassOpts({ ...passOpts, excludeAmbiguous: !passOpts.excludeAmbiguous })}
                      className={`col-span-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors text-left ${
                        passOpts.excludeAmbiguous
                          ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-100'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      Avoid look-alikes <span className="text-[11px] opacity-70">(O/0, l/1)</span>
                    </button>
                  </div>
                  {noCharSetSelected && (
                    <p className="mt-1.5 text-xs text-red-600">Select at least one character set.</p>
                  )}
                </div>
              </div>
            )}

            {mode === 'key' && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Key size</div>
                  <div className="flex gap-1.5">
                    {([128, 192, 256] as const).map((bits) => (
                      <button
                        key={bits}
                        type="button"
                        onClick={() => setKeyOpts({ ...keyOpts, bits })}
                        className={`flex-1 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                          keyOpts.bits === bits
                            ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-100'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {bits}-bit
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Encoding</div>
                  <div className="flex gap-1.5">
                    {(['hex', 'base64'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setKeyOpts({ ...keyOpts, format: fmt })}
                        className={`flex-1 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                          keyOpts.format === fmt
                            ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-100'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {fmt === 'hex' ? 'Hex' : 'Base64'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mode === 'uuid' && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                UUID v4 · version and variant bits are fixed; the remaining 122 bits come
                from Web Crypto, optionally XORed with your pointer entropy.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-3 sm:p-4 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Local-only. Generated via <span className="font-mono">crypto.getRandomValues</span>; never transmitted or stored.
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</div>
    </div>
  );
};

export default GeneratorPanel;
