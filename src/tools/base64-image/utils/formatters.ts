/**
 * Utility functions for formatting and extracting information from base64 images
 */

/**
 * Format bytes to human-readable format
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extract image format from data URL
 */
export const extractImageFormat = (dataUrl: string): string => {
  const match = dataUrl.match(/data:image\/([a-zA-Z0-9+.-]+);base64,/);
  return match ? match[1].toUpperCase() : 'Unknown';
};
