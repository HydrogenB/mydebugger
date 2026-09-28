# Image Compressor v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/image-compressor` with a TinyPNG-style batch tool where the user picks only files + output format, and the system returns the smallest encode that passes a quality check.

**Architecture:** A single module Web Worker runs `decode → analyze → plan (candidate families) → select (smallest passing) → report`. All codec WASM is lazy-loaded through one `codecs.ts` module so pure logic stays unit-testable in Jest. A React hook owns the queue, the worker lifecycle and a watchdog; the view is a pure component fed by the hook.

**Tech Stack:** React 18 + TS, Vite (`worker.format: 'es'`), Jest + RTL (jsdom, babel). Codecs: `@jsquash/oxipng`, `@jsquash/jpeg` (mozjpeg), `@jsquash/webp`, `libimagequant-wasm` (raw wasm-bindgen API), `gifsicle-wasm-browser`, `upng-js`, `gifuct-js`, `gifenc`, `fflate`.

**Spec:** `docs/superpowers/specs/2026-09-28-image-compressor-design.md` (read the "Decisions made during planning" section).

## Global Constraints

- Browser-only; no server code, no network calls except lazy-loading our own bundled chunks/WASM.
- Output formats exactly: `png | jpg | webp | gif | bmp`. The image is never resized.
- Thresholds: lossless candidates pass by contract; lossy pass iff luma SSIM ≥ **0.99** (`photo`) / **0.995** (`ui`, `flat`), and if the reference has alpha, alpha SSIM ≥ **0.99**. Animations use the minimum per-frame score.
- Ladders are ordered **most aggressive first**; the first passing candidate ends its family.
- Limits: **20 files**, **50 MB** per file, **40 MP** static, **400 MP** (w × h × frames) animated. Watchdog **60 s** without a progress message.
- Every new TS file starts with `/**\n * © 2026 MyDebugger Contributors – MIT License\n */`.
- Lint: `pnpm lint` runs with `--max-warnings 0`. Run `npx eslint <files>` on every file you touch.
- Tests live flat in `__tests__/`, named `tools.image-compressor.<area>.test.ts[x]`.
- Pixel buffers use the structural type `Pixels` (`{ data: Uint8ClampedArray; width; height }`), never `ImageData`, except at codec boundaries (`toImageData`) — jsdom has no `ImageData`.
- No codec package may be imported statically outside `lib/codecs.ts`.

## File Structure

```
src/tools/image-compressor/
  page.tsx                       (modify) wires hook -> view, licence line
  index.ts                       (keep)
  components/ImageCompressorPanel.tsx   (rewrite) format picker, drop zone, queue, footer
  components/FileRow.tsx         (create) one row + details + before/after slider
  hooks/useImageCompressor.ts    (rewrite) queue, worker, watchdog, format persistence
  workers/compress.worker.ts     (create) message adapter around pipeline.compress
  workers/createCompressWorker.ts (create) `new Worker(new URL(...))` factory
  lib/types.ts                   (create) shared types + constants
  lib/pixels.ts                  (create) hasAlpha, flattenOnWhite, paletteToRgba
  lib/analyze.ts                 (create) colour count, flat ratio, class
  lib/ssim.ts                    (create) luma/alpha SSIM, compareFrames
  lib/select.ts                  (create) selectBest, thresholdFor
  lib/bmp.ts                     (create) BMP writer incl. RLE8/RLE4
  lib/webpMux.ts                 (create) animated WebP RIFF muxer
  lib/gifFrames.ts               (create) composite gifuct patches into full frames
  lib/codecs.ts                  (create) the ONLY place that imports codec packages
  lib/decode.ts                  (create) sniff + decode File bytes -> DecodedImage
  lib/encoders.ts                (create) codec calls returning EncodeOutput
  lib/plans.ts                   (create) per-format candidate families
  lib/pipeline.ts                (create) compress(bytes, format, onStep)
  lib/format.ts                  (create) formatBytes, outputName (shared by both components)
  lib/imageCompressor.ts         (delete)
src/types/gifenc.d.ts            (create) module typings
src/types/gifsicle-wasm-browser.d.ts (create)
__mocks__/createCompressWorker.ts (create) Jest stub (import.meta.url is not CJS-safe)
jest.config.cjs                  (modify) moduleNameMapper for the worker factory
vite.config.ts                   (modify) optimizeDeps.exclude jsquash packages
src/tools/index.ts               (modify) registry description/keywords
__tests__/tools.image-compressor.test.tsx (delete — replaced)
```

---

### Task 1: Types, pixel helpers and image analysis

**Files:**
- Create: `src/tools/image-compressor/lib/types.ts`, `src/tools/image-compressor/lib/pixels.ts`, `src/tools/image-compressor/lib/analyze.ts`
- Test: `__tests__/tools.image-compressor.analyze.test.ts`

**Interfaces:**
- Produces: all types below; `hasAlpha(p)`, `flattenOnWhite(p)`, `paletteToRgba(idx, palette, w, h)`; `countColors(p, cap?)`, `flatRatio(p)`, `classify(colorCount, flat)`, `analyze(img)`; constants `COLOR_CAP`, `MIME`, limits.

- [ ] **Step 1: Create `lib/types.ts`** (no test — types only)

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
export type OutputFormat = 'png' | 'jpg' | 'webp' | 'gif' | 'bmp';
export type SourceFormat = OutputFormat | 'unknown';
export type ImageClass = 'photo' | 'ui' | 'flat';

/** Structural stand-in for ImageData (jsdom has no ImageData). */
export interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface Frame {
  data: Pixels;
  delayMs: number;
}

export interface DecodedImage {
  frames: Frame[];
  width: number;
  height: number;
  source: SourceFormat;
  warnings: string[];
}

export interface Analysis {
  hasAlpha: boolean;
  animated: boolean;
  /** Exact unique RGBA count, or COLOR_CAP + 1 when over the cap. */
  colorCount: number;
  flatRatio: number;
  cls: ImageClass;
}

export interface EncodeOutput {
  bytes: Uint8Array;
  /** Pixels a viewer will see. Lossless candidates may return the input frames. */
  frames: Frame[];
}

export interface Candidate {
  label: string;
  lossless: boolean;
  run: () => Promise<EncodeOutput>;
}

/** Candidates ordered most aggressive (smallest expected) first. */
export interface Family {
  name: string;
  candidates: Candidate[];
}

export interface FormatPlan {
  families: Family[];
  warnings: string[];
  /** What the candidates are judged against (e.g. first frame only, or flattened for JPG). */
  reference: Frame[];
}

export type Mode = 'lossless' | 'visually-lossless' | 'below-target' | 'already-optimal';

export interface Report {
  pipeline: string;
  mode: Mode;
  ssim: number | null;
  inputBytes: number;
  outputBytes: number;
  cls: ImageClass;
  warnings: string[];
  skipped: string[];
}

export interface CompressResult {
  bytes: Uint8Array;
  mime: string;
  ext: OutputFormat;
  report: Report;
}

export type ErrorCode = 'decode' | 'too-big' | 'codec' | 'internal';

export type WorkerRequest = {
  type: 'compress';
  jobId: number;
  bytes: ArrayBuffer;
  format: OutputFormat;
};

export type WorkerResponse =
  | { type: 'progress'; jobId: number; step: string }
  | { type: 'done'; jobId: number; result: CompressResult }
  | { type: 'error'; jobId: number; code: ErrorCode; message: string };

export const OUTPUT_FORMATS: OutputFormat[] = ['png', 'jpg', 'webp', 'gif', 'bmp'];

export const MIME: Record<OutputFormat, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
};

export const COLOR_CAP = 4096;
export const MAX_STATIC_PIXELS = 40_000_000;
export const MAX_ANIMATED_PIXELS = 400_000_000;
```

- [ ] **Step 2: Write the failing test**

`__tests__/tools.image-compressor.analyze.test.ts`:

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import {
  analyze,
  classify,
  countColors,
  flatRatio,
} from '../src/tools/image-compressor/lib/analyze';
import {
  flattenOnWhite,
  hasAlpha,
  paletteToRgba,
} from '../src/tools/image-compressor/lib/pixels';
import type { DecodedImage, Pixels } from '../src/tools/image-compressor/lib/types';

type Rgba = [number, number, number, number];

const makePixels = (w: number, h: number, fn: (x: number, y: number) => Rgba): Pixels => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      data.set(fn(x, y), (y * w + x) * 4);
    }
  }
  return { data, width: w, height: h };
};

// Deterministic pseudo-random noise, every pixel (almost surely) unique.
const noise = (w: number, h: number): Pixels => {
  let s = 1;
  const rnd = () => {
    s = (s * 48271) % 2147483647; // Park–Miller: stays below 2^53, so no float precision loss
    return s % 256;
  };
  return makePixels(w, h, () => [rnd(), rnd(), rnd(), 255]);
};

const img = (p: Pixels, frames = 1): DecodedImage => ({
  frames: Array.from({ length: frames }, () => ({ data: p, delayMs: 100 })),
  width: p.width,
  height: p.height,
  source: 'png',
  warnings: [],
});

describe('pixels', () => {
  it('detects alpha', () => {
    expect(hasAlpha(makePixels(2, 2, () => [0, 0, 0, 255]))).toBe(false);
    expect(hasAlpha(makePixels(2, 2, (x) => [0, 0, 0, x ? 255 : 10]))).toBe(true);
  });

  it('flattens transparent pixels onto white', () => {
    const out = flattenOnWhite(makePixels(1, 1, () => [0, 0, 0, 0]));
    expect(Array.from(out.data)).toEqual([255, 255, 255, 255]);
    const half = flattenOnWhite(makePixels(1, 1, () => [0, 0, 0, 128]));
    expect(half.data[0]).toBe(127);
    expect(half.data[3]).toBe(255);
  });

  it('expands palette indices to RGBA', () => {
    const out = paletteToRgba(new Uint8Array([1, 0]), [[1, 2, 3, 4], [5, 6, 7, 8]], 2, 1);
    expect(Array.from(out.data)).toEqual([5, 6, 7, 8, 1, 2, 3, 4]);
  });
});

describe('analyze', () => {
  it('counts exact colours', () => {
    expect(countColors(makePixels(9, 9, (x) => [x % 3, 0, 0, 255]))).toBe(3);
  });

  it('caps the colour count', () => {
    expect(countColors(noise(100, 100))).toBe(4097);
  });

  it('measures the flat ratio', () => {
    expect(flatRatio(makePixels(4, 4, () => [1, 1, 1, 255]))).toBe(1);
    expect(flatRatio(noise(10, 10))).toBeLessThan(0.05);
  });

  it('classifies flat / ui / photo', () => {
    expect(classify(3, 0.1)).toBe('flat');
    expect(classify(5000, 0.6)).toBe('ui');
    expect(classify(5000, 0.2)).toBe('photo');
  });

  it('analyzes a screenshot-like image as ui', () => {
    const n = noise(100, 100);
    const shot = makePixels(200, 100, (x, y) => {
      if (x < 150) return [255, 255, 255, 255];
      const i = (y * 100 + (x - 100)) * 4;
      return [n.data[i], n.data[i + 1], n.data[i + 2], 255];
    });
    const a = analyze(img(shot));
    expect(a.cls).toBe('ui');
    expect(a.hasAlpha).toBe(false);
    expect(a.animated).toBe(false);
  });

  it('flags animation and photos', () => {
    const a = analyze(img(noise(64, 64), 3));
    expect(a.animated).toBe(true);
    expect(a.cls).toBe('photo');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.analyze.test.ts`
Expected: FAIL — `Cannot find module '../src/tools/image-compressor/lib/analyze'`.

- [ ] **Step 4: Implement `lib/pixels.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { Pixels } from './types';

export const hasAlpha = ({ data }: Pixels): boolean => {
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
};

/** Composite over white and make fully opaque (what a JPEG can represent). */
export const flattenOnWhite = ({ data, width, height }: Pixels): Pixels => {
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    out[i] = data[i] * a + 255 * (1 - a);
    out[i + 1] = data[i + 1] * a + 255 * (1 - a);
    out[i + 2] = data[i + 2] * a + 255 * (1 - a);
    out[i + 3] = 255;
  }
  return { data: out, width, height };
};

/** Expand palette indices (palette entries are [r, g, b, a]) into RGBA pixels. */
export const paletteToRgba = (
  indices: Uint8Array,
  palette: number[][],
  width: number,
  height: number,
): Pixels => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let k = 0; k < indices.length; k += 1) data.set(palette[indices[k]], k * 4);
  return { data, width, height };
};
```

Note: `Uint8ClampedArray` rounds half to even, so `0*0.502 + 255*0.498 = 126.99 → 127` — matches the test.

- [ ] **Step 5: Implement `lib/analyze.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { hasAlpha } from './pixels';
import { COLOR_CAP, type Analysis, type DecodedImage, type ImageClass, type Pixels } from './types';

export const countColors = ({ data }: Pixels, cap = COLOR_CAP): number => {
  const seen = new Set<number>();
  for (let i = 0; i < data.length; i += 4) {
    // >>> 0 keeps the packed RGBA value unsigned.
    seen.add(((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]) >>> 0);
    if (seen.size > cap) return cap + 1;
  }
  return seen.size;
};

/** Share of pixels identical to their right-hand neighbour (screenshots score high). */
export const flatRatio = ({ data, width, height }: Pixels): number => {
  if (width < 2) return 1;
  let same = 0;
  for (let y = 0; y < height; y += 1) {
    const row = y * width * 4;
    for (let x = 0; x < width - 1; x += 1) {
      const i = row + x * 4;
      if (
        data[i] === data[i + 4] &&
        data[i + 1] === data[i + 5] &&
        data[i + 2] === data[i + 6] &&
        data[i + 3] === data[i + 7]
      ) {
        same += 1;
      }
    }
  }
  return same / (height * (width - 1));
};

export const classify = (colorCount: number, flat: number): ImageClass => {
  if (colorCount <= 256) return 'flat';
  return flat >= 0.5 ? 'ui' : 'photo';
};

// ponytail: class comes from the first frame only; per-frame classification if animations misclassify.
export const analyze = (img: DecodedImage): Analysis => {
  const first = img.frames[0].data;
  const colorCount = countColors(first);
  const flat = flatRatio(first);
  return {
    hasAlpha: img.frames.some((f) => hasAlpha(f.data)),
    animated: img.frames.length > 1,
    colorCount,
    flatRatio: flat,
    cls: classify(colorCount, flat),
  };
};
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.analyze.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 7: Lint + commit**

```bash
npx eslint src/tools/image-compressor/lib/types.ts src/tools/image-compressor/lib/pixels.ts src/tools/image-compressor/lib/analyze.ts __tests__/tools.image-compressor.analyze.test.ts
git add src/tools/image-compressor/lib/types.ts src/tools/image-compressor/lib/pixels.ts src/tools/image-compressor/lib/analyze.ts __tests__/tools.image-compressor.analyze.test.ts
git commit -m "feat(image-compressor): add types, pixel helpers and image analysis"
```

---

### Task 2: SSIM

**Files:**
- Create: `src/tools/image-compressor/lib/ssim.ts`
- Test: `__tests__/tools.image-compressor.ssim.test.ts`

**Interfaces:**
- Consumes: `Pixels`, `Frame` (Task 1).
- Produces: `lumaOverWhite(p): Float32Array`, `alphaPlane(p): Float32Array`, `ssimPlane(a, b, w, h): number`, `compareFrames(ref: Frame[], out: Frame[]): { luma: number; alpha: number }`.

- [ ] **Step 1: Write the failing test**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compareFrames } from '../src/tools/image-compressor/lib/ssim';
import type { Frame, Pixels } from '../src/tools/image-compressor/lib/types';

const grad = (w: number, h: number, jitter = 0, alpha = 255): Pixels => {
  const data = new Uint8ClampedArray(w * h * 4);
  let s = 7;
  for (let k = 0; k < w * h; k += 1) {
    s = (s * 48271) % 2147483647; // Park–Miller: stays below 2^53, so no float precision loss
    const n = jitter ? ((s % (2 * jitter + 1)) - jitter) : 0;
    const v = ((k % w) * 255) / w + n;
    data.set([v, v, v, alpha], k * 4);
  }
  return { data, width: w, height: h };
};
const f = (p: Pixels): Frame[] => [{ data: p, delayMs: 0 }];

describe('compareFrames', () => {
  it('scores identical images 1', () => {
    const s = compareFrames(f(grad(32, 32)), f(grad(32, 32)));
    expect(s.luma).toBeCloseTo(1, 6);
    expect(s.alpha).toBeCloseTo(1, 6);
  });

  it('drops monotonically with more noise', () => {
    const ref = f(grad(64, 64));
    const a = compareFrames(ref, f(grad(64, 64, 4))).luma;
    const b = compareFrames(ref, f(grad(64, 64, 20))).luma;
    const c = compareFrames(ref, f(grad(64, 64, 60))).luma;
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(a).toBeLessThan(1);
  });

  it('ignores colour under fully transparent pixels', () => {
    const clear = (v: number): Pixels => {
      const p = grad(16, 16, 0, 0);
      p.data.forEach((_, i) => { if (i % 4 !== 3) p.data[i] = v; });
      return p;
    };
    expect(compareFrames(f(clear(0)), f(clear(200))).luma).toBeCloseTo(1, 6);
  });

  it('scores alpha changes on the alpha plane', () => {
    const ref = f(grad(16, 16, 0, 255));
    const s = compareFrames(ref, f(grad(16, 16, 0, 40)));
    expect(s.alpha).toBeLessThan(0.99);
  });

  it('fails mismatched frame counts or sizes', () => {
    expect(compareFrames(f(grad(8, 8)), []).luma).toBe(0);
    expect(compareFrames(f(grad(8, 8)), f(grad(9, 8))).luma).toBe(0);
  });

  it('uses the worst frame of an animation', () => {
    const ref = [...f(grad(32, 32)), ...f(grad(32, 32))];
    const out = [...f(grad(32, 32)), ...f(grad(32, 32, 60))];
    expect(compareFrames(ref, out).luma).toBeLessThan(0.9);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.ssim.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/ssim.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { Frame, Pixels } from './types';

const C1 = (0.01 * 255) ** 2;
const C2 = (0.03 * 255) ** 2;
const WINDOW = 8;

/** Rec.601 luma of the image composited over white. */
export const lumaOverWhite = ({ data, width, height }: Pixels): Float32Array => {
  const out = new Float32Array(width * height);
  for (let k = 0; k < out.length; k += 1) {
    const i = k * 4;
    const a = data[i + 3] / 255;
    const bg = 255 * (1 - a);
    out[k] = 0.299 * (data[i] * a + bg) + 0.587 * (data[i + 1] * a + bg) + 0.114 * (data[i + 2] * a + bg);
  }
  return out;
};

export const alphaPlane = ({ data, width, height }: Pixels): Float32Array => {
  const out = new Float32Array(width * height);
  for (let k = 0; k < out.length; k += 1) out[k] = data[k * 4 + 3];
  return out;
};

// ponytail: non-overlapping 8x8 windows, no Gaussian weighting; switch to sliding windows if scores prove too coarse.
export const ssimPlane = (a: Float32Array, b: Float32Array, width: number, height: number): number => {
  let total = 0;
  let windows = 0;
  for (let y0 = 0; y0 < height; y0 += WINDOW) {
    for (let x0 = 0; x0 < width; x0 += WINDOW) {
      const y1 = Math.min(y0 + WINDOW, height);
      const x1 = Math.min(x0 + WINDOW, width);
      let sa = 0;
      let sb = 0;
      let saa = 0;
      let sbb = 0;
      let sab = 0;
      let n = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const va = a[y * width + x];
          const vb = b[y * width + x];
          sa += va;
          sb += vb;
          saa += va * va;
          sbb += vb * vb;
          sab += va * vb;
          n += 1;
        }
      }
      const ma = sa / n;
      const mb = sb / n;
      const varA = saa / n - ma * ma;
      const varB = sbb / n - mb * mb;
      const cov = sab / n - ma * mb;
      total += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (varA + varB + C2));
      windows += 1;
    }
  }
  return total / windows;
};

export interface Similarity {
  luma: number;
  alpha: number;
}

/** Minimum luma / alpha SSIM across frames; 0 when the shapes don't match. */
export const compareFrames = (ref: Frame[], out: Frame[]): Similarity => {
  if (ref.length === 0 || ref.length !== out.length) return { luma: 0, alpha: 0 };
  let luma = 1;
  let alpha = 1;
  for (let k = 0; k < ref.length; k += 1) {
    const r = ref[k].data;
    const o = out[k].data;
    if (r.width !== o.width || r.height !== o.height) return { luma: 0, alpha: 0 };
    luma = Math.min(luma, ssimPlane(lumaOverWhite(r), lumaOverWhite(o), r.width, r.height));
    alpha = Math.min(alpha, ssimPlane(alphaPlane(r), alphaPlane(o), r.width, r.height));
  }
  return { luma, alpha };
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.ssim.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Lint + commit**

```bash
npx eslint src/tools/image-compressor/lib/ssim.ts __tests__/tools.image-compressor.ssim.test.ts
git add src/tools/image-compressor/lib/ssim.ts __tests__/tools.image-compressor.ssim.test.ts
git commit -m "feat(image-compressor): add SSIM quality metric"
```

---

### Task 3: Candidate selection

**Files:**
- Create: `src/tools/image-compressor/lib/select.ts`
- Test: `__tests__/tools.image-compressor.select.test.ts`

**Interfaces:**
- Consumes: `Family`, `Candidate`, `EncodeOutput`, `Frame`, `ImageClass` (Task 1); `compareFrames` (Task 2); `hasAlpha` (Task 1).
- Produces:
  - `thresholdFor(cls: ImageClass): number`
  - `ALPHA_THRESHOLD = 0.99`
  - `interface Evaluated { label: string; lossless: boolean; bytes: Uint8Array; luma: number; passed: boolean }`
  - `interface Selection { best: Evaluated | null; passed: boolean; skipped: string[] }`
  - `selectBest(input: { reference: Frame[]; threshold: number; families: Family[]; onStep?: (label: string) => void }): Promise<Selection>`

- [ ] **Step 1: Write the failing test**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
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

  it('returns null when every candidate throws', async () => {
    const boom: Candidate = { label: 'x', lossless: false, run: async () => { throw new Error('offline'); } };
    const sel = await selectBest({ reference: ref, threshold: 0.99, families: [{ name: 'l', candidates: [boom] }] });
    expect(sel.best).toBeNull();
    expect(sel.skipped).toHaveLength(1);
  });
});
```

Note on "enforces the alpha threshold": the reference alpha plane is constant 128 and the output is constant 255, so means differ and alpha SSIM ≈ `(2·128·255 + C1)/(128² + 255² + C1)` ≈ 0.80 < 0.99.

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.select.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/select.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.select.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Lint + commit**

```bash
npx eslint src/tools/image-compressor/lib/select.ts __tests__/tools.image-compressor.select.test.ts
git add src/tools/image-compressor/lib/select.ts __tests__/tools.image-compressor.select.test.ts
git commit -m "feat(image-compressor): pick the smallest candidate that passes the quality check"
```

---

### Task 4: BMP encoder

**Files:**
- Create: `src/tools/image-compressor/lib/bmp.ts`
- Test: `__tests__/tools.image-compressor.bmp.test.ts`

**Interfaces:**
- Consumes: `Pixels` (Task 1).
- Produces: `type BmpMode = 'rgb24' | 'rgba32' | 'pal8' | 'rle8' | 'rle4'`; `exactPalette(p, max): { palette: number[]; indices: Uint8Array } | null` (palette entries packed `0xRRGGBB`, alpha ignored); `encodeBmp(p, mode): Uint8Array` (throws `Too many colours for <mode>` when the palette overflows).

- [ ] **Step 1: Write the failing test**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { encodeBmp, exactPalette } from '../src/tools/image-compressor/lib/bmp';
import type { Pixels } from '../src/tools/image-compressor/lib/types';

const stripes = (w: number, h: number, colours: number): Pixels => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let k = 0; k < w * h; k += 1) {
    const c = Math.floor((k % w) / Math.ceil(w / colours));
    data.set([c * 10, c * 20, c * 30, 255], k * 4);
  }
  return { data, width: w, height: h };
};

const view = (b: Uint8Array) => new DataView(b.buffer, b.byteOffset, b.byteLength);

// Minimal RLE8/RLE4 decoder (encoded runs only — what our writer emits). Returns top-down indices.
const decodeRle = (b: Uint8Array, w: number, h: number, bits: 4 | 8): number[] => {
  const v = view(b);
  const rows: number[][] = [];
  let row: number[] = [];
  let o = v.getUint32(10, true);
  while (o < b.length) {
    const n = b[o];
    const val = b[o + 1];
    o += 2;
    if (n > 0) {
      for (let i = 0; i < n; i += 1) row.push(bits === 8 ? val : i % 2 === 0 ? val >> 4 : val & 15);
    } else if (val === 0 || val === 1) {
      rows.push(row);
      row = [];
      if (val === 1) break;
    } else {
      throw new Error(`unexpected escape ${val}`);
    }
  }
  expect(rows).toHaveLength(h);
  rows.forEach((r) => expect(r).toHaveLength(w));
  return rows.reverse().flat();
};

describe('exactPalette', () => {
  it('builds a palette and indices', () => {
    const pal = exactPalette(stripes(6, 2, 3), 256);
    expect(pal?.palette).toHaveLength(3);
    expect(Array.from(pal!.indices.slice(0, 6))).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it('returns null past the limit', () => {
    expect(exactPalette(stripes(40, 1, 20), 16)).toBeNull();
  });
});

describe('encodeBmp', () => {
  it('writes a 24-bit BMP with padded rows', () => {
    const b = encodeBmp(stripes(3, 2, 3), 'rgb24');
    const v = view(b);
    expect(String.fromCharCode(b[0], b[1])).toBe('BM');
    expect(v.getUint32(2, true)).toBe(b.length);
    expect(v.getUint32(10, true)).toBe(54);
    expect(v.getInt32(18, true)).toBe(3);
    expect(v.getInt32(22, true)).toBe(2);
    expect(v.getUint16(28, true)).toBe(24);
    expect(b.length).toBe(54 + 12 * 2); // 3 px * 3 B = 9 -> padded to 12
    expect([b[54], b[55], b[56]]).toEqual([0, 0, 0]); // BGR of first pixel, bottom row
  });

  it('writes a 32-bit BMP with bitfields and alpha', () => {
    const p = stripes(2, 1, 2);
    p.data[3] = 7;
    const b = encodeBmp(p, 'rgba32');
    const v = view(b);
    expect(v.getUint32(14, true)).toBe(108);
    expect(v.getUint32(30, true)).toBe(3);
    expect(v.getUint32(54, true)).toBe(0x00ff0000);
    expect(v.getUint32(66, true)).toBe(0xff000000);
    expect(b[14 + 108 + 3]).toBe(7);
  });

  it('round-trips RLE8', () => {
    const p = stripes(10, 3, 4);
    const b = encodeBmp(p, 'rle8');
    expect(view(b).getUint32(30, true)).toBe(1);
    const pal = exactPalette(p, 256)!;
    expect(decodeRle(b, 10, 3, 8)).toEqual(Array.from(pal.indices));
  });

  it('round-trips RLE4', () => {
    const p = stripes(10, 3, 4);
    const b = encodeBmp(p, 'rle4');
    expect(view(b).getUint16(28, true)).toBe(4);
    expect(view(b).getUint32(30, true)).toBe(2);
    expect(decodeRle(b, 10, 3, 4)).toEqual(Array.from(exactPalette(p, 16)!.indices));
  });

  it('makes RLE smaller than raw for flat images', () => {
    const p = stripes(200, 50, 2);
    expect(encodeBmp(p, 'rle8').length).toBeLessThan(encodeBmp(p, 'pal8').length);
  });

  it('refuses palettes that are too large', () => {
    expect(() => encodeBmp(stripes(40, 1, 20), 'rle4')).toThrow('Too many colours for rle4');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.bmp.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/bmp.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { Pixels } from './types';

export type BmpMode = 'rgb24' | 'rgba32' | 'pal8' | 'rle8' | 'rle4';

const FILE_HEADER = 14;
const INFO_HEADER = 40;
const V4_HEADER = 108;
const PPM = 2835; // 72 DPI

const stride = (bits: number, width: number) => Math.ceil((bits * width) / 32) * 4;

export const exactPalette = (
  { data, width, height }: Pixels,
  max: number,
): { palette: number[]; indices: Uint8Array } | null => {
  const map = new Map<number, number>();
  const palette: number[] = [];
  const indices = new Uint8Array(width * height);
  for (let k = 0; k < indices.length; k += 1) {
    const i = k * 4;
    const c = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    let idx = map.get(c);
    if (idx === undefined) {
      if (palette.length >= max) return null;
      idx = palette.length;
      map.set(c, idx);
      palette.push(c);
    }
    indices[k] = idx;
  }
  return { palette, indices };
};

interface Header {
  width: number;
  height: number;
  bits: number;
  compression: number;
  imageSize: number;
  colors: number;
  dibSize: number;
}

const writeHeaders = (v: DataView, fileSize: number, dataOffset: number, h: Header) => {
  v.setUint8(0, 0x42);
  v.setUint8(1, 0x4d);
  v.setUint32(2, fileSize, true);
  v.setUint32(10, dataOffset, true);
  v.setUint32(14, h.dibSize, true);
  v.setInt32(18, h.width, true);
  v.setInt32(22, h.height, true); // positive = bottom-up rows
  v.setUint16(26, 1, true);
  v.setUint16(28, h.bits, true);
  v.setUint32(30, h.compression, true);
  v.setUint32(34, h.imageSize, true);
  v.setInt32(38, PPM, true);
  v.setInt32(42, PPM, true);
  v.setUint32(46, h.colors, true);
  v.setUint32(50, 0, true);
};

const encodeTrueColor = ({ data, width, height }: Pixels, alpha: boolean): Uint8Array => {
  const bits = alpha ? 32 : 24;
  const dibSize = alpha ? V4_HEADER : INFO_HEADER;
  const rowBytes = stride(bits, width);
  const offset = FILE_HEADER + dibSize;
  const out = new Uint8Array(offset + rowBytes * height);
  const v = new DataView(out.buffer);
  writeHeaders(v, out.length, offset, {
    width, height, bits, compression: alpha ? 3 : 0, imageSize: rowBytes * height, colors: 0, dibSize,
  });
  if (alpha) {
    v.setUint32(54, 0x00ff0000, true);
    v.setUint32(58, 0x0000ff00, true);
    v.setUint32(62, 0x000000ff, true);
    v.setUint32(66, 0xff000000, true);
    v.setUint32(70, 0x73524742, true); // 'sRGB'
  }
  const px = bits / 8;
  for (let y = 0; y < height; y += 1) {
    const dst = offset + (height - 1 - y) * rowBytes;
    for (let x = 0; x < width; x += 1) {
      const s = (y * width + x) * 4;
      const d = dst + x * px;
      out[d] = data[s + 2];
      out[d + 1] = data[s + 1];
      out[d + 2] = data[s];
      if (alpha) out[d + 3] = data[s + 3];
    }
  }
  return out;
};

const packPal8 = (indices: Uint8Array, width: number, height: number): Uint8Array => {
  const rowBytes = stride(8, width);
  const out = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y += 1) {
    out.set(indices.subarray(y * width, (y + 1) * width), (height - 1 - y) * rowBytes);
  }
  return out;
};

// ponytail: encoded runs only (no RLE "absolute mode"), so noisy rows are larger than raw; selection picks raw then.
const rle = (indices: Uint8Array, width: number, height: number, bits: 4 | 8): Uint8Array => {
  const out: number[] = [];
  for (let y = height - 1; y >= 0; y -= 1) {
    const row = indices.subarray(y * width, (y + 1) * width);
    let x = 0;
    while (x < width) {
      let run = 1;
      while (x + run < width && run < 255 && row[x + run] === row[x]) run += 1;
      out.push(run, bits === 8 ? row[x] : (row[x] << 4) | row[x]);
      x += run;
    }
    out.push(0, y === 0 ? 1 : 0); // end of line, or end of bitmap after the last row
  }
  return Uint8Array.from(out);
};

export const encodeBmp = (p: Pixels, mode: BmpMode): Uint8Array => {
  if (mode === 'rgb24' || mode === 'rgba32') return encodeTrueColor(p, mode === 'rgba32');
  const pal = exactPalette(p, mode === 'rle4' ? 16 : 256);
  if (!pal) throw new Error(`Too many colours for ${mode}`);
  const { width, height } = p;
  const bits = mode === 'rle4' ? 4 : 8;
  let pixels: Uint8Array;
  let compression: number;
  if (mode === 'pal8') {
    pixels = packPal8(pal.indices, width, height);
    compression = 0;
  } else {
    pixels = rle(pal.indices, width, height, bits);
    compression = mode === 'rle8' ? 1 : 2;
  }
  const offset = FILE_HEADER + INFO_HEADER + pal.palette.length * 4;
  const out = new Uint8Array(offset + pixels.length);
  writeHeaders(new DataView(out.buffer), out.length, offset, {
    width, height, bits, compression, imageSize: pixels.length, colors: pal.palette.length, dibSize: INFO_HEADER,
  });
  pal.palette.forEach((c, k) => {
    const o = FILE_HEADER + INFO_HEADER + k * 4;
    out[o] = c & 0xff;
    out[o + 1] = (c >> 8) & 0xff;
    out[o + 2] = (c >> 16) & 0xff;
  });
  out.set(pixels, offset);
  return out;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.bmp.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Lint + commit**

```bash
npx eslint src/tools/image-compressor/lib/bmp.ts __tests__/tools.image-compressor.bmp.test.ts
git add src/tools/image-compressor/lib/bmp.ts __tests__/tools.image-compressor.bmp.test.ts
git commit -m "feat(image-compressor): add BMP encoder with RLE8/RLE4"
```

---

### Task 5: Animated WebP muxer

**Files:**
- Create: `src/tools/image-compressor/lib/webpMux.ts`
- Test: `__tests__/tools.image-compressor.webpmux.test.ts`

**Interfaces:**
- Produces: `interface MuxFrame { webp: Uint8Array; delayMs: number }`; `frameChunks(webp): Uint8Array` (ALPH/VP8/VP8L chunks of a still WebP, VP8X dropped; throws `Not a WebP file`); `muxAnimatedWebP(frames: MuxFrame[], width, height, alpha: boolean): Uint8Array`.

- [ ] **Step 1: Write the failing test**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { frameChunks, muxAnimatedWebP } from '../src/tools/image-compressor/lib/webpMux';

const ascii = (s: string) => Array.from(s, (c) => c.charCodeAt(0));
const le32 = (n: number) => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
const chunk = (id: string, payload: number[]) => [
  ...ascii(id), ...le32(payload.length), ...payload, ...(payload.length % 2 ? [0] : []),
];
const riff = (chunks: number[][]) => {
  const body = [...ascii('WEBP'), ...chunks.flat()];
  return Uint8Array.from([...ascii('RIFF'), ...le32(body.length), ...body]);
};
const u24 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
const fourcc = (b: Uint8Array, o: number) => String.fromCharCode(...b.subarray(o, o + 4));

const lossless = riff([chunk('VP8L', [1, 2, 3])]);
const withAlpha = riff([chunk('VP8X', new Array(10).fill(0)), chunk('ALPH', [9, 9]), chunk('VP8 ', [4, 5, 6, 7])]);

describe('frameChunks', () => {
  it('keeps image chunks and drops VP8X', () => {
    const out = frameChunks(withAlpha);
    expect(fourcc(out, 0)).toBe('ALPH');
    expect(fourcc(out, 10)).toBe('VP8 ');
    expect(out.length).toBe(10 + 12);
  });

  it('keeps odd-size padding', () => {
    expect(Array.from(frameChunks(lossless))).toEqual(chunk('VP8L', [1, 2, 3]));
  });

  it('rejects non-WebP input', () => {
    expect(() => frameChunks(new Uint8Array(16))).toThrow('Not a WebP file');
  });
});

describe('muxAnimatedWebP', () => {
  const out = muxAnimatedWebP(
    [{ webp: lossless, delayMs: 120 }, { webp: withAlpha, delayMs: 80 }],
    300,
    200,
    true,
  );

  it('writes a valid RIFF header', () => {
    expect(fourcc(out, 0)).toBe('RIFF');
    expect(new DataView(out.buffer).getUint32(4, true)).toBe(out.length - 8);
    expect(fourcc(out, 8)).toBe('WEBP');
  });

  it('writes VP8X with animation + alpha flags and canvas size', () => {
    expect(fourcc(out, 12)).toBe('VP8X');
    expect(out[20]).toBe(0x12);
    expect(u24(out, 24) + 1).toBe(300);
    expect(u24(out, 27) + 1).toBe(200);
  });

  it('writes ANIM then one ANMF per frame with durations', () => {
    expect(fourcc(out, 30)).toBe('ANIM');
    let o = 30 + 8 + 6;
    const durations: number[] = [];
    while (o < out.length) {
      expect(fourcc(out, o)).toBe('ANMF');
      const size = new DataView(out.buffer).getUint32(o + 4, true);
      const p = o + 8;
      expect(u24(out, p + 6) + 1).toBe(300);
      expect(u24(out, p + 9) + 1).toBe(200);
      durations.push(u24(out, p + 12));
      expect(out[p + 15]).toBe(0x02);
      o += 8 + size + (size % 2);
    }
    expect(durations).toEqual([120, 80]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.webpmux.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/webpMux.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */

export interface MuxFrame {
  webp: Uint8Array;
  delayMs: number;
}

const fourcc = (b: Uint8Array, o: number) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
const ascii = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));

const concat = (parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  parts.forEach((p) => {
    out.set(p, o);
    o += p.length;
  });
  return out;
};

const u24 = (b: Uint8Array, o: number, value: number) => {
  b[o] = value & 0xff;
  b[o + 1] = (value >> 8) & 0xff;
  b[o + 2] = (value >> 16) & 0xff;
};

const chunk = (id: string, payload: Uint8Array): Uint8Array => {
  const out = new Uint8Array(8 + payload.length + (payload.length & 1));
  out.set(ascii(id), 0);
  new DataView(out.buffer).setUint32(4, payload.length, true);
  out.set(payload, 8);
  return out;
};

/** The ALPH / VP8 / VP8L chunks of a still WebP, i.e. an ANMF frame body. */
export const frameChunks = (webp: Uint8Array): Uint8Array => {
  if (webp.length < 12 || fourcc(webp, 0) !== 'RIFF' || fourcc(webp, 8) !== 'WEBP') {
    throw new Error('Not a WebP file');
  }
  const view = new DataView(webp.buffer, webp.byteOffset, webp.byteLength);
  const parts: Uint8Array[] = [];
  let o = 12;
  while (o + 8 <= webp.length) {
    const id = fourcc(webp, o);
    const size = view.getUint32(o + 4, true);
    const total = 8 + size + (size & 1);
    if (id === 'ALPH' || id === 'VP8 ' || id === 'VP8L') parts.push(webp.subarray(o, o + total));
    o += total;
  }
  return concat(parts);
};

/** Full-canvas frames, no blending, loop forever. */
export const muxAnimatedWebP = (frames: MuxFrame[], width: number, height: number, alpha: boolean): Uint8Array => {
  const vp8x = new Uint8Array(10);
  vp8x[0] = 0x02 | (alpha ? 0x10 : 0);
  u24(vp8x, 4, width - 1);
  u24(vp8x, 7, height - 1);
  const anim = new Uint8Array(6); // transparent background, loop count 0 = forever

  const anmf = frames.map((f) => {
    const body = frameChunks(f.webp);
    const payload = new Uint8Array(16 + body.length);
    u24(payload, 6, width - 1);
    u24(payload, 9, height - 1);
    u24(payload, 12, Math.min(0xffffff, Math.max(0, Math.round(f.delayMs))));
    payload[15] = 0x02; // do not blend; no dispose
    payload.set(body, 16);
    return chunk('ANMF', payload);
  });

  const inner = concat([ascii('WEBP'), chunk('VP8X', vp8x), chunk('ANIM', anim), ...anmf]);
  const out = new Uint8Array(8 + inner.length);
  out.set(ascii('RIFF'), 0);
  new DataView(out.buffer).setUint32(4, inner.length, true);
  out.set(inner, 8);
  return out;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.webpmux.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Lint + commit**

```bash
npx eslint src/tools/image-compressor/lib/webpMux.ts __tests__/tools.image-compressor.webpmux.test.ts
git add src/tools/image-compressor/lib/webpMux.ts __tests__/tools.image-compressor.webpmux.test.ts
git commit -m "feat(image-compressor): add animated WebP muxer"
```

---

### Task 6: GIF frame compositing

**Files:**
- Create: `src/tools/image-compressor/lib/gifFrames.ts`
- Test: `__tests__/tools.image-compressor.gifframes.test.ts`

**Interfaces:**
- Consumes: `Frame`, `Pixels` (Task 1).
- Produces: `interface GifPatch { dims: { top: number; left: number; width: number; height: number }; delay: number; disposalType: number; patch: Uint8ClampedArray }` (the shape `gifuct-js` `decompressFrames(gif, true)` returns; `delay` is already in ms); `compositeGifFrames(patches: GifPatch[], width, height): Frame[]`.

- [ ] **Step 1: Write the failing test**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compositeGifFrames, type GifPatch } from '../src/tools/image-compressor/lib/gifFrames';

const solid = (w: number, h: number, rgba: number[]) => {
  const p = new Uint8ClampedArray(w * h * 4);
  for (let k = 0; k < w * h; k += 1) p.set(rgba, k * 4);
  return p;
};
const patch = (left: number, top: number, w: number, h: number, rgba: number[], disposalType = 1): GifPatch => ({
  dims: { left, top, width: w, height: h }, delay: 100, disposalType, patch: solid(w, h, rgba),
});
const px = (f: { data: { data: Uint8ClampedArray; width: number } }, x: number, y: number) =>
  Array.from(f.data.data.subarray((y * f.data.width + x) * 4, (y * f.data.width + x) * 4 + 4));

const RED = [255, 0, 0, 255];
const BLUE = [0, 0, 255, 255];
const CLEAR = [0, 0, 0, 0];

describe('compositeGifFrames', () => {
  it('draws patches on top of the previous frame (disposal 1)', () => {
    const f = compositeGifFrames([patch(0, 0, 2, 2, RED), patch(1, 1, 1, 1, BLUE)], 2, 2);
    expect(f).toHaveLength(2);
    expect(px(f[1], 0, 0)).toEqual(RED);
    expect(px(f[1], 1, 1)).toEqual(BLUE);
    expect(f[1].delayMs).toBe(100);
  });

  it('clears the patch area after the frame (disposal 2)', () => {
    const f = compositeGifFrames([patch(0, 0, 2, 2, RED, 2), patch(1, 1, 1, 1, BLUE)], 2, 2);
    expect(px(f[0], 0, 0)).toEqual(RED);
    expect(px(f[1], 0, 0)).toEqual(CLEAR);
  });

  it('restores the previous canvas after the frame (disposal 3)', () => {
    const f = compositeGifFrames(
      [patch(0, 0, 2, 2, RED), patch(0, 0, 1, 1, BLUE, 3), patch(1, 1, 1, 1, BLUE)],
      2,
      2,
    );
    expect(px(f[1], 0, 0)).toEqual(BLUE);
    expect(px(f[2], 0, 0)).toEqual(RED);
  });

  it('does not overwrite with transparent patch pixels', () => {
    const f = compositeGifFrames([patch(0, 0, 2, 2, RED), patch(0, 0, 2, 2, CLEAR)], 2, 2);
    expect(px(f[1], 0, 0)).toEqual(RED);
  });

  it('clips patches that overflow the canvas', () => {
    const f = compositeGifFrames([patch(1, 1, 3, 3, RED)], 2, 2);
    expect(px(f[0], 1, 1)).toEqual(RED);
    expect(px(f[0], 0, 0)).toEqual(CLEAR);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.gifframes.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/gifFrames.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { Frame } from './types';

export interface GifPatch {
  dims: { top: number; left: number; width: number; height: number };
  delay: number;
  disposalType: number;
  patch: Uint8ClampedArray;
}

/** Turn gifuct-js patches into full RGBA frames, honouring disposal methods 1–3. */
export const compositeGifFrames = (patches: GifPatch[], width: number, height: number): Frame[] => {
  const canvas = new Uint8ClampedArray(width * height * 4);
  return patches.map((f) => {
    const { left, top, width: pw, height: ph } = f.dims;
    const before = f.disposalType === 3 ? canvas.slice() : null;
    for (let y = 0; y < ph; y += 1) {
      const cy = top + y;
      if (cy < 0 || cy >= height) continue;
      for (let x = 0; x < pw; x += 1) {
        const cx = left + x;
        if (cx < 0 || cx >= width) continue;
        const s = (y * pw + x) * 4;
        if (f.patch[s + 3] === 0) continue;
        canvas.set(f.patch.subarray(s, s + 4), (cy * width + cx) * 4);
      }
    }
    const frame: Frame = { data: { data: canvas.slice(), width, height }, delayMs: f.delay };
    if (f.disposalType === 2) {
      for (let y = Math.max(0, top); y < Math.min(height, top + ph); y += 1) {
        canvas.fill(0, (y * width + Math.max(0, left)) * 4, (y * width + Math.min(width, left + pw)) * 4);
      }
    } else if (before) {
      canvas.set(before);
    }
    return frame;
  });
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.gifframes.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Lint + commit**

```bash
npx eslint src/tools/image-compressor/lib/gifFrames.ts __tests__/tools.image-compressor.gifframes.test.ts
git add src/tools/image-compressor/lib/gifFrames.ts __tests__/tools.image-compressor.gifframes.test.ts
git commit -m "feat(image-compressor): composite GIF frames with disposal handling"
```

---

### Task 7: Dependencies, codec loaders and decode

**Files:**
- Modify: `package.json` / `pnpm-lock.yaml` (via pnpm add), `vite.config.ts` (optimizeDeps)
- Create: `src/types/gifenc.d.ts`, `src/types/gifsicle-wasm-browser.d.ts`, `src/tools/image-compressor/lib/codecs.ts`, `src/tools/image-compressor/lib/decode.ts`
- Test: `__tests__/tools.image-compressor.decode.test.ts`

**Interfaces:**
- Consumes: `compositeGifFrames` (Task 6), types (Task 1).
- Produces (`codecs.ts`): `loadOxipng()`, `loadJpeg()`, `loadWebp()`, `loadUpng()`, `loadGifenc()`, `loadGifuct()`, `loadGifsicle()`, `loadImagequant()`; `toImageData(p: Pixels): ImageData`; `fromImageData(d: ImageData): Pixels`.
- Produces (`decode.ts`): `sniff(bytes): SourceFormat`; `isAnimatedWebp(bytes): boolean`; `decodeGif(bytes): Promise<Frame[]>`; `decodeApngOrPng(bytes): Promise<Frame[]>`; `decode(bytes): Promise<DecodedImage>` (throws `TooBigError` when over the pixel limits).

- [ ] **Step 1: Install dependencies**

```bash
pnpm add @jsquash/oxipng@^2.3.0 @jsquash/jpeg@^1.6.0 @jsquash/webp@^1.5.0 libimagequant-wasm@^0.3.0 gifsicle-wasm-browser@^1.5.19 upng-js@^2.1.0 gifuct-js@^2.1.2 gifenc@^1.0.3 fflate@^0.8.3
pnpm add -D @types/upng-js
```

Expected: both commands succeed; `package.json` lists the packages.

- [ ] **Step 2: Exclude jsquash from Vite pre-bundling** (their `new URL('*.wasm', import.meta.url)` breaks when pre-bundled)

In `vite.config.ts`, change the `optimizeDeps` block to:

```ts
  optimizeDeps: {
    exclude: ['@prisma/client', '@jsquash/oxipng', '@jsquash/jpeg', '@jsquash/webp'],
    include: ['@neslinesli93/qpdf-wasm'],
  }
```

- [ ] **Step 3: Add module typings**

`src/types/gifenc.d.ts`:

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
declare module 'gifenc' {
  export interface WriteFrameOptions {
    palette?: number[][];
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    repeat?: number;
    dispose?: number;
  }
  export interface Encoder {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: WriteFrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
  }
  export function GIFEncoder(opts?: { auto?: boolean; initialCapacity?: number }): Encoder;
}
```

`src/types/gifsicle-wasm-browser.d.ts`:

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
declare module 'gifsicle-wasm-browser' {
  interface RunOptions {
    input: { file: string | File | Blob | ArrayBuffer; name: string }[];
    command: string[];
    folder?: string[];
    isStrict?: boolean;
  }
  const gifsicle: { run(opts: RunOptions): Promise<File[]> };
  export default gifsicle;
}
```

- [ ] **Step 4: Create `lib/codecs.ts`** (not unit-tested: it only wraps dynamic imports; Task 12 smoke-tests it in a real browser)

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * The only module allowed to import codec packages. Everything is a dynamic import so each
 * format's WASM is fetched on first use, and so Jest never loads ESM/WASM from node_modules.
 */
import type { Pixels } from './types';

export const loadOxipng = () => import('@jsquash/oxipng');
export const loadJpeg = () => import('@jsquash/jpeg');
export const loadWebp = () => import('@jsquash/webp');
export const loadUpng = () => import('upng-js');
export const loadGifenc = () => import('gifenc');
export const loadGifuct = () => import('gifuct-js');
export const loadGifsicle = () => import('gifsicle-wasm-browser');

type Liq = typeof import('libimagequant-wasm/wasm/libimagequant_wasm.js');
let liq: Promise<Liq> | null = null;

/** libimagequant's raw wasm-bindgen API (its high-level class spawns its own worker, which we don't want). */
export const loadImagequant = (): Promise<Liq> => {
  if (!liq) {
    liq = (async () => {
      const [mod, wasm] = await Promise.all([
        import('libimagequant-wasm/wasm/libimagequant_wasm.js'),
        import('libimagequant-wasm/wasm/libimagequant_wasm_bg.wasm?url'),
      ]);
      await mod.default({ module_or_path: wasm.default });
      return mod;
    })().catch((err) => {
      liq = null; // allow a retry after a network hiccup
      throw err;
    });
  }
  return liq;
};

export const toImageData = (p: Pixels): ImageData =>
  new ImageData(new Uint8ClampedArray(p.data), p.width, p.height);

export const fromImageData = (d: ImageData): Pixels => ({ data: d.data, width: d.width, height: d.height });
```

If `tsc` complains that `libimagequant-wasm/wasm/libimagequant_wasm_bg.wasm?url` has no types, confirm `vite/client` is in `tsconfig.json` `types` (it is) — Vite's client types declare `*?url`.

- [ ] **Step 5: Write the failing decode test** (pure parts only: sniffing and the pixel guard)

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { assertWithinLimits, isAnimatedWebp, sniff, TooBigError } from '../src/tools/image-compressor/lib/decode';

const bytes = (...parts: (string | number[])[]) =>
  Uint8Array.from(parts.flatMap((p) => (typeof p === 'string' ? Array.from(p, (c) => c.charCodeAt(0)) : p)));

describe('sniff', () => {
  it('recognises each supported format by magic bytes', () => {
    expect(sniff(bytes([0x89], 'PNG', [13, 10, 26, 10]))).toBe('png');
    expect(sniff(bytes([0xff, 0xd8, 0xff]))).toBe('jpg');
    expect(sniff(bytes('GIF89a'))).toBe('gif');
    expect(sniff(bytes('RIFF', [0, 0, 0, 0], 'WEBP'))).toBe('webp');
    expect(sniff(bytes('BM', [0, 0]))).toBe('bmp');
    expect(sniff(bytes([0, 0, 0, 0x18], 'ftypheic'))).toBe('unknown');
  });
});

describe('isAnimatedWebp', () => {
  it('reads the VP8X animation flag', () => {
    const vp8x = (flags: number) => bytes('RIFF', [0, 0, 0, 0], 'WEBP', 'VP8X', [10, 0, 0, 0, flags]);
    expect(isAnimatedWebp(vp8x(0x02))).toBe(true);
    expect(isAnimatedWebp(vp8x(0x10))).toBe(false);
    expect(isAnimatedWebp(bytes('RIFF', [0, 0, 0, 0], 'WEBP', 'VP8L'))).toBe(false);
  });
});

describe('assertWithinLimits', () => {
  it('allows normal images and refuses huge ones', () => {
    expect(() => assertWithinLimits(4000, 3000, 1)).not.toThrow();
    expect(() => assertWithinLimits(8000, 6000, 1)).toThrow(TooBigError);
    expect(() => assertWithinLimits(1000, 1000, 401)).toThrow(TooBigError);
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.decode.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `lib/decode.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { fromImageData, loadGifuct, loadUpng, loadWebp } from './codecs';
import { compositeGifFrames, type GifPatch } from './gifFrames';
import {
  MAX_ANIMATED_PIXELS,
  MAX_STATIC_PIXELS,
  type DecodedImage,
  type Frame,
  type Pixels,
  type SourceFormat,
} from './types';

export class TooBigError extends Error {}

const text = (b: Uint8Array, o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));
const toBuffer = (b: Uint8Array): ArrayBuffer => b.slice().buffer;

export const sniff = (b: Uint8Array): SourceFormat => {
  if (b[0] === 0x89 && text(b, 1, 3) === 'PNG') return 'png';
  if (b[0] === 0xff && b[1] === 0xd8) return 'jpg';
  if (text(b, 0, 3) === 'GIF') return 'gif';
  if (text(b, 0, 4) === 'RIFF' && text(b, 8, 4) === 'WEBP') return 'webp';
  if (text(b, 0, 2) === 'BM') return 'bmp';
  return 'unknown';
};

export const isAnimatedWebp = (b: Uint8Array): boolean =>
  text(b, 12, 4) === 'VP8X' && (b[20] & 0x02) !== 0;

export const assertWithinLimits = (width: number, height: number, frames: number) => {
  const px = width * height;
  if (frames <= 1 && px > MAX_STATIC_PIXELS) {
    throw new TooBigError(`Image is ${Math.round(px / 1e6)} MP; the limit is 40 MP.`);
  }
  if (frames > 1 && px * frames > MAX_ANIMATED_PIXELS) {
    throw new TooBigError('Animation is too large to process in the browser (limit 400 MP across all frames).');
  }
};

export const decodeGif = async (bytes: Uint8Array): Promise<Frame[]> => {
  const { parseGIF, decompressFrames } = await loadGifuct();
  const gif = parseGIF(toBuffer(bytes));
  const patches = decompressFrames(gif, true) as unknown as GifPatch[];
  assertWithinLimits(gif.lsd.width, gif.lsd.height, patches.length);
  return compositeGifFrames(patches, gif.lsd.width, gif.lsd.height);
};

/** PNG and APNG, decoded exactly (no canvas premultiplication). */
export const decodeApngOrPng = async (bytes: Uint8Array): Promise<Frame[]> => {
  const UPNG = (await loadUpng()).default;
  const img = UPNG.decode(toBuffer(bytes));
  assertWithinLimits(img.width, img.height, Math.max(1, img.frames.length));
  return UPNG.toRGBA8(img).map((buf, k) => ({
    data: { data: new Uint8ClampedArray(buf), width: img.width, height: img.height },
    delayMs: img.frames[k]?.delay ?? 0,
  }));
};

/** Browser decode: applies EXIF orientation and converts ICC profiles to sRGB. */
const decodeViaBitmap = async (bytes: Uint8Array): Promise<Pixels> => {
  const bitmap = await createImageBitmap(new Blob([bytes]));
  assertWithinLimits(bitmap.width, bitmap.height, 1);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return fromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
};

interface MinimalImageDecoder {
  tracks: { ready: Promise<void>; selectedTrack: { frameCount: number } | null };
  decode(o: { frameIndex: number }): Promise<{ image: CanvasImageSource & { duration: number | null; displayWidth: number; displayHeight: number; close(): void } }>;
  close(): void;
}
type ImageDecoderCtor = new (init: { data: Uint8Array; type: string }) => MinimalImageDecoder;

const decodeAnimatedWebp = async (bytes: Uint8Array, warnings: string[]): Promise<Frame[]> => {
  const Ctor = (globalThis as { ImageDecoder?: ImageDecoderCtor }).ImageDecoder;
  if (!Ctor) {
    warnings.push('This browser can’t read animated WebP frames; only the first frame was used.');
    return [{ data: await decodeViaBitmap(bytes), delayMs: 0 }];
  }
  const decoder = new Ctor({ data: bytes, type: 'image/webp' });
  try {
    await decoder.tracks.ready;
    const count = decoder.tracks.selectedTrack?.frameCount ?? 1;
    const frames: Frame[] = [];
    for (let k = 0; k < count; k += 1) {
      // eslint-disable-next-line no-await-in-loop
      const { image } = await decoder.decode({ frameIndex: k });
      if (k === 0) assertWithinLimits(image.displayWidth, image.displayHeight, count);
      const canvas = new OffscreenCanvas(image.displayWidth, image.displayHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D canvas is not available');
      ctx.drawImage(image, 0, 0);
      frames.push({
        data: fromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height)),
        delayMs: (image.duration ?? 0) / 1000,
      });
      image.close();
    }
    return frames;
  } finally {
    decoder.close();
  }
};

export const decode = async (bytes: Uint8Array): Promise<DecodedImage> => {
  const source = sniff(bytes);
  const warnings: string[] = [];
  let frames: Frame[];
  if (source === 'png') frames = await decodeApngOrPng(bytes);
  else if (source === 'gif') frames = await decodeGif(bytes);
  else if (source === 'webp' && isAnimatedWebp(bytes)) frames = await decodeAnimatedWebp(bytes, warnings);
  else if (source === 'webp') {
    const { decode: decodeWebp } = await loadWebp();
    const data = fromImageData(await decodeWebp(toBuffer(bytes)));
    assertWithinLimits(data.width, data.height, 1);
    frames = [{ data, delayMs: 0 }];
  } else {
    frames = [{ data: await decodeViaBitmap(bytes), delayMs: 0 }];
  }
  const { width, height } = frames[0].data;
  return { frames, width, height, source, warnings };
};
```

- [ ] **Step 8: Run tests + typecheck**

Run: `pnpm jest __tests__/tools.image-compressor.decode.test.ts`
Expected: PASS (3 tests).

Run: `pnpm typecheck 2>&1 | grep image-compressor`
Expected: no output. If `gifuct-js` types say `decompressFrames` returns `ParsedFrame[]` with `patch` optional, the `as unknown as GifPatch[]` cast already covers it.

- [ ] **Step 9: Lint + commit**

```bash
npx eslint src/tools/image-compressor/lib/codecs.ts src/tools/image-compressor/lib/decode.ts src/types/gifenc.d.ts src/types/gifsicle-wasm-browser.d.ts __tests__/tools.image-compressor.decode.test.ts
git add package.json pnpm-lock.yaml vite.config.ts src/types/gifenc.d.ts src/types/gifsicle-wasm-browser.d.ts src/tools/image-compressor/lib/codecs.ts src/tools/image-compressor/lib/decode.ts __tests__/tools.image-compressor.decode.test.ts
git commit -m "feat(image-compressor): add lazy codec loaders and image decoding"
```

(If `package-lock.json` changed too, leave it out — pnpm is canonical.)

---

### Task 8: Encoders and per-format plans

**Files:**
- Create: `src/tools/image-compressor/lib/encoders.ts`, `src/tools/image-compressor/lib/plans.ts`
- Test: `__tests__/tools.image-compressor.plans.test.ts`

**Interfaces:**
- Consumes: codecs (Task 7), `decodeGif`, `decodeApngOrPng` (Task 7), `encodeBmp`/`BmpMode` (Task 4), `muxAnimatedWebP` (Task 5), `flattenOnWhite`, `paletteToRgba` (Task 1).
- Produces (`encoders.ts`, all `Promise<EncodeOutput>`): `oxipngLossless(f)`, `pngquant(f, colours)`, `encodeApng(frames, cnum)`, `encodeJpeg(f, quality)`, `encodeWebp(frames, opts, lossless, alpha)`, `gifsicle(getBase, args, lossless, frames)`, `gifBase(frames): Promise<Uint8Array>`.
- Produces (`plans.ts`): `WARN` (warning strings), `planPng`, `planJpeg`, `planWebp`, `planGif`, `planBmp`, `planFor(format, img, analysis, sourceBytes): FormatPlan`.

- [ ] **Step 1: Create `lib/encoders.ts`** (codec glue — exercised by the browser smoke test in Task 12; plan tests mock it)

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { encodeBmp, type BmpMode } from './bmp';
import {
  fromImageData,
  loadGifenc,
  loadGifsicle,
  loadImagequant,
  loadJpeg,
  loadOxipng,
  loadUpng,
  loadWebp,
  toImageData,
} from './codecs';
import { decodeApngOrPng, decodeGif } from './decode';
import { flattenOnWhite, paletteToRgba } from './pixels';
import type { EncodeOutput, Frame, Pixels } from './types';
import { muxAnimatedWebP } from './webpMux';

const view = (b: ArrayBuffer | Uint8Array) => (b instanceof Uint8Array ? b : new Uint8Array(b));

export const oxipngLossless = async (f: Frame): Promise<EncodeOutput> => {
  const { default: optimise } = await loadOxipng();
  // optimiseAlpha: false keeps RGB under transparent pixels, so the result stays truly lossless.
  const out = await optimise(toImageData(f.data), { level: 4, optimiseAlpha: false });
  return { bytes: view(out), frames: [f] };
};

const quantize = async (p: Pixels, colours: number) => {
  const { ImageQuantizer } = await loadImagequant();
  const q = new ImageQuantizer();
  try {
    q.setMaxColors(colours);
    q.setSpeed(3);
    q.setQuality(0, 100);
    const res = q.quantizeImage(new Uint8ClampedArray(p.data), p.width, p.height);
    try {
      res.setDithering(1.0);
      const indices = res.getPaletteIndices(new Uint8ClampedArray(p.data), p.width, p.height);
      const palette = res.getPalette() as number[][];
      return { indices, palette };
    } finally {
      res.free();
    }
  } finally {
    q.free();
  }
};

export const pngquant = async (f: Frame, colours: number): Promise<EncodeOutput> => {
  const { encode_palette_to_png: encodePalettePng } = await loadImagequant();
  const { default: optimise } = await loadOxipng();
  const { width, height } = f.data;
  const { indices, palette } = await quantize(f.data, colours);
  const png = encodePalettePng(indices, palette, width, height);
  const out = await optimise(png.slice().buffer, { level: 4 });
  return { bytes: view(out), frames: [{ data: paletteToRgba(indices, palette, width, height), delayMs: 0 }] };
};

/** cnum 0 = lossless; otherwise UPNG's own quantizer with that many colours. */
export const encodeApng = async (frames: Frame[], cnum: number): Promise<EncodeOutput> => {
  const UPNG = (await loadUpng()).default;
  const { width, height } = frames[0].data;
  const out = view(UPNG.encode(
    frames.map((f) => f.data.data.slice().buffer),
    width,
    height,
    cnum,
    frames.map((f) => Math.max(10, Math.round(f.delayMs))),
  ));
  if (cnum === 0) return { bytes: out, frames };
  const decoded = await decodeApngOrPng(out);
  return { bytes: out, frames: decoded.map((d, k) => ({ ...d, delayMs: frames[k].delayMs })) };
};

export const encodeJpeg = async (f: Frame, quality: number): Promise<EncodeOutput> => {
  const { encode, decode } = await loadJpeg();
  const out = await encode(toImageData(flattenOnWhite(f.data)), { quality });
  const back = fromImageData(await decode(out));
  return { bytes: view(out), frames: [{ data: back, delayMs: f.delayMs }] };
};

export type WebpOptions = Record<string, number>;

export const encodeWebp = async (
  frames: Frame[],
  opts: WebpOptions,
  lossless: boolean,
  alpha: boolean,
): Promise<EncodeOutput> => {
  const { encode, decode } = await loadWebp();
  const stills: Uint8Array[] = [];
  const seen: Frame[] = [];
  for (const f of frames) {
    // eslint-disable-next-line no-await-in-loop
    const bytes = view(await encode(toImageData(f.data), opts));
    stills.push(bytes);
    // eslint-disable-next-line no-await-in-loop
    seen.push(lossless ? f : { data: fromImageData(await decode(bytes.slice().buffer)), delayMs: f.delayMs });
  }
  if (frames.length === 1) return { bytes: stills[0], frames: seen };
  const { width, height } = frames[0].data;
  const muxed = muxAnimatedWebP(stills.map((webp, k) => ({ webp, delayMs: frames[k].delayMs })), width, height, alpha);
  return { bytes: muxed, frames: seen };
};

/** Build a GIF from RGBA frames: libimagequant 256-colour palette per frame (dithered), gifenc writer. */
export const gifBase = async (frames: Frame[]): Promise<Uint8Array> => {
  const { GIFEncoder } = await loadGifenc();
  const gif = GIFEncoder();
  for (const f of frames) {
    const { width, height } = f.data;
    // eslint-disable-next-line no-await-in-loop
    const { indices, palette } = await quantize(f.data, 256);
    // ponytail: GIF has 1-bit alpha — the most transparent palette entry becomes the transparent index.
    let t = -1;
    palette.forEach((c, k) => { if (c[3] < 128 && (t < 0 || c[3] < palette[t][3])) t = k; });
    gif.writeFrame(indices, width, height, {
      palette: palette.map((c) => [c[0], c[1], c[2]]),
      delay: Math.round(f.delayMs),
      transparent: t >= 0,
      transparentIndex: Math.max(0, t),
    });
  }
  gif.finish();
  return gif.bytes();
};

export const gifsicle = async (
  getBase: () => Promise<Uint8Array>,
  args: string,
  lossless: boolean,
  frames: Frame[],
): Promise<EncodeOutput> => {
  const { default: gs } = await loadGifsicle();
  const base = await getBase();
  const [file] = await gs.run({
    input: [{ file: base.slice().buffer, name: 'in.gif' }],
    command: [`${args} in.gif -o /out/out.gif`],
  });
  if (!file) throw new Error('gifsicle produced no output');
  const bytes = new Uint8Array(await file.arrayBuffer());
  return { bytes, frames: lossless ? frames : await decodeGif(bytes) };
};

export const bmp = async (f: Frame, mode: BmpMode): Promise<EncodeOutput> => ({
  bytes: encodeBmp(f.data, mode),
  frames: [f],
});
```

- [ ] **Step 2: Write the failing plans test**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { planFor, WARN } from '../src/tools/image-compressor/lib/plans';
import type { Analysis, DecodedImage, OutputFormat } from '../src/tools/image-compressor/lib/types';

jest.mock('../src/tools/image-compressor/lib/encoders', () => {
  const fake = (label: string) => jest.fn(async () => ({ bytes: new Uint8Array([1]), frames: [], label }));
  return {
    oxipngLossless: fake('oxi'),
    pngquant: fake('pq'),
    encodeApng: fake('apng'),
    encodeJpeg: fake('jpg'),
    encodeWebp: fake('webp'),
    gifsicle: fake('gs'),
    gifBase: jest.fn(async () => new Uint8Array([7])),
    bmp: jest.requireActual('../src/tools/image-compressor/lib/encoders').bmp,
  };
});
// eslint-disable-next-line import/first
import * as enc from '../src/tools/image-compressor/lib/encoders';

const frame = { data: { data: new Uint8ClampedArray(4 * 4 * 4).fill(255), width: 4, height: 4 }, delayMs: 50 };
const img = (frames = 1, source: DecodedImage['source'] = 'png'): DecodedImage => ({
  frames: Array.from({ length: frames }, () => frame), width: 4, height: 4, source, warnings: [],
});
const analysis = (over: Partial<Analysis> = {}): Analysis => ({
  hasAlpha: false, animated: false, colorCount: 5000, flatRatio: 0.1, cls: 'photo', ...over,
});
const labels = (format: OutputFormat, i: DecodedImage, a: Analysis) =>
  planFor(format, i, a, new Uint8Array([9])).families.map((f) => f.candidates.map((c) => c.label));

describe('planFor', () => {
  it('PNG: oxipng lossless, then pngquant most aggressive first', () => {
    expect(labels('png', img(), analysis())).toEqual([
      ['oxipng -o4'],
      ['pngquant 64c → oxipng', 'pngquant 128c → oxipng', 'pngquant 256c → oxipng'],
    ]);
  });

  it('PNG animated: APNG lossless then quantized ladder', () => {
    const a = analysis({ animated: true });
    expect(labels('png', img(3), a)).toEqual([
      ['APNG lossless'],
      ['APNG 64 colours', 'APNG 128 colours', 'APNG 256 colours'],
    ]);
  });

  it('JPG: quality ladder 85→95, flattened reference, warnings', () => {
    const plan = planFor('jpg', img(2), analysis({ hasAlpha: true, animated: true, cls: 'ui' }), new Uint8Array());
    expect(plan.families[0].candidates.map((c) => c.label)).toEqual([
      'mozjpeg q85', 'mozjpeg q88', 'mozjpeg q90', 'mozjpeg q92', 'mozjpeg q95',
    ]);
    expect(plan.reference).toHaveLength(1);
    expect(plan.warnings).toEqual([WARN.firstFrame('JPG'), WARN.jpegAlpha, WARN.jpegNotIdeal]);
  });

  it('WebP photo: lossy ladder only', () => {
    expect(labels('webp', img(), analysis())).toEqual([
      ['WebP q75', 'WebP q80', 'WebP q85', 'WebP q90', 'WebP q95'],
    ]);
  });

  it('WebP ui: lossless + near-lossless', () => {
    expect(labels('webp', img(), analysis({ cls: 'ui' }))).toEqual([
      ['WebP lossless'],
      ['WebP near-lossless 60', 'WebP near-lossless 80'],
    ]);
  });

  it('WebP photo with alpha: near-lossless + lossy', () => {
    expect(labels('webp', img(), analysis({ hasAlpha: true }))).toEqual([
      ['WebP near-lossless 60', 'WebP near-lossless 80'],
      ['WebP q75', 'WebP q80', 'WebP q85', 'WebP q90', 'WebP q95'],
    ]);
  });

  it('GIF from GIF: lossless -O3 on original bytes, then lossy ladder', async () => {
    const plan = planFor('gif', img(3, 'gif'), analysis({ animated: true }), new Uint8Array([9]));
    expect(plan.families.map((f) => f.candidates.map((c) => c.label))).toEqual([
      ['gifsicle -O3'],
      ['gifsicle -O3 --lossy=80', 'gifsicle -O3 --lossy=40', 'gifsicle -O3 --lossy=20'],
    ]);
    expect(plan.families[0].candidates[0].lossless).toBe(true);
    await plan.families[0].candidates[0].run();
    expect(enc.gifsicle).toHaveBeenCalledWith(expect.any(Function), '-O3', true, plan.reference);
    const getBase = (enc.gifsicle as jest.Mock).mock.calls[0][0];
    expect(Array.from(await getBase())).toEqual([9]);
    expect(plan.warnings).toEqual([WARN.gifColours]);
  });

  it('GIF from PNG: builds the base once and treats it as lossy', async () => {
    (enc.gifBase as jest.Mock).mockClear();
    const plan = planFor('gif', img(), analysis({ colorCount: 12, cls: 'flat' }), new Uint8Array());
    expect(plan.families[0].candidates[0].label).toBe('libimagequant → gifsicle -O3');
    expect(plan.families[0].candidates[0].lossless).toBe(false);
    const getBase = () => (enc.gifsicle as jest.Mock).mock.calls.at(-1)[0]();
    await plan.families[0].candidates[0].run();
    await getBase();
    await plan.families[1].candidates[0].run();
    await getBase();
    expect(enc.gifBase).toHaveBeenCalledTimes(1);
    expect(plan.warnings).toEqual([]);
  });

  it('BMP: true colour, plus palette modes when colours allow', async () => {
    expect(labels('bmp', img(), analysis())).toEqual([['BMP rgb24']]);
    expect(labels('bmp', img(), analysis({ hasAlpha: true, colorCount: 3 }))).toEqual([['BMP rgba32']]);
    expect(labels('bmp', img(), analysis({ colorCount: 200 }))).toEqual([['BMP rgb24'], ['BMP pal8'], ['BMP rle8']]);
    expect(labels('bmp', img(), analysis({ colorCount: 1 }))).toEqual([['BMP rgb24'], ['BMP pal8'], ['BMP rle8'], ['BMP rle4']]);
    const out = await planFor('bmp', img(), analysis(), new Uint8Array()).families[0].candidates[0].run();
    expect(String.fromCharCode(out.bytes[0], out.bytes[1])).toBe('BM');
  });

  it('BMP animated: first frame + warning', () => {
    const plan = planFor('bmp', img(2), analysis({ animated: true }), new Uint8Array());
    expect(plan.reference).toHaveLength(1);
    expect(plan.warnings).toEqual([WARN.firstFrame('BMP')]);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.plans.test.ts`
Expected: FAIL — `Cannot find module '../src/tools/image-compressor/lib/plans'`.

- [ ] **Step 4: Implement `lib/plans.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Candidate families per output format. Ladders are ordered most aggressive first:
 * selectBest() stops a family at its first passing candidate.
 */
import type { BmpMode } from './bmp';
import {
  bmp,
  encodeApng,
  encodeJpeg,
  encodeWebp,
  gifBase,
  gifsicle,
  oxipngLossless,
  pngquant,
} from './encoders';
import { flattenOnWhite } from './pixels';
import type { Analysis, Candidate, DecodedImage, Family, FormatPlan, OutputFormat } from './types';

export const WARN = {
  firstFrame: (fmt: string) => `${fmt} can’t hold animation — only the first frame was kept.`,
  jpegAlpha: 'JPG has no transparency — transparent areas were filled with white.',
  jpegNotIdeal: 'JPG isn’t ideal for screenshots and flat graphics; PNG or WebP usually looks sharper.',
  gifColours: 'GIF is limited to 256 colours per frame, so colour gradients may show banding.',
};

const once = <T>(fn: () => Promise<T>): (() => Promise<T>) => {
  let p: Promise<T> | null = null;
  return () => {
    if (!p) p = fn();
    return p;
  };
};

export const planPng = (img: DecodedImage, a: Analysis): FormatPlan => {
  if (a.animated) {
    const apng = (cnum: number): Candidate => ({
      label: cnum ? `APNG ${cnum} colours` : 'APNG lossless',
      lossless: cnum === 0,
      run: () => encodeApng(img.frames, cnum),
    });
    return {
      reference: img.frames,
      warnings: [],
      families: [
        { name: 'lossless', candidates: [apng(0)] },
        { name: 'quantized', candidates: [64, 128, 256].map(apng) },
      ],
    };
  }
  const f = img.frames[0];
  return {
    reference: [f],
    warnings: [],
    families: [
      { name: 'lossless', candidates: [{ label: 'oxipng -o4', lossless: true, run: () => oxipngLossless(f) }] },
      {
        name: 'pngquant',
        candidates: [64, 128, 256].map((n) => ({
          label: `pngquant ${n}c → oxipng`,
          lossless: false,
          run: () => pngquant(f, n),
        })),
      },
    ],
  };
};

export const planJpeg = (img: DecodedImage, a: Analysis): FormatPlan => {
  const warnings: string[] = [];
  if (a.animated) warnings.push(WARN.firstFrame('JPG'));
  if (a.hasAlpha) warnings.push(WARN.jpegAlpha);
  if (a.cls !== 'photo') warnings.push(WARN.jpegNotIdeal);
  const f = img.frames[0];
  return {
    // Judge JPG against what it can represent: the image flattened on white.
    reference: [{ data: flattenOnWhite(f.data), delayMs: f.delayMs }],
    warnings,
    families: [{
      name: 'mozjpeg',
      candidates: [85, 88, 90, 92, 95].map((q) => ({
        label: `mozjpeg q${q}`,
        lossless: false,
        run: () => encodeJpeg(f, q),
      })),
    }],
  };
};

export const planWebp = (img: DecodedImage, a: Analysis): FormatPlan => {
  const cand = (label: string, lossless: boolean, opts: Record<string, number>): Candidate => ({
    label,
    lossless,
    run: () => encodeWebp(img.frames, opts, lossless, a.hasAlpha),
  });
  const families: Family[] = [];
  if (a.cls !== 'photo') {
    families.push({
      name: 'lossless',
      candidates: [cand('WebP lossless', true, { lossless: 1, exact: 1, method: 4, quality: 75 })],
    });
  }
  if (a.cls !== 'photo' || a.hasAlpha) {
    families.push({
      name: 'near-lossless',
      candidates: [60, 80].map((n) =>
        cand(`WebP near-lossless ${n}`, false, { lossless: 1, near_lossless: n, method: 4, quality: 75 })),
    });
  }
  if (a.cls === 'photo') {
    families.push({
      name: 'lossy',
      candidates: [75, 80, 85, 90, 95].map((q) => cand(`WebP q${q}`, false, { quality: q, method: 4 })),
    });
  }
  return { reference: img.frames, warnings: [], families };
};

export const planGif = (img: DecodedImage, a: Analysis, sourceBytes: Uint8Array): FormatPlan => {
  const fromGif = img.source === 'gif';
  const base = fromGif ? async () => sourceBytes : once(() => gifBase(img.frames));
  const run = (args: string, lossless: boolean) => () => gifsicle(base, args, lossless, img.frames);
  return {
    reference: img.frames,
    warnings: a.colorCount > 256 ? [WARN.gifColours] : [],
    families: [
      {
        name: 'gifsicle',
        candidates: [{
          label: fromGif ? 'gifsicle -O3' : 'libimagequant → gifsicle -O3',
          lossless: fromGif,
          run: run('-O3', fromGif),
        }],
      },
      {
        name: 'gifsicle lossy',
        candidates: [80, 40, 20].map((l) => ({
          label: `gifsicle -O3 --lossy=${l}`,
          lossless: false,
          run: run(`-O3 --lossy=${l}`, false),
        })),
      },
    ],
  };
};

export const planBmp = (img: DecodedImage, a: Analysis): FormatPlan => {
  const f = img.frames[0];
  const modes: BmpMode[] = [a.hasAlpha ? 'rgba32' : 'rgb24'];
  if (!a.hasAlpha && a.colorCount <= 256) modes.push('pal8', 'rle8');
  if (!a.hasAlpha && a.colorCount <= 16) modes.push('rle4');
  return {
    reference: [f],
    warnings: a.animated ? [WARN.firstFrame('BMP')] : [],
    families: modes.map((m) => ({
      name: m,
      candidates: [{ label: `BMP ${m}`, lossless: true, run: () => bmp(f, m) }],
    })),
  };
};

export const planFor = (
  format: OutputFormat,
  img: DecodedImage,
  a: Analysis,
  sourceBytes: Uint8Array,
): FormatPlan => {
  switch (format) {
    case 'png': return planPng(img, a);
    case 'jpg': return planJpeg(img, a);
    case 'webp': return planWebp(img, a);
    case 'gif': return planGif(img, a, sourceBytes);
    default: return planBmp(img, a);
  }
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.plans.test.ts`
Expected: PASS (10 tests). If `jest.requireActual(... encoders).bmp` fails because `encoders.ts` statically imports `codecs.ts` — it shouldn't: `codecs.ts` only has dynamic imports, which babel turns into lazy `require`s that never run here.

- [ ] **Step 6: Typecheck, lint, commit**

```bash
pnpm typecheck 2>&1 | grep image-compressor
npx eslint src/tools/image-compressor/lib/encoders.ts src/tools/image-compressor/lib/plans.ts __tests__/tools.image-compressor.plans.test.ts
git add src/tools/image-compressor/lib/encoders.ts src/tools/image-compressor/lib/plans.ts __tests__/tools.image-compressor.plans.test.ts
git commit -m "feat(image-compressor): add encoders and per-format candidate plans"
```

Expected: typecheck grep prints nothing; eslint prints nothing.

---

### Task 9: Pipeline and worker

**Files:**
- Create: `src/tools/image-compressor/lib/pipeline.ts`, `src/tools/image-compressor/workers/compress.worker.ts`, `src/tools/image-compressor/workers/createCompressWorker.ts`, `__mocks__/createCompressWorker.ts`
- Modify: `jest.config.cjs` (moduleNameMapper)
- Test: `__tests__/tools.image-compressor.pipeline.test.ts`

**Interfaces:**
- Consumes: `decode`, `TooBigError` (Task 7), `analyze` (Task 1), `planFor` (Task 8), `selectBest`, `thresholdFor` (Task 3), types.
- Produces: `class PipelineError extends Error { code: ErrorCode }`; `compress(bytes: Uint8Array, format: OutputFormat, onStep?: (s: string) => void, decodeFn?: typeof decode): Promise<CompressResult>`; `createCompressWorker(): Worker`.

- [ ] **Step 1: Write the failing test**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compress, PipelineError } from '../src/tools/image-compressor/lib/pipeline';
import { TooBigError } from '../src/tools/image-compressor/lib/decode';
import type { DecodedImage } from '../src/tools/image-compressor/lib/types';

jest.mock('../src/tools/image-compressor/lib/codecs', () => ({
  loadJpeg: () => Promise.reject(new Error('offline')),
}));

const threeColours = (): DecodedImage => {
  const w = 40;
  const h = 10;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let k = 0; k < w * h; k += 1) data.set([(k % w) < 20 ? 0 : 200, 0, 0, 255], k * 4);
  return { frames: [{ data: { data, width: w, height: h }, delayMs: 0 }], width: w, height: h, source: 'png', warnings: [] };
};

describe('compress', () => {
  it('returns the smallest lossless BMP with a report', async () => {
    const steps: string[] = [];
    const res = await compress(new Uint8Array(5000), 'bmp', (s) => steps.push(s), async () => threeColours());
    expect(res.ext).toBe('bmp');
    expect(res.mime).toBe('image/bmp');
    expect(res.report.pipeline).toBe('BMP rle8');
    expect(res.report.mode).toBe('lossless');
    expect(res.report.ssim).toBeNull();
    expect(res.report.cls).toBe('flat');
    expect(res.report.outputBytes).toBe(res.bytes.length);
    expect(res.report.inputBytes).toBe(5000);
    expect(steps.slice(0, 2)).toEqual(['Reading image', 'Analyzing']);
    expect(steps).toContain('BMP rle8');
  });

  it('returns the original when the same format is already smaller', async () => {
    const original = new Uint8Array(10);
    const res = await compress(original, 'bmp', undefined, async () => ({ ...threeColours(), source: 'bmp' }));
    expect(res.bytes).toBe(original);
    expect(res.report.mode).toBe('already-optimal');
    expect(res.report.warnings).toContain('The original file was already the smallest, so it was returned unchanged (metadata not stripped).');
  });

  it('maps decode failures to a decode error', async () => {
    await expect(compress(new Uint8Array(1), 'png', undefined, async () => { throw new Error('bad'); }))
      .rejects.toMatchObject({ code: 'decode', message: 'Can’t read this image in your browser.' });
  });

  it('maps size-limit failures to too-big', async () => {
    await expect(compress(new Uint8Array(1), 'png', undefined, async () => { throw new TooBigError('Image is 99 MP; the limit is 40 MP.'); }))
      .rejects.toMatchObject({ code: 'too-big', message: 'Image is 99 MP; the limit is 40 MP.' });
  });

  it('reports a codec error when every encoder fails to load', async () => {
    const err = await compress(new Uint8Array(1), 'jpg', undefined, async () => threeColours()).catch((e) => e);
    expect(err).toBeInstanceOf(PipelineError);
    expect(err.code).toBe('codec');
    expect(err.message).toMatch(/^Couldn’t load the JPG encoder/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.pipeline.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/pipeline.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { analyze } from './analyze';
import { decode, TooBigError } from './decode';
import { planFor } from './plans';
import { selectBest, thresholdFor } from './select';
import { MIME, type CompressResult, type ErrorCode, type Mode, type OutputFormat } from './types';

export class PipelineError extends Error {
  constructor(public code: ErrorCode, message: string) {
    super(message);
  }
}

const ORIGINAL_KEPT = 'The original file was already the smallest, so it was returned unchanged (metadata not stripped).';

export const compress = async (
  bytes: Uint8Array,
  format: OutputFormat,
  onStep: (step: string) => void = () => {},
  decodeFn: typeof decode = decode,
): Promise<CompressResult> => {
  onStep('Reading image');
  let img;
  try {
    img = await decodeFn(bytes);
  } catch (err) {
    if (err instanceof TooBigError) throw new PipelineError('too-big', err.message);
    throw new PipelineError('decode', 'Can’t read this image in your browser.');
  }

  onStep('Analyzing');
  const a = analyze(img);
  const plan = planFor(format, img, a, bytes);
  const sel = await selectBest({
    reference: plan.reference,
    threshold: thresholdFor(a.cls),
    families: plan.families,
    onStep,
  });

  if (!sel.best) {
    throw new PipelineError('codec', `Couldn’t load the ${format.toUpperCase()} encoder (${sel.skipped.join('; ')}).`);
  }

  const warnings = [...img.warnings, ...plan.warnings];
  const common = { inputBytes: bytes.length, cls: a.cls, skipped: sel.skipped };

  if (img.source === format && sel.best.bytes.length >= bytes.length) {
    return {
      bytes,
      mime: MIME[format],
      ext: format,
      report: {
        ...common,
        pipeline: 'original file',
        mode: 'already-optimal',
        ssim: null,
        outputBytes: bytes.length,
        warnings: [...warnings, ORIGINAL_KEPT],
      },
    };
  }

  let mode: Mode = 'below-target';
  if (sel.passed) mode = sel.best.lossless ? 'lossless' : 'visually-lossless';
  return {
    bytes: sel.best.bytes,
    mime: MIME[format],
    ext: format,
    report: {
      ...common,
      pipeline: sel.best.label,
      mode,
      ssim: sel.best.lossless ? null : Math.round(sel.best.luma * 10000) / 10000,
      outputBytes: sel.best.bytes.length,
      warnings,
    },
  };
};
```

Check against the first test: the 40×10 two-colour image → BMP modes rgb24 (1254 B), pal8 (462 B), rle8 (122 B), rle4 (122 B — same run bytes, same 2-entry palette). On a tie `selectBest` keeps the earlier family, so the winner is `BMP rle8`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.pipeline.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Create the worker, its factory, and the Jest stub**

`src/tools/image-compressor/workers/compress.worker.ts`:

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compress, PipelineError } from '../lib/pipeline';
import type { WorkerRequest, WorkerResponse } from '../lib/types';

const post = (m: WorkerResponse) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { jobId, bytes, format } = e.data;
  try {
    const result = await compress(new Uint8Array(bytes), format, (step) => post({ type: 'progress', jobId, step }));
    post({ type: 'done', jobId, result });
  } catch (err) {
    post({
      type: 'error',
      jobId,
      code: err instanceof PipelineError ? err.code : 'internal',
      message: (err as Error).message || 'Something went wrong while compressing.',
    });
  }
};
```

`src/tools/image-compressor/workers/createCompressWorker.ts`:

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
export const createCompressWorker = (): Worker =>
  new Worker(new URL('./compress.worker.ts', import.meta.url), { type: 'module' });
```

`__mocks__/createCompressWorker.ts`:

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Jest (CJS) can't parse import.meta.url. Hook tests inject their own worker factory.
 */
export const createCompressWorker = (): Worker => {
  throw new Error('createCompressWorker is not available in tests; inject a fake worker.');
};
```

In `jest.config.cjs` `moduleNameMapper`, add after the `defaultQrWorker` line:

```js
    '(.*/)?createCompressWorker$': '<rootDir>/__mocks__/createCompressWorker.ts',
```

- [ ] **Step 6: Typecheck, lint, commit**

```bash
pnpm typecheck 2>&1 | grep image-compressor
npx eslint src/tools/image-compressor/lib/pipeline.ts src/tools/image-compressor/workers __mocks__/createCompressWorker.ts __tests__/tools.image-compressor.pipeline.test.ts
git add src/tools/image-compressor/lib/pipeline.ts src/tools/image-compressor/workers __mocks__/createCompressWorker.ts jest.config.cjs __tests__/tools.image-compressor.pipeline.test.ts
git commit -m "feat(image-compressor): add compression pipeline and worker"
```

---

### Task 10: Queue hook

**Files:**
- Rewrite: `src/tools/image-compressor/hooks/useImageCompressor.ts`
- Test: `__tests__/tools.image-compressor.hook.test.ts`

**Interfaces:**
- Consumes: `createCompressWorker` (Task 9), `WorkerRequest`, `WorkerResponse`, `OutputFormat`, `CompressResult`, `OUTPUT_FORMATS` (Task 1).
- Produces:
  - `MAX_FILES = 20`, `MAX_FILE_BYTES = 50 * 1024 * 1024`, `WATCHDOG_MS = 60_000`, `FORMAT_KEY = 'image-compressor-format'`
  - `type ItemStatus = 'queued' | 'working' | 'done' | 'error'`
  - `interface QueueItem { id: number; file: File; status: ItemStatus; step: string; result?: CompressResult; error?: string; invalid?: boolean }`
  - `useImageCompressor(createWorker?: () => Worker)` returning `{ format, setFormat, items, addFiles, removeItem, clear, unavailable }`
  - `type UseImageCompressorReturn = ReturnType<typeof useImageCompressor>`

- [ ] **Step 1: Write the failing test**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  FORMAT_KEY,
  MAX_FILES,
  useImageCompressor,
  WATCHDOG_MS,
} from '../src/tools/image-compressor/hooks/useImageCompressor';
import type { CompressResult, WorkerRequest, WorkerResponse } from '../src/tools/image-compressor/lib/types';

class FakeWorker {
  static all: FakeWorker[] = [];
  onmessage: ((e: MessageEvent<WorkerResponse>) => void) | null = null;
  posted: WorkerRequest[] = [];
  terminate = jest.fn();
  constructor() { FakeWorker.all.push(this); }
  postMessage(m: WorkerRequest) { this.posted.push(m); }
  emit(m: WorkerResponse) { act(() => { this.onmessage?.({ data: m } as MessageEvent<WorkerResponse>); }); }
}
const factory = () => new FakeWorker() as unknown as Worker;
const last = () => FakeWorker.all[FakeWorker.all.length - 1];
const file = (name: string, size = 10, type = 'image/png') => {
  const f = new File([new Uint8Array(size)], name, { type });
  return f;
};
const result = (): CompressResult => ({
  bytes: new Uint8Array(3), mime: 'image/webp', ext: 'webp',
  report: { pipeline: 'WebP q80', mode: 'visually-lossless', ssim: 0.995, inputBytes: 10, outputBytes: 3, cls: 'photo', warnings: [], skipped: [] },
});
const posted = async (n: number) => waitFor(() => expect(last().posted).toHaveLength(n));

beforeEach(() => {
  FakeWorker.all = [];
  localStorage.clear();
});

describe('useImageCompressor', () => {
  it('defaults to WebP and restores the saved format', () => {
    expect(renderHook(() => useImageCompressor(factory)).result.current.format).toBe('webp');
    localStorage.setItem(FORMAT_KEY, 'png');
    expect(renderHook(() => useImageCompressor(factory)).result.current.format).toBe('png');
  });

  it('processes files one at a time', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png'), file('b.png')]));
    await posted(1);
    expect(last().posted[0]).toMatchObject({ type: 'compress', jobId: 1, format: 'webp' });
    expect(r.current.items.map((i) => i.status)).toEqual(['working', 'queued']);

    last().emit({ type: 'progress', jobId: 1, step: 'WebP q80' });
    expect(r.current.items[0].step).toBe('WebP q80');

    last().emit({ type: 'done', jobId: 1, result: result() });
    await posted(2);
    expect(r.current.items[0].status).toBe('done');
    expect(r.current.items[1].status).toBe('working');
  });

  it('ignores messages for stale jobs', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png')]));
    await posted(1);
    last().emit({ type: 'done', jobId: 99, result: result() });
    expect(r.current.items[0].status).toBe('working');
  });

  it('marks a format unavailable on codec errors', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png')]));
    await posted(1);
    last().emit({ type: 'error', jobId: 1, code: 'codec', message: 'Couldn’t load the WEBP encoder' });
    expect(r.current.items[0]).toMatchObject({ status: 'error', error: 'Couldn’t load the WEBP encoder' });
    expect(r.current.unavailable).toEqual(['webp']);
  });

  it('changing the format restarts every valid file with a fresh worker', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png'), file('big.png', 60 * 1024 * 1024)]));
    await posted(1);
    const first = last();
    act(() => r.current.setFormat('png'));
    expect(first.terminate).toHaveBeenCalled();
    expect(localStorage.getItem(FORMAT_KEY)).toBe('png');
    await waitFor(() => expect(FakeWorker.all).toHaveLength(2));
    await posted(1);
    expect(last().posted[0].format).toBe('png');
    expect(r.current.items[1]).toMatchObject({ status: 'error', invalid: true });
  });

  it('rejects oversized, non-image and over-limit files without sending them', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    const many = Array.from({ length: MAX_FILES + 1 }, (_, k) => file(`f${k}.png`));
    act(() => r.current.addFiles([file('big.png', 60 * 1024 * 1024), file('notes.txt', 5, 'text/plain'), ...many]));
    const errors = r.current.items.filter((i) => i.status === 'error').map((i) => i.error);
    expect(errors).toContain('File is larger than 50 MB.');
    expect(errors).toContain('Not an image file.');
    expect(errors).toContain('Limit is 20 files at a time.');
    expect(r.current.items).toHaveLength(MAX_FILES + 3);
  });

  it('times out a stuck job and recreates the worker', async () => {
    jest.useFakeTimers();
    try {
      const { result: r } = renderHook(() => useImageCompressor(factory));
      act(() => r.current.addFiles([file('a.png'), file('b.png')]));
      await waitFor(() => expect(FakeWorker.all).toHaveLength(1));
      const stuck = last();
      act(() => { jest.advanceTimersByTime(WATCHDOG_MS + 1); });
      expect(stuck.terminate).toHaveBeenCalled();
      expect(r.current.items[0]).toMatchObject({ status: 'error', error: 'Timed out — this image took too long to process.' });
      expect(r.current.items[1].status).toBe('working');
    } finally {
      jest.useRealTimers();
    }
  });

  it('removes items and clears the queue', async () => {
    const { result: r } = renderHook(() => useImageCompressor(factory));
    act(() => r.current.addFiles([file('a.png'), file('b.png')]));
    await posted(1);
    act(() => r.current.removeItem(r.current.items[1].id));
    expect(r.current.items).toHaveLength(1);
    act(() => r.current.clear());
    expect(r.current.items).toHaveLength(0);
    expect(last().terminate).toHaveBeenCalled();
  });
});
```

Note: 20 valid-looking `many` files fill the limit after `a.png`-style rejects? No — rejected files still occupy a row. Rows: `big` (error), `notes` (error), then `many[0..20]`: only `MAX_FILES - 2 = 18` fit; the rest get the limit error. Total rows = 2 + 21 = 23 = `MAX_FILES + 3`. The limit counts **all rows** so the list can't grow without bound.

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.hook.test.ts`
Expected: FAIL — old hook has no `addFiles` / module exports missing.

- [ ] **Step 3: Rewrite `hooks/useImageCompressor.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createCompressWorker } from '../workers/createCompressWorker';
import {
  OUTPUT_FORMATS,
  type CompressResult,
  type OutputFormat,
  type WorkerRequest,
  type WorkerResponse,
} from '../lib/types';

export const MAX_FILES = 20;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const WATCHDOG_MS = 60_000;
export const FORMAT_KEY = 'image-compressor-format';

export type ItemStatus = 'queued' | 'working' | 'done' | 'error';

export interface QueueItem {
  id: number;
  file: File;
  status: ItemStatus;
  step: string;
  result?: CompressResult;
  error?: string;
  /** Rejected before processing (too big, not an image, over the limit) — never retried. */
  invalid?: boolean;
}

const readFormat = (): OutputFormat => {
  try {
    const saved = localStorage.getItem(FORMAT_KEY) as OutputFormat | null;
    return saved && OUTPUT_FORMATS.includes(saved) ? saved : 'webp';
  } catch {
    return 'webp';
  }
};

interface ActiveJob {
  jobId: number;
  itemId: number;
  format: OutputFormat;
}

export const useImageCompressor = (createWorker: () => Worker = createCompressWorker) => {
  const [format, setFormatState] = useState<OutputFormat>(readFormat);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [unavailable, setUnavailable] = useState<OutputFormat[]>([]);

  const workerRef = useRef<Worker | null>(null);
  const activeRef = useRef<ActiveJob | null>(null);
  const watchdogRef = useRef<number | undefined>(undefined);
  const jobSeq = useRef(0);
  const idSeq = useRef(0);

  const patch = useCallback((id: number, p: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));
  }, []);

  const stopWorker = useCallback(() => {
    window.clearTimeout(watchdogRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
    activeRef.current = null;
  }, []);

  const armWatchdog = useCallback(() => {
    window.clearTimeout(watchdogRef.current);
    watchdogRef.current = window.setTimeout(() => {
      const job = activeRef.current;
      if (!job) return;
      stopWorker();
      patch(job.itemId, { status: 'error', step: '', error: 'Timed out — this image took too long to process.' });
    }, WATCHDOG_MS);
  }, [patch, stopWorker]);

  const onMessage = useCallback((m: WorkerResponse) => {
    const job = activeRef.current;
    if (!job || m.jobId !== job.jobId) return;
    if (m.type === 'progress') {
      armWatchdog();
      patch(job.itemId, { step: m.step });
      return;
    }
    window.clearTimeout(watchdogRef.current);
    activeRef.current = null;
    if (m.type === 'done') {
      patch(job.itemId, { status: 'done', step: '', result: m.result });
    } else {
      if (m.code === 'codec') {
        setUnavailable((u) => (u.includes(job.format) ? u : [...u, job.format]));
      }
      patch(job.itemId, { status: 'error', step: '', error: m.message });
    }
  }, [armWatchdog, patch]);

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      const w = createWorker();
      w.onmessage = (e: MessageEvent<WorkerResponse>) => onMessageRef.current(e.data);
      workerRef.current = w;
    }
    return workerRef.current;
  }, [createWorker]);

  // Start the next queued item whenever nothing is running.
  useEffect(() => {
    if (activeRef.current) return;
    const next = items.find((it) => it.status === 'queued');
    if (!next) return;
    jobSeq.current += 1;
    const job: ActiveJob = { jobId: jobSeq.current, itemId: next.id, format };
    activeRef.current = job;
    patch(next.id, { status: 'working', step: 'Reading file' });
    armWatchdog();
    next.file.arrayBuffer().then(
      (bytes) => {
        if (activeRef.current?.jobId !== job.jobId) return;
        const msg: WorkerRequest = { type: 'compress', jobId: job.jobId, bytes, format: job.format };
        getWorker().postMessage(msg, [bytes]);
      },
      () => {
        if (activeRef.current?.jobId !== job.jobId) return;
        window.clearTimeout(watchdogRef.current);
        activeRef.current = null;
        patch(job.itemId, { status: 'error', step: '', error: 'Couldn’t read this file.' });
      },
    );
  }, [items, format, patch, armWatchdog, getWorker]);

  useEffect(() => stopWorker, [stopWorker]);

  const addFiles = useCallback((files: File[]) => {
    setItems((prev) => {
      let room = MAX_FILES - prev.length;
      const added = files.map((file): QueueItem => {
        idSeq.current += 1;
        const base = { id: idSeq.current, file, step: '' };
        room -= 1;
        if (room < 0) return { ...base, status: 'error', invalid: true, error: `Limit is ${MAX_FILES} files at a time.` };
        if (file.type && !file.type.startsWith('image/')) return { ...base, status: 'error', invalid: true, error: 'Not an image file.' };
        if (file.size > MAX_FILE_BYTES) return { ...base, status: 'error', invalid: true, error: 'File is larger than 50 MB.' };
        return { ...base, status: 'queued' };
      });
      return [...prev, ...added];
    });
  }, []);

  const setFormat = useCallback((next: OutputFormat) => {
    try {
      localStorage.setItem(FORMAT_KEY, next);
    } catch {
      // storage blocked — the choice just won't persist
    }
    stopWorker();
    setFormatState(next);
    setItems((prev) => prev.map((it) => (it.invalid ? it : { ...it, status: 'queued', step: '', result: undefined, error: undefined })));
  }, [stopWorker]);

  const removeItem = useCallback((id: number) => {
    if (activeRef.current?.itemId === id) stopWorker();
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, [stopWorker]);

  const clear = useCallback(() => {
    stopWorker();
    setItems([]);
  }, [stopWorker]);

  return { format, setFormat, items, addFiles, removeItem, clear, unavailable };
};

export type UseImageCompressorReturn = ReturnType<typeof useImageCompressor>;
```

The limit test: `room` starts at 20. `big` → room 19, error (size). `notes` → room 18, error (type). `many[0..17]` → room 17..0, queued. `many[18..20]` → room < 0, limit error. So `MAX_FILES + 3` rows. ✓

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm jest __tests__/tools.image-compressor.hook.test.ts`
Expected: PASS (8 tests). If `File.prototype.arrayBuffer` is missing in jsdom, add to the top of the test: `if (!Blob.prototype.arrayBuffer) Blob.prototype.arrayBuffer = function () { return new Response(this).arrayBuffer(); };`.

- [ ] **Step 5: Lint + commit**

```bash
npx eslint src/tools/image-compressor/hooks/useImageCompressor.ts __tests__/tools.image-compressor.hook.test.ts
git add src/tools/image-compressor/hooks/useImageCompressor.ts __tests__/tools.image-compressor.hook.test.ts
git commit -m "feat(image-compressor): queue hook with worker lifecycle and watchdog"
```

(The old UI still imports the old hook's fields and will fail typecheck until Task 11 — that's expected; don't push between Task 10 and 11.)

---

### Task 11: TinyPNG-style UI

**Files:**
- Rewrite: `src/tools/image-compressor/components/ImageCompressorPanel.tsx`
- Create: `src/tools/image-compressor/components/FileRow.tsx`, `src/tools/image-compressor/lib/format.ts`
- Modify: `src/tools/image-compressor/page.tsx`, `src/tools/index.ts` (registry entry at the `id: "image-compressor"` block)
- Delete: `src/tools/image-compressor/lib/imageCompressor.ts`, `__tests__/tools.image-compressor.test.tsx`
- Test: `__tests__/tools.image-compressor.ui.test.tsx`

**Interfaces:**
- Consumes: `UseImageCompressorReturn`, `QueueItem` (Task 10), `OUTPUT_FORMATS`, `OutputFormat` (Task 1).
- Produces: default export `ImageCompressorView(props: UseImageCompressorReturn)`; `FileRow({ item, onRemove })`; `formatBytes(n): string`; `outputName(name, ext): string`.

- [ ] **Step 1: Write the failing test**

```tsx
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ImageCompressorView, { formatBytes, outputName } from '../src/tools/image-compressor/components/ImageCompressorPanel';
import type { QueueItem, UseImageCompressorReturn } from '../src/tools/image-compressor/hooks/useImageCompressor';

beforeAll(() => {
  (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => 'blob:x';
  (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
});

const file = (name: string, size = 2048) => new File([new Uint8Array(size)], name, { type: 'image/png' });
const done = (id: number, name: string): QueueItem => ({
  id, file: file(name, 10240), status: 'done', step: '',
  result: {
    bytes: new Uint8Array(4096), mime: 'image/webp', ext: 'webp',
    report: { pipeline: 'WebP q80', mode: 'visually-lossless', ssim: 0.9953, inputBytes: 10240, outputBytes: 4096, cls: 'photo', warnings: ['Heads up'], skipped: [] },
  },
});

const vm = (over: Partial<UseImageCompressorReturn> = {}): UseImageCompressorReturn => ({
  format: 'webp', setFormat: jest.fn(), items: [], addFiles: jest.fn(), removeItem: jest.fn(), clear: jest.fn(), unavailable: [],
  ...over,
});

describe('helpers', () => {
  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB');
  });
  it('swaps the extension', () => {
    expect(outputName('photo.final.JPG', 'webp')).toBe('photo.final.webp');
    expect(outputName('noext', 'png')).toBe('noext.png');
  });
});

describe('ImageCompressorView', () => {
  it('shows the five formats as a radio group', () => {
    const setFormat = jest.fn();
    render(<ImageCompressorView {...vm({ setFormat, unavailable: ['gif'] })} />);
    const group = screen.getByRole('radiogroup', { name: 'Output format' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: 'WebP' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'GIF' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'PNG' }));
    expect(setFormat).toHaveBeenCalledWith('png');
  });

  it('adds files from the picker and from a drop', () => {
    const addFiles = jest.fn();
    render(<ImageCompressorView {...vm({ addFiles })} />);
    const input = screen.getByLabelText('Choose images');
    fireEvent.change(input, { target: { files: [file('a.png')] } });
    expect(addFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.png' })]);
    fireEvent.drop(screen.getByRole('button', { name: /drop images here/i }), { dataTransfer: { files: [file('b.png')] } });
    expect(addFiles).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'b.png' })]);
  });

  it('renders progress, errors and results', () => {
    const items: QueueItem[] = [
      { id: 1, file: file('a.png'), status: 'working', step: 'WebP q85' },
      { id: 2, file: file('b.png'), status: 'error', step: '', error: 'File is larger than 50 MB.' },
      done(3, 'c.png'),
    ];
    render(<ImageCompressorView {...vm({ items })} />);
    expect(screen.getByText('WebP q85…')).toBeInTheDocument();
    expect(screen.getByText('File is larger than 50 MB.')).toBeInTheDocument();
    expect(screen.getByText('−60%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download c.webp' })).toHaveAttribute('download', 'c.webp');
  });

  it('expands a finished row to show the report', () => {
    render(<ImageCompressorView {...vm({ items: [done(3, 'c.png')] })} />);
    fireEvent.click(screen.getByRole('button', { name: /details for c.png/i }));
    expect(screen.getByText('WebP q80')).toBeInTheDocument();
    expect(screen.getByText('Visually lossless')).toBeInTheDocument();
    expect(screen.getByText('0.9953')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
  });

  it('enables Download all only when something is done', () => {
    const { rerender } = render(<ImageCompressorView {...vm({ items: [{ id: 1, file: file('a.png'), status: 'queued', step: '' }] })} />);
    expect(screen.getByRole('button', { name: /download all/i })).toBeDisabled();
    rerender(<ImageCompressorView {...vm({ items: [done(3, 'c.png')] })} />);
    expect(screen.getByRole('button', { name: /download all/i })).toBeEnabled();
    expect(screen.getByText(/Saved 6\.0 KB/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm jest __tests__/tools.image-compressor.ui.test.tsx`
Expected: FAIL — `formatBytes` / `outputName` not exported.

- [ ] **Step 3: Create `lib/format.ts`**

```ts
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { OutputFormat } from './types';

export const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
};

export const outputName = (name: string, ext: OutputFormat): string => {
  const dot = name.lastIndexOf('.');
  return `${dot > 0 ? name.slice(0, dot) : name}.${ext}`;
};
```

- [ ] **Step 3b: Create `components/FileRow.tsx`**

```tsx
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React, { useEffect, useState } from 'react';
import type { QueueItem } from '../hooks/useImageCompressor';
import { formatBytes, outputName } from '../lib/format';
import type { Mode } from '../lib/types';

const MODE_LABEL: Record<Mode, string> = {
  lossless: 'Lossless',
  'visually-lossless': 'Visually lossless',
  'below-target': 'Below quality target',
  'already-optimal': 'Already optimal',
};

const useObjectUrl = (blob: Blob | null) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) return undefined;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
};

function CompareSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:16px_16px]">
      <img src={after} alt="Compressed" className="block w-full" />
      <img
        src={before}
        alt="Original"
        className="absolute inset-0 block w-full h-full object-contain"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} aria-hidden />
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare original and compressed"
        className="absolute inset-x-0 bottom-2 mx-auto w-2/3 accent-primary-500"
      />
    </div>
  );
}

export default function FileRow({ item, onRemove }: { item: QueueItem; onRemove: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const { file, status, result } = item;
  const resultBlob = React.useMemo(
    () => (result ? new Blob([result.bytes], { type: result.mime }) : null),
    [result],
  );
  const downloadUrl = useObjectUrl(resultBlob);
  const beforeUrl = useObjectUrl(open ? file : null);
  const name = result ? outputName(file.name, result.ext) : file.name;
  const saved = result ? Math.round((1 - result.report.outputBytes / file.size) * 100) : 0;

  return (
    <li className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3 text-sm">
        <span className="flex-1 truncate font-medium" title={file.name}>{file.name}</span>
        <span className="w-20 text-right text-gray-500 tabular-nums">{formatBytes(file.size)}</span>
        <div className="w-40 sm:w-56" aria-live="polite">
          {status === 'queued' && <span className="text-gray-400">Queued</span>}
          {status === 'working' && (
            <div>
              <div className="h-1.5 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full w-1/2 animate-pulse bg-primary-500" />
              </div>
              <span className="text-xs text-gray-500">{item.step}…</span>
            </div>
          )}
          {status === 'error' && <span className="text-red-600 dark:text-red-400">{item.error}</span>}
          {status === 'done' && result && (
            <span className="tabular-nums">
              {formatBytes(result.report.outputBytes)}{' '}
              <span className={saved > 0 ? 'font-semibold text-green-600 dark:text-green-400' : 'text-gray-500'}>
                {saved > 0 ? `−${saved}%` : `${-saved > 0 ? '+' : ''}${-saved}%`}
              </span>
            </span>
          )}
        </div>
        {status === 'done' && downloadUrl && (
          <a
            href={downloadUrl}
            download={name}
            aria-label={`Download ${name}`}
            className="rounded-md bg-primary-500 px-3 py-1 text-white hover:bg-primary-600"
          >
            ⬇
          </a>
        )}
        {status === 'done' && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`Details for ${file.name}`}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {open ? '▾' : '▸'}
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${file.name}`}
          className="rounded-md px-2 py-1 text-gray-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
      {open && result && (
        <div className="grid gap-4 px-4 pb-4 md:grid-cols-2">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-gray-500">Pipeline</dt>
            <dd>{result.report.pipeline}</dd>
            <dt className="text-gray-500">Mode</dt>
            <dd>{MODE_LABEL[result.report.mode]}</dd>
            {result.report.ssim !== null && (
              <>
                <dt className="text-gray-500">SSIM</dt>
                <dd className="tabular-nums">{result.report.ssim.toFixed(4)}</dd>
              </>
            )}
            <dt className="text-gray-500">Size</dt>
            <dd className="tabular-nums">
              {formatBytes(result.report.inputBytes)} → {formatBytes(result.report.outputBytes)}
            </dd>
            <dt className="text-gray-500">Image type</dt>
            <dd>{result.report.cls}</dd>
            {result.report.warnings.map((w) => (
              <dd key={w} className="col-span-2 text-amber-700 dark:text-amber-400">{w}</dd>
            ))}
            {result.report.skipped.length > 0 && (
              <dd className="col-span-2 text-xs text-gray-500">Skipped: {result.report.skipped.join('; ')}</dd>
            )}
          </dl>
          {beforeUrl && downloadUrl && <CompareSlider before={beforeUrl} after={downloadUrl} />}
        </div>
      )}
    </li>
  );
}
```

- [ ] **Step 4: Rewrite `components/ImageCompressorPanel.tsx`**

```tsx
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React, { useEffect, useRef, useState } from 'react';
import type { UseImageCompressorReturn } from '../hooks/useImageCompressor';
import { formatBytes, outputName } from '../lib/format';
import { OUTPUT_FORMATS, type OutputFormat } from '../lib/types';
import FileRow from './FileRow';

export { formatBytes, outputName };

const LABEL: Record<OutputFormat, string> = { png: 'PNG', jpg: 'JPG', webp: 'WebP', gif: 'GIF', bmp: 'BMP' };

const saveBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export default function ImageCompressorView({
  format, setFormat, items, addFiles, removeItem, clear, unavailable,
}: UseImageCompressorReturn) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) addFiles(files);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles]);

  const done = items.filter((it) => it.status === 'done' && it.result);
  const inputTotal = done.reduce((n, it) => n + it.file.size, 0);
  const outputTotal = done.reduce((n, it) => n + (it.result?.report.outputBytes ?? 0), 0);

  const downloadAll = async () => {
    const { zipSync } = await import('fflate');
    const used = new Map<string, number>();
    const entries: Record<string, Uint8Array> = {};
    done.forEach((it) => {
      const base = outputName(it.file.name, it.result!.ext);
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      const name = n === 1 ? base : base.replace(/(\.[^.]+)$/, `-${n}$1`);
      entries[name] = it.result!.bytes;
    });
    // Images are already compressed; store without deflate.
    saveBlob(new Blob([zipSync(entries, { level: 0 })], { type: 'application/zip' }), 'compressed-images.zip');
  };

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Output format" className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
        {OUTPUT_FORMATS.map((f) => {
          const off = unavailable.includes(f);
          return (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={format === f}
              disabled={off}
              title={off ? 'This encoder failed to load. Check your connection and reload.' : undefined}
              onClick={() => setFormat(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                format === f ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {LABEL[f]}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const files = Array.from(e.dataTransfer?.files ?? []);
          if (files.length) addFiles(files);
        }}
        className={`w-full rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-primary-400'
        }`}
      >
        <span className="block text-lg font-semibold text-gray-800 dark:text-gray-100">
          Drop images here, or click to browse
        </span>
        <span className="mt-1 block text-sm text-gray-500">
          PNG · JPG · WebP · GIF · BMP · up to 20 files, 50 MB each · paste works too
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        aria-label="Choose images"
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) addFiles(files);
          e.target.value = '';
        }}
      />

      {items.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ul>
            {items.map((it) => <FileRow key={it.id} item={it} onRemove={removeItem} />)}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700 px-4 py-3 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {done.length > 0
                ? `Saved ${formatBytes(Math.max(0, inputTotal - outputTotal))} total (−${Math.max(0, Math.round((1 - outputTotal / inputTotal) * 100))}%)`
                : 'Compressing…'}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={clear} className="rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                Clear
              </button>
              <button
                type="button"
                onClick={() => { void downloadAll(); }}
                disabled={done.length === 0}
                className="rounded-md bg-primary-500 px-3 py-1.5 font-medium text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Download all (.zip)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Update `page.tsx`**

```tsx
/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';
import ImageCompressorView from './components/ImageCompressorPanel';
import { useImageCompressor } from './hooks/useImageCompressor';

const ImageCompressorPage: React.FC = () => {
  const vm = useImageCompressor();
  const tool = getToolByRoute('/image-compressor');
  return (
    <ToolLayout
      tool={tool!}
      title="Image Compressor"
      description="Pick an output format and drop your images — we try several encoders and keep the smallest file that still looks the same. Everything runs in your browser."
      showRelatedTools
    >
      <ImageCompressorView {...vm} />
      <p className="mt-6 text-xs text-gray-500">
        Encoders: oxipng, MozJPEG, libwebp (Apache-2.0/BSD), libimagequant (GPL-3.0), gifsicle (GPL-2.0),
        UPNG.js, gifenc, gifuct-js, fflate (MIT). Images never leave your device.
      </p>
    </ToolLayout>
  );
};

export default ImageCompressorPage;
```

- [ ] **Step 6: Update the registry entry** in `src/tools/index.ts` (the `id: "image-compressor"` block)

```ts
    id: "image-compressor",
    route: "/image-compressor",
    title: "Image Compressor",
    description: "Compress images to PNG, JPG, WebP, GIF or BMP — the smallest file that still looks the same.",
    icon: ImageCompressIcon,
    component: lazy(() => import("./image-compressor/page")),
    category: "Utilities",
    metadata: {
      keywords: ["image", "compress", "optimize", "png", "jpg", "webp", "gif", "bmp", "tinypng", "oxipng", "mozjpeg"],
      relatedTools: ["generate-large-image"],
    },
    uiOptions: { showExamples: false },
```

- [ ] **Step 7: Delete the old implementation and test**

```bash
git rm src/tools/image-compressor/lib/imageCompressor.ts __tests__/tools.image-compressor.test.tsx
grep -rn "imageCompressor'" src __tests__
```

Expected: grep prints nothing.

- [ ] **Step 8: Run tests + typecheck + lint**

Run: `pnpm jest __tests__/tools.image-compressor`
Expected: all image-compressor suites PASS.

Run: `pnpm typecheck 2>&1 | grep image-compressor`
Expected: no output.

Run: `npx eslint src/tools/image-compressor __tests__/tools.image-compressor.ui.test.tsx src/tools/index.ts`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add src/tools/image-compressor src/tools/index.ts __tests__/tools.image-compressor.ui.test.tsx
git commit -m "feat(image-compressor): TinyPNG-style batch UI with auto format optimization"
```

---

### Task 12: Real-browser verification

**Files:** none new (fix-ups only if something breaks).

- [ ] **Step 1: Production build**

Run: `pnpm build`
Expected: succeeds; `dist/assets` contains separate chunks for the worker and each codec (`*oxipng*`, `*mozjpeg*` / `*jpeg*`, `*webp*`, `*libimagequant*` wasm files). Main entry chunk size is not noticeably larger than before (`git stash` + build for comparison if unsure).

- [ ] **Step 2: Smoke-test in the browser**

Run `pnpm dev`, open `http://localhost:5173/image-compressor` (use the `run` or `browser-automation` skill). Prepare 5 samples: a camera photo (JPG, ideally with EXIF orientation 6), a UI screenshot (PNG), an icon with alpha (PNG), an animated GIF, a flat illustration (PNG, < 256 colours). For **each of the 5 output formats**, drop all 5 samples and record:

| Sample | Format | Output size | Pipeline | Mode | SSIM | Notes |
|---|---|---|---|---|---|---|

Check:
- Every row finishes (no watchdog timeouts) and the UI stays responsive while compressing.
- The photo keeps the right orientation in every output format.
- The animated GIF stays animated as GIF, WebP and PNG (APNG); JPG/BMP show the first-frame warning.
- The alpha icon keeps transparency in PNG/WebP/GIF/BMP; JPG shows the white-fill warning.
- Expanding a row shows the before/after slider; Download all produces a zip whose files open.
- DevTools Network: codec WASM loads only when its format is first used.

- [ ] **Step 3: Full preflight**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: all green except the pre-existing `useQrscan.ts:254` `_soundEnabled` lint error — if it's still there, leave it (not in scope) and say so in the PR.

- [ ] **Step 4: Commit any fix-ups**

```bash
git add -A src/tools/image-compressor
git commit -m "fix(image-compressor): address browser smoke-test findings"
```

(Skip if nothing changed.) Paste the Step 2 table into the PR/commit summary for the user.
