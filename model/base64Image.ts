/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface ImageInfo {
  width: number;
  height: number;
  type: string;
  size: number;
  sizeFormatted: string;
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / (k ** i)).toFixed(2));
  return `${size} ${sizes[i]}`;
};

export const extractImageFormat = (dataUrl: string): string => {
  const match = dataUrl.match(/data:image\/([a-zA-Z0-9+.-]+);base64,/);
  return match ? match[1].toUpperCase() : 'Unknown';
};
