/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import {
  generateThaiFlagSVG,
  getThaiFlagStripes,
  THAI_FLAG_COLORS,
} from "../model/thaiFlag";

describe("thaiFlag model", () => {
  test("stripes calculation and svg generation", () => {
    const height = 300;
    const { width, stripes } = getThaiFlagStripes(height);
    expect(width).toBe(450);
    expect(stripes).toHaveLength(5);
    stripes.forEach((s, i) => {
      expect(s.color).toBe(THAI_FLAG_COLORS[i]);
    });
    const svg = generateThaiFlagSVG(height);
    expect(svg).toContain('width="450"');
    expect(svg).toContain('height="300"');
    THAI_FLAG_COLORS.forEach((c) => {
      expect(svg).toContain(c);
    });
  });
});
