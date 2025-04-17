// Initialize tracing first
const tracing = require('./tracing');

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(tracing.tracingMiddleware); // Add trace context to requests
app.use(requestLogger); // Log all HTTP requests

// API routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/health', require('./routes/health'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/logs', require('./routes/logs'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    traceId: req.traceId || 'no-trace-id'
  });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`, {
    method: req.method,
    ip: req.ip,
    traceId: req.traceId || 'no-trace-id'
  });
  res.status(404).json({ error: 'Not found' });
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
  });
}

// For testing purposes
app.close = () => {
  if (server) {
    return server.close();
  }
  return null;
};

module.exports = app;
