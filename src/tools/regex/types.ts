/**
 * Regex Tool Type Definitions
 */

/**
 * Represents a regex match result
 */
export interface RegexMatch {
  index: number;
  match: string;
  groups: string[];
}

/**
 * Flag option configuration
 */
export interface FlagOption {
  value: string;
  label: string;
  description: string;
}

/**
 * Predefined regex example
 */
export interface RegexExample {
  name: string;
  pattern: string;
  input: string;
  flags: string;
}

/**
 * Regex match results with metadata
 */
export interface RegexMatchResult {
  matches: RegexMatch[];
  executionTime: number;
  totalMatches: number;
  errorMessage?: string;
}

/**
 * Props for the RegexTester component
 */
export interface RegexTesterProps {
  initialPattern?: string;
  initialInput?: string;
  initialFlags?: string;
}
