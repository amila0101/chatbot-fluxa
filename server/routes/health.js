const express = require('express');
const router = express.Router();
const os = require('os');

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    model: process.env.AI_MODEL || 'default',
    environment: process.env.ENVIRONMENT_NAME || 'unknown',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    uptime: process.uptime()
  });
});

// Detailed health check for internal monitoring
router.get('/detailed', (req, res) => {
  // Check if this is an internal request
  const isInternal = req.headers['x-internal-check'] === process.env.INTERNAL_CHECK_TOKEN;

  if (!isInternal) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Collect detailed health information
  const healthInfo = {
    status: 'ok',
    model: process.env.AI_MODEL || 'default',
    environment: process.env.ENVIRONMENT_NAME || 'unknown',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: os.totalmem(),
        free: os.freemem()
      },
      uptime: os.uptime(),
      loadavg: os.loadavg()
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    }
  };

  res.json(healthInfo);
});

module.exports = router;
