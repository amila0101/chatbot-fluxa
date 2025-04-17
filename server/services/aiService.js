const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { createSpan } = require('../utils/tracing');

exports.getResponse = async (message) => {
  // In test environment, return a mock response
  if (process.env.NODE_ENV === 'test') {
    return `Test response for: ${message}`;
  }

  // Create a span for the AI API call
  return createSpan('openai.completion', async (span) => {
    try {
      // Add attributes to the span
      span.setAttribute('message.length', message.length);
      span.setAttribute('model', 'gpt-3.5-turbo');

      // Log the API call
      logger.info('Calling OpenAI API', {
        messageLength: message.length,
        model: 'gpt-3.5-turbo'
      });

      const startTime = Date.now();

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const duration = Date.now() - startTime;
      const content = response.data.choices[0].message.content;

      // Add more attributes to the span
      span.setAttribute('response.length', content.length);
      span.setAttribute('response.duration_ms', duration);

      // Log the successful response
      logger.info('OpenAI API response received', {
        duration,
        responseLength: content.length,
        model: 'gpt-3.5-turbo'
      });

      return content;
    } catch (error) {
      // Log the error
      logger.error(`Error calling OpenAI API: ${error.message}`, {
        error: error.response?.data || error.message,
        stack: error.stack
      });

      // Add error details to the span
      span.setAttribute('error', true);
      span.setAttribute('error.message', error.message);
      span.setAttribute('error.type', error.name);

      throw new Error('Failed to get AI response');
    }
  });
};