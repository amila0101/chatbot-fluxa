const morgan = require('morgan');
const logger = require('../utils/logger');

// Define a custom token for request body
morgan.token('body', (req) => {
  // Don't log sensitive information
  const safeBody = { ...req.body };

  // Mask sensitive fields if they exist
  if (safeBody.password) safeBody.password = '******';
  if (safeBody.token) safeBody.token = '******';
  if (safeBody.apiKey) safeBody.apiKey = '******';

  return JSON.stringify(safeBody);
});

// Define a custom token for response time in a more readable format
morgan.token('response-time-formatted', (req, res) => {
  const time = morgan['response-time'](req, res);
  if (time && typeof time === 'number') {
    return `${time.toFixed(2)}ms`;
  } else if (time) {
    return `${time}ms`;
  } else {
    return '';
  }
});

// Define a custom token for trace ID (will be used with OpenTelemetry)
morgan.token('trace-id', (req) => {
  return req.traceId || 'no-trace-id';
});

// Create a format string for development
const developmentFormat = ':method :url :status :response-time-formatted - :trace-id - :body';

// Create a format string for production (more concise)
const productionFormat = ':remote-addr - :method :url :status :response-time-formatted - :trace-id';

// Choose format based on environment
const format = process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat;

// Create and export the middleware
const requestLogger = morgan(format, {
  stream: logger.stream,
  skip: (req, res) => {
    // Skip logging for health check endpoints to reduce noise
    return req.url.includes('/health') && res.statusCode === 200;
  },
});

module.exports = requestLogger;
