const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    model: process.env.AI_MODEL || 'default'
  });
});

module.exports = router;
