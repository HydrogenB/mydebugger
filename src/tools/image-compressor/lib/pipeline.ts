/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { analyze } from './analyze';
import { decode, TooBigError } from './decode';
import { planFor } from './plans';
import { selectBest, thresholdFor } from './select';
import { MIME, type CompressResult, type ErrorCode, type FormatChoice, type Mode } from './types';

export class PipelineError extends Error {
  constructor(public code: ErrorCode, message: string) {
    super(message);
  }
}

const ORIGINAL_KEPT = 'The original file was already the smallest, so it was returned unchanged (metadata not stripped).';

export const compress = async (
  bytes: Uint8Array,
  choice: FormatChoice,
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

  // Browser-only inputs (HEIC, AVIF…) have no encoder of their own, so 'original' makes them JPG.
  const format = choice === 'original' ? (img.source === 'unknown' ? 'jpg' : img.source) : choice;

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
    // 'codec' disables the format in the UI, so reserve it for loader failures.
    if (sel.loadFailed) {
      throw new PipelineError('codec', `Couldn’t load the ${format.toUpperCase()} encoder (${sel.skipped.join('; ')}).`);
    }
    throw new PipelineError('internal', `Every encoder failed for this image (${sel.skipped.join('; ')}).`);
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
