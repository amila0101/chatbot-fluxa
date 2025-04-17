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
    const recentLatencies = metrics.apiLatencies
      .filter(l => Date.now() - l.timestamp < 60000) // Last minute
      .map(l => l.duration);
    
    const avgLatency = recentLatencies.length > 0
      ? recentLatencies.reduce((sum, val) => sum + val, 0) / recentLatencies.length
      : 0;
    
    const recentRequests = metrics.apiLatencies
      .filter(l => Date.now() - l.timestamp < 60000).length; // Last minute
    
    const recentErrors = metrics.apiLatencies
      .filter(l => Date.now() - l.timestamp < 60000 && l.statusCode >= 400).length;
    
    const errorRate = recentRequests > 0
      ? (recentErrors / recentRequests) * 100
      : 0;
    
    // System metrics
    const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    // Get the 10 most recent latencies for the chart
    const latencyHistory = metrics.apiLatencies
      .slice(-10)
      .map(l => l.duration);
    
    // Response
    res.json({
      uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
      requestCount: metrics.requestCount,
      errorRate,
      apiLatency: latencyHistory,
      currentLatency: avgLatency,
      cpuUsage,
      memoryUsage,
      activeUsers: Math.floor(Math.random() * 10) + 1, // Mock data
      serverStatus: 'healthy',
    });
  } catch (error) {
    logger.error('Error generating metrics', { error });
    res.status(500).json({ error: 'Failed to generate metrics' });
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
