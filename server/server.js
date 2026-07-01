'use strict';
require('dotenv').config();

const express = require('express');
const path    = require('path');
const cors    = require('cors');
const mongoose = require('mongoose');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection (graceful — server starts even without Mongo) ──────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot-fluxa';

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // give up quickly in dev if Mongo isn't running
  })
  .then(() => {
    console.log('[INFO] MongoDB connected:', MONGODB_URI);
  })
  .catch((err) => {
    // Don't crash the server — just warn. Chat history persistence will be skipped.
    console.warn(
      '[WARN] MongoDB not available — chat history will not be saved.',
      err.message
    );
  });

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/chat',   require('./routes/chat'));
app.use('/api/health', require('./routes/health'));
app.use('/api/admin',  require('./routes/admin'));

// ─── Serve React build in production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start listening ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Always listen — even in NODE_ENV=test — because E2E tests run the real server
// as a background process and need it to actually bind to the port.
// Unit/integration test files that import `app` directly should NOT call listen.
const server = app.listen(PORT, () => {
  console.log(`[INFO] Server running on http://localhost:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
});

// Graceful shutdown helper (used by test teardown and SIGTERM)
app.close = () => server.close();


module.exports = app;
