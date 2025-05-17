// Controllers for device-related API endpoints
const { deviceService } = require('../services');

// Handler for device tracing
const deviceTrace = async (req, res) => {
  try {
    const result = await deviceService.traceDevice(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Device trace error:', error);
    return res.status(500).json({ error: 'Failed to trace device' });
  }
};

// Controller exports
module.exports = {
  deviceTrace
};
