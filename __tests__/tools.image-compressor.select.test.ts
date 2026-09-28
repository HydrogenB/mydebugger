/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { CodecLoadError } from '../src/tools/image-compressor/lib/codecs';
import { selectBest, thresholdFor } from '../src/tools/image-compressor/lib/select';
import type { Candidate, Frame, Pixels } from '../src/tools/image-compressor/lib/types';

const pixels = (fn: (k: number) => number, alpha = 255): Pixels => {
  const data = new Uint8ClampedArray(32 * 32 * 4);
  for (let k = 0; k < 1024; k += 1) {
    const v = fn(k);
    data.set([v, v, v, alpha], k * 4);
  }
  return { data, width: 32, height: 32 };
};
const ref: Frame[] = [{ data: pixels((k) => k % 32 * 8), delayMs: 0 }];
const same: Frame[] = ref;
const slightlyOff: Frame[] = [{ data: pixels((k) => (k % 32) * 8 + (k % 3) * 10), delayMs: 0 }];
const inverted: Frame[] = [{ data: pixels((k) => 255 - (k % 32) * 8), delayMs: 0 }];

const cand = (label: string, size: number, frames: Frame[], lossless = false): Candidate & { run: jest.Mock } => ({
  label,
  lossless,
  run: jest.fn(async () => ({ bytes: new Uint8Array(size), frames })),
});

describe('thresholdFor', () => {
  it('is stricter for ui and flat images', () => {
    expect(thresholdFor('photo')).toBe(0.99);
    expect(thresholdFor('ui')).toBe(0.995);
    expect(thresholdFor('flat')).toBe(0.995);
  });
});

describe('selectBest', () => {
  it('stops a ladder at the first passing candidate', async () => {
    const a = cand('q85', 10, inverted);
    const b = cand('q90', 20, same);
    const c = cand('q95', 30, same);
    const sel = await selectBest({ reference: ref, threshold: 0.99, families: [{ name: 'l', candidates: [a, b, c] }] });
    expect(sel.best?.label).toBe('q90');
    expect(sel.passed).toBe(true);
    expect(c.run).not.toHaveBeenCalled();
  });

  it('picks the smallest passing result across families', async () => {
    const sel = await selectBest({
      reference: ref,
      threshold: 0.99,
      families: [
        { name: 'lossless', candidates: [cand('oxipng', 500, same, true)] },
        { name: 'quant', candidates: [cand('pq64', 120, same)] },
      ],
    });
    expect(sel.best?.label).toBe('pq64');
  });

  it('trusts lossless candidates without comparing pixels', async () => {
    const sel = await selectBest({
      reference: ref,
      threshold: 0.99,
      families: [{ name: 'lossless', candidates: [cand('raw', 50, inverted, true)] }],
    });
    expect(sel.passed).toBe(true);
    expect(sel.best?.luma).toBe(1);
  });

  it('falls back to the highest-scoring candidate when nothing passes', async () => {
    const sel = await selectBest({
      reference: ref,
      threshold: 0.9999,
      families: [{ name: 'l', candidates: [cand('bad', 5, inverted), cand('close', 9, slightlyOff)] }],
    });
    expect(sel.passed).toBe(false);
    expect(sel.best?.label).toBe('close');
  });

  it('skips a throwing candidate and keeps going', async () => {
    const boom: Candidate = { label: 'boom', lossless: false, run: async () => { throw new Error('wasm failed'); } };
    const steps: string[] = [];
    const sel = await selectBest({
      reference: ref,
      threshold: 0.99,
      families: [{ name: 'l', candidates: [boom, cand('ok', 7, same)] }],
      onStep: (s) => steps.push(s),
    });
    expect(sel.best?.label).toBe('ok');
    expect(sel.skipped).toEqual(['boom: wasm failed']);
    expect(steps).toEqual(['boom', 'ok']);
  });

  it('enforces the alpha threshold when the reference has alpha', async () => {
    const alphaRef: Frame[] = [{ data: pixels((k) => k % 32 * 8, 128), delayMs: 0 }];
    const lostAlpha: Frame[] = [{ data: pixels((k) => k % 32 * 8, 255), delayMs: 0 }];
    const sel = await selectBest({
      reference: alphaRef,
      threshold: 0.5,
      families: [{ name: 'l', candidates: [cand('opaque', 3, lostAlpha)] }],
    });
    expect(sel.passed).toBe(false);
  });

  it('returns null when every candidate throws, and says whether only loaders failed', async () => {
    const boom: Candidate = { label: 'x', lossless: false, run: async () => { throw new Error('offline'); } };
    const sel = await selectBest({ reference: ref, threshold: 0.99, families: [{ name: 'l', candidates: [boom] }] });
    expect(sel.best).toBeNull();
    expect(sel.skipped).toHaveLength(1);
    expect(sel.loadFailed).toBe(false);

    const noLoad: Candidate = { label: 'y', lossless: false, run: async () => { throw new CodecLoadError('404'); } };
    const sel2 = await selectBest({ reference: ref, threshold: 0.99, families: [{ name: 'l', candidates: [noLoad] }] });
    expect(sel2.loadFailed).toBe(true);
  });

  it('records a candidate that rejects with a plain string', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    const str: Candidate = { label: 'gs', lossless: false, run: () => Promise.reject('worker died') };
    const sel = await selectBest({ reference: ref, threshold: 0.99, families: [{ name: 'l', candidates: [str] }] });
    expect(sel.skipped).toEqual(['gs: worker died']);
  });
});
