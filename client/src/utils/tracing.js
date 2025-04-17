import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

// Define service name for tracing
const serviceName = 'chatbot-client';

// Initialize tracing
export function initTracing() {
  try {
    // Create a trace exporter
    const traceExporter = new OTLPTraceExporter({
      // If you're using a collector like Jaeger, specify the URL
      // Default is http://localhost:4318/v1/traces
      url: process.env.REACT_APP_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: {},
    });

    // Create a resource that identifies your service
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.REACT_APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    });

    // Create and configure the OpenTelemetry SDK
    const provider = new WebTracerProvider({
      resource,
    });

    // Use batch processing for better performance
    provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

    // Register the provider
    provider.register({
      contextManager: new ZoneContextManager(),
    });

    // Get auto-instrumentations
    const instrumentations = getWebAutoInstrumentations({
      // Enable all auto-instrumentations
      '@opentelemetry/instrumentation-document-load': { enabled: true },
      '@opentelemetry/instrumentation-fetch': { enabled: true },
      '@opentelemetry/instrumentation-xml-http-request': { enabled: true },
    });

    // Register instrumentations
    instrumentations.forEach(instrumentation => {
      instrumentation.setTracerProvider(provider);
    });

    console.log('Tracing initialized', { serviceName });
    return provider;
  } catch (error) {
    console.error('Failed to initialize tracing', error);
    return null;
  }
}

// Helper function to create a new span
export function createSpan(name, fn) {
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
}

// Helper function to get the current trace ID
export function getCurrentTraceId() {
  const currentSpan = trace.getActiveSpan();
  return currentSpan ? currentSpan.spanContext().traceId : null;
}

// Initialize tracing when this module is imported
initTracing();
