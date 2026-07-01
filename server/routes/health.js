'use strict';
const express  = require('express');
const mongoose = require('mongoose');
const router   = express.Router();

/**
 * GET /api/health
 * Used by CI wait-on and monitoring to confirm the server is alive.
 * Always returns HTTP 200 so wait-on succeeds even without MongoDB.
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected 1=connected 2=connecting 3=disconnecting
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';

  res.status(200).json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
    model:     process.env.AI_MODEL || 'gemini',
    db:        dbStatus,
    version:   '2.1.0',
  });
});

module.exports = router;
