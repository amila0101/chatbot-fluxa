// Setup Jest mocks
const mockLogger = require('./mocks/logger');
const mockTracing = require('./mocks/tracing');

// Mock the logger module
jest.mock('../utils/logger', () => mockLogger);

// Mock the tracing module
jest.mock('../tracing', () => mockTracing);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.AI_API_KEY = 'test-api-key';
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.LOG_LEVEL = 'error';
process.env.LOG_DIR = 'logs';
process.env.SERVICE_NAME = 'chatbot-server-test';
process.env.DISABLE_TRACING = 'true';
