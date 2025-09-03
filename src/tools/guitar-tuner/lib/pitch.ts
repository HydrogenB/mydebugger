/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export const detectPitch = (
  buffer: Float32Array,
  sampleRate: number,
): number | null => {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.01) return null;

  let crossings = 0;
  let prev = buffer[0];
  for (let i = 1; i < size; i++) {
    const curr = buffer[i];
    if (prev <= 0 && curr > 0) crossings += 1;
    prev = curr;
  }
  if (crossings <= 1) return null;
  const frequency = (crossings * sampleRate) / size;
  return frequency;
};

export const noteNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const frequencyToNote = (frequency: number): string => {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[midi % 12];
  return `${note}${octave}`;
};

export const noteToFrequency = (note: string): number => {
  const match = note.match(/^([A-G]#?)(-?\d)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const index = noteNames.indexOf(name);
  const midi = (octave + 1) * 12 + index;
  return 440 * 2 ** ((midi - 69) / 12);
};

export const centsOff = (frequency: number, reference: number): number =>
  1200 * Math.log2(frequency / reference);

export default detectPitch;

