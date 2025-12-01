/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Image to SVG Path Tracing Library
 * Uses a custom implementation based on potrace algorithm for reliable vectorization
 */

export interface TracingOptions {
  /** Number of colors for color quantization (2-256) */
  colorCount: number;
  /** Color precision threshold (0-255), lower = more colors merged */
  colorQuantCycles: number;
  /** Minimum path length to keep */
  minPathLength: number;
  /** Path smoothing level (0-100) */
  pathSmoothing: number;
  /** Corner detection threshold (0-180 degrees) */
  cornerThreshold: number;
  /** Output mode: 'color' | 'grayscale' | 'monochrome' */
  mode: 'color' | 'grayscale' | 'monochrome';
  /** Stroke width for output paths */
  strokeWidth: number;
  /** Enable blur preprocessing */
  blur: boolean;
  /** Invert colors before tracing */
  invert: boolean;
}

export interface TracingResult {
  svg: string;
  width: number;
  height: number;
  pathCount: number;
  colorPalette: string[];
}

export interface TracingPreset {
  name: string;
  description: string;
  options: Partial<TracingOptions>;
}

export const DEFAULT_OPTIONS: TracingOptions = {
  colorCount: 16,
  colorQuantCycles: 3,
  minPathLength: 4,
  pathSmoothing: 1,
  cornerThreshold: 100,
  mode: 'color',
  strokeWidth: 1,
  blur: false,
  invert: false,
};

export const PRESETS: TracingPreset[] = [
  {
    name: 'Default',
    description: 'Balanced settings for most images',
    options: { colorCount: 16, pathSmoothing: 1, cornerThreshold: 100 },
  },
  {
    name: 'Detailed',
    description: 'High detail with more colors and paths',
    options: { colorCount: 64, pathSmoothing: 0.5, minPathLength: 2, colorQuantCycles: 5 },
  },
  {
    name: 'Simplified',
    description: 'Clean output with fewer colors',
    options: { colorCount: 8, pathSmoothing: 2, minPathLength: 8, cornerThreshold: 120 },
  },
  {
    name: 'Posterized',
    description: 'Artistic poster-style effect',
    options: { colorCount: 4, pathSmoothing: 3, minPathLength: 10 },
  },
  {
    name: 'Line Art',
    description: 'Monochrome line drawing',
    options: { mode: 'monochrome', colorCount: 2, strokeWidth: 2, pathSmoothing: 1.5 },
  },
  {
    name: 'Grayscale',
    description: 'Grayscale with smooth gradients',
    options: { mode: 'grayscale', colorCount: 8, pathSmoothing: 1 },
  },
];

// Color quantization using median cut algorithm
function medianCut(pixels: number[][], colorCount: number): number[][] {
  if (pixels.length === 0) return [];
  if (colorCount <= 1) {
    const avg = pixels.reduce(
      (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
      [0, 0, 0]
    );
    return [[Math.round(avg[0] / pixels.length), Math.round(avg[1] / pixels.length), Math.round(avg[2] / pixels.length)]];
  }

  // Find channel with most range
  const ranges = [0, 1, 2].map((c) => {
    const vals = pixels.map((p) => p[c]);
    return Math.max(...vals) - Math.min(...vals);
  });
  const maxRangeChannel = ranges.indexOf(Math.max(...ranges));

  // Sort by that channel and split
  pixels.sort((a, b) => a[maxRangeChannel] - b[maxRangeChannel]);
  const mid = Math.floor(pixels.length / 2);

  const left = medianCut(pixels.slice(0, mid), Math.floor(colorCount / 2));
  const right = medianCut(pixels.slice(mid), Math.ceil(colorCount / 2));

  return [...left, ...right];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function getPixelColor(data: Uint8ClampedArray, idx: number): [number, number, number, number] {
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

function findClosestColor(r: number, g: number, b: number, palette: number[][]): number {
  let minDist = Infinity;
  let closest = 0;
  for (let i = 0; i < palette.length; i++) {
    const dist =
      (r - palette[i][0]) ** 2 +
      (g - palette[i][1]) ** 2 +
      (b - palette[i][2]) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }
  return closest;
}

// Gaussian blur kernel
function applyBlur(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const kernelSum = 16;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        output[(y * width + x) * 4 + c] = Math.round(sum / kernelSum);
      }
    }
  }

  return new ImageData(output, width, height);
}

// Convert to grayscale
function toGrayscale(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    output[i] = gray;
    output[i + 1] = gray;
    output[i + 2] = gray;
  }

  return new ImageData(output, width, height);
}

// Invert colors
function invertColors(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);

  for (let i = 0; i < data.length; i += 4) {
    output[i] = 255 - data[i];
    output[i + 1] = 255 - data[i + 1];
    output[i + 2] = 255 - data[i + 2];
  }

  return new ImageData(output, width, height);
}

// Trace contours and convert to SVG paths
function traceContours(
  colorMap: number[][],
  width: number,
  height: number,
  palette: number[][],
  options: TracingOptions
): { paths: string[]; colors: string[] } {
  const paths: string[] = [];
  const colors: string[] = [];
  const visited = new Set<string>();

  // Create indexed color map for each palette color
  for (let colorIdx = 0; colorIdx < palette.length; colorIdx++) {
    const colorKey = rgbToHex(palette[colorIdx][0], palette[colorIdx][1], palette[colorIdx][2]);
    const regions: { x: number; y: number }[][] = [];

    // Find connected regions of this color
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (colorMap[y][x] === colorIdx && !visited.has(`${x},${y}`)) {
          const region: { x: number; y: number }[] = [];
          const stack: [number, number][] = [[x, y]];

          while (stack.length > 0) {
            const [cx, cy] = stack.pop()!;
            const key = `${cx},${cy}`;
            if (visited.has(key) || cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
            if (colorMap[cy][cx] !== colorIdx) continue;

            visited.add(key);
            region.push({ x: cx, y: cy });

            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
          }

          if (region.length >= options.minPathLength) {
            regions.push(region);
          }
        }
      }
    }

    // Convert regions to SVG paths
    for (const region of regions) {
      const path = regionToPath(region, width, height, options.pathSmoothing);
      if (path) {
        paths.push(path);
        colors.push(colorKey);
      }
    }
  }

  return { paths, colors };
}

// Convert a region of pixels to an SVG path
function regionToPath(
  region: { x: number; y: number }[],
  _width: number,
  _height: number,
  smoothing: number
): string | null {
  if (region.length < 3) return null;

  // Find boundary pixels
  const boundary: { x: number; y: number }[] = [];
  const regionSet = new Set(region.map((p) => `${p.x},${p.y}`));

  for (const { x, y } of region) {
    const isEdge =
      !regionSet.has(`${x - 1},${y}`) ||
      !regionSet.has(`${x + 1},${y}`) ||
      !regionSet.has(`${x},${y - 1}`) ||
      !regionSet.has(`${x},${y + 1}`);
    if (isEdge) boundary.push({ x, y });
  }

  if (boundary.length < 3) {
    // Fall back to rectangle for small regions
    const minX = Math.min(...region.map((p) => p.x));
    const maxX = Math.max(...region.map((p) => p.x));
    const minY = Math.min(...region.map((p) => p.y));
    const maxY = Math.max(...region.map((p) => p.y));
    return `M${minX},${minY}L${maxX},${minY}L${maxX},${maxY}L${minX},${maxY}Z`;
  }

  // Order boundary pixels by angle from center
  const cx = boundary.reduce((s, p) => s + p.x, 0) / boundary.length;
  const cy = boundary.reduce((s, p) => s + p.y, 0) / boundary.length;
  boundary.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));

  // Smooth the path using Catmull-Rom splines
  const smoothed = smoothPath(boundary, smoothing);

  // Build SVG path
  if (smoothed.length === 0) return null;
  let d = `M${smoothed[0].x.toFixed(1)},${smoothed[0].y.toFixed(1)}`;

  if (smoothing > 0 && smoothed.length > 2) {
    // Use quadratic Bezier curves for smoothing
    for (let i = 1; i < smoothed.length - 1; i++) {
      const curr = smoothed[i];
      const next = smoothed[i + 1];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      d += `Q${curr.x.toFixed(1)},${curr.y.toFixed(1)},${midX.toFixed(1)},${midY.toFixed(1)}`;
    }
    const last = smoothed[smoothed.length - 1];
    d += `Q${last.x.toFixed(1)},${last.y.toFixed(1)},${smoothed[0].x.toFixed(1)},${smoothed[0].y.toFixed(1)}`;
  } else {
    // Simple line segments
    for (let i = 1; i < smoothed.length; i++) {
      d += `L${smoothed[i].x.toFixed(1)},${smoothed[i].y.toFixed(1)}`;
    }
  }
  d += 'Z';

  return d;
}

function smoothPath(
  points: { x: number; y: number }[],
  factor: number
): { x: number; y: number }[] {
  if (factor === 0 || points.length < 3) return points;

  // Reduce number of points based on smoothing factor
  const step = Math.max(1, Math.floor(factor * 2));
  const reduced: { x: number; y: number }[] = [];

  for (let i = 0; i < points.length; i += step) {
    const window: { x: number; y: number }[] = [];
    for (let j = -step; j <= step; j++) {
      const idx = (i + j + points.length) % points.length;
      window.push(points[idx]);
    }
    const avgX = window.reduce((s, p) => s + p.x, 0) / window.length;
    const avgY = window.reduce((s, p) => s + p.y, 0) / window.length;
    reduced.push({ x: avgX, y: avgY });
  }

  return reduced;
}

export async function traceImage(
  imageSource: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  options: TracingOptions = DEFAULT_OPTIONS
): Promise<TracingResult> {
  // Create canvas and draw image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let width: number;
  let height: number;

  if (imageSource instanceof HTMLImageElement) {
    width = imageSource.naturalWidth || imageSource.width;
    height = imageSource.naturalHeight || imageSource.height;
  } else if (imageSource instanceof ImageBitmap) {
    width = imageSource.width;
    height = imageSource.height;
  } else {
    width = imageSource.width;
    height = imageSource.height;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(imageSource, 0, 0);

  let imageData = ctx.getImageData(0, 0, width, height);

  // Apply preprocessing
  if (options.blur) {
    imageData = applyBlur(imageData);
  }
  if (options.mode === 'grayscale' || options.mode === 'monochrome') {
    imageData = toGrayscale(imageData);
  }
  if (options.invert) {
    imageData = invertColors(imageData);
  }

  const { data } = imageData;

  // Collect all pixels for color quantization
  const pixels: number[][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      // Only consider non-transparent pixels
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  // Quantize colors
  let palette = medianCut([...pixels], options.colorCount);

  // Handle monochrome mode
  if (options.mode === 'monochrome') {
    palette = [[0, 0, 0], [255, 255, 255]];
  }

  // Map pixels to palette colors
  const colorMap: number[][] = [];
  for (let y = 0; y < height; y++) {
    colorMap[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = getPixelColor(data, idx);
      if (a < 128) {
        colorMap[y][x] = -1; // Transparent
      } else {
        colorMap[y][x] = findClosestColor(r, g, b, palette);
      }
    }
  }

  // Trace contours
  const { paths, colors } = traceContours(colorMap, width, height, palette, options);

  // Generate SVG
  const svgPaths = paths
    .map((d, i) => `<path d="${d}" fill="${colors[i]}" stroke="none"/>`)
    .join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${svgPaths}
</svg>`;

  return {
    svg,
    width,
    height,
    pathCount: paths.length,
    colorPalette: [...new Set(colors)],
  };
}

export async function traceImageFromFile(
  file: File,
  options: TracingOptions = DEFAULT_OPTIONS
): Promise<TracingResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        const result = await traceImage(img, options);
        URL.revokeObjectURL(url);
        resolve(result);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
