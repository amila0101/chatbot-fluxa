const winston = require('winston');
const { format, transports } = winston;
const path = require('path');
require('winston-daily-rotate-file');

// Define log directory
const logDir = process.env.LOG_DIR || 'logs';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define format for console logs
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.splat !== undefined ? `${info.splat}` : ''} ${info.metadata ? JSON.stringify(info.metadata) : ''}`
  )
);

// Define format for file logs (JSON)
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  format.json()
);

// Create file transports
const fileTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

const errorFileTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: fileFormat,
});

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
    fileTransport,
    errorFileTransport,
  ],
  exitOnError: false,
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
