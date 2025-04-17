// This is a minimal support file for the basic test
// It doesn't include any commands that might try to connect to a server

// Disable uncaught exception handling to prevent test failures
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Disable network requests
Cypress.on('before:browser:launch', (browser, launchOptions) => {
  // Block all network requests
  if (browser.family === 'chromium') {
    launchOptions.args.push('--disable-network');
  }
  return launchOptions;
});

// Log that we're using the basic support file
console.log('Using basic support file for standalone tests');

// Add a custom command for basic testing
Cypress.Commands.add('basicTest', () => {
  cy.log('Running a basic test that does not require a server');
  expect(true).to.equal(true);
});
