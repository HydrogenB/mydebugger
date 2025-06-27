/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface CompressOptions {
  scale?: number; // scale factor 1.0 = original
  colorDepth?: number; // bits per channel
  targetSizeKB?: number; // desired max size in KB
  mimeType?: 'image/jpeg' | 'image/png';
}

export interface ImageInfo {
  width: number;
  height: number;
  sizeKB: number;
}

export interface CompressedResult {
  blob: Blob;
  base64: string;
  info: ImageInfo;
}

/* eslint-disable no-param-reassign */
export const reduceColorDepth = (data: Uint8ClampedArray, bits: number): void => {
  const levels = 2 ** bits;
  const step = 256 / levels;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.floor(data[i] / step) * step;
    data[i + 1] = Math.floor(data[i + 1] / step) * step;
    data[i + 2] = Math.floor(data[i + 2] / step) * step;
  }
};
/* eslint-enable no-param-reassign */

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadImage = (file: File | Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b as Blob), type, quality);
  });

export const compressImage = async (
  file: File,
  opts: CompressOptions = {},
): Promise<CompressedResult> => {
  const {
    scale = 1,
    colorDepth = 8,
    targetSizeKB = 50,
    mimeType = 'image/jpeg',
  } = opts;

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  reduceColorDepth(imgData.data, colorDepth);
  ctx.putImageData(imgData, 0, 0);

  let quality = 0.92;
  let blob = await canvasToBlob(canvas, mimeType, quality);
  /* eslint-disable no-await-in-loop */
  while (blob.size > targetSizeKB * 1024 && quality > 0.1) {
    quality -= 0.05;
    blob = await canvasToBlob(canvas, mimeType, quality);
  }
  /* eslint-enable no-await-in-loop */
  const base64 = await blobToBase64(blob);
  return {
    blob,
    base64,
    info: {
      width: canvas.width,
      height: canvas.height,
      sizeKB: Math.round(blob.size / 1024),
    },
  };
};

export default compressImage;
