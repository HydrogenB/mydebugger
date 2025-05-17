import { useState, useCallback } from 'react';
import { EncodingMode, EncodingType, EncodingResult } from '../types';
import { processString } from '../utils/encoders';

/**
 * Custom hook for URL encoding/decoding functionality
 */
export const useUrlEncoder = () => {
  const [result, setResult] = useState<EncodingResult | null>(null);
  
  /**
   * Encode or decode a string
   * @param input The string to encode or decode
   * @param mode The encoding mode (encode or decode)
   * @param type The encoding type (component, uri, binary, query)
   */
  const processUrl = useCallback((
    input: string,
    mode: EncodingMode,
    type: EncodingType
  ): EncodingResult => {
    const newResult = processString(input, mode, type);
    setResult(newResult);
    return newResult;
  }, []);
  
  return {
    result,
    processUrl,
    clearResult: () => setResult(null)
  };
};
