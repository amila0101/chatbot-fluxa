// Mock logger for tests
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn(),
  stream: {
    write: jest.fn()
  }
};

module.exports = mockLogger;
