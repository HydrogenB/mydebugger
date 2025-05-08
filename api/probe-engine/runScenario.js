// Runner for multiple puppeteer scenarios
// Orchestrates the execution of various device scenarios with proper cleanup

const { probeUrl } = require('./deeplinkCapture');
const deviceProfiles = require('./deviceProfiles');

/**
 * Run a specific device scenario probe
 * @param {string} url - The URL to probe
 * @param {string} scenarioId - The ID of the scenario to run
 * @param {Object} options - Additional options
 * @returns {Object} The probe results
 */
async function runSingleScenario(url, scenarioId, options = {}) {
  // Make sure the device profile exists
  if (!deviceProfiles[scenarioId]) {
    throw new Error(`Invalid scenario ID: ${scenarioId}`);
  }

  // Run the probe
  const result = await probeUrl(url, scenarioId, deviceProfiles[scenarioId], options);
  return result;
}

/**
 * Run multiple device scenarios in parallel
 * @param {string} url - The URL to probe
 * @param {Array<string>} scenarioIds - Array of scenario IDs to run
 * @param {Object} options - Additional options
 * @returns {Array<Object>} Array of probe results
 */
async function runMultipleScenarios(url, scenarioIds, options = {}) {
  // Validate that all scenario IDs are valid
  const validScenarios = scenarioIds.filter(id => deviceProfiles[id]);
  if (validScenarios.length === 0) {
    throw new Error('No valid scenarios specified');
  }
  
  // Run all scenarios in parallel with Promise.all
  const results = await Promise.all(
    validScenarios.map(scenarioId => 
      probeUrl(url, scenarioId, deviceProfiles[scenarioId], options)
    )
  );
  
  return results;
}

module.exports = {
  runSingleScenario,
  runMultipleScenarios
};