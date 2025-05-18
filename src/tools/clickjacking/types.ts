/**
 * Clickjacking Tool Type Definitions
 */

/**
 * Validation result data structure
 */
export interface ValidationResult {
  url: string;
  headers: {
    'x-frame-options'?: string;
    'content-security-policy'?: string;
    'frame-ancestors'?: string;
  };
  canBeFramed: boolean;
  frameLoaded: boolean;
  statusCode?: number;
  statusText?: string;
  message?: string;
  timestamp: Date;
}

/**
 * History entry for a validation result
 */
export interface HistoryEntry {
  id: string;
  result: ValidationResult;
}

/**
 * Props for the ClickJackingValidator component
 */
export interface ClickJackingValidatorProps {
  initialUrl?: string;
}
