/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface ConnectionInfo {
  type: 'wifi' | 'cellular' | 'unknown';
  effectiveType?: string;
  downlink?: number;
}

interface NetworkConnection {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  addEventListener?(type: string, listener: EventListener): void;
  removeEventListener?(type: string, listener: EventListener): void;
}

export const isConnectionApiSupported = (): boolean =>
  typeof (navigator as unknown as { connection?: unknown }).connection !== 'undefined';

export const getConnectionInfo = (): ConnectionInfo => {
  const nav = navigator as unknown as { connection?: NetworkConnection };
  const conn = nav.connection;
  if (!conn) return { type: 'unknown' };
  let base: 'wifi' | 'cellular' | 'unknown' = 'unknown';
  if (conn.type === 'wifi') base = 'wifi';
  else if (conn.type === 'cellular') base = 'cellular';
  else if (typeof conn.effectiveType === 'string' && conn.effectiveType.includes('g')) {
    base = 'cellular';
  }
  return {
    type: base,
    effectiveType: conn.effectiveType,
    downlink: conn.downlink,
  };
};

export const getTechTier = (info: { effectiveType?: string; downlink?: number }): '3G' | '4G' | '≈5G' => {
  if (!info.effectiveType) return '3G';
  if (info.effectiveType === '2g' || info.effectiveType === '3g') return '3G';
  if (info.downlink !== undefined && info.effectiveType === '4g' && info.downlink >= 50) return '≈5G';
  return '4G';
};

export const average = (vals: number[]): number =>
  vals.reduce((a, b) => a + b, 0) / (vals.length || 1);

export const calcJitter = (vals: number[]): number => {
  if (vals.length <= 1) return 0;
  let total = 0;
  for (let i = 1; i < vals.length; i += 1) total += Math.abs(vals[i] - vals[i - 1]);
  return total / (vals.length - 1);
};

export const pingSamples = async (
  url: string,
  samples = 5,
  fetchFn: typeof fetch = fetch
): Promise<number[]> => {
  const results: number[] = [];
  // sequential awaits are intentional
  // eslint-disable-next-line no-await-in-loop
  for (let i = 0; i < samples; i += 1) {
    const start = performance.now();
    // eslint-disable-next-line no-await-in-loop
    await fetchFn(url, { mode: 'no-cors', cache: 'no-store' });
    const dt = performance.now() - start;
    if (i > 0) results.push(dt);
  }
  return results;
};

export const measureDownloadSpeed = async (
  url: string,
  cap = 10 * 1024 * 1024,
  onProgress?: (bytes: number) => void,
  fetchFn: typeof fetch = fetch
): Promise<number> => {
  const start = performance.now();
  const res = await fetchFn(url, { cache: 'no-store' });
  if (!res.body) throw new Error('stream unsupported');
  const reader = res.body.getReader();
  let loaded = 0;
  // eslint-disable-next-line no-constant-condition
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    if (done || !value) break;
    loaded += value.length;
    if (onProgress) onProgress(loaded);
    if (loaded >= cap) {
      try {
        reader.cancel();
      } catch {
        // ignore
      }
      break;
    }
  }
  const seconds = (performance.now() - start) / 1000;
  return (loaded * 8) / (seconds * 1_000_000);
};

export const measureUploadSpeed = async (
  url: string,
  bytes = 5 * 1024 * 1024,
  onProgress?: (sent: number) => void,
  fetchFn: typeof fetch = fetch
): Promise<number> => {
  // Create a deterministic payload without storing in memory excessively
  const chunkSize = 256 * 1024;
  const chunks = Math.ceil(bytes / chunkSize);
  const chunksArray: Blob[] = [];
  for (let i = 0; i < chunks; i += 1) {
    const size = Math.min(chunkSize, bytes - i * chunkSize);
    chunksArray.push(new Blob([new Uint8Array(size)]));
  }
  const body = new Blob(chunksArray, { type: 'application/octet-stream' });
  const start = performance.now();
  try {
    await fetchFn(url, { method: 'POST', body, mode: 'no-cors', keepalive: false });
  } catch {
    // As long as the browser attempted the upload, we consider timing valid
  }
  if (onProgress) onProgress(bytes);
  const seconds = (performance.now() - start) / 1000;
  return (bytes * 8) / (seconds * 1_000_000);
};

export type QualityMetrics = {
  avgPingMs: number;
  jitterMs: number;
  downloadMbps: number | null;
  uploadMbps: number | null;
};

export const getQualityScore = (m: QualityMetrics): { score: number; grade: 'A'|'B'|'C'|'D' } => {
  const pingScore = Math.max(0, 100 - Math.min(100, m.avgPingMs));
  const jitterScore = Math.max(0, 100 - Math.min(100, m.jitterMs * 2));
  const downScore = m.downloadMbps ? Math.min(100, (m.downloadMbps / 100) * 100) : 0;
  const upScore = m.uploadMbps ? Math.min(100, (m.uploadMbps / 50) * 100) : 0;
  const score = Math.round(0.25 * pingScore + 0.25 * jitterScore + 0.3 * downScore + 0.2 * upScore);
  let grade: 'A'|'B'|'C'|'D' = 'D';
  if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 50) grade = 'C';
  return { score, grade };
};
