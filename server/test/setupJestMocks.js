// Setup Jest mocks

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.AI_API_KEY = 'test-api-key';
process.env.GEMINI_API_KEY = 'test-api-key';

