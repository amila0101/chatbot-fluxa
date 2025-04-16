/**
 * Mock mongoose module for testing
 */

// Create mock functions for mongoose
const mongoose = {
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    on: jest.fn(),
    once: jest.fn(),
    close: jest.fn()
  },
  Schema: function(definition) {
    this.definition = definition;
    return this;
  },
  model: function(name, schema) {
    return {
      create: jest.fn().mockResolvedValue({
        userMessage: 'test message',
        botResponse: 'test response',
        timestamp: new Date()
      }),
      find: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      findOne: jest.fn().mockResolvedValue(null),
      updateOne: jest.fn().mockResolvedValue({ nModified: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
    };
  }
};

// Add prototype methods to Schema
mongoose.Schema.prototype.index = function() { return this; };

module.exports = mongoose;
