const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/', rateLimiter, chatController.handleChat);

module.exports = router;