// Simple server with basic tracing and logging
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add trace ID to requests
app.use((req, res, next) => {
  // Generate a random trace ID
  req.traceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Trace-Id', req.traceId);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log the request
  logger.info(`Request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    traceId: req.traceId
  });
  
  // Log the response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Response: ${req.method} ${req.url} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      traceId: req.traceId
    });
  });
  
  next();
});

// API routes
app.use('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    model: process.env.AI_MODEL || 'default'
  });
});

// Simple metrics endpoint
app.use('/api/metrics', (req, res) => {
  res.json({
    uptime: Math.floor(process.uptime()),
    requestCount: 0,
    errorRate: 0,
    apiLatency: [100, 120, 110, 130, 125, 115, 105, 110, 120, 115],
    currentLatency: 115,
    cpuUsage: 10,
    memoryUsage: 20,
    activeUsers: 1,
    serverStatus: 'healthy',
  });
});

// Simple logs endpoint
app.use('/api/logs', (req, res) => {
  res.json({
    logs: [
      { level: 'info', message: 'Server started', timestamp: new Date().toISOString() },
      { level: 'info', message: 'API request received', timestamp: new Date(Date.now() - 5000).toISOString() },
      { level: 'warn', message: 'Slow API response', timestamp: new Date(Date.now() - 10000).toISOString() },
      { level: 'error', message: 'API request failed', timestamp: new Date(Date.now() - 15000).toISOString() },
    ],
    total: 4,
    filtered: 4
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    traceId: req.traceId
  });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`, {
    method: req.method,
    ip: req.ip,
    traceId: req.traceId
  });
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});
