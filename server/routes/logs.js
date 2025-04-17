const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// In-memory log storage for recent logs
const recentLogs = [];

// Maximum number of logs to keep in memory
const MAX_LOGS = 100;

// Add a log entry to the in-memory storage
const addLogEntry = (level, message, metadata = {}) => {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  recentLogs.unshift(logEntry);
  
  // Keep only the most recent logs
  if (recentLogs.length > MAX_LOGS) {
    recentLogs.pop();
  }
  
  return logEntry;
};

// Initialize with some logs
addLogEntry('info', 'Server started', { service: 'server' });
addLogEntry('info', 'Connected to database', { service: 'database' });

// Get logs
router.get('/', (req, res) => {
  try {
    // Get query parameters
    const limit = parseInt(req.query.limit) || 50;
    const level = req.query.level;
    const search = req.query.search;
    
    // Filter logs
    let filteredLogs = [...recentLogs];
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (search) {
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Limit the number of logs
    filteredLogs = filteredLogs.slice(0, limit);
    
    res.json({
      logs: filteredLogs,
      total: recentLogs.length,
      filtered: filteredLogs.length
    });
  } catch (error) {
    logger.error('Error retrieving logs', { error });
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

// Add a log entry (for testing)
router.post('/', (req, res) => {
  try {
    const { level, message, metadata } = req.body;
    
    if (!level || !message) {
      return res.status(400).json({ error: 'Level and message are required' });
    }
    
    const logEntry = addLogEntry(level, message, metadata);
    
    // Also log to the actual logger
    logger[level](message, metadata);
    
    res.status(201).json(logEntry);
  } catch (error) {
    logger.error('Error adding log entry', { error });
    res.status(500).json({ error: 'Failed to add log entry' });
  }
});

// Get log files
router.get('/files', (req, res) => {
  try {
    const logDir = process.env.LOG_DIR || 'logs';
    const logPath = path.join(process.cwd(), logDir);
    
    // Check if the log directory exists
    if (!fs.existsSync(logPath)) {
      return res.json({ files: [] });
    }
    
    // Get all log files
    const files = fs.readdirSync(logPath)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logDir, file),
        size: fs.statSync(path.join(logPath, file)).size,
        modified: fs.statSync(path.join(logPath, file)).mtime
      }));
    
    res.json({ files });
  } catch (error) {
    logger.error('Error retrieving log files', { error });
    res.status(500).json({ error: 'Failed to retrieve log files' });
  }
});

// Get a specific log file
router.get('/files/:filename', (req, res) => {
  try {
    const logDir = process.env.LOG_DIR || 'logs';
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), logDir, filename);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Log file not found' });
    }
    
    // Check if the file is a log file
    if (!filename.endsWith('.log')) {
      return res.status(400).json({ error: 'Invalid log file' });
    }
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse the log file (assuming JSON logs)
    const logs = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { level: 'unknown', message: line, timestamp: new Date().toISOString() };
        }
      });
    
    res.json({ filename, logs });
  } catch (error) {
    logger.error('Error retrieving log file', { error, filename: req.params.filename });
    res.status(500).json({ error: 'Failed to retrieve log file' });
  }
});

module.exports = router;
