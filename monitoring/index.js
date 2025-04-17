#!/usr/bin/env node

const { program } = require('commander');
const logger = require('./utils/logger');
const config = require('./config');

// Import test classes
const HealthCheckTest = require('./synthetic-tests/health-check');
const ChatJourneyTest = require('./synthetic-tests/chat-journey');
const RateLimitTest = require('./synthetic-tests/rate-limit-test');
const AdminJourneyTest = require('./synthetic-tests/admin-journey');
const ErrorHandlingTest = require('./synthetic-tests/error-handling');

// Define available tests
const tests = {
  health: HealthCheckTest,
  chat: ChatJourneyTest,
  rateLimit: RateLimitTest,
  admin: AdminJourneyTest,
  error: ErrorHandlingTest
};

// Configure CLI
program
  .version('1.0.0')
  .description('Synthetic monitoring for Chatbot Fluxa application')
  .option('-e, --environment <env>', 'Environment to test (development, staging, production)', config.environment)
  .option('-t, --test <test>', 'Specific test to run (health, chat, rateLimit, admin, error)')
  .option('-a, --all', 'Run all tests')
  .option('-v, --verbose', 'Enable verbose logging')
  .parse(process.argv);

const options = program.opts();

// Set environment
if (options.environment) {
  config.environment = options.environment;
  process.env.NODE_ENV = options.environment;
}

// Set log level
if (options.verbose) {
  process.env.LOG_LEVEL = 'debug';
}

// Main function to run tests
async function runTests() {
  logger.info(`Starting synthetic monitoring in ${config.environment} environment`);
  
  const startTime = Date.now();
  const results = [];
  
  // Determine which tests to run
  let testsToRun = [];
  
  if (options.all) {
    testsToRun = Object.values(tests);
  } else if (options.test && tests[options.test]) {
    testsToRun = [tests[options.test]];
  } else {
    // Default to health check if no test specified
    testsToRun = [tests.health];
  }
  
  // Run each test
  for (const TestClass of testsToRun) {
    const test = new TestClass();
    const testStartTime = Date.now();
    
    try {
      const success = await test.run();
      const duration = Date.now() - testStartTime;
      
      results.push({
        name: test.name,
        success,
        duration
      });
    } catch (error) {
      logger.error(`Unhandled error in test ${test.name}`, error);
      
      results.push({
        name: test.name,
        success: false,
        duration: Date.now() - testStartTime,
        error: error.message
      });
    }
  }
  
  // Log summary
  const totalDuration = Date.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  logger.info('Synthetic monitoring complete', {
    environment: config.environment,
    totalTests: results.length,
    successCount,
    failureCount,
    totalDuration
  });
  
  // Log detailed results
  results.forEach(result => {
    const status = result.success ? 'PASS' : 'FAIL';
    logger.info(`${status}: ${result.name} (${result.duration}ms)`);
  });
  
  // Exit with appropriate code
  process.exit(failureCount > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  logger.error('Unhandled error in test runner', error);
  process.exit(1);
});
