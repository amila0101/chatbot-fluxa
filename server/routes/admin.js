const express = require('express');
const router = express.Router();

// Simple auth middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // In a real app, you would validate the token here
  // For testing purposes, we're just checking if it exists
  next();
};

router.get('/', requireAuth, (req, res) => {
  res.json({ 
    status: 'authenticated',
    message: 'Admin access granted'
  });
});

module.exports = router;
