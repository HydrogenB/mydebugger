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
  const { optimise } = await loadOxipng();
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
  const { optimise } = await loadOxipng();
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

export const GIFSICLE_TIMEOUT_MS = 30_000;

export const gifsicle = async (
  getBase: () => Promise<Uint8Array>,
  args: string,
  lossless: boolean,
  frames: Frame[],
): Promise<EncodeOutput> => {
  const { default: gs } = await loadGifsicle();
  const base = await getBase();
  // gifsicle-wasm-browser's run() can hang forever, resolves null on a worker error, and rejects
  // with strings — so bound it and normalise every failure to an Error.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('gifsicle timed out')), GIFSICLE_TIMEOUT_MS);
  });
  let files: unknown;
  try {
    files = await Promise.race([
      gs.run({
        input: [{ file: base.slice().buffer, name: 'in.gif' }],
        command: [`${args} in.gif -o /out/out.gif`],
      }),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
  if (!Array.isArray(files)) throw new Error('gifsicle failed');
  const [file] = files as File[];
  if (!file) throw new Error('gifsicle produced no output');
  const bytes = new Uint8Array(await file.arrayBuffer());
  return { bytes, frames: lossless ? frames : await decodeGif(bytes) };
};

export const bmp = async (f: Frame, mode: BmpMode): Promise<EncodeOutput> => ({
  bytes: encodeBmp(f.data, mode),
  frames: [f],
});
