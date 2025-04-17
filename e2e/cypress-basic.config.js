const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // CI-specific configuration
  video: false,
  screenshotOnRunFailure: false,
  trashAssetsBeforeRuns: true,
  
  e2e: {
    // Use a dummy URL that won't be accessed
    baseUrl: 'http://localhost:8000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      console.log('Using basic configuration');
      return config;
    },
    specPattern: 'cypress/e2e/basic.cy.js',
    supportFile: 'cypress/support/basic.js',
    experimentalRunAllSpecs: false,
  },
  // Disable any network requests
  blockHosts: ['*'],
  // Increase timeouts
  defaultCommandTimeout: 5000,
  requestTimeout: 5000,
  responseTimeout: 5000,
  pageLoadTimeout: 10000,
});
