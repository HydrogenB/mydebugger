/**
 * Type definitions for the Base64 Image Debugger
 */

/**
 * Information about an analyzed image
 */
export interface ImageInfo {
  width: number;
  height: number;
  type: string;
  size: number;
  sizeFormatted: string;
}
