/**
 * API route entry point
 * Re-exports all API handlers for better organization
 */

// Security-related endpoints
export { default as clickjackingAnalysis } from './security/clickjacking-analysis';

// Network-related endpoints
export { default as headerAudit } from './network/header-audit';
export { default as linkTrace } from './network/link-trace';

// Device-related endpoints
export { default as deviceTrace } from './device/device-trace';
export { default as puppeteerProbe } from './device/puppeteer-probe';

// Test-related endpoints
export { default as iframeTest } from './testing/iframe-test';
