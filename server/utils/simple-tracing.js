/**
 * Simple tracing module that doesn't require OpenTelemetry
 * This is used as a fallback when OpenTelemetry is not available
 */

const crypto = require('crypto');
const logger = require('./logger');

// Service name for tracing
const serviceName = process.env.SERVICE_NAME || 'chatbot-server';

// Store active spans
const activeSpans = new Map();

// Generate a random ID for tracing
function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

// Initialize tracing (no-op for simple tracing)
function initTracing() {
  logger.info('Using simple tracing (OpenTelemetry not available)');
  return {
    shutdown: () => Promise.resolve()
  };
}

// Middleware to add trace context to requests
function tracingMiddleware(req, res, next) {
  // Generate a trace ID and span ID
  const traceId = generateId();
  const spanId = generateId();
  
  // Add to request object
  req.traceId = traceId;
  req.spanId = spanId;
  
  // Add to response headers
  res.setHeader('X-Trace-Id', traceId);
  res.setHeader('X-Span-Id', spanId);
  
  next();
}

// Create a new span
function createSpan(name, fn) {
  const spanId = generateId();
  const parentSpanId = null; // No parent in simple tracing
  const startTime = Date.now();
  
  // Create a simple span object
  const span = {
    name,
    spanId,
    parentSpanId,
    startTime,
    endTime: null,
    attributes: {},
    events: [],
    status: 'OK',
    
    // Methods
    setAttribute: (key, value) => {
      span.attributes[key] = value;
    },
    addEvent: (name, attributes = {}) => {
      span.events.push({
        name,
        timestamp: Date.now(),
        attributes
      });
    },
    recordException: (error) => {
      span.addEvent('exception', {
        exception: {
          message: error.message,
          type: error.name,
          stack: error.stack
        }
      });
      span.status = 'ERROR';
    },
    setStatus: (status) => {
      span.status = status.code || status;
    },
    end: () => {
      span.endTime = Date.now();
      span.duration = span.endTime - span.startTime;
      activeSpans.delete(spanId);
      
      // Log span completion for debugging
      if (process.env.TRACE_DEBUG === 'true') {
        logger.debug(`Span completed: ${name}`, {
          spanId,
          duration: span.duration,
          status: span.status
        });
      }
    }
  };
  
  // Store the active span
  activeSpans.set(spanId, span);
  
  // Execute the function with the span
  return (async () => {
    try {
      const result = await fn(span);
      span.end();
      return result;
    } catch (error) {
      span.recordException(error);
      span.end();
      throw error;
    }
  })();
}

module.exports = {
  initTracing,
  tracingMiddleware,
  createSpan,
  generateId
};
