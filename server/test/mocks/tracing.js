// Mock tracing for tests
const mockTracing = {
  initTracing: jest.fn().mockReturnValue({
    shutdown: jest.fn().mockResolvedValue(undefined)
  }),
  
  tracingMiddleware: jest.fn((req, res, next) => {
    req.traceId = 'mock-trace-id';
    res.setHeader = jest.fn();
    next();
  }),
  
  createSpan: jest.fn((name, fn) => {
    const mockSpan = {
      setAttribute: jest.fn(),
      recordException: jest.fn(),
      setStatus: jest.fn(),
      end: jest.fn()
    };
    
    return fn(mockSpan);
  })
};

module.exports = mockTracing;
