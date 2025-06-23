/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { motion } from 'framer-motion';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { GeoIpInfo } from '../src/tools/GeoIPService';
import { TraceHop } from '../model/traceroute';

interface Props {
  host: string;
  setHost: (v: string) => void;
  apiKey: string;
  setApiKey: (v: string) => void;
  hops: Array<TraceHop & { geo?: GeoIpInfo | null }>;
  running: boolean;
  run: () => void;
  showRaw: boolean;
  toggleRaw: () => void;
  raw: string;
}

export function TracerouteView({
  host,
  setHost,
  apiKey,
  setApiKey,
  hops,
  running,
  run,
  showRaw,
  toggleRaw,
  raw,
}: Props) {
  return (
  <div className="space-y-6">
    <div className={TOOL_PANEL_CLASS}>
      <div className="flex flex-wrap gap-2 items-end">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="host" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Host/IP</label>
        <input
          id="host"
          className="border rounded px-2 py-1 flex-1"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="google.com"
        />
        <input
          id="apikey"
          className="border rounded px-2 py-1 flex-1"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Hackertarget API key"
        />
        <button type="button" onClick={run} disabled={running} className="px-3 py-1 bg-primary-500 text-white rounded">
          Trace
        </button>
        <button type="button" onClick={toggleRaw} className="px-3 py-1 bg-gray-200 rounded">
          {showRaw ? 'Hide Logs' : 'Show Logs'}
        </button>
      </div>
    </div>

    <div className={TOOL_PANEL_CLASS}>
      {hops.map((h) => (
        <motion.div key={h.hop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: h.hop * 0.1 }} className="border-b py-2">
          <div className="flex justify-between text-sm">
            <span>Hop {h.hop}</span>
            <span>{h.ip} - {h.latency}ms {h.geo && h.geo.country ? `(${h.geo.country})` : ''}</span>
          </div>
        </motion.div>
      ))}
      {showRaw && (
        <pre className="mt-2 text-xs bg-gray-50 p-2 overflow-auto whitespace-pre-wrap">
{raw}
        </pre>
      )}
    </div>

    {hops.some(h => h.geo && typeof h.geo.lat === 'number' && typeof h.geo.lon === 'number') && (
      <MapContainer center={[0,0]} zoom={1} style={{ height: '300px', width: '100%' }} className={TOOL_PANEL_CLASS}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {hops.map((h) => h.geo && h.geo.lat && h.geo.lon && (
          <Marker key={h.hop} position={[h.geo.lat, h.geo.lon]} />
        ))}
        <Polyline positions={hops.map((h) => h.geo && h.geo.lat && h.geo.lon ? [h.geo.lat, h.geo.lon] : [0,0]) as [number, number][]} />
      </MapContainer>
    )}
  </div>
);
};

export default TracerouteView;
