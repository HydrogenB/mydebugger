/**
 * API route entry point
 * Re-exports all API handlers using a controller-based architecture
 */

// Import controllers
const deviceController = require('./controllers/device');
const networkController = require('./controllers/network');
const securityController = require('./controllers/security');

// Export API handlers
module.exports = {
  // Security-related endpoints
  clickjackingAnalysis: securityController.clickjackingAnalysis,
  
  // Network-related endpoints
  dnsLookup: networkController.dnsLookup,
  headerAudit: networkController.headerAudit,
  linkTrace: networkController.linkTrace,
  
  // Device-related endpoints
  deviceTrace: deviceController.deviceTrace,
  
  // Re-export original handlers for any that haven't been migrated yet
  // These should eventually be moved to the controller architecture
  puppeteerProbe: require('./device/puppeteer-probe'),
  iframeTest: require('./testing/iframe-test')
};
