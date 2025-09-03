/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useRef, useState } from 'react';
import detectPitch, { frequencyToNote } from '../lib/pitch';
import { tuningPresets } from '../lib/tunings';

const useGuitarTuner = () => {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [tuningId, setTuningId] = useState('guitar-standard');
  const audioCtx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const raf = useRef<number>();

  const update = useCallback(() => {
    if (!analyser.current || !audioCtx.current) return;
    const buffer = new Float32Array(analyser.current.fftSize);
    analyser.current.getFloatTimeDomainData(buffer);
    const freq = detectPitch(buffer, audioCtx.current.sampleRate);
    if (freq) {
      setFrequency(freq);
      setNote(frequencyToNote(freq));
    }
    raf.current = requestAnimationFrame(update);
  }, []);

  const start = useCallback(async () => {
    if (active) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx.current = new AudioContext();
      const source = audioCtx.current.createMediaStreamSource(stream);
      analyser.current = audioCtx.current.createAnalyser();
      analyser.current.fftSize = 2048;
      source.connect(analyser.current);
      setActive(true);
      setError('');
      update();
    } catch (e) {
      setError((e as Error).message);
    }
  }, [active, update]);

  const stop = useCallback(() => {
    if (!active) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    audioCtx.current?.close();
    audioCtx.current = null;
    analyser.current = null;
    setActive(false);
    setFrequency(null);
    setNote('');
  }, [active]);

  const setTuning = useCallback((id: string) => setTuningId(id), []);
  const tuning = tuningPresets.find((t) => t.id === tuningId)!;

  return {
    frequency,
    note,
    active,
    error,
    start,
    stop,
    tuningId,
    setTuning,
    tuning,
  };
};

export default useGuitarTuner;

