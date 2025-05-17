// Controllers for network-related API endpoints
const { networkService } = require('../services');

// Handler for DNS lookups
const dnsLookup = async (req, res) => {
  try {
    const result = await networkService.lookupDns(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('DNS lookup error:', error);
    return res.status(500).json({ error: 'Failed to lookup DNS' });
  }
};

// Handler for header auditing
const headerAudit = async (req, res) => {
  try {
    const result = await networkService.auditHeaders(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Header audit error:', error);
    return res.status(500).json({ error: 'Failed to audit headers' });
  }
};

// Handler for link tracing
const linkTrace = async (req, res) => {
  try {
    const result = await networkService.traceLink(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Link trace error:', error);
    return res.status(500).json({ error: 'Failed to trace link' });
  }
};

// Controller exports
module.exports = {
  dnsLookup,
  headerAudit,
  linkTrace
};
