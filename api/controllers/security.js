// Controllers for security-related API endpoints
const { securityService } = require('../services');

// Handler for clickjacking analysis
const clickjackingAnalysis = async (req, res) => {
  try {
    const result = await securityService.analyzeClickjacking(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Clickjacking analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze clickjacking protection' });
  }
};

// Controller exports
module.exports = {
  clickjackingAnalysis
};
