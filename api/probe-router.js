/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { deviceTraceHandler } from './probe-engine/deviceTraceLib.js';
import deviceProfiles from './probe-engine/deviceProfiles.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  if (action === 'trace') return deviceTraceHandler(req, res);
  if (action === 'profile') return res.status(200).json(deviceProfiles);

  return res.status(400).json({ error: 'Invalid action parameter' });
}
