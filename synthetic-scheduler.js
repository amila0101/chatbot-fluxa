/**
 * Synthetic Monitoring Scheduler
 * 
 * This script schedules the synthetic monitoring tests to run at regular intervals.
 */

const cron = require('node-cron');
const { runAllTests } = require('./synthetic-monitor');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file path
const logFile = path.join(logDir, 'scheduler.log');

/**
 * Simple logging function
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };
  
  // Log to console
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  if (Object.keys(data).length > 0) {
    console.log(JSON.stringify(data, null, 2));
  }
  
  // Append to log file
  fs.appendFileSync(
    logFile, 
    JSON.stringify(logEntry) + '\n',
    { encoding: 'utf8' }
  );
}

// Schedule configuration
const schedules = {
  // Run every 5 minutes
  default: '*/5 * * * *'
};

/**
 * Run the scheduled tests
 */
async function runScheduledTests() {
  const runId = `scheduled-${Date.now()}`;
  log('info', `Running scheduled tests`, { runId });
  
  try {
    const success = await runAllTests();
    
    log('info', `Scheduled tests completed`, {
      runId,
      success
    });
    
    return success;
  } catch (error) {
    log('error', `Error running scheduled tests`, {
      runId,
      error: error.message
    });
    
    return false;
  }
}

/**
 * Start the scheduler
 */
function startScheduler() {
  const schedule = process.env.TEST_SCHEDULE || schedules.default;
  
  log('info', `Starting synthetic monitoring scheduler with schedule: ${schedule}`);
  
  // Schedule the tests
  cron.schedule(schedule, runScheduledTests);
  
  // Run immediately on startup
  runScheduledTests();
  
  log('info', 'Scheduler running. Press Ctrl+C to exit.');
}

// Start the scheduler if this file is executed directly
if (require.main === module) {
  startScheduler();
}

module.exports = {
  startScheduler,
  runScheduledTests
};
