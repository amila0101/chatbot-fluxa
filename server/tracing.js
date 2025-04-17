// This file should be required at the very beginning of the application
// to ensure tracing is initialized before any other modules are loaded

// Try to use OpenTelemetry tracing, fall back to simple tracing if it fails
let tracingModule;

try {
  // Try to load the OpenTelemetry tracing module
  tracingModule = require('./utils/tracing');

  // Initialize tracing if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    const sdk = tracingModule.initTracing();
    if (!sdk) {
      // If OpenTelemetry initialization fails, fall back to simple tracing
      console.log('OpenTelemetry initialization failed, falling back to simple tracing');
      tracingModule = require('./utils/simple-tracing');
      tracingModule.initTracing();
    }
  }
} catch (error) {
  // If OpenTelemetry is not available, use simple tracing
  console.error('Error loading OpenTelemetry:', error.message);
  tracingModule = require('./utils/simple-tracing');

  // Initialize simple tracing if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    tracingModule.initTracing();
  }
}

// Export the tracing module for use in other files
module.exports = tracingModule;
