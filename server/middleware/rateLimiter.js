// Simple in-memory rate limiter
const requestCounts = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // Maximum requests per minute

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Initialize or clean up old entries
  if (!requestCounts[ip] || now - requestCounts[ip].timestamp > WINDOW_MS) {
    requestCounts[ip] = {
      count: 0,
      timestamp: now
    };
  }
  
  // Increment request count
  requestCounts[ip].count++;
  
  // Check if rate limit exceeded
  if (requestCounts[ip].count > MAX_REQUESTS) {
    return res.status(429).json({ 
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil((requestCounts[ip].timestamp + WINDOW_MS - now) / 1000)
    });
  }
  
  next();
};

module.exports = rateLimiter;
