const ChatMessage = require('../models/chatmessage');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const { createSpan } = require('../utils/tracing');

exports.handleChat = async (req, res) => {
  // Create a new span for this request
  return createSpan('handleChat', async (span) => {
    try {
      const { message } = req.body;

      // Add attributes to the span
      span.setAttribute('message.length', message?.length || 0);
      span.setAttribute('user.ip', req.ip);

      // Log the incoming request
      logger.info('Chat request received', {
        messageLength: message?.length || 0,
        ip: req.ip,
        traceId: req.traceId || 'no-trace-id'
      });

      // Validate input
      if (!message) {
        logger.warn('Empty message received', { ip: req.ip, traceId: req.traceId });
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get response from AI service (wrapped in a child span)
      const aiResponse = await createSpan('aiService.getResponse', async (childSpan) => {
        childSpan.setAttribute('message.length', message.length);
        const response = await aiService.getResponse(message);
        childSpan.setAttribute('response.length', response.length);
        return response;
      });

      // Save the conversation to database (wrapped in a child span)
      await createSpan('database.saveConversation', async () => {
        await ChatMessage.create({
          userMessage: message,
          botResponse: aiResponse,
          timestamp: new Date()
        });
      });

      // Log the successful response
      logger.info('Chat response sent', {
        messageLength: message.length,
        responseLength: aiResponse.length,
        processingTime: span.duration,
        traceId: req.traceId || 'no-trace-id'
      });

      res.json({ response: aiResponse });
    } catch (error) {
      // Log the error with trace ID for correlation
      logger.error(`Error in chat handler: ${error.message}`, {
        error,
        stack: error.stack,
        traceId: req.traceId || 'no-trace-id'
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  });
};