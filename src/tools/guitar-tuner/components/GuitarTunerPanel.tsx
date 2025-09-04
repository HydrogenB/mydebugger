/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import clsx from 'clsx';
import { PlayIcon, StopIcon } from '@heroicons/react/24/solid';
import { noteToFrequency } from '../lib/pitch';
import { tuningPresets, type TuningPreset } from '../lib/tunings';
import TunerDial from './TunerDial';

interface Props {
  frequency: number | null;
  note: string;
  active: boolean;
  error: string;
  start: () => void;
  stop: () => void;
  tuningId: string;
  setTuning: (id: string) => void;
  tuning: TuningPreset;
  detune: number;
  confidence: number;
  a4: number;
  setA4: (v: number) => void;
  customNotes: string[];
  setCustomNotes: (notes: string[]) => void;
}

const GuitarTunerPanel: React.FC<Props> = ({
  frequency,
  note,
  active,
  error,
  start,
  stop,
  tuningId,
  setTuning,
  tuning,
  detune,
  confidence,
  a4,
  setA4,
  customNotes,
  setCustomNotes,
}) => (
  <section
    className="flex flex-col items-center gap-6 w-full max-w-2xl p-6 border rounded-lg bg-white/70 dark:bg-zinc-900/40 shadow"
    aria-label="Online guitar tuner"
  >
    <h2 className="text-2xl font-semibold">Real-time Guitar Tuner</h2>
    <label htmlFor="tuning" className="sr-only">
      Select tuning
    </label>
    <select
      id="tuning"
      className="border rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      value={tuningId}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTuning(e.target.value)}
    >
      <option value="custom">Custom (6-string)</option>
      {tuningPresets.map((preset) => (
        <option key={preset.id} value={preset.id}>
          {preset.label}
        </option>
      ))}
    </select>
    <p className="text-xs text-zinc-600 dark:text-zinc-400 -mt-2">Choose a preset or select Custom to edit target notes.</p>

    {/* Custom tuning editor */}
    {tuningId === 'custom' && (
      <div className="w-full max-w-md p-3 rounded border bg-white/50 dark:bg-zinc-900/40">
        <p id="custom-help" className="text-sm mb-2">
          Enter six target notes (e.g., E2, A2, D3, G3, B3, E4). Use # for sharps.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="group" aria-labelledby="custom-help">
          {[0,1,2,3,4,5].map((i) => {
            const val = customNotes[i] ?? '';
            const isValid = /^([A-G]#?)(-?\d)$/.test(val);
            const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const next = [...customNotes];
              next[i] = e.target.value.trim();
              setCustomNotes(next);
            };
            return (
              <input
                key={i}
                inputMode="text"
                aria-label={`String ${i + 1} note`}
                aria-invalid={!isValid && val !== ''}
                className={clsx(
                  'px-2 py-1 rounded border text-center uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                  isValid || val === ''
                    ? 'border-zinc-300 dark:border-zinc-700'
                    : 'border-red-500',
                )}
                placeholder={["E2", "A2", "D3", "G3", "B3", "E4"][i]}
                value={val}
                onChange={onChange}
                maxLength={3}
              />
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">Invalid entries are highlighted in red and ignored in frequency display.</p>
      </div>
    )}
    <ul className="flex gap-2 flex-wrap justify-center">
      {tuning.notes.map((n: string, idx: number) => {
        let hz = '--';
        try { hz = noteToFrequency(n).toFixed(1); } catch (_) { /* ignore invalid */ }
        const isCurrent = n === note;
        return (
          <li
            key={`${n}-${idx}`}
            className={clsx(
              'text-sm px-1 rounded',
              isCurrent && 'bg-sky-100 dark:bg-sky-700/30 font-semibold',
            )}
          >
            {n || '—'} ({hz} Hz)
          </li>
        );
      })}
    </ul>
    {error && (
      <p role="alert" className="text-red-500">
        {error}
      </p>
    )}

    {/* Animated dial */}
    <TunerDial detune={detune} note={note} frequency={frequency} confidence={confidence} />

    {/* Calibration control */}
    <div className="w-full max-w-md">
      <label htmlFor="a4" className="block text-sm font-medium">
        Calibration A4: <span className="tabular-nums">{a4} Hz</span>
      </label>
      <input
        id="a4"
        type="range"
        min={415}
        max={466}
        step={1}
        value={a4}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setA4(Number(e.target.value))}
        className="w-full"
        aria-valuemin={415}
        aria-valuemax={466}
        aria-valuenow={a4}
        aria-label="Calibration A4 frequency"
      />
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
        Adjust reference pitch. Default is 440 Hz.
      </p>
    </div>

    <div className="text-center">
      <p className="text-5xl font-bold" aria-live="polite">
        {note || '--'}
      </p>
      {frequency && (
        <p className="text-xl" aria-live="polite">
          {frequency.toFixed(2)} Hz
        </p>
      )}
    </div>

    <button
      type="button"
      className={clsx(
        'px-4 py-2 rounded text-white transition-colors flex items-center gap-2 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500',
        active ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700',
      )}
      onClick={active ? stop : start}
      aria-pressed={active}
    >
      {active ? (
        <>
          <StopIcon className="h-5 w-5" />
          Stop Tuning
        </>
      ) : (
        <>
          <PlayIcon className="h-5 w-5" />
          Start Tuning
        </>
      )}
    </button>
  </section>
);

export default GuitarTunerPanel;

