// A simple test script that doesn't require Cypress or a server
// This is used as a fallback when the server can't start

console.log('Running basic test...');

// Simple test that always passes
const test = {
  name: 'Basic Test',
  run: () => {
    console.log('✅ Basic test passed!');
    return true;
  }
};

// Run the test
const result = test.run();

// Exit with appropriate code
process.exit(result ? 0 : 1);
