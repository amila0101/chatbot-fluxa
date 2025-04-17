const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  // CI-specific configuration
  video: false,
  screenshotOnRunFailure: false,
  trashAssetsBeforeRuns: true,
  chromeWebSecurity: false,

  component: {
    // Use component testing mode instead of e2e
    // This doesn't require a server to be running
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      // Use a simple static server that serves the fixtures directory
      webpackConfig: {
        devServer: {
          static: {
            directory: path.join(__dirname, 'cypress/fixtures'),
          },
          port: 8080,
        },
      },
    },
    specPattern: 'cypress/e2e/basic.cy.js',
    supportFile: 'cypress/support/basic.js',
    indexHtmlFile: 'cypress/fixtures/test.html',
  },

  // Increase timeouts
  defaultCommandTimeout: 5000,
  requestTimeout: 5000,
  responseTimeout: 5000,
  pageLoadTimeout: 10000,

  // Override the testFiles setting to use our basic test
  testFiles: 'cypress/e2e/basic.cy.js',

  // Override the baseUrl to use the file:// protocol
  baseUrl: `file://${path.join(__dirname, 'cypress/fixtures/test.html')}`,
});
