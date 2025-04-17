const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // CI-specific configuration
  ...(process.env.CI ? {
    video: false,
    screenshotOnRunFailure: false,
    trashAssetsBeforeRuns: true,
  } : {}),
  e2e: {
    baseUrl: 'http://localhost:5000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    experimentalRetries: true,
  },
  env: {
    apiUrl: 'http://localhost:5000/api',
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
});
