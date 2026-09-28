/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { hasAlpha } from './pixels';
import { compareFrames } from './ssim';
import type { Candidate, EncodeOutput, Family, Frame, ImageClass } from './types';

export const ALPHA_THRESHOLD = 0.99;

export const thresholdFor = (cls: ImageClass): number => (cls === 'photo' ? 0.99 : 0.995);

export interface Evaluated {
  label: string;
  lossless: boolean;
  bytes: Uint8Array;
  luma: number;
  passed: boolean;
}

export interface Selection {
  best: Evaluated | null;
  passed: boolean;
  skipped: string[];
}

export interface SelectInput {
  reference: Frame[];
  threshold: number;
  families: Family[];
  onStep?: (label: string) => void;
}

const evaluate = (
  c: Candidate,
  out: EncodeOutput,
  reference: Frame[],
  threshold: number,
  refAlpha: boolean,
): Evaluated => {
  if (c.lossless) return { label: c.label, lossless: true, bytes: out.bytes, luma: 1, passed: true };
  const s = compareFrames(reference, out.frames);
  return {
    label: c.label,
    lossless: false,
    bytes: out.bytes,
    luma: s.luma,
    passed: s.luma >= threshold && (!refAlpha || s.alpha >= ALPHA_THRESHOLD),
  };
};

export const selectBest = async ({ reference, threshold, families, onStep }: SelectInput): Promise<Selection> => {
  const refAlpha = reference.some((f) => hasAlpha(f.data));
  const skipped: string[] = [];
  const passing: Evaluated[] = [];
  let bestFailing: Evaluated | null = null;

  for (const family of families) {
    for (const c of family.candidates) {
      onStep?.(c.label);
      let out: EncodeOutput;
      try {
        // Sequential on purpose: one image in memory at a time, and ladders exit early.
        // eslint-disable-next-line no-await-in-loop
        out = await c.run();
      } catch (err) {
        skipped.push(`${c.label}: ${(err as Error).message}`);
        continue;
      }
      const ev = evaluate(c, out, reference, threshold, refAlpha);
      if (ev.passed) {
        passing.push(ev);
        break;
      }
      if (!bestFailing || ev.luma > bestFailing.luma) bestFailing = ev;
    }
  }

  if (passing.length) {
    const best = passing.reduce((a, b) => (b.bytes.length < a.bytes.length ? b : a));
    return { best, passed: true, skipped };
  }
  return { best: bestFailing, passed: false, skipped };
};
