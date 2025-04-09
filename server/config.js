require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot',
  aiApiKey: process.env.AI_API_KEY,
}; 