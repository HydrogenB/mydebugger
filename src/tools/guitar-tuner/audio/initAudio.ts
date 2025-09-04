/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import yinWorkletUrl from './yin-processor.worklet.ts?url';

export async function initAudioWorklet(ctx: AudioContext, stream: MediaStream) {
  // Register the worklet module (bundler provides resolved URL)
  try {
    await ctx.audioWorklet.addModule(yinWorkletUrl);
  } catch {
    throw new Error('Unable to load audio worklet module');
  }

  const src = ctx.createMediaStreamSource(stream);
  const yin = new AudioWorkletNode(ctx, 'yin-processor', {
    numberOfInputs: 1,
    numberOfOutputs: 0,
    // Keep options small to reduce cloning overhead
    processorOptions: {
      targetSR: 16000,
      yinThreshold: 0.15,
      highpassHz: 70,
      notchHz: 50, // Will auto-extend to 60 based on SR ratio
    },
  });

  src.connect(yin);
  // @ts-expect-error start exists at runtime in Chrome for WorkletPorts
  yin.port.start?.();
  return yin; // listen with yin.port.onmessage
}
