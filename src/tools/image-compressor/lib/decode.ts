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
    throw new TooBigError('Animation is too large to process in the browser (limit 100 MP across all frames).');
  }
};

/** PNG IHDR size and APNG frame count (acTL before the first IDAT), read without inflating. */
export const pngHeader = (b: Uint8Array) => {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const header = { width: v.getUint32(16), height: v.getUint32(20), frames: 1 };
  for (let o = 8; o + 12 <= b.length; o += 12 + v.getUint32(o)) {
    const type = text(b, o + 4, 4);
    if (type === 'IDAT') break;
    if (type === 'acTL') header.frames = Math.max(1, v.getUint32(o + 8));
  }
  return header;
};

/** Static WebP canvas size from the first chunk (VP8 / VP8L / VP8X), or null if unrecognised.
 * Truncated headers throw RangeError, which decode() callers report as unreadable. */
export const webpSize = (b: Uint8Array): { width: number; height: number } | null => {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const d = 20; // chunk data start: RIFF(12) + fourcc(4) + size(4)
  const u24 = (o: number) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
  switch (text(b, 12, 4)) {
    case 'VP8 ':
      return { width: v.getUint16(d + 6, true) & 0x3fff, height: v.getUint16(d + 8, true) & 0x3fff };
    case 'VP8L': {
      const bits = v.getUint32(d + 1, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    case 'VP8X':
      return { width: u24(d + 4) + 1, height: u24(d + 7) + 1 };
    default:
      return null;
  }
};

export const decodeGif = async (bytes: Uint8Array): Promise<Frame[]> => {
  const { parseGIF, decompressFrames } = await loadGifuct();
  const gif = parseGIF(toBuffer(bytes));
  // Check limits against header metadata before LZW-decompressing any frame — decompressing
  // is exactly the expensive allocation this guard exists to prevent.
  assertWithinLimits(gif.lsd.width, gif.lsd.height, gif.frames.length);
  const patches = decompressFrames(gif, true) as unknown as GifPatch[];
  return compositeGifFrames(patches, gif.lsd.width, gif.lsd.height);
};

/** PNG and APNG, decoded exactly (no canvas premultiplication). */
export const decodeApngOrPng = async (bytes: Uint8Array): Promise<Frame[]> => {
  // Guard on the header before UPNG inflates everything (decompression bombs).
  const h = pngHeader(bytes);
  assertWithinLimits(h.width, h.height, h.frames);
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
    const size = webpSize(bytes);
    if (size) assertWithinLimits(size.width, size.height, 1);
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
