/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { noteToFrequency } from '../lib/pitch';
import { tuningPresets, type TuningPreset } from '../lib/tunings';

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
}) => (
  <section
    className="flex flex-col items-center gap-6"
    aria-label="Online guitar tuner"
  >
    <h2 className="text-2xl font-semibold">Real-time Guitar Tuner</h2>
    <label htmlFor="tuning" className="sr-only">
      Select tuning
    </label>
    <select
      id="tuning"
      className="border rounded px-2 py-1"
      value={tuningId}
      onChange={(e) => setTuning(e.target.value)}
    >
      {tuningPresets.map((preset) => (
        <option key={preset.id} value={preset.id}>
          {preset.label}
        </option>
      ))}
    </select>
    <ul className="flex gap-2">
      {tuning.notes.map((n) => (
        <li key={n} className="text-sm">
          {n} ({noteToFrequency(n).toFixed(1)} Hz)
        </li>
      ))}
    </ul>
    {error && (
      <p role="alert" className="text-red-500">
        {error}
      </p>
    )}
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
      className="px-4 py-2 rounded bg-blue-600 text-white"
      onClick={active ? stop : start}
      aria-pressed={active}
    >
      {active ? 'Stop Tuning' : 'Start Tuning'}
    </button>
  </section>
);

export default GuitarTunerPanel;

