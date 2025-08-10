/**
 * © 2025 MyDebugger Contributors – MIT License
 */
// Use local relative path to shared types
import { DeviceTraceResult } from '../../linktracer/types';

export interface DeviceTraceOptions {
  maxHops?: number;
  iosAppId?: string;
  androidPackage?: string;
  deepLinkScheme?: string;
}

export const runDeviceTrace = async (
  url: string,
  options: DeviceTraceOptions = {},
): Promise<DeviceTraceResult> => {
  const res = await fetch('/api/probe-router?action=trace', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url, ...options }),
  });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  const data = (await res.json()) as DeviceTraceResult;
  return data;
};

export default runDeviceTrace;

// Simple utilities expected by tests
export const detectBrowser = (ua: string) => {
  if (/Chrome\//.test(ua)) return { name: 'Chrome', version: ua.match(/Chrome\/([\d.]+)/)?.[1] || '' };
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return { name: 'Safari', version: ua.match(/Version\/([\d.]+)/)?.[1] || '' };
  if (/Firefox\//.test(ua)) return { name: 'Firefox', version: ua.match(/Firefox\/([\d.]+)/)?.[1] || '' };
  return { name: 'Unknown', version: '' };
};

export const getDeviceInfo = () => ({
  platform: navigator.platform || '',
  screenWidth: window.screen?.width || 0,
  screenHeight: window.screen?.height || 0,
});

export const getNetworkInfo = () => {
  const anyNav: any = navigator as any;
  const conn = anyNav.connection || anyNav.mozConnection || anyNav.webkitConnection;
  return {
    effectiveType: conn?.effectiveType || 'unknown',
    downlink: conn?.downlink,
  };
};
