/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { compress, PipelineError } from '../src/tools/image-compressor/lib/pipeline';
import { TooBigError } from '../src/tools/image-compressor/lib/decode';
import { CodecLoadError } from '../src/tools/image-compressor/lib/codecs';
import type { DecodedImage } from '../src/tools/image-compressor/lib/types';

const mockLoadJpeg = jest.fn();
jest.mock('../src/tools/image-compressor/lib/codecs', () => ({
  CodecLoadError: jest.requireActual('../src/tools/image-compressor/lib/codecs').CodecLoadError,
  loadJpeg: () => mockLoadJpeg(),
  toImageData: (p: unknown) => p,
  fromImageData: (d: unknown) => d,
}));

beforeEach(() => {
  mockLoadJpeg.mockReset();
  // Real loaders wrap import/init failures in CodecLoadError (lib/codecs.ts).
  mockLoadJpeg.mockRejectedValue(new CodecLoadError('offline'));
});

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

  it('reports an internal error, not a codec error, when an encoder fails at runtime', async () => {
    mockLoadJpeg.mockResolvedValue({
      encode: async () => { throw new Error('memory access out of bounds'); },
      decode: async () => threeColours().frames[0].data,
    });
    const err = await compress(new Uint8Array(1), 'jpg', undefined, async () => threeColours()).catch((e) => e);
    expect(err).toBeInstanceOf(PipelineError);
    expect(err.code).toBe('internal');
    expect(err.message).toMatch(/^Every encoder failed for this image \(mozjpeg q\d+: memory access out of bounds;/);
  });

  it('Original keeps the source format', async () => {
    const res = await compress(new Uint8Array(5000), 'original', undefined, async () => ({ ...threeColours(), source: 'bmp' }));
    expect(res.ext).toBe('bmp');
    expect(res.mime).toBe('image/bmp');
  });

  it('Original turns browser-only formats (HEIC/AVIF) into JPG', async () => {
    mockLoadJpeg.mockResolvedValue({
      encode: async () => new Uint8Array(3).buffer,
      decode: async () => ({ ...threeColours().frames[0].data }),
    });
    const res = await compress(new Uint8Array(5000), 'original', undefined, async () => ({ ...threeColours(), source: 'unknown' }));
    expect(res.ext).toBe('jpg');
    expect(res.mime).toBe('image/jpeg');
  });
});
