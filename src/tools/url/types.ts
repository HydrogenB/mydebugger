/**
 * Type definitions for the URL encoder/decoder tool
 */

/**
 * URL encoding modes
 */
export type EncodingMode = 'encode' | 'decode';

/**
 * URL encoding types
 */
export type EncodingType = 
  | 'component' // encodeURIComponent
  | 'uri'       // encodeURI
  | 'binary'    // btoa/atob
  | 'query';    // URLSearchParams

/**
 * URL encoding result
 */
export interface EncodingResult {
  input: string;
  output: string;
  mode: EncodingMode;
  type: EncodingType;
  error: string | null;
}
