const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

/**
 * Send notification about test failures
 * @param {string} testName - Name of the test that failed
 * @param {string} environment - Environment where the test was run
 * @param {Error} error - Error object
 * @param {Object} metadata - Additional metadata about the failure
 */
async function sendNotification(testName, environment, error, metadata = {}) {
  const timestamp = new Date().toISOString();
  const errorMessage = error.message || 'Unknown error';
  
  // Prepare notification message
  const message = {
    title: `❌ Synthetic Test Failure: ${testName}`,
    environment,
    timestamp,
    error: errorMessage,
    details: metadata,
    runId: process.env.RUN_ID || 'manual',
    url: metadata.url || 'N/A'
  };
  
  logger.error(`Test failure notification: ${testName}`, message);
  
  // Send notifications to configured channels
  const channels = config.monitoring.notificationChannels || [];
  
  for (const channel of channels) {
    try {
      switch (channel) {
        case 'slack':
          await sendSlackNotification(message);
          break;
        case 'email':
          await sendEmailNotification(message);
          break;
        default:
          logger.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (notificationError) {
      logger.error(`Failed to send ${channel} notification`, notificationError);
    }
  }
}

/**
 * Send notification to Slack
 * @param {Object} message - Notification message
 */
async function sendSlackNotification(message) {
  const { webhook, channel } = config.monitoring.slack;
  
  if (!webhook) {
    logger.warn('Slack webhook URL not configured');
    return;
  }
  
  try {
    const slackMessage = {
      channel,
      username: 'Synthetic Monitoring',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          color: '#FF0000',
          title: message.title,
          text: `*Error:* ${message.error}`,
          fields: [
            {
              title: 'Environment',
              value: message.environment,
              short: true
            },
            {
              title: 'Timestamp',
              value: message.timestamp,
              short: true
            },
            {
              title: 'URL',
              value: message.url,
              short: true
            },
            {
              title: 'Run ID',
              value: message.runId,
              short: true
            }
          ],
          footer: 'Chatbot Fluxa Synthetic Monitoring'
        }
      ]
    };
    
    await axios.post(webhook, slackMessage);
    logger.info('Slack notification sent successfully');
  } catch (error) {
    logger.error('Failed to send Slack notification', error);
    throw error;
  }
}

/**
 * Send notification via email
 * @param {Object} message - Notification message
 */
async function sendEmailNotification(message) {
  // In a real implementation, this would use a service like SendGrid, AWS SES, etc.
  // For this example, we'll just log that we would send an email
  const { recipients, from } = config.monitoring.email;
  
  if (!recipients || recipients.length === 0) {
    logger.warn('No email recipients configured');
    return;
  }
  
  logger.info(`Would send email notification to ${recipients.join(', ')} from ${from}`, message);
  
  // Example implementation with a hypothetical email service:
  /*
  const emailService = require('./email-service');
  await emailService.sendEmail({
    from,
    to: recipients,
    subject: message.title,
    html: `
      <h1>${message.title}</h1>
      <p><strong>Environment:</strong> ${message.environment}</p>
      <p><strong>Timestamp:</strong> ${message.timestamp}</p>
      <p><strong>Error:</strong> ${message.error}</p>
      <p><strong>URL:</strong> ${message.url}</p>
      <p><strong>Run ID:</strong> ${message.runId}</p>
      <h2>Details:</h2>
      <pre>${JSON.stringify(message.details, null, 2)}</pre>
    `
  });
  */
}

module.exports = {
  sendNotification
};
