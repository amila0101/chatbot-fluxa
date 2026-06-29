'use strict';
/**
 * tracing.js
 * Distributed tracing via OpenTelemetry (optional).
 *
 * If the @opentelemetry/* packages are not installed, OR if DISABLE_TRACING=true
 * is set in the environment, every function degrades gracefully to a no-op so
 * the server continues to start without errors.
 */

const logger = require('./logger');

// ─── Feature flag ─────────────────────────────────────────────────────────────
const tracingDisabled =
  process.env.DISABLE_TRACING === 'true' ||
  process.env.NODE_ENV === 'test';

// ─── No-op span used as fallback ─────────────────────────────────────────────
const noopSpan = {
  setAttribute:    () => {},
  recordException: () => {},
  setStatus:       () => {},
  end:             () => {},
};

// ─── Try to load OpenTelemetry (optional peer dependency) ────────────────────
let otelTrace = null;
let SpanStatusCode = { ERROR: 2 };

if (!tracingDisabled) {
  try {
    const api = require('@opentelemetry/api');
    otelTrace = api.trace;
    SpanStatusCode = api.SpanStatusCode;
  } catch (_e) {
    logger.warn(
      'OpenTelemetry API not installed — tracing disabled. ' +
      'Run: npm install @opentelemetry/api  (in server/) to enable.'
    );
  }
}

// ─── initTracing ──────────────────────────────────────────────────────────────
function initTracing() {
  if (tracingDisabled || !otelTrace) {
    logger.info('Tracing is disabled or unavailable — skipping SDK init.');
    return null;
  }

  try {
    const { NodeSDK }                    = require('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
    const { ConsoleSpanExporter }        = require('@opentelemetry/sdk-trace-base');
    const { OTLPTraceExporter }          = require('@opentelemetry/exporter-trace-otlp-http');
    const { Resource }                   = require('@opentelemetry/resources');
    const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

    const serviceName = process.env.SERVICE_NAME || 'chatbot-server';

    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      })
    );

    const useConsole =
      process.env.TRACING_CONSOLE_EXPORT === 'true' ||
      process.env.NODE_ENV === 'development';

    let traceExporter;
    if (useConsole) {
      traceExporter = new ConsoleSpanExporter();
      logger.info('Tracing: using ConsoleSpanExporter');
    } else {
      try {
        traceExporter = new OTLPTraceExporter({
          url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
        });
      } catch (exporterErr) {
        logger.warn('OTLP exporter init failed — falling back to console', { error: exporterErr });
        traceExporter = new ConsoleSpanExporter();
      }
    }

    const sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs':      { enabled: false },
          '@opentelemetry/instrumentation-express': { enabled: true  },
          '@opentelemetry/instrumentation-http':    { enabled: true  },
          '@opentelemetry/instrumentation-mongodb': { enabled: true  },
        }),
      ],
    });

    sdk.start();

    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => logger.info('Tracing terminated'))
        .catch((err) => logger.error('Error terminating tracing', { error: err }))
        .finally(() => process.exit(0));
    });

    logger.info('Tracing initialised', { serviceName });
    return sdk;
  } catch (err) {
    logger.warn('Tracing init failed — continuing without tracing.', { error: err.message });
    return null;
  }
}

// ─── tracingMiddleware ────────────────────────────────────────────────────────
function tracingMiddleware(req, res, next) {
  try {
    if (otelTrace) {
      const currentSpan = otelTrace.getActiveSpan();
      if (currentSpan) {
        const ctx = currentSpan.spanContext();
        req.traceId = ctx.traceId;
        req.spanId  = ctx.spanId;
        res.setHeader('X-Trace-Id', req.traceId);
        res.setHeader('X-Span-Id',  req.spanId);
        return next();
      }
    }
  } catch (_e) { /* fall through */ }

  req.traceId = generateRandomId();
  res.setHeader('X-Trace-Id', req.traceId);
  next();
}

// ─── createSpan ──────────────────────────────────────────────────────────────
/**
 * Wraps an async function in a tracing span.
 * Falls back to running the function directly (with a no-op span) when
 * tracing is unavailable.
 *
 * @param {string}   name - Span name
 * @param {Function} fn   - async (span) => result
 */
function createSpan(name, fn) {
  if (!otelTrace) {
    return fn(noopSpan);
  }

  try {
    const serviceName = process.env.SERVICE_NAME || 'chatbot-server';
    const tracer = otelTrace.getTracer(serviceName);
    return tracer.startActiveSpan(name, async (span) => {
      try {
        const result = await fn(span);
        span.end();
        return result;
      } catch (err) {
        span.recordException(err);
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
        throw err;
      }
    });
  } catch (_e) {
    logger.debug(`Tracing unavailable for span: ${name}`);
    return fn(noopSpan);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

module.exports = { initTracing, tracingMiddleware, createSpan };
