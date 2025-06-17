/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { puppeteerProbeHandler } from './probe-engine/puppeteerProbeLib.js';
import { runSingleScenario, runMultipleScenarios } from './probe-engine/runScenario.js';

export default async function handler(req, res) {
  const { type } = req.body || {};

  if (type === 'puppeteer') {
    return puppeteerProbeHandler(req, res);
  }

  if (type === 'scenario') {
    try {
      const { url, scenarios = [], options = {} } = req.body;
      if (!url) return res.status(400).json({ error: 'URL is required' });
      const results = await runMultipleScenarios(url, scenarios, options);
      return res.status(200).json({ results });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid type parameter' });
}
