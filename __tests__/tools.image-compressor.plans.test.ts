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
    oxipngLevel: jest.requireActual('../src/tools/image-compressor/lib/encoders').oxipngLevel,
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

  it('JPG: quality ladder 70→95, flattened reference, warnings', () => {
    const plan = planFor('jpg', img(2), analysis({ hasAlpha: true, animated: true, cls: 'ui' }), new Uint8Array());
    expect(plan.families[0].candidates.map((c) => c.label)).toEqual([
      'mozjpeg q70', 'mozjpeg q75', 'mozjpeg q80', 'mozjpeg q85',
      'mozjpeg q88', 'mozjpeg q90', 'mozjpeg q92', 'mozjpeg q95',
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
