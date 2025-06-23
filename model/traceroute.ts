/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface TraceHop {
  hop: number;
  ip: string;
  latency: number;
  hostname?: string;
  status: 'success' | 'timeout';
}

export interface TraceResult {
  target: string;
  hops: TraceHop[];
  raw: string;
}

const ipRegex = /(\d{1,3}(?:\.\d{1,3}){3})/;
const latencyRegex = /(\d+(?:\.\d+)?)\s*ms/;

export const parseMtrOutput = (text: string): TraceHop[] => {
  const lines = text.split(/\n|\r/).filter((l) => /^\s*\d+/.test(l));
  return lines.map((line, idx) => {
    const ipMatch = line.match(ipRegex);
    const latencyMatch = line.match(latencyRegex);
    return {
      hop: idx + 1,
      ip: ipMatch ? ipMatch[1] : '*',
      latency: latencyMatch ? parseFloat(latencyMatch[1]) : -1,
      status: ipMatch ? 'success' : 'timeout',
    } as TraceHop;
  });
};

export const runTraceroute = async (
  target: string,
  apiKey: string,
): Promise<TraceResult> => {
  const url = `https://api.hackertarget.com/mtr/?q=${encodeURIComponent(
    target,
  )}&apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Traceroute request failed');
  }
  const text = await res.text();
  return { target, raw: text, hops: parseMtrOutput(text) };
};

export default runTraceroute;
