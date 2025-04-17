# How to Configure AI Models

This guide explains how to configure and switch between different AI models in your Chatbot Fluxa application.

## Overview

Chatbot Fluxa supports multiple AI providers, including Google's Gemini and OpenAI. This guide will show you how to:

1. Configure API keys for different AI providers
2. Switch between AI models
3. Customize model parameters
4. Implement fallback strategies

## Configuring API Keys

### Step 1: Obtain API Keys

First, you need to obtain API keys from the AI providers you want to use:

- **Google Gemini**: Sign up at [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI**: Sign up at [OpenAI Platform](https://platform.openai.com/signup)

### Step 2: Add Keys to Environment Variables

Add your API keys to the appropriate environment files:

**For development:**

Add to `server/.env`:
```
AI_API_KEY=your_openai_api_key_here
```

Add to `client/.env`:
```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

**For production:**

Add these same environment variables to your deployment platform (Vercel, etc.).

## Switching Between AI Models

### Option 1: Server-Side Model Selection

To change the default AI model used by the server:

1. Open `server/services/aiService.js`
2. Modify the service to use your preferred model:

```javascript
// Example: Switch from OpenAI to Gemini
exports.getResponse = async (message) => {
  // Comment out or remove OpenAI implementation
  // return await callOpenAI(message);
  
  // Use Gemini implementation instead
  return await callGemini(message);
};
```

### Option 2: Client-Side Model Selection

To allow users to select different models from the UI:

1. Add a model selector component to the chat interface:

```jsx
// In client/src/Chatbot.js
const [selectedModel, setSelectedModel] = useState('gemini');

// Add this to your UI
<select 
  value={selectedModel} 
  onChange={(e) => setSelectedModel(e.target.value)}
  className={`${theme.input} ${theme.border} rounded-md p-2`}
>
  <option value="gemini">Gemini</option>
  <option value="openai">OpenAI</option>
</select>
```

2. Pass the selected model to your API calls:

```javascript
// When sending a message
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: input,
    model: selectedModel 
  }),
});
```

3. Update the server to handle model selection:

```javascript
// In server/controllers/chatController.js
exports.handleChat = async (req, res) => {
  try {
    const { message, model = 'default' } = req.body;
    
    // Get response from AI service based on selected model
    const aiResponse = await aiService.getResponse(message, model);
    
    // Rest of the function...
  } catch (error) {
    // Error handling...
  }
};
```

## Customizing Model Parameters

To customize parameters like temperature, max tokens, etc.:

1. Create a configuration file for AI models:

```javascript
// In server/config/aiModels.js
module.exports = {
  openai: {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
  gemini: {
    model: 'gemini-1.5-pro-latest',
    temperature: 0.8,
    max_output_tokens: 1000,
    top_p: 0.9,
    top_k: 40,
  }
};
```

2. Use these configurations in your AI service:

```javascript
// In server/services/aiService.js
const aiModels = require('../config/aiModels');

exports.getResponse = async (message, modelType = 'gemini') => {
  const config = aiModels[modelType];
  
  if (modelType === 'openai') {
    return await callOpenAI(message, config);
  } else if (modelType === 'gemini') {
    return await callGemini(message, config);
  } else {
    throw new Error(`Unsupported model type: ${modelType}`);
  }
};
```

## Implementing Fallback Strategies

To ensure reliability, implement fallback strategies when a primary AI service fails:

```javascript
// In server/services/aiService.js
exports.getResponse = async (message, modelType = 'gemini') => {
  try {
    // Try primary model first
    if (modelType === 'gemini') {
      return await callGemini(message);
    } else {
      return await callOpenAI(message);
    }
  } catch (error) {
    console.error(`Error with ${modelType} model:`, error);
    
    // Fallback to alternative model
    try {
      console.log(`Falling back to alternative model...`);
      return modelType === 'gemini' 
        ? await callOpenAI(message) 
        : await callGemini(message);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return 'I apologize, but I am currently unable to process your request. Please try again later.';
    }
  }
};
```

## Testing Your Configuration

After making changes, test your configuration:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Send test messages using different models
3. Check the server logs for any errors
4. Verify responses are coming from the expected model

## Advanced Configuration

For advanced use cases, consider:

- **Model Rotation**: Implement a strategy to rotate between models based on usage or cost
- **Caching**: Cache responses for common queries to reduce API calls
- **Prompt Templates**: Create specialized prompts for different models to optimize responses
- **Response Filtering**: Implement post-processing to ensure consistent output format

## Troubleshooting

### Common Issues

- **API Key Issues**: Verify your API keys are correct and have sufficient quota
- **Rate Limiting**: Implement exponential backoff for retries when hitting rate limits
- **Model Availability**: Some models may be in limited beta or have regional restrictions
- **Response Format Differences**: Different AI providers return responses in different formats

## Next Steps

After configuring your AI models, you might want to:

- [Implement custom chat features](implement-custom-features.md)
- Learn about [monitoring and debugging](monitoring-debugging.md)
- Explore [performance optimization](optimize-performance.md)
