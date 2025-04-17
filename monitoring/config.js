require('dotenv').config();

module.exports = {
  // Environment settings
  environment: process.env.NODE_ENV || 'development',
  
  // Base URLs for different environments
  baseUrls: {
    development: {
      api: 'http://localhost:5000/api',
      web: 'http://localhost:3000'
    },
    staging: {
      api: process.env.STAGING_API_URL || 'https://staging-api.chatbot-fluxa.com/api',
      web: process.env.STAGING_WEB_URL || 'https://staging.chatbot-fluxa.com'
    },
    production: {
      api: process.env.PRODUCTION_API_URL || 'https://api.chatbot-fluxa.com/api',
      web: process.env.PRODUCTION_WEB_URL || 'https://chatbot-fluxa.com'
    }
  },
  
  // Test settings
  testSettings: {
    timeout: 30000, // 30 seconds
    retries: 2,
    interval: 5 * 60 * 1000, // 5 minutes in milliseconds
    screenshotOnFailure: true,
    screenshotDir: './screenshots',
    logDir: './logs'
  },
  
  // Monitoring settings
  monitoring: {
    alertThreshold: 2, // Number of consecutive failures before alerting
    notificationChannels: ['email', 'slack'],
    email: {
      recipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(','),
      from: process.env.ALERT_EMAIL_FROM || 'monitoring@chatbot-fluxa.com'
    },
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || '#monitoring-alerts'
    }
  },
  
  // Test data
  testData: {
    chat: {
      validMessages: [
        'Hello, how are you?',
        'Tell me about artificial intelligence',
        'What is the weather like today?'
      ],
      invalidMessages: [
        '',
        ' ',
        null
      ]
    },
    admin: {
      validToken: process.env.TEST_ADMIN_TOKEN || 'test-admin-token',
      invalidToken: 'invalid-token'
    }
  },
  
  // Performance thresholds (in milliseconds)
  performanceThresholds: {
    healthCheck: 500,
    chatResponse: 3000,
    pageLoad: 2000
  }
};
