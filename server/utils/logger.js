/**
 * logger.js
 * A lightweight, zero-dependency logger for the chatbot server.
 * Supports info, warn, error, and debug log levels with ISO timestamps
 * and optional structured metadata — matching all call sites in the codebase.
 *
 * Set LOG_LEVEL=debug in your .env for verbose output during development.
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr =
    meta && typeof meta === 'object' && Object.keys(meta).length > 0
      ? ' ' + JSON.stringify(meta)
      : '';
  const entry = `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}${metaStr}`;

  if (level === 'error') {
    console.error(entry);
  } else if (level === 'warn') {
    console.warn(entry);
  } else {
    console.log(entry);
  }
}

module.exports = {
  /** @param {string} message @param {object} [meta] */
  info:  (message, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.info)  log('info',  message, meta); },

  /** @param {string} message @param {object} [meta] */
  warn:  (message, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.warn)  log('warn',  message, meta); },

  /** @param {string} message @param {object} [meta] */
  error: (message, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.error) log('error', message, meta); },

  /** Only printed when LOG_LEVEL=debug. @param {string} message @param {object} [meta] */
  debug: (message, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.debug) log('debug', message, meta); },
};