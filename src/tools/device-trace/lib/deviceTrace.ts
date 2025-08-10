/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { DeviceTraceResult } from '../src/tools/linktracer/types';

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
