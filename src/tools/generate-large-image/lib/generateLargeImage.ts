/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export type ImageFormat = 'png' | 'jpeg';

export const calculateImageSize = (width: number, height: number, format: ImageFormat): number => {
  const pixels = Math.max(1, width) * Math.max(1, height);
  // very rough estimate: png ~ 4 bytes/pixel, jpeg ~ 2 bytes/pixel
  const bytesPerPixel = format === 'png' ? 4 : 2;
  return pixels * bytesPerPixel;
};

export const generateLargeImage = async (
  width: number,
  height: number,
  format: ImageFormat = 'png'
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '20px sans-serif';
    ctx.fillText(`${canvas.width}x${canvas.height}`, 10, 30);
  }
  const type = format === 'png' ? 'image/png' : 'image/jpeg';
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob(blob => resolve(blob || new Blob([], { type })), type);
  });
};

export default generateLargeImage;


