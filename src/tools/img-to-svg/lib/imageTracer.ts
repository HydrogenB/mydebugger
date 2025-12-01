/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Image to SVG Path Tracing Library
 * Supports multiple tracing engines for different use cases
 */

// Available tracing engines
export type TracingEngine = 'potrace' | 'edgeTrace' | 'colorQuantize';

export interface TracingOptions {
  /** Tracing engine to use */
  engine: TracingEngine;
  /** Number of colors for color quantization (2-256) */
  colorCount: number;
  /** Color precision threshold (0-255), lower = more colors merged */
  colorQuantCycles: number;
  /** Minimum path length to keep */
  minPathLength: number;
  /** Path smoothing level (0-5) */
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
  /** Threshold for edge detection (0-255) */
  threshold: number;
  /** Turn policy: 'black' | 'white' | 'left' | 'right' | 'minority' | 'majority' */
  turnPolicy: 'black' | 'white' | 'left' | 'right' | 'minority' | 'majority';
  /** Alpha color (background color for alpha blending) */
  background: string;
  /** Enable line filter for better stroke detection */
  lineFilter: boolean;
}

export interface TracingResult {
  svg: string;
  width: number;
  height: number;
  pathCount: number;
  colorPalette: string[];
  engine: TracingEngine;
}

export interface TracingPreset {
  name: string;
  description: string;
  options: Partial<TracingOptions>;
}

export const ENGINE_INFO: Record<TracingEngine, { name: string; description: string }> = {
  potrace: {
    name: 'Potrace',
    description: 'Best for line art, logos, and high-contrast images. Produces clean stroked paths.',
  },
  edgeTrace: {
    name: 'Edge Trace',
    description: 'Edge detection based tracing. Great for outlines and contours.',
  },
  colorQuantize: {
    name: 'Color Quantize',
    description: 'Region-based tracing with color quantization. Best for filled shapes and photos.',
  },
};

export const DEFAULT_OPTIONS: TracingOptions = {
  engine: 'potrace',
  colorCount: 16,
  colorQuantCycles: 3,
  minPathLength: 4,
  pathSmoothing: 1,
  cornerThreshold: 100,
  mode: 'color',
  strokeWidth: 1,
  blur: false,
  invert: false,
  threshold: 128,
  turnPolicy: 'minority',
  background: '#ffffff',
  lineFilter: true,
};

export const PRESETS: TracingPreset[] = [
  {
    name: 'Line Art (Best)',
    description: 'Optimized for line drawings and outlines',
    options: { engine: 'potrace', mode: 'monochrome', threshold: 128, lineFilter: true, strokeWidth: 1 },
  },
  {
    name: 'Logo/Icon',
    description: 'Sharp edges for logos and icons',
    options: { engine: 'potrace', colorCount: 8, threshold: 100, pathSmoothing: 0.5 },
  },
  {
    name: 'Detailed Color',
    description: 'High detail with many colors',
    options: { engine: 'colorQuantize', colorCount: 64, pathSmoothing: 0.5, minPathLength: 2 },
  },
  {
    name: 'Simplified',
    description: 'Clean output with fewer colors',
    options: { engine: 'colorQuantize', colorCount: 8, pathSmoothing: 2, minPathLength: 8 },
  },
  {
    name: 'Posterized',
    description: 'Artistic poster-style effect',
    options: { engine: 'colorQuantize', colorCount: 4, pathSmoothing: 3, minPathLength: 10 },
  },
  {
    name: 'Edge Detection',
    description: 'Extract outlines only',
    options: { engine: 'edgeTrace', mode: 'monochrome', threshold: 50, strokeWidth: 2 },
  },
  {
    name: 'High Contrast',
    description: 'Black and white with threshold',
    options: { engine: 'potrace', mode: 'monochrome', threshold: 150, colorCount: 2 },
  },
  {
    name: 'Grayscale',
    description: 'Grayscale with smooth gradients',
    options: { engine: 'colorQuantize', mode: 'grayscale', colorCount: 8, pathSmoothing: 1 },
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

// ============================================================================
// POTRACE ENGINE - Best for line art
// ============================================================================

interface BitmapPath {
  points: { x: number; y: number }[];
  sign: '+' | '-';
}

function createBitmap(imageData: ImageData, threshold: number): number[][] {
  const { width, height, data } = imageData;
  const bitmap: number[][] = [];
  
  for (let y = 0; y < height; y++) {
    bitmap[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha < 128) {
        bitmap[y][x] = 0; // Transparent = white
      } else {
        const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        bitmap[y][x] = gray < threshold ? 1 : 0;
      }
    }
  }
  
  return bitmap;
}

function traceBitmapPaths(bitmap: number[][], width: number, height: number): BitmapPath[] {
  const paths: BitmapPath[] = [];
  const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
  
  // Direction vectors for 8-connectivity
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (bitmap[y][x] === 1 && !visited[y][x]) {
        // Found a black pixel, trace the contour
        const contour = traceContourPotrace(bitmap, x, y, width, height, visited);
        if (contour.length >= 3) {
          paths.push({ points: contour, sign: '+' });
        }
      }
    }
  }
  
  return paths;
}

function traceContourPotrace(
  bitmap: number[][],
  startX: number,
  startY: number,
  width: number,
  height: number,
  visited: boolean[][]
): { x: number; y: number }[] {
  const contour: { x: number; y: number }[] = [];
  
  // Find all connected pixels and their boundary
  const region: { x: number; y: number }[] = [];
  const queue: [number, number][] = [[startX, startY]];
  
  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (visited[y][x] || bitmap[y][x] !== 1) continue;
    
    visited[y][x] = true;
    region.push({ x, y });
    
    // 4-connectivity for flood fill
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  
  if (region.length === 0) return contour;
  
  // Extract boundary pixels (pixels adjacent to non-black)
  const boundarySet = new Set<string>();
  
  for (const { x, y } of region) {
    const neighbors = [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
    ];
    
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= width || ny < 0 || ny >= height || bitmap[ny][nx] !== 1) {
        boundarySet.add(`${x},${y}`);
        break;
      }
    }
  }
  
  // Convert to ordered boundary points using marching
  const boundary = Array.from(boundarySet).map(s => {
    const [x, y] = s.split(',').map(Number);
    return { x, y };
  });
  
  if (boundary.length < 3) return boundary;
  
  // Sort boundary by angle from centroid for proper ordering
  const cx = boundary.reduce((s, p) => s + p.x, 0) / boundary.length;
  const cy = boundary.reduce((s, p) => s + p.y, 0) / boundary.length;
  
  boundary.sort((a, b) => {
    const angleA = Math.atan2(a.y - cy, a.x - cx);
    const angleB = Math.atan2(b.y - cy, b.x - cx);
    return angleA - angleB;
  });
  
  return boundary;
}

function pathToSvgPotrace(
  path: BitmapPath,
  options: TracingOptions
): string {
  const points = path.points;
  if (points.length < 2) return '';
  
  // Simplify path using Douglas-Peucker
  const simplified = simplifyPath(points, options.pathSmoothing);
  
  if (simplified.length < 2) return '';
  
  let d = `M${simplified[0].x},${simplified[0].y}`;
  
  // Use bezier curves for smoothing
  if (options.pathSmoothing > 0 && simplified.length > 2) {
    for (let i = 1; i < simplified.length; i++) {
      const p0 = simplified[i - 1];
      const p1 = simplified[i];
      const p2 = simplified[(i + 1) % simplified.length];
      
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      d += `Q${p1.x},${p1.y},${midX},${midY}`;
    }
  } else {
    for (let i = 1; i < simplified.length; i++) {
      d += `L${simplified[i].x},${simplified[i].y}`;
    }
  }
  
  d += 'Z';
  return d;
}

function simplifyPath(
  points: { x: number; y: number }[],
  tolerance: number
): { x: number; y: number }[] {
  if (points.length <= 2) return points;
  if (tolerance === 0) return points;
  
  // Douglas-Peucker algorithm
  const sqTolerance = tolerance * tolerance;
  
  function getSqDist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }
  
  function getSqSegDist(p: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    let x = p1.x;
    let y = p1.y;
    let dx = p2.x - x;
    let dy = p2.y - y;
    
    if (dx !== 0 || dy !== 0) {
      const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      
      if (t > 1) {
        x = p2.x;
        y = p2.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    
    dx = p.x - x;
    dy = p.y - y;
    
    return dx * dx + dy * dy;
  }
  
  function simplifyDPStep(
    points: { x: number; y: number }[],
    first: number,
    last: number,
    sqTolerance: number,
    simplified: { x: number; y: number }[]
  ): void {
    let maxSqDist = sqTolerance;
    let index = 0;
    
    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);
      
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }
    
    if (maxSqDist > sqTolerance) {
      if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
      simplified.push(points[index]);
      if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }
  
  const last = points.length - 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  
  return simplified;
}

function generatePotracesSvg(
  bitmap: number[][],
  width: number,
  height: number,
  options: TracingOptions
): { svg: string; pathCount: number; colors: string[] } {
  const paths = traceBitmapPaths(bitmap, width, height);
  
  const strokeColor = options.invert ? '#ffffff' : '#000000';
  const fillColor = options.invert ? '#ffffff' : '#000000';
  
  let svgPaths = '';
  let pathCount = 0;
  
  for (const path of paths) {
    const d = pathToSvgPotrace(path, options);
    if (d) {
      if (options.lineFilter) {
        // Stroke-based output for line art
        svgPaths += `<path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="${options.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
      } else {
        // Fill-based output
        svgPaths += `<path d="${d}" fill="${fillColor}" stroke="none"/>\n`;
      }
      pathCount++;
    }
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${svgPaths}</svg>`;
  
  return { svg, pathCount, colors: [strokeColor] };
}

// ============================================================================
// EDGE TRACE ENGINE - Edge detection based
// ============================================================================

function sobelEdgeDetection(imageData: ImageData, threshold: number): number[][] {
  const { width, height, data } = imageData;
  const edges: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[ki];
          gy += gray * sobelY[ki];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y][x] = magnitude > threshold ? 1 : 0;
    }
  }
  
  return edges;
}

function generateEdgeTraceSvg(
  imageData: ImageData,
  options: TracingOptions
): { svg: string; pathCount: number; colors: string[] } {
  const { width, height } = imageData;
  const edges = sobelEdgeDetection(imageData, options.threshold);
  
  // Trace edge pixels as paths
  const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
  const paths: string[] = [];
  
  const strokeColor = options.invert ? '#ffffff' : '#000000';
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y][x] === 1 && !visited[y][x]) {
        const path = traceEdgePath(edges, x, y, width, height, visited);
        if (path.length >= options.minPathLength) {
          const simplified = simplifyPath(path, options.pathSmoothing);
          if (simplified.length >= 2) {
            let d = `M${simplified[0].x},${simplified[0].y}`;
            for (let i = 1; i < simplified.length; i++) {
              d += `L${simplified[i].x},${simplified[i].y}`;
            }
            paths.push(`<path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="${options.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`);
          }
        }
      }
    }
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${paths.join('\n')}</svg>`;
  
  return { svg, pathCount: paths.length, colors: [strokeColor] };
}

function traceEdgePath(
  edges: number[][],
  startX: number,
  startY: number,
  width: number,
  height: number,
  visited: boolean[][]
): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  const queue: [number, number][] = [[startX, startY]];
  
  // 8-connectivity directions
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];
  
  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (visited[y][x] || edges[y][x] !== 1) continue;
    
    visited[y][x] = true;
    path.push({ x, y });
    
    // Check 8-connected neighbors
    for (let i = 0; i < 8; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx] && edges[ny][nx] === 1) {
        queue.push([nx, ny]);
      }
    }
  }
  
  return path;
}

// ============================================================================
// COLOR QUANTIZE ENGINE - Region-based (original)
// ============================================================================

function generateColorQuantizeSvg(
  imageData: ImageData,
  options: TracingOptions
): { svg: string; pathCount: number; colors: string[] } {
  const { width, height, data } = imageData;
  
  // Collect all pixels for color quantization
  const pixels: number[][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  // Quantize colors
  let palette = medianCut([...pixels], options.colorCount);

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
        colorMap[y][x] = -1;
      } else {
        colorMap[y][x] = findClosestColor(r, g, b, palette);
      }
    }
  }

  // Trace contours
  const { paths, colors } = traceContours(colorMap, width, height, palette, options);

  const svgPaths = paths
    .map((d, i) => `<path d="${d}" fill="${colors[i]}" stroke="none"/>`)
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${svgPaths}</svg>`;

  return { svg, pathCount: paths.length, colors: [...new Set(colors)] };
}

// ============================================================================
// MAIN TRACE FUNCTION
// ============================================================================

export async function traceImage(
  imageSource: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  options: TracingOptions = DEFAULT_OPTIONS
): Promise<TracingResult> {
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

  let result: { svg: string; pathCount: number; colors: string[] };

  // Select engine
  switch (options.engine) {
    case 'potrace': {
      const bitmap = createBitmap(imageData, options.threshold);
      result = generatePotracesSvg(bitmap, width, height, options);
      break;
    }
    case 'edgeTrace': {
      result = generateEdgeTraceSvg(imageData, options);
      break;
    }
    case 'colorQuantize':
    default: {
      result = generateColorQuantizeSvg(imageData, options);
      break;
    }
  }

  return {
    svg: result.svg,
    width,
    height,
    pathCount: result.pathCount,
    colorPalette: result.colors,
    engine: options.engine,
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
