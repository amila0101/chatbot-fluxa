const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { trace, SpanStatusCode } = require('@opentelemetry/api');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const logger = require('./logger');

// Define service name for tracing
const serviceName = process.env.SERVICE_NAME || 'chatbot-server';

// Initialize tracing
function initTracing() {
  try {
    // Check if tracing is disabled
    if (process.env.DISABLE_TRACING === 'true') {
      logger.info('Tracing is disabled by configuration');
      return null;
    }

    // Create a resource that identifies your service
    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      })
    );

    // Determine which exporter to use
    let traceExporter;
    const useConsoleExporter = process.env.TRACING_CONSOLE_EXPORT === 'true' || process.env.NODE_ENV === 'development';

    if (useConsoleExporter) {
      // Use console exporter for development or when explicitly configured
      traceExporter = new ConsoleSpanExporter();
      logger.info('Using console span exporter for tracing');
    } else {
      // Use OTLP exporter for production
      try {
        traceExporter = new OTLPTraceExporter({
          url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
          headers: {},
        });
        logger.info('Using OTLP exporter for tracing', {
          endpoint: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
        });
      } catch (exporterError) {
        logger.warn('Failed to initialize OTLP exporter, falling back to console exporter', { error: exporterError });
        traceExporter = new ConsoleSpanExporter();
      }
    }

    // Create and configure the OpenTelemetry SDK
    const sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Enable all auto-instrumentations
          '@opentelemetry/instrumentation-fs': { enabled: false }, // Disable file system instrumentation to reduce noise
          '@opentelemetry/instrumentation-express': { enabled: true },
          '@opentelemetry/instrumentation-http': { enabled: true },
          '@opentelemetry/instrumentation-mongodb': { enabled: true },
        }),
      ],
    });

    // Start the SDK
    sdk.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => logger.info('Tracing terminated'))
        .catch((error) => logger.error('Error terminating tracing', { error }))
        .finally(() => process.exit(0));
    });

    logger.info('Tracing initialized successfully', { serviceName });
    return sdk;
  } catch (error) {
    logger.error('Failed to initialize tracing', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    // Continue without tracing
    return null;
  }
}

// Create a middleware to add trace context to requests
function tracingMiddleware(req, res, next) {
  try {
    const currentSpan = trace.getActiveSpan();
    if (currentSpan) {
      // Add trace ID to request object for logging
      const spanContext = currentSpan.spanContext();
      req.traceId = spanContext.traceId;
      req.spanId = spanContext.spanId;

      // Add trace ID to response headers for client-side correlation
      res.setHeader('X-Trace-Id', req.traceId);
      res.setHeader('X-Span-Id', req.spanId);
    } else {
      // Generate a random trace ID if no active span
      req.traceId = generateRandomId();
      res.setHeader('X-Trace-Id', req.traceId);
    }
  } catch (error) {
    // If tracing fails, generate a random trace ID
    logger.debug('Error in tracing middleware', { error: error.message });
    req.traceId = generateRandomId();
    res.setHeader('X-Trace-Id', req.traceId);
  }
  next();
}

// Helper function to generate a random ID for tracing when OpenTelemetry is not available
function generateRandomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to create a new span
function createSpan(name, fn) {
  try {
    const tracer = trace.getTracer(serviceName);
    return tracer.startActiveSpan(name, async (span) => {
      try {
        const result = await fn(span);
        span.end();
        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
        throw error;
      }
    });
  } catch (error) {
    // If tracing is not initialized or fails, just run the function without tracing
    logger.debug(`Tracing not available for span: ${name}`, { error: error.message });
    return fn({ setAttribute: () => {}, recordException: () => {}, setStatus: () => {} });
  }
}

module.exports = {
  initTracing,
  tracingMiddleware,
  createSpan,
};
