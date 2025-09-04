export async function initAudioWorklet(ctx: AudioContext, stream: MediaStream) {
  // Register the worklet module (Vite will bundle TS -> JS)
  await ctx.audioWorklet.addModule(new URL('./yin-processor.worklet.ts', import.meta.url));

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
