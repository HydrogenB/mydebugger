/**
 * Shared type definitions for link tracing tools
 */

/**
 * Represents a single hop/step in a link trace
 */
export interface Hop {
  n: number;
  url: string;
  status: number;
  method?: string;
  latencyMs: number;
  error?: string;
  type?: string;
  nextUrl?: string;
}

/**
 * Result of a standard link trace operation
 */
export interface TraceResult {
  hops: Hop[];
  totalTimeMs: number;
  warnings: string[];
}

/**
 * Device profile for tracing with different user agents
 */
export interface DeviceProfile {
  id: string;
  name: string;
  type: string;
  userAgent: string;
}

/**
 * User agent configuration option
 */
export interface UserAgentOption {
  label: string;
  value: string;
}

/**
 * Result of a trace for a specific device/browser scenario
 */
export interface ScenarioResult {
  scenario: string;
  name: string;
  hops: Hop[];
  totalTimeMs: number;
  finalUrl?: string;
  final_url?: string; // For backward compatibility
  warnings: string[];
  isValidOutcome?: boolean;
  status?: string;
  deep_link?: string | null;
  is_store_url?: boolean;
}

/**
 * Overall result of a device trace operation
 * containing multiple scenario results
 */
export interface DeviceTraceResult {
  url: string;
  overallTimeMs: number;
  results: ScenarioResult[];
}
