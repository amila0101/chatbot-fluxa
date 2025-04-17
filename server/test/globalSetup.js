// Global setup for Jest tests
const mongoose = require('mongoose');

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DISABLE_TRACING = 'true';

// Mock mongoose connection
mongoose.connect = function() { return Promise.resolve(); };
mongoose.connection = {
  readyState: 1,
  collections: {},
  dropDatabase: function() { return Promise.resolve(); },
  close: function() { return Promise.resolve(); },
  on: function() {},
  once: function() {}
};

module.exports = async () => {
  // Log setup
  console.log('Connected to the mock database');

  // Store mock URI in global variable
  global.__MONGO_URI__ = 'mongodb://mock:27017/test';
};
