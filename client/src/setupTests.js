import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock Gemini API
jest.mock('./services/geminiService', () => ({
  generateGeminiResponse: jest.fn().mockImplementation(async (prompt) => {
    // Return a safe response that doesn't contain the API key
    return 'This is a mocked response for: ' + prompt;
  })
}));

// Mock environment variables
process.env.REACT_APP_GEMINI_API_KEY = 'test-api-key';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button'
  },
  AnimatePresence: ({ children }) => children
}));



