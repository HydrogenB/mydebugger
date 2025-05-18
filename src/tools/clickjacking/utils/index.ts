import { ValidationResult, HistoryEntry } from '../types';

/**
 * Load clickjacking validation history from local storage
 * @returns Array of history entries
 */
export const loadValidationHistory = (): HistoryEntry[] => {
  try {
    const savedHistory = localStorage.getItem('clickjacking-history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error('Error loading validation history:', error);
    return [];
  }
};

/**
 * Save a validation result to history
 * @param result The validation result to save
 */
export const saveToHistory = (result: ValidationResult): HistoryEntry[] => {
  try {
    const history = loadValidationHistory();
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      result
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep last 20 entries
    localStorage.setItem('clickjacking-history', JSON.stringify(updatedHistory));
    
    return updatedHistory;
  } catch (error) {
    console.error('Error saving to history:', error);
    return loadValidationHistory();
  }
};

/**
 * Clear the validation history
 * @returns Empty array
 */
export const clearHistory = (): HistoryEntry[] => {
  try {
    localStorage.removeItem('clickjacking-history');
    return [];
  } catch (error) {
    console.error('Error clearing history:', error);
    return [];
  }
};

/**
 * Parse CSP header for frame-ancestors directive
 * @param csp Content-Security-Policy header value
 * @returns Frame-ancestors directive or undefined
 */
export const parseCSPForFrameAncestors = (csp?: string): string | undefined => {
  if (!csp) return undefined;
  
  const directives = csp.split(';').map(directive => directive.trim());
  const frameAncestorsDirective = directives.find(directive => 
    directive.toLowerCase().startsWith('frame-ancestors')
  );
  
  return frameAncestorsDirective;
};

/**
 * Format a URL by ensuring it has a protocol
 * @param url URL string to format
 * @returns Formatted URL with protocol
 */
export const formatUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove whitespace
  url = url.trim();
  
  // Add https:// if no protocol specified
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

/**
 * Checks if clickjacking protection is enabled based on headers
 * @param headers Response headers
 * @returns Whether clickjacking protection is enabled
 */
export const hasClickjackingProtection = (headers: ValidationResult['headers']): boolean => {
  // Check for X-Frame-Options header
  const xFrameOptions = headers['x-frame-options']?.toLowerCase();
  if (xFrameOptions === 'deny' || xFrameOptions === 'sameorigin') {
    return true;
  }
  
  // Check for CSP frame-ancestors directive
  const csp = headers['content-security-policy'];
  const frameAncestors = parseCSPForFrameAncestors(csp);
  if (frameAncestors) {
    // Check if frame-ancestors is restrictive (not 'frame-ancestors *')
    const value = frameAncestors.toLowerCase();
    if (value.includes('none') || 
        (value.includes('self') && !value.includes('*')) ||
        (!value.includes('*'))) {
      return true;
    }
  }
  
  return false;
};
