// Mock server for testing
const express = require('express');
const cors = require('cors');

// Create a mock app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock health route
app.use('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'test-model' });
});

// Mock chat route
let requestCounter = 0;
app.use('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Simulate rate limiting
  requestCounter++;
  if (requestCounter > 5) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  res.json({ response: `Test response for: ${message}` });
});

// Mock admin route
app.use('/api/admin', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({ status: 'authenticated' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
