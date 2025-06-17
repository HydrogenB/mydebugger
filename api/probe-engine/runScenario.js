import { probeUrl } from './deeplinkCapture.js';
import deviceProfiles from './deviceProfiles.js';

export async function runSingleScenario(url, scenarioId, options = {}) {
  if (!deviceProfiles[scenarioId]) {
    throw new Error(`Invalid scenario ID: ${scenarioId}`);
  }
  const result = await probeUrl(url, scenarioId, deviceProfiles[scenarioId], options);
  return result;
}

export async function runMultipleScenarios(url, scenarioIds, options = {}) {
  const validScenarios = scenarioIds.filter((id) => deviceProfiles[id]);
  if (validScenarios.length === 0) {
    throw new Error('No valid scenarios specified');
  }
  const results = await Promise.all(
    validScenarios.map((scenarioId) => probeUrl(url, scenarioId, deviceProfiles[scenarioId], options)),
  );
  return results;
}
