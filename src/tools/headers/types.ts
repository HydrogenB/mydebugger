/**
 * Headers Analyzer Tool Type Definitions
 */

/**
 * Represents a single HTTP header with metadata
 */
export interface HeaderData {
  name: string;
  value: string;
  description: string;
  category: string;
  source: 'request' | 'response';
}

/**
 * Collection of request and response headers
 */
export interface ParsedHeaders {
  request: HeaderData[];
  response: HeaderData[];
}

/**
 * Analysis result for a URL including headers and metadata
 */
export interface HeadersAnalysisResult {
  url: string;
  headers: ParsedHeaders;
  statusCode?: number;
  statusText?: string;
  timestamp: Date;
}

/**
 * Props for the HeadersAnalyzer component
 */
export interface HeadersAnalyzerProps {
  initialUrl?: string;
}
