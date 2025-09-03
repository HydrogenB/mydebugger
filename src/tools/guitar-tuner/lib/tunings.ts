/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface TuningPreset {
  id: string;
  label: string;
  notes: string[];
}

export const tuningPresets: TuningPreset[] = [
  {
    id: 'guitar-standard',
    label: 'Guitar - Standard',
    notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  },
  {
    id: 'bass-4-standard',
    label: 'Bass (4-string) - Standard',
    notes: ['E1', 'A1', 'D2', 'G2'],
  },
  {
    id: 'bass-4-drop-d',
    label: 'Bass (4-string) - Drop D',
    notes: ['D1', 'A1', 'D2', 'G2'],
  },
  {
    id: 'bass-5-standard',
    label: 'Bass (5-string) - Standard',
    notes: ['B0', 'E1', 'A1', 'D2', 'G2'],
  },
  {
    id: 'bass-5-drop-d',
    label: 'Bass (5-string) - Drop D',
    notes: ['B0', 'D1', 'A1', 'D2', 'G2'],
  },
  {
    id: 'bass-6-standard',
    label: 'Bass (6-string) - Standard',
    notes: ['B0', 'E1', 'A1', 'D2', 'G2', 'C3'],
  },
  {
    id: 'bass-6-drop-d',
    label: 'Bass (6-string) - Drop D',
    notes: ['B0', 'D1', 'A1', 'D2', 'G2', 'C3'],
  },
];

export type { TuningPreset };

