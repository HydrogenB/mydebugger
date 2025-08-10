/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState } from 'react';
import ProgressRing from '../src/design-system/components/feedback/ProgressRing';

export interface StayAwakeViewProps {
  supported: boolean;
  running: boolean;
  timeLeft: number;
  duration: number;
  toggle: () => Promise<void>;
  start: (ms: number) => Promise<void>;
  stats: { todayMin: number; weekHr: number; weekMin: number };
  resetStats: () => void;
}

const formatTime = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((total % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

function StayAwakeView({
  supported,
  running,
  timeLeft,
  duration,
  toggle,
  start,
  stats,
  resetStats,
}: StayAwakeViewProps) {
  const [custom, setCustom] = useState('00:00');

  if (!supported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-red-500 font-bold text-center px-4">Wake Lock not supported in this browser.</p>
      </div>
    );
  }

  const progress = duration ? (duration - timeLeft) / duration : 0;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-md w-full space-y-6 text-center">
        <button
          type="button"
          id="wake-toggle"
          aria-label="Toggle screen-awake session"
          onClick={toggle}
          className="relative w-48 h-48 rounded-full border-8 border-gray-300 dark:border-gray-700 flex items-center justify-center mx-auto focus:outline-none"
        >
          <ProgressRing progress={progress} className="absolute text-teal-500" />
          {!running && <span id="toggle-icon" className="text-4xl text-gray-700 dark:text-gray-200 z-0">▶️</span>}
          <span id="timer-text" className="absolute text-xl text-gray-800 dark:text-gray-100 z-10">
            {formatTime(timeLeft)}
          </span>
        </button>

        <div id="quick-controls" className="mt-6 flex items-center justify-center space-x-3">
          <button
            type="button"
            className="duration-chip px-4 py-2 rounded-full border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900"
            onClick={() => start(30 * 60 * 1000)}
          >
            30 min
          </button>
          <button
            type="button"
            className="hidden sm:block duration-chip px-4 py-2 rounded-full border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900"
            onClick={() => start(60 * 60 * 1000)}
          >
            1 hr
          </button>
          <button
            type="button"
            className="duration-chip px-4 py-2 rounded-full border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900"
            onClick={() => start(2 * 60 * 60 * 1000)}
          >
            2 hr
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const [h, m] = custom.split(':').map((v) => parseInt(v, 10));
              const ms = (h * 60 + m) * 60 * 1000;
              start(ms);
            }}
            className="flex space-x-2 items-center"
          >
            <input
              type="time"
              required
              value={custom}
              step={60}
              onChange={(e) => setCustom(e.target.value)}
              className="w-24 p-2 border rounded"
            />
            <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded">
              Start
            </button>
          </form>
        </div>
      </div>

      <div id="stats" className="mt-6 text-gray-700 dark:text-gray-300">
        Today: <span id="today-min">{stats.todayMin}</span> min | This Week:{' '}
        <span id="week-hr">{stats.weekHr}</span> hr <span id="week-min">{stats.weekMin}</span> min{' '}
        <button type="button" onClick={resetStats} className="text-teal-500 hover:text-teal-600 ml-2 text-sm">
          reset
        </button>
      </div>
    </main>
  );
}

export default StayAwakeView;
