/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export const THAI_FLAG_COLORS = [
  "#A51931",
  "#FFFFFF",
  "#2D2A4A",
  "#FFFFFF",
  "#A51931",
];
export const THAI_FLAG_RATIO = 1.5; // width = height * 1.5

export interface Stripe {
  color: string;
  height: number;
  y: number;
}

export function getThaiFlagStripes(height: number): {
  width: number;
  stripes: Stripe[];
} {
  if (height <= 0) {
    throw new Error("Height must be positive");
  }
  const width = Math.round(height * THAI_FLAG_RATIO);
  const unit = height / 6; // total units 1+1+2+1+1 = 6
  const stripes: Stripe[] = [];
  let y = 0;
  THAI_FLAG_COLORS.forEach((color, idx) => {
    const h = idx === 2 ? unit * 2 : unit;
    stripes.push({ color, height: h, y });
    y += h;
  });
  return { width, stripes };
}

export function generateThaiFlagSVG(height: number): string {
  const { width, stripes } = getThaiFlagStripes(height);
  const rects = stripes
    .map(
      (s) =>
        `<rect width="${width}" height="${s.height}" y="${s.y}" fill="${s.color}"/>`,
    ) // stripe rect
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rects}</svg>`;
}
