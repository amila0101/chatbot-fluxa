import { getCurrentTraceId } from './tracing';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Current log level based on environment
const currentLogLevel = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.INFO 
  : LOG_LEVELS.DEBUG;

// Base logger function
const log = (level, message, data = {}) => {
  // Only log if the level is less than or equal to the current log level
  if (level > currentLogLevel) return;

  // Get the current trace ID for correlation
  const traceId = getCurrentTraceId();
  
  // Add trace ID and timestamp to the log data
  const logData = {
    ...data,
    traceId: traceId || 'no-trace-id',
    timestamp: new Date().toISOString(),
  };

  // Format the log message
  const formattedMessage = `[${logData.timestamp}] [${getLevelName(level)}] ${message}`;

  // Log to console with appropriate method
  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(formattedMessage, logData);
      break;
    case LOG_LEVELS.WARN:
      console.warn(formattedMessage, logData);
      break;
    case LOG_LEVELS.INFO:
      console.info(formattedMessage, logData);
      break;
    case LOG_LEVELS.DEBUG:
      console.debug(formattedMessage, logData);
      break;
    default:
      console.log(formattedMessage, logData);
  }

  // In production, you might want to send logs to a centralized service
  if (process.env.NODE_ENV === 'production') {
    sendLogToServer(level, message, logData);
  }
};

// Helper function to get level name
const getLevelName = (level) => {
  switch (level) {
    case LOG_LEVELS.ERROR:
      return 'ERROR';
    case LOG_LEVELS.WARN:
      return 'WARN';
    case LOG_LEVELS.INFO:
      return 'INFO';
    case LOG_LEVELS.DEBUG:
      return 'DEBUG';
    default:
      return 'UNKNOWN';
  }
};

// Function to send logs to a centralized service
const sendLogToServer = (level, message, data) => {
  // This is a placeholder for sending logs to a server
  // In a real application, you would implement this to send logs to a centralized service
  // For example, using fetch to send logs to your backend
  
  // Example implementation:
  /*
  fetch('/api/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      level: getLevelName(level),
      message,
      ...data,
    }),
  }).catch(err => {
    // Don't log this error to avoid infinite loops
    console.error('Failed to send log to server:', err);
  });
  */
};

// Export logger methods
const logger = {
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
};

export default logger;
