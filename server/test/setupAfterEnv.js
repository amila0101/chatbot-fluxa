// Setup file that runs after the test environment is set up
const mongoose = require('mongoose');

// Increase the timeout for all tests
jest.setTimeout(30000);

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clear the database before each test
beforeEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

// Close any open handles after all tests
afterAll(async () => {
  // Ensure all pending timeouts are cleared
  jest.useRealTimers();
});
