import {
  detectPitch,
  noteToFrequency,
  centsOff,
  frequencyToNote,
} from '../src/tools/guitar-tuner/lib/pitch';
import { tuningPresets } from '../src/tools/guitar-tuner/lib/tunings';

describe('guitar tuner pitch detection', () => {
  test('detects 440Hz tone', () => {
    const sampleRate = 44100;
    const frequency = 440;
    const buffer = new Float32Array(sampleRate);
    for (let i = 0; i < sampleRate; i++) {
      buffer[i] = Math.sin((2 * Math.PI * i * frequency) / sampleRate);
    }
    const detected = detectPitch(buffer, sampleRate);
    expect(detected).toBeGreaterThan(430);
    expect(detected).toBeLessThan(450);
  });

  test('bass 5-string drop D tuning notes', () => {
    const preset = tuningPresets.find((p) => p.id === 'bass-5-drop-d');
    expect(preset?.notes).toEqual(['B0', 'D1', 'A1', 'D2', 'G2']);
  });

  test('converts B0 to frequency', () => {
    const freq = noteToFrequency('B0');
    expect(freq).toBeCloseTo(30.87, 2);
  });

  test('calculates cents difference', () => {
    const diff = centsOff(450, 440);
    expect(diff).toBeCloseTo(39.0, 0);
  });

  test('returns null for silence', () => {
    const buffer = new Float32Array(2048);
    const result = detectPitch(buffer, 44100);
    expect(result).toBeNull();
  });

  test('throws on invalid note', () => {
    expect(() => noteToFrequency('H2')).toThrow('Invalid note');
  });

  test('maps frequency to nearest note', () => {
    expect(frequencyToNote(440)).toBe('A4');
  });
});

