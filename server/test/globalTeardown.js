// Global teardown for Jest tests
const mongoose = require('mongoose');

module.exports = async () => {
  // Log teardown
  console.log('Disconnected from the mock database');

  // Clean up global variables
  delete global.__MONGO_URI__;
};
