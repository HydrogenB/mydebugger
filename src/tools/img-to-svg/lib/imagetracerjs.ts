/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * ImageTracerJS - A raster image tracer and vectorizer written in JavaScript
 * Based on the potrace algorithm by Peter Selinger
 * 
 * This is a standalone implementation based on imagetracerjs by András Jankovics
 * https://github.com/nickolaylavrinenko/imagetracerjs
 */

export interface ImageTracerOptions {
  // Tracing
  ltres: number; // Linear tolerance (1-20)
  qtres: number; // Quadratic tolerance (0.3-10)
  pathomit: number; // Edge node paths shorter than this will be discarded (2-20)
  rightangleenhance: boolean; // Enhance right angles
  
  // Color quantization
  colorsampling: number; // 0: disabled, 1: random, 2: deterministic
  numberofcolors: number; // Number of colors to use (2-64)
  mincolorratio: number; // Color ratio threshold (0-1)
  colorquantcycles: number; // Color quantization cycles (1-10)
  
  // Layering
  layering: number; // 0: sequential, 1: parallel
  
  // SVG rendering
  strokewidth: number; // Stroke width for stroked output
  linefilter: boolean; // Use line filter for line art
  scale: number; // Scale factor
  roundcoords: number; // Decimal places to round to (0-5)
  viewbox: boolean; // Use viewBox
  desc: boolean; // Include description
  lcpr: number; // Line control point radius
  qcpr: number; // Quad control point radius
  
  // Blur preprocessing
  blurradius: number; // 0: disabled, 1-5: blur
  blurdelta: number; // Blur delta threshold (0-256)
}

export const defaultOptions: ImageTracerOptions = {
  ltres: 1,
  qtres: 1,
  pathomit: 8,
  rightangleenhance: true,
  colorsampling: 2,
  numberofcolors: 16,
  mincolorratio: 0,
  colorquantcycles: 3,
  layering: 0,
  strokewidth: 1,
  linefilter: false,
  scale: 1,
  roundcoords: 1,
  viewbox: true,
  desc: false,
  lcpr: 0,
  qcpr: 0,
  blurradius: 0,
  blurdelta: 20,
};

// Preset configurations
export const presets: Record<string, Partial<ImageTracerOptions>> = {
  default: {},
  posterized1: { colorsampling: 0, numberofcolors: 2 },
  posterized2: { numberofcolors: 4, blurradius: 5 },
  curvy: { ltres: 0.01, linefilter: true, rightangleenhance: false },
  sharp: { qtres: 0.01, linefilter: false },
  detailed: { 
    pathomit: 0, 
    roundcoords: 2, 
    ltres: 0.5, 
    qtres: 0.5, 
    numberofcolors: 64 
  },
  smoothed: { blurradius: 5, blurdelta: 64 },
  grayscale: { colorsampling: 0, colorquantcycles: 1, numberofcolors: 7 },
  fixedpalette: { colorsampling: 0, colorquantcycles: 1, numberofcolors: 27 },
  randomsampling1: { colorsampling: 1, numberofcolors: 8 },
  randomsampling2: { colorsampling: 1, numberofcolors: 64 },
  artistic1: { colorsampling: 0, colorquantcycles: 1, pathomit: 0, blurradius: 5, blurdelta: 64, ltres: 0.01, linefilter: true, numberofcolors: 16, strokewidth: 2 },
  artistic2: { qtres: 0.01, colorsampling: 0, colorquantcycles: 1, numberofcolors: 4, strokewidth: 0 },
};

// Color utilities
function torgbastr(c: { r: number; g: number; b: number; a: number }): string {
  return `rgba(${c.r},${c.g},${c.b},${c.a / 255})`;
}

function tosvgcolorstr(c: { r: number; g: number; b: number; a: number }): string {
  return `rgb(${c.r},${c.g},${c.b})`;
}

// Gaussian blur
function blur(imgd: ImageData, radius: number, delta: number): ImageData {
  const imgd2: ImageData = { 
    width: imgd.width, 
    height: imgd.height, 
    data: new Uint8ClampedArray(imgd.data) 
  } as ImageData;
  
  const radius2 = Math.floor(radius);
  if (radius2 < 1) return imgd2;
  
  const w = imgd.width;
  const h = imgd.height;
  
  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = [0, 0, 0, 0];
      let cnt = 0;
      
      for (let dx = -radius2; dx <= radius2; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < w) {
          const idx = (y * w + nx) * 4;
          acc[0] += imgd.data[idx];
          acc[1] += imgd.data[idx + 1];
          acc[2] += imgd.data[idx + 2];
          acc[3] += imgd.data[idx + 3];
          cnt++;
        }
      }
      
      const idx = (y * w + x) * 4;
      if (Math.abs(imgd.data[idx] - acc[0] / cnt) < delta) {
        imgd2.data[idx] = Math.round(acc[0] / cnt);
        imgd2.data[idx + 1] = Math.round(acc[1] / cnt);
        imgd2.data[idx + 2] = Math.round(acc[2] / cnt);
        imgd2.data[idx + 3] = Math.round(acc[3] / cnt);
      }
    }
  }
  
  return imgd2;
}

// Color quantization using simple median cut
function colorquantization(
  imgd: ImageData,
  options: ImageTracerOptions
): { array: number[][]; palette: { r: number; g: number; b: number; a: number }[] } {
  const { width, height, data } = imgd;
  const numberofcolors = options.numberofcolors;
  
  // Build palette
  const pixels: { r: number; g: number; b: number; a: number }[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] });
    }
  }
  
  // Simple k-means clustering for palette
  let palette: { r: number; g: number; b: number; a: number }[] = [];
  
  if (options.colorsampling === 0) {
    // Deterministic - evenly spaced
    for (let i = 0; i < numberofcolors; i++) {
      const idx = Math.floor((i / numberofcolors) * pixels.length);
      if (pixels[idx]) {
        palette.push({ ...pixels[idx] });
      }
    }
  } else if (options.colorsampling === 1) {
    // Random sampling
    for (let i = 0; i < numberofcolors; i++) {
      const idx = Math.floor(Math.random() * pixels.length);
      if (pixels[idx]) {
        palette.push({ ...pixels[idx] });
      }
    }
  } else {
    // Deterministic with sorting
    pixels.sort((a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b));
    for (let i = 0; i < numberofcolors; i++) {
      const idx = Math.floor(((i + 0.5) / numberofcolors) * pixels.length);
      if (pixels[idx]) {
        palette.push({ ...pixels[idx] });
      }
    }
  }
  
  // Ensure we have at least some colors
  if (palette.length === 0) {
    palette = [
      { r: 0, g: 0, b: 0, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 }
    ];
  }
  
  // Refine palette with k-means
  for (let cycle = 0; cycle < options.colorquantcycles; cycle++) {
    const clusters: { r: number; g: number; b: number; a: number; count: number }[] = 
      palette.map(() => ({ r: 0, g: 0, b: 0, a: 0, count: 0 }));
    
    for (const px of pixels) {
      let minDist = Infinity;
      let minIdx = 0;
      
      for (let j = 0; j < palette.length; j++) {
        const dist = 
          (px.r - palette[j].r) ** 2 +
          (px.g - palette[j].g) ** 2 +
          (px.b - palette[j].b) ** 2;
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      
      clusters[minIdx].r += px.r;
      clusters[minIdx].g += px.g;
      clusters[minIdx].b += px.b;
      clusters[minIdx].a += px.a;
      clusters[minIdx].count++;
    }
    
    for (let j = 0; j < palette.length; j++) {
      if (clusters[j].count > 0) {
        palette[j] = {
          r: Math.round(clusters[j].r / clusters[j].count),
          g: Math.round(clusters[j].g / clusters[j].count),
          b: Math.round(clusters[j].b / clusters[j].count),
          a: Math.round(clusters[j].a / clusters[j].count),
        };
      }
    }
  }
  
  // Create indexed image
  const array: number[][] = [];
  for (let y = 0; y < height; y++) {
    array[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      if (data[idx + 3] < 128) {
        array[y][x] = -1; // transparent
        continue;
      }
      
      let minDist = Infinity;
      let minIdx = 0;
      
      for (let j = 0; j < palette.length; j++) {
        const dist = 
          (data[idx] - palette[j].r) ** 2 +
          (data[idx + 1] - palette[j].g) ** 2 +
          (data[idx + 2] - palette[j].b) ** 2;
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      
      array[y][x] = minIdx;
    }
  }
  
  return { array, palette };
}

// Edge detection for line art
interface Point { x: number; y: number; }

function detectEdges(array: number[][], width: number, height: number): number[][] {
  const edges: number[][] = [];
  
  for (let y = 0; y < height; y++) {
    edges[y] = [];
    for (let x = 0; x < width; x++) {
      edges[y][x] = 0;
      
      const current = array[y][x];
      if (current === -1) continue;
      
      // Check 4-connectivity
      const neighbors = [
        y > 0 ? array[y - 1][x] : -1,
        y < height - 1 ? array[y + 1][x] : -1,
        x > 0 ? array[y][x - 1] : -1,
        x < width - 1 ? array[y][x + 1] : -1,
      ];
      
      for (const n of neighbors) {
        if (n !== current) {
          edges[y][x] = 1;
          break;
        }
      }
    }
  }
  
  return edges;
}

// Layering - separate colors into layers
interface Layer {
  colorIndex: number;
  paths: Point[][];
}

function layeringstep(
  array: number[][],
  palette: { r: number; g: number; b: number; a: number }[],
  options: ImageTracerOptions
): Layer[] {
  const height = array.length;
  const width = array[0]?.length || 0;
  const layers: Layer[] = [];
  
  for (let colorIdx = 0; colorIdx < palette.length; colorIdx++) {
    const visited = new Set<string>();
    const paths: Point[][] = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (array[y][x] !== colorIdx) continue;
        
        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        
        // Trace contour
        const contour = traceContour(array, x, y, colorIdx, width, height, visited);
        if (contour.length >= options.pathomit) {
          paths.push(contour);
        }
      }
    }
    
    if (paths.length > 0) {
      layers.push({ colorIndex: colorIdx, paths });
    }
  }
  
  return layers;
}

// Contour tracing using Moore-Neighbor algorithm
function traceContour(
  array: number[][],
  startX: number,
  startY: number,
  colorIdx: number,
  width: number,
  height: number,
  visited: Set<string>
): Point[] {
  const contour: Point[] = [];
  
  // Moore neighborhood directions (clockwise from left)
  const directions = [
    [-1, 0], [-1, -1], [0, -1], [1, -1],
    [1, 0], [1, 1], [0, 1], [-1, 1]
  ];
  
  // Find start point on boundary
  let x = startX;
  let y = startY;
  let dir = 0;
  
  // Mark region and find boundary
  const region: Point[] = [];
  const queue: [number, number][] = [[startX, startY]];
  const regionVisited = new Set<string>();
  
  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    const key = `${cx},${cy}`;
    
    if (regionVisited.has(key)) continue;
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
    if (array[cy][cx] !== colorIdx) continue;
    
    regionVisited.add(key);
    visited.add(key);
    region.push({ x: cx, y: cy });
    
    // Add neighbors
    for (const [dx, dy] of directions) {
      queue.push([cx + dx, cy + dy]);
    }
  }
  
  // Extract boundary points
  for (const p of region) {
    let isBoundary = false;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = p.x + dx;
      const ny = p.y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height || array[ny][nx] !== colorIdx) {
        isBoundary = true;
        break;
      }
    }
    if (isBoundary) {
      contour.push(p);
    }
  }
  
  // Order points by angle from centroid
  if (contour.length > 2) {
    const cx = contour.reduce((s, p) => s + p.x, 0) / contour.length;
    const cy = contour.reduce((s, p) => s + p.y, 0) / contour.length;
    contour.sort((a, b) => 
      Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );
  }
  
  return contour;
}

// Path interpolation - smooth paths with bezier curves
function interpolatePath(
  points: Point[],
  options: ImageTracerOptions
): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}Z`;
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}Z`;
  }
  
  let d = `M${round(points[0].x, options.roundcoords)},${round(points[0].y, options.roundcoords)}`;
  
  const ltres = options.ltres;
  const qtres = options.qtres;
  
  // Use quadratic bezier curves for smoothing
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    
    // Calculate control point
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    
    // Check if we should use curve or line
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < ltres) {
      continue; // Skip very close points
    }
    
    if (options.rightangleenhance && isRightAngle(p0, p1, p2)) {
      d += `L${round(p1.x, options.roundcoords)},${round(p1.y, options.roundcoords)}`;
    } else if (qtres > 0) {
      d += `Q${round(p1.x, options.roundcoords)},${round(p1.y, options.roundcoords)},${round(midX, options.roundcoords)},${round(midY, options.roundcoords)}`;
    } else {
      d += `L${round(p1.x, options.roundcoords)},${round(p1.y, options.roundcoords)}`;
    }
  }
  
  d += 'Z';
  return d;
}

function isRightAngle(p0: Point, p1: Point, p2: Point): boolean {
  const v1x = p1.x - p0.x;
  const v1y = p1.y - p0.y;
  const v2x = p2.x - p1.x;
  const v2y = p2.y - p1.y;
  
  const dot = v1x * v2x + v1y * v2y;
  const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
  
  if (len1 === 0 || len2 === 0) return false;
  
  const cos = dot / (len1 * len2);
  return Math.abs(cos) < 0.1; // Close to perpendicular
}

function round(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

// Main SVG generation
function getsvgstring(
  layers: Layer[],
  palette: { r: number; g: number; b: number; a: number }[],
  width: number,
  height: number,
  options: ImageTracerOptions
): string {
  const scale = options.scale;
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  
  let svg = options.viewbox
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${w}" height="${h}">\n`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">\n`;
  
  if (options.desc) {
    svg += `<desc>Created with ImageTracerJS</desc>\n`;
  }
  
  for (const layer of layers) {
    const color = palette[layer.colorIndex];
    if (!color) continue;
    
    const colorStr = tosvgcolorstr(color);
    const opacity = color.a / 255;
    
    for (const path of layer.paths) {
      const d = interpolatePath(path, options);
      if (d) {
        if (options.strokewidth > 0 && options.linefilter) {
          svg += `<path d="${d}" fill="none" stroke="${colorStr}" stroke-width="${options.strokewidth}" stroke-opacity="${opacity}"/>\n`;
        } else {
          svg += `<path d="${d}" fill="${colorStr}" fill-opacity="${opacity}" stroke="none"/>\n`;
        }
      }
    }
  }
  
  svg += '</svg>';
  return svg;
}

// Main tracing function
export function imagedataToSVG(
  imgd: ImageData,
  options: Partial<ImageTracerOptions> = {}
): string {
  const opts: ImageTracerOptions = { ...defaultOptions, ...options };
  
  let processedImgd = imgd;
  
  // Apply blur if needed
  if (opts.blurradius > 0) {
    processedImgd = blur(imgd, opts.blurradius, opts.blurdelta);
  }
  
  // Color quantization
  const { array, palette } = colorquantization(processedImgd, opts);
  
  // Layering
  const layers = layeringstep(array, palette, opts);
  
  // Generate SVG
  return getsvgstring(layers, palette, imgd.width, imgd.height, opts);
}

// Trace from canvas
export function traceCanvas(
  canvas: HTMLCanvasElement,
  options: Partial<ImageTracerOptions> = {}
): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return imagedataToSVG(imgd, options);
}

// Trace from image element
export async function traceImage(
  img: HTMLImageElement,
  options: Partial<ImageTracerOptions> = {}
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(img, 0, 0);
  return imagedataToSVG(ctx.getImageData(0, 0, canvas.width, canvas.height), options);
}
