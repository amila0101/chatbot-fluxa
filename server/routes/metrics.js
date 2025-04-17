const express = require('express');
const router = express.Router();
const os = require('os');
const logger = require('../utils/logger');

// In-memory metrics storage
const metrics = {
  requestCount: 0,
  errorCount: 0,
  apiLatencies: [],
  startTime: Date.now(),
};

// Middleware to track requests
router.use((req, res, next) => {
  const startTime = Date.now();

  // Increment request count
  metrics.requestCount++;

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Store API latency
    metrics.apiLatencies.push({
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: Date.now(),
    });

    // Keep only the last 1000 requests
    if (metrics.apiLatencies.length > 1000) {
      metrics.apiLatencies.shift();
    }

    // Track errors
    if (res.statusCode >= 400) {
      metrics.errorCount++;
    }

    // Log the request
    logger.http(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
});

// Get metrics
router.get('/', (req, res) => {
  try {
    // Calculate current metrics
    let recentLatencies = [];
    let avgLatency = 0;
    let recentRequests = 0;
    let recentErrors = 0;
    let errorRate = 0;
    let latencyHistory = [];

    try {
      // Calculate API metrics
      recentLatencies = metrics.apiLatencies
        .filter(l => Date.now() - l.timestamp < 60000) // Last minute
        .map(l => l.duration);

      avgLatency = recentLatencies.length > 0
        ? recentLatencies.reduce((sum, val) => sum + val, 0) / recentLatencies.length
        : 0;

      recentRequests = metrics.apiLatencies
        .filter(l => Date.now() - l.timestamp < 60000).length; // Last minute

      recentErrors = metrics.apiLatencies
        .filter(l => Date.now() - l.timestamp < 60000 && l.statusCode >= 400).length;

      errorRate = recentRequests > 0
        ? (recentErrors / recentRequests) * 100
        : 0;

      // Get the 10 most recent latencies for the chart
      latencyHistory = metrics.apiLatencies
        .slice(-10)
        .map(l => l.duration);
    } catch (metricsError) {
      logger.warn('Error calculating API metrics', { error: metricsError });
      // Continue with default values
    }

    // System metrics with error handling
    let cpuUsage = 0;
    let memoryUsage = 0;

    try {
      // Get CPU usage
      const loadAvg = os.loadavg();
      const cpuCount = os.cpus().length;
      cpuUsage = loadAvg[0] * 100 / cpuCount;

      // Get memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    } catch (sysError) {
      logger.warn('Error calculating system metrics', { error: sysError });
      // Continue with default values
    }

    // Response with safe values
    res.json({
      uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
      requestCount: metrics.requestCount || 0,
      errorRate: isNaN(errorRate) ? 0 : errorRate,
      apiLatency: latencyHistory || [],
      currentLatency: isNaN(avgLatency) ? 0 : avgLatency,
      cpuUsage: isNaN(cpuUsage) ? 0 : cpuUsage,
      memoryUsage: isNaN(memoryUsage) ? 0 : memoryUsage,
      activeUsers: Math.floor(Math.random() * 10) + 1, // Mock data
      serverStatus: 'healthy',
    });
  } catch (error) {
    logger.error('Error generating metrics', { error: error.message, stack: error.stack });

    // Return a minimal response with default values
    res.json({
      uptime: 0,
      requestCount: 0,
      errorRate: 0,
      apiLatency: [],
      currentLatency: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      activeUsers: 1,
      serverStatus: 'unknown',
    });
  }
});

// Reset metrics (for testing)
router.post('/reset', (req, res) => {
  metrics.requestCount = 0;
  metrics.errorCount = 0;
  metrics.apiLatencies = [];
  metrics.startTime = Date.now();

  res.json({ message: 'Metrics reset successfully' });
});

module.exports = router;
