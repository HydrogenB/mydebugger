/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import { runTraceroute, TraceHop } from '../model/traceroute';
import { fetchGeoIp, GeoIpInfo } from '../src/tools/GeoIPService';

export interface UseTracerouteReturn {
  host: string;
  setHost: (v: string) => void;
  apiKey: string;
  setApiKey: (v: string) => void;
  hops: Array<TraceHop & { geo?: GeoIpInfo | null }>;
  running: boolean;
  run: () => Promise<void>;
  showRaw: boolean;
  toggleRaw: () => void;
  raw: string;
}

export const useTraceroute = (): UseTracerouteReturn => {
  const [host, setHost] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hops, setHops] = useState<Array<TraceHop & { geo?: GeoIpInfo | null }>>([]);
  const [running, setRunning] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [raw, setRaw] = useState('');

  const run = async () => {
    if (!host || !apiKey) return;
    setRunning(true);
    try {
      const res = await runTraceroute(host, apiKey);
      setRaw(res.raw);
      const enriched = await Promise.all(
        res.hops.map(async (h) => ({ ...h, geo: await fetchGeoIp(h.ip) })),
      );
      setHops(enriched);
    } catch {
      setRaw('');
      setHops([]);
    }
    setRunning(false);
  };

  const toggleRaw = () => setShowRaw((v) => !v);

  return { host, setHost, apiKey, setApiKey, hops, running, run, showRaw, toggleRaw, raw };
};

export default useTraceroute;
