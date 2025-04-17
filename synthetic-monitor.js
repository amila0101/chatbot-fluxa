/**
 * Synthetic Monitoring Script
 * 
 * This script performs synthetic monitoring of critical API endpoints
 * and can be run manually or scheduled via cron.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file path
const logFile = path.join(logDir, 'synthetic-monitor.log');

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

/**
 * Configuration for the synthetic monitoring
 */
const config = {
  baseUrl: process.env.API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  retries: 2,
  tests: [
    {
      name: 'Health Check',
      endpoint: '/health',
      method: 'GET',
      expectedStatus: 200,
      validate: (data) => data && data.status === 'ok'
    },
    {
      name: 'Not Found',
      endpoint: '/non-existent-endpoint',
      method: 'GET',
      expectedStatus: 404,
      validate: () => true // We expect a 404 error
    }
  ]
};

/**
 * Run a single test
 * @param {Object} test - Test configuration
 * @returns {Promise<boolean>} - Test result
 */
async function runTest(test) {
  log('info', `Running test: ${test.name}`);
  
  const url = `${config.baseUrl}${test.endpoint}`;
  const startTime = Date.now();
  
  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      if (attempt > 0) {
        log('info', `Retry attempt ${attempt}/${config.retries} for test: ${test.name}`);
      }
      
      const response = await axios({
        method: test.method,
        url,
        data: test.data,
        headers: test.headers,
        timeout: config.timeout,
        validateStatus: () => true // Don't throw on non-2xx status codes
      });
      
      const duration = Date.now() - startTime;
      
      // Check status code
      if (response.status !== test.expectedStatus) {
        throw new Error(`Expected status ${test.expectedStatus}, got ${response.status}`);
      }
      
      // Validate response data
      if (test.validate && !test.validate(response.data)) {
        throw new Error(`Response validation failed: ${JSON.stringify(response.data)}`);
      }
      
      log('info', `Test passed: ${test.name}`, {
        duration,
        status: response.status,
        url
      });
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (attempt === config.retries) {
        log('error', `Test failed: ${test.name}`, {
          error: error.message,
          duration,
          url
        });
        return false;
      }
    }
  }
}

/**
 * Run all tests
 * @returns {Promise<boolean>} - Overall test result
 */
async function runAllTests() {
  log('info', 'Starting synthetic monitoring tests');
  
  const results = {};
  let allPassed = true;
  
  for (const test of config.tests) {
    const success = await runTest(test);
    results[test.name] = success;
    
    if (!success) {
      allPassed = false;
    }
  }
  
  // Log summary
  log('info', 'Synthetic monitoring tests completed', {
    results,
    allPassed
  });
  
  return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log('error', 'Unhandled error in tests', { error: error.message });
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  runTest
};
