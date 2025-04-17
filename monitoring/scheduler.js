#!/usr/bin/env node

const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config');

// Define test schedules
const schedules = {
  health: '*/5 * * * *',      // Every 5 minutes
  chat: '*/15 * * * *',       // Every 15 minutes
  rateLimit: '0 */2 * * *',   // Every 2 hours
  admin: '0 */4 * * *',       // Every 4 hours
  error: '0 */6 * * *'        // Every 6 hours
};

// Function to run a test
function runTest(testName) {
  return new Promise((resolve, reject) => {
    logger.info(`Scheduled run of ${testName} test`);
    
    const runId = `scheduled-${Date.now()}`;
    const args = ['index.js', '--test', testName, '--environment', config.environment];
    
    if (process.env.LOG_LEVEL === 'debug') {
      args.push('--verbose');
    }
    
    const child = spawn('node', args, {
      cwd: __dirname,
      env: { ...process.env, RUN_ID: runId }
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        logger.info(`${testName} test completed successfully`, { runId });
        resolve();
      } else {
        logger.error(`${testName} test failed with code ${code}`, { runId, stderr });
        reject(new Error(`Test failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      logger.error(`Error running ${testName} test`, { runId, error: error.message });
      reject(error);
    });
  });
}

// Start the scheduler
function startScheduler() {
  logger.info(`Starting synthetic monitoring scheduler in ${config.environment} environment`);
  
  // Schedule each test
  Object.entries(schedules).forEach(([testName, schedule]) => {
    logger.info(`Scheduling ${testName} test: ${schedule}`);
    
    cron.schedule(schedule, async () => {
      try {
        await runTest(testName);
      } catch (error) {
        logger.error(`Scheduled ${testName} test failed`, error);
      }
    });
  });
  
  // Run all tests immediately on startup
  logger.info('Running all tests on startup');
  
  Promise.all(Object.keys(schedules).map(testName => 
    runTest(testName).catch(error => {
      logger.error(`Initial ${testName} test failed`, error);
    })
  )).then(() => {
    logger.info('Initial test run complete');
  });
  
  // Keep the process running
  logger.info('Scheduler running. Press Ctrl+C to exit.');
}

// Start the scheduler if this file is executed directly
if (require.main === module) {
  startScheduler();
}

module.exports = { startScheduler, runTest };
