/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { tuningPresets } from '../lib/tunings';
import { initAudioWorklet } from '../audio/initAudio';

const useGuitarTuner = () => {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [tuningId, setTuningId] = useState('guitar-standard');
  const [detune, setDetune] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [a4, setA4] = useState<number>(440);
  const [customNotes, setCustomNotes] = useState<string[]>(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
  const audioCtx = useRef<AudioContext | null>(null);
  const yinNode = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onWorkletMessage = useCallback((ev: MessageEvent) => {
    const data = ev.data as { freqHz: number; note: string; cents: number; confidence: number } | undefined;
    if (!data) return;
    const { freqHz, note: noteName, cents, confidence } = data;
    // Confidence gating to avoid UI jitter in noise
    setConfidence(confidence);
    if (confidence < 0.35) return;
    setFrequency(freqHz);
    setNote(noteName);
    const clamped = Math.max(-50, Math.min(50, cents));
    setDetune(clamped);
  }, []);

  const start = useCallback(async () => {
    if (active) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not supported in this browser');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      audioCtx.current = new AudioContext();
      const node = await initAudioWorklet(audioCtx.current, stream);
      yinNode.current = node;
      node.port.onmessage = onWorkletMessage;
      // Send current calibration to worklet
      node.port.postMessage({ type: 'calibration', a4 });
      setActive(true);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [active, onWorkletMessage, a4]);

  const stop = useCallback(() => {
    if (!active) return;
    try {
      yinNode.current?.port.postMessage({ type: 'stop' });
      yinNode.current?.disconnect();
      yinNode.current = null;
      // Stop microphone tracks
      streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      streamRef.current = null;
      audioCtx.current?.close();
    } catch (_) {
      // ignore
    }
    audioCtx.current = null;
    setActive(false);
    setFrequency(null);
    setNote('');
  }, [active]);

  useEffect(() => {
    const saved = localStorage.getItem('guitar-tuner-tuning');
    if (saved) setTuningId(saved);
    const savedA4 = localStorage.getItem('guitar-tuner-a4');
    if (savedA4) setA4(Number(savedA4));
    const savedCustom = localStorage.getItem('guitar-tuner-custom');
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'string')) {
          setCustomNotes(parsed as string[]);
        }
      } catch (_) {
        // ignore parse errors
      }
    }
  }, []);

  const setTuning = useCallback((id: string) => {
    setTuningId(id);
    localStorage.setItem('guitar-tuner-tuning', id);
  }, []);

  // Persist and send calibration changes to the worklet
  useEffect(() => {
    localStorage.setItem('guitar-tuner-a4', String(a4));
    if (yinNode.current) {
      yinNode.current.port.postMessage({ type: 'calibration', a4 });
    }
  }, [a4]);
  // Persist custom notes
  useEffect(() => {
    try {
      localStorage.setItem('guitar-tuner-custom', JSON.stringify(customNotes));
    } catch (_) {
      // ignore
    }
  }, [customNotes]);

  const preset = tuningPresets.find((t) => t.id === tuningId);
  const tuning = preset ?? { id: 'custom', label: 'Custom (6-string)', notes: customNotes };

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
    detune,
    confidence,
    a4,
    setA4,
    customNotes,
    setCustomNotes,
  };
};

export default useGuitarTuner;

