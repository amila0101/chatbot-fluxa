const ChatMessage = require('../models/ChatMessage');
const aiService = require('../services/aiService');

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Get response from AI service
    const aiResponse = await aiService.getResponse(message);
    
    // Save the conversation to database
    await ChatMessage.create({
      userMessage: message,
      botResponse: aiResponse,
      timestamp: new Date()
    });

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in chat handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 