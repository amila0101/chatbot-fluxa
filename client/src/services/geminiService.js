import { createSpan } from '../utils/tracing';
import logger from '../utils/logger';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

// Use environment variable for API key
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyCYM8XiqTB0s1wmY5kYTdqF4uWhDDj5Twg';

export const generateGeminiResponse = async (prompt) => {
  // Create a span for the Gemini API call
  return createSpan('gemini.generateContent', async (span) => {
    try {
      // Add attributes to the span
      span.setAttribute('prompt.length', prompt.length);

      // Log the API call
      logger.info('Calling Gemini API', {
        promptLength: prompt.length
      });

      if (!GEMINI_API_KEY) {
        logger.error('Gemini API key is not configured');
        throw new Error('Gemini API key is not configured');
      }

      // List available models (wrapped in a child span)
      const models = await createSpan('gemini.listModels', async (childSpan) => {
        const listModelsUrl = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
        const modelResponse = await fetch(listModelsUrl);
        const modelsData = await modelResponse.json();
        logger.debug('Available Gemini models', { count: modelsData.models?.length || 0 });
        return modelsData;
      });

      // Generate content (wrapped in a child span)
      const startTime = performance.now();
      const response = await createSpan('gemini.fetchResponse', async (childSpan) => {
        const apiUrlWithKey = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
        const res = await fetch(apiUrlWithKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 20,
              topP: 0.8,
              maxOutputTokens: 2048,
              stopSequences: ["\n\n"]
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ]
          })
        });

        childSpan.setAttribute('http.status_code', res.status);
        return res;
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = `Gemini API failed with status ${response.status}: ${errorData?.error?.message || 'Unknown error'}`;

        logger.error(errorMessage, {
          status: response.status,
          error: errorData?.error
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates.length) {
        logger.error('No response generated from Gemini API', { data });
        throw new Error('No response generated from Gemini API');
      }

      const generatedText = data.candidates[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        logger.error('Invalid response format from Gemini API', { data });
        throw new Error('Invalid response format from Gemini API: Missing text content');
      }

      // Process the response (wrapped in a child span)
      const result = await createSpan('gemini.processResponse', async (childSpan) => {
        const formattedText = formatText(generatedText);
        const contentType = detectContentType(formattedText);
        childSpan.setAttribute('content.type', contentType);
        childSpan.setAttribute('content.length', formattedText.length);
        return enhanceFormatting(formattedText, contentType);
      });

      const duration = performance.now() - startTime;

      // Add more attributes to the span
      span.setAttribute('response.length', result.length);
      span.setAttribute('response.duration_ms', duration);

      // Log the successful response
      logger.info('Gemini API response received', {
        duration,
        responseLength: result.length,
        promptLength: prompt.length
      });

      return result;
    } catch (error) {
      // Log the error
      logger.error(`Gemini API Error: ${error.message}`, {
        error: error.message,
        stack: error.stack
      });

      // Add error details to the span
      span.setAttribute('error', true);
      span.setAttribute('error.message', error.message);
      span.setAttribute('error.type', error.name);

      throw new Error(error.message || 'Failed to get response from Gemini API');
    }
  });
};

// Clean and format the response text
function formatText(text) {
  return text
    .trim()
    .replace(/\*\*(.*?)\*\*/g, '**$1**')
    .replace(/\*(.*?)\*/g, '*$1*')
    .replace(/```(\w+)?([\s\S]*?)```/g, '```$1\n$2\n```')
    .replace(/^[\s]*[-*]\s/gm, '• ')
    .replace(/^[\s]*\d+\.\s/gm, '$& ')
    .split('\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .join('\n\n');
}

// Detect content type to enhance formatting accordingly
function detectContentType(text) {
  if (text.includes('```') || /function|class|const|let|var|import|export|return|async|await/.test(text)) {
    return 'code';
  }
  if (/^\s*(?:[0-9]+\.|[-*•])\s/m.test(text)) {
    return 'list';
  }
  if (/^#{1,6}\s/m.test(text) || text.length > 500 || text.split('\n').length > 5) {
    return 'article';
  }
  return 'conversation';
}

// Enhance formatting based on type
function enhanceFormatting(text, contentType) {
  let formatted = text
    .replace(/\s+$/gm, '')
    .replace(/^\s+/gm, '');

  switch (contentType) {
    case 'code':
      formatted = formatted.replace(/```(\w+)?([\s\S]*?)```/g, (match, lang, code) => {
        const trimmedCode = code.trim();
        return `\n\`\`\`${lang || ''}\n${trimmedCode}\n\`\`\`\n`;
      });
      break;
    case 'list':
      formatted = formatted.split('\n').map(line =>
        line.match(/^\s*(?:[0-9]+\.|[-*•])\s/) ? '  ' + line.trim() : line
      ).join('\n');
      break;
    case 'article':
      formatted = formatted.split('\n\n').map(paragraph => {
        if (paragraph.match(/^\s*(?:[0-9]+\.|[-*•])\s/) || paragraph.includes('```')) {
          return paragraph;
        }
        return paragraph
          .replace(/([.!?])(?=\s+|$)(?!\]|\))/g, '$1\n')
          .replace(/\n{3,}/g, '\n\n');
      }).join('\n\n');
      break;
    default:
      formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();
      break;
  }

  return formatted.replace(/\n{3,}/g, '\n\n').trim();
}
