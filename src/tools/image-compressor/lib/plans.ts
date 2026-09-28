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
