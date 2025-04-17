// This is a minimal support file for the basic test
// It doesn't include any commands that might try to connect to a server

// Import cypress commands
import './commands';

// Disable uncaught exception handling to prevent test failures
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Log that we're using the basic support file
console.log('Using basic support file for standalone tests');
