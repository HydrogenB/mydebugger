/**
 * URL encoding/decoding utility functions
 */
import { EncodingMode, EncodingType, EncodingResult } from '../types';

/**
 * Encode or decode a string using the specified encoding type
 */
export const processString = (
  input: string,
  mode: EncodingMode,
  type: EncodingType
): EncodingResult => {
  if (!input) {
    return {
      input,
      output: '',
      mode,
      type,
      error: null
    };
  }

  try {
    let output = '';

    if (mode === 'encode') {
      switch (type) {
        case 'component':
          output = encodeURIComponent(input);
          break;
        case 'uri':
          output = encodeURI(input);
          break;
        case 'binary':
          output = btoa(input);
          break;
        case 'query':
          const params = new URLSearchParams();
          // Split by & to get param pairs
          const pairs = input.split('&');
          pairs.forEach(pair => {
            // Split each pair by = to get key and value
            const [key, value] = pair.split('=');
            if (key) {
              params.append(key, value || '');
            }
          });
          output = params.toString();
          break;
      }
    } else { // mode === 'decode'
      switch (type) {
        case 'component':
          output = decodeURIComponent(input);
          break;
        case 'uri':
          output = decodeURI(input);
          break;
        case 'binary':
          // Add padding if needed for base64
          let toDecode = input;
          while (toDecode.length % 4 !== 0) {
            toDecode += '=';
          }
          output = atob(toDecode);
          break;
        case 'query':
          const params = new URLSearchParams(input);
          const result: string[] = [];
          
          // Convert URLSearchParams to formatted string
          params.forEach((value, key) => {
            result.push(`${key}=${value}`);
          });
          
          output = result.join('&');
          break;
      }
    }

    return {
      input,
      output,
      mode,
      type,
      error: null
    };
  } catch (error) {
    return {
      input,
      output: '',
      mode,
      type,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
