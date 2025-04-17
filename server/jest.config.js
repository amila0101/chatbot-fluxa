module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test patterns
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // Coverage configuration
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js'
  ],

  // Timeout settings
  testTimeout: 30000,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles (like database connections)
  detectOpenHandles: true,

  // Limit workers to avoid memory issues
  maxWorkers: 2,

  // Verbose output for debugging
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Global setup/teardown
  globalSetup: './test/globalSetup.js',
  globalTeardown: './test/globalTeardown.js',

  // Setup files
  setupFiles: ['./test/setupJestMocks.js'],
  setupFilesAfterEnv: ['./test/setupAfterEnv.js']
};
