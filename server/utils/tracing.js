const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { trace } = require('@opentelemetry/api');
const logger = require('./logger');

// Define service name for tracing
const serviceName = process.env.SERVICE_NAME || 'chatbot-server';

// Initialize tracing
function initTracing() {
  try {
    // Create a trace exporter
    const traceExporter = new OTLPTraceExporter({
      // If you're using a collector like Jaeger, specify the URL
      // Default is http://localhost:4318/v1/traces
      url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: {},
    });

    // Create a resource that identifies your service
    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      })
    );

    // Create and configure the OpenTelemetry SDK
    const sdk = new opentelemetry.NodeSDK({
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

    logger.info('Tracing initialized', { serviceName });
    return sdk;
  } catch (error) {
    logger.error('Failed to initialize tracing', { error });
    return null;
  }
}

// Create a middleware to add trace context to requests
function tracingMiddleware(req, res, next) {
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    // Add trace ID to request object for logging
    req.traceId = currentSpan.spanContext().traceId;
    
    // Add trace ID to response headers for client-side correlation
    res.setHeader('X-Trace-Id', req.traceId);
  }
  next();
}

// Helper function to create a new span
function createSpan(name, fn) {
  const tracer = trace.getTracer(serviceName);
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn(span);
      span.end();
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
      span.end();
      throw error;
    }
  });
}

module.exports = {
  initTracing,
  tracingMiddleware,
  createSpan,
};
