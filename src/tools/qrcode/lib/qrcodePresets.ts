/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { DotType, CornerSquareType } from 'qr-code-styling';

export interface QRPreset {
  name: string;
  darkColor: string;
  lightColor: string;
  dotStyle: DotType;
  eyeStyle: CornerSquareType;
  gradient?: { start: string; end: string; angle: number };
  logo?: string;
}

export const QR_PRESETS: QRPreset[] = [
  {
    name: 'Classic Black',
    darkColor: '#000000',
    lightColor: '#ffffff',
    dotStyle: 'square',
    eyeStyle: 'square',
  },
  {
    name: 'Brand Blue',
    darkColor: '#007bff',
    lightColor: '#ffffff',
    dotStyle: 'rounded',
    eyeStyle: 'square',
  },
  {
    name: 'Tech Gradient',
    darkColor: '#4f46e5',
    lightColor: '#f9fafb',
    dotStyle: 'rounded',
    eyeStyle: 'dot',
    gradient: { start: '#4f46e5', end: '#06b6d4', angle: 45 },
  },
  {
    name: 'Night Mode',
    darkColor: '#ffffff',
    lightColor: '#0f172a',
    dotStyle: 'rounded',
    eyeStyle: 'square',
  },
  {
    name: 'Eco Green',
    darkColor: '#10b981',
    lightColor: '#ecfdf5',
    dotStyle: 'square',
    eyeStyle: 'dot',
  },
  {
    name: 'Minimal Grey',
    darkColor: '#4b5563',
    lightColor: '#f3f4f6',
    dotStyle: 'square',
    eyeStyle: 'square',
  },
  {
    name: 'Neon Yellow',
    darkColor: '#facc15',
    lightColor: '#111827',
    dotStyle: 'dots',
    eyeStyle: 'dot',
  },
  {
    name: 'Sunset Warm',
    darkColor: '#ef4444',
    lightColor: '#fff7ed',
    dotStyle: 'dots',
    eyeStyle: 'square',
    gradient: { start: '#ef4444', end: '#f97316', angle: 60 },
  },
  {
    name: 'Luxury Gold',
    darkColor: '#d4af37',
    lightColor: '#ffffff',
    dotStyle: 'square',
    eyeStyle: 'square',
  },
  {
    name: 'Cyberpunk Pink',
    darkColor: '#ec4899',
    lightColor: '#0f172a',
    dotStyle: 'square',
    eyeStyle: 'square',
  },
];

export const getPresetByName = (name: string): QRPreset | undefined =>
  QR_PRESETS.find((p) => p.name === name);
