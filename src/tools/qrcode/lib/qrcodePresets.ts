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
  // Minimal + brand-safe
  { name: 'Classic Black', darkColor: '#000000', lightColor: '#ffffff', dotStyle: 'square', eyeStyle: 'square' },
  { name: 'Minimal Grey', darkColor: '#4b5563', lightColor: '#f3f4f6', dotStyle: 'square', eyeStyle: 'square' },
  { name: 'Night Mode', darkColor: '#ffffff', lightColor: '#0f172a', dotStyle: 'rounded', eyeStyle: 'square' },

  // Brand tones
  { name: 'Brand Blue', darkColor: '#0d6efd', lightColor: '#ffffff', dotStyle: 'rounded', eyeStyle: 'square' },
  { name: 'SaaS Purple', darkColor: '#7c3aed', lightColor: '#f5f3ff', dotStyle: 'rounded', eyeStyle: 'dot' },
  { name: 'Eco Green', darkColor: '#10b981', lightColor: '#ecfdf5', dotStyle: 'square', eyeStyle: 'dot' },

  // Modern gradients
  { name: 'Tech Gradient', darkColor: '#4f46e5', lightColor: '#f9fafb', dotStyle: 'rounded', eyeStyle: 'dot', gradient: { start: '#4f46e5', end: '#06b6d4', angle: 45 } },
  { name: 'Sunset Glow', darkColor: '#ef4444', lightColor: '#fff7ed', dotStyle: 'dots', eyeStyle: 'square', gradient: { start: '#ef4444', end: '#f97316', angle: 60 } },
  { name: 'Aurora', darkColor: '#8b5cf6', lightColor: '#faf5ff', dotStyle: 'classy-rounded', eyeStyle: 'dot', gradient: { start: '#8b5cf6', end: '#22d3ee', angle: 60 } },
  { name: 'Ocean Breeze', darkColor: '#60a5fa', lightColor: '#f0f9ff', dotStyle: 'rounded', eyeStyle: 'square', gradient: { start: '#60a5fa', end: '#38bdf8', angle: 90 } },
  { name: 'Neon Pop', darkColor: '#f472b6', lightColor: '#0f172a', dotStyle: 'dots', eyeStyle: 'dot', gradient: { start: '#f43f5e', end: '#a855f7', angle: 30 } },

  // Luxury / elegant
  { name: 'Luxury Gold', darkColor: '#d4af37', lightColor: '#ffffff', dotStyle: 'square', eyeStyle: 'square' },
  { name: 'Ivory Champagne', darkColor: '#fde68a', lightColor: '#fff7ed', dotStyle: 'classy', eyeStyle: 'classy' },
];

export const getPresetByName = (name: string): QRPreset | undefined =>
  QR_PRESETS.find((p) => p.name === name);
