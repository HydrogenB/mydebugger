/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { motion, useSpring } from 'framer-motion';

interface TunerDialProps {
  detune: number; // cents, -50..50
  note: string;
  frequency: number | null;
  confidence: number; // 0..1
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Map cents (-50..50) to degrees (-45..45)
const centsToDeg = (cents: number) => (cents / 50) * 45;

const TunerDial: React.FC<TunerDialProps> = ({ detune, note, frequency, confidence }) => {
  const targetDeg = centsToDeg(clamp(detune, -50, 50));
  const rotate = useSpring(targetDeg, { stiffness: 140, damping: 18, mass: 0.4 });
  React.useEffect(() => {
    rotate.set(targetDeg);
  }, [targetDeg, rotate]);

  const inLock = Math.abs(detune) < 3 && confidence >= 0.6;

  return (
    <div className="relative w-64 h-64 select-none" aria-label="Tuner dial">
      {/* Background dial */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 shadow-inner" />

      {/* Colored arcs: red -> yellow -> green -> yellow -> red */}
      <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <g transform="translate(50,50)">
          {/* Arc path (semi-circle) */}
          <path d="M -40 0 A 40 40 0 1 1 40 0" fill="none" stroke="url(#arcGradient)" strokeWidth="8" strokeLinecap="round" />
          {/* Center mark */}
          <line x1="0" y1="-42" x2="0" y2="-36" stroke="#475569" strokeWidth="2" />
        </g>
      </svg>

      {/* Lock glow when in tune */}
      {inLock && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ boxShadow: '0 0 0px rgba(34,197,94,0.0)' }}
          animate={{ boxShadow: '0 0 24px rgba(34,197,94,0.35)' }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        />
      )}

      {/* Needle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          style={{ rotate }}
          className="origin-bottom"
          aria-label="Needle"
          role="img"
        >
          <div className="w-1 h-28 bg-sky-500 dark:bg-sky-400 rounded-t shadow" />
          <div className="w-3 h-3 -mt-1 mx-auto rounded-full bg-sky-600 dark:bg-sky-300" />
        </motion.div>
      </div>

      {/* Hub */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-zinc-700 dark:bg-zinc-200 shadow-inner" />
      </div>

      {/* Readouts */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
        <div className="text-4xl font-bold tabular-nums" aria-live="polite">{note || '--'}</div>
        {frequency !== null && (
          <div className="text-zinc-600 dark:text-zinc-300" aria-live="polite">{frequency.toFixed(2)} Hz</div>
        )}
        <div className="mt-1 text-sm" aria-live="polite">
          {Math.abs(detune) < 3 ? (
            <span className="text-green-600 dark:text-green-400">In tune</span>
          ) : detune > 0 ? (
            <span className="text-amber-600 dark:text-amber-400">{detune.toFixed(1)}¢ sharp</span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">{(-detune).toFixed(1)}¢ flat</span>
          )}
          <span className="ml-2 text-xs text-zinc-500">conf {Math.round(confidence * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default TunerDial;
