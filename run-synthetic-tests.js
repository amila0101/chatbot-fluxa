/**
 * Run Synthetic Tests
 * 
 * This script runs the synthetic monitoring tests once and exits.
 */

const { runAllTests } = require('./synthetic-monitor');

console.log('Running synthetic monitoring tests...');

runAllTests()
  .then(success => {
    console.log(`Tests ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
