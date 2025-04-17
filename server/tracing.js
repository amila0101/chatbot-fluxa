// This file should be required at the very beginning of the application
// to ensure tracing is initialized before any other modules are loaded
const { initTracing } = require('./utils/tracing');

// Initialize tracing if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initTracing();
}

// Export the tracing module for use in other files
module.exports = require('./utils/tracing');
