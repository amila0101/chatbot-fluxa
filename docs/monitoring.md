# Monitoring and Distributed Tracing Guide

This document provides an overview of the monitoring and distributed tracing infrastructure implemented in the Chatbot Fluxa application.

## Overview

The monitoring infrastructure consists of several components:

1. **Structured Logging**: Using Winston on the server and a custom logger on the client
2. **Distributed Tracing**: Using OpenTelemetry to trace requests across services
3. **Metrics Collection**: Collecting performance metrics from both client and server
4. **Monitoring Dashboard**: A visual interface for monitoring system health

## Structured Logging

### Server-side Logging

The server uses Winston for structured logging with the following features:

- Multiple log levels (error, warn, info, http, debug)
- JSON-formatted logs for machine readability
- Console output for development
- File output with daily rotation for production
- HTTP request logging with Morgan integration

### Client-side Logging

The client uses a custom logger with the following features:

- Multiple log levels (error, warn, info, debug)
- Correlation with trace IDs for distributed tracing
- Console output for development
- Optional server-side logging for production

## Distributed Tracing

The application uses OpenTelemetry for distributed tracing with the following features:

### Server-side Tracing

- Automatic instrumentation of Express, HTTP, and MongoDB
- Custom spans for business logic
- Trace context propagation
- Correlation with logs via trace IDs

### Client-side Tracing

- Automatic instrumentation of fetch, XMLHttpRequest, and document load
- Custom spans for user interactions and API calls
- Correlation with server-side traces
- Performance metrics collection

## Metrics Collection

The application collects various metrics to monitor system health:

### Server Metrics

- Request count and error rate
- API latency
- CPU and memory usage
- Database connection status
- Custom business metrics

### Client Metrics

- Page load time
- API call latency
- User interactions
- Client-side errors
- Custom business metrics

## Monitoring Dashboard

The application includes a monitoring dashboard with the following features:

- Real-time metrics visualization
- System health status
- Error rate monitoring
- API latency tracking
- Log viewer

## Configuration

### Environment Variables

Server-side environment variables:

```
# Logging Configuration
LOG_LEVEL=info
LOG_DIR=logs

# Tracing Configuration
SERVICE_NAME=chatbot-server
OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Metrics Configuration
ENABLE_METRICS=true
METRICS_PORT=9464
```

Client-side environment variables:

```
REACT_APP_OTLP_ENDPOINT=http://localhost:4318/v1/traces
REACT_APP_LOG_LEVEL=info
```

## Integration with External Services

The monitoring infrastructure can be integrated with external services:

### Logging Services

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Graylog
- Papertrail
- CloudWatch Logs

### Tracing Services

- Jaeger
- Zipkin
- Datadog APM
- New Relic

### Metrics Services

- Prometheus
- Grafana
- Datadog
- New Relic

## Usage Examples

### Adding Custom Spans

```javascript
// Server-side
const { createSpan } = require('./utils/tracing');

async function processData(data) {
  return createSpan('processData', async (span) => {
    span.setAttribute('data.size', data.length);
    // Process data
    return result;
  });
}

// Client-side
import { createSpan } from './utils/tracing';

async function fetchData() {
  return createSpan('fetchData', async (span) => {
    span.setAttribute('user.id', userId);
    // Fetch data
    return result;
  });
}
```

### Logging with Correlation

```javascript
// Server-side
const logger = require('./utils/logger');

app.get('/api/data', (req, res) => {
  logger.info('Processing data request', {
    userId: req.user.id,
    traceId: req.traceId
  });
  // Process request
});

// Client-side
import logger from './utils/logger';

function handleClick() {
  logger.info('User clicked button', {
    buttonId: 'submit',
    formData: { /* ... */ }
  });
  // Handle click
}
```

## Troubleshooting

### Common Issues

1. **Missing Trace Context**: Ensure all services are properly instrumented and propagating trace context.
2. **High Log Volume**: Adjust log levels to reduce noise in production.
3. **Performance Impact**: Monitor the overhead of tracing and adjust sampling rate if needed.
4. **Missing Metrics**: Check that metrics collection is enabled and properly configured.

### Debugging

1. Enable debug logging:
   ```
   LOG_LEVEL=debug
   ```

2. Check trace propagation:
   ```
   curl -v -H "traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01" http://localhost:5000/api/health
   ```

3. Verify metrics endpoint:
   ```
   curl http://localhost:5000/api/metrics
   ```

## Best Practices

1. **Use Structured Logging**: Always use structured logging with relevant context.
2. **Correlation IDs**: Include trace IDs in all logs for correlation.
3. **Appropriate Log Levels**: Use appropriate log levels to avoid noise.
4. **Custom Metrics**: Define custom metrics for business-specific monitoring.
5. **Regular Review**: Regularly review logs and metrics to identify issues.
6. **Alerting**: Set up alerts for critical metrics and errors.
7. **Documentation**: Keep monitoring documentation up to date.

## Future Improvements

1. **Distributed Metrics**: Implement distributed metrics collection with Prometheus.
2. **Anomaly Detection**: Implement anomaly detection for metrics.
3. **Custom Dashboards**: Create custom dashboards for specific use cases.
4. **Alerting Integration**: Integrate with alerting services like PagerDuty.
5. **Log Analysis**: Implement log analysis with ELK stack.
6. **User Monitoring**: Implement real user monitoring (RUM) for better client-side insights.
7. **Synthetic Monitoring**: Implement synthetic monitoring for critical paths.
