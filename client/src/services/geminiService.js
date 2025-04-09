const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';  // Use v1beta if v1 fails
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export const generateGeminiResponse = async (prompt) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Call ListModels to see available models
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
    const modelResponse = await fetch(listModelsUrl);
    const models = await modelResponse.json();
    console.log('Available models:', models); // Log the available models

    const apiUrlWithKey = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrlWithKey, {
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
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Gemini API failed with status ${response.status}: ${errorData?.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates.length) {
      throw new Error('No response generated from Gemini API');
    }

    const generatedText = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('Invalid response format from Gemini API: Missing text content');
    }

    // Clean and format the response for professional output
    const formattedText = generatedText
      .trim()
      // Preserve markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '**$1**')  // Bold
      .replace(/\*(.*?)\*/g, '*$1*')        // Italic
      .replace(/```([\s\S]*?)```/g, '```\n$1```')  // Code blocks
      // Handle lists properly
      .replace(/^[\s]*[-*]\s/gm, '• ')     // Convert list markers to bullets
      .replace(/^[\s]*\d+\.\s/gm, '$& ')  // Preserve numbered lists
      // Improve paragraph and sentence spacing
      .split('\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');

    // Add contextual formatting based on content type
    const contentType = detectContentType(formattedText);
    return enhanceFormatting(formattedText, contentType);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to get response from Gemini API');
  }
};

// Helper function to detect content type
function detectContentType(text) {
  // Check for code blocks or programming keywords
  if (text.includes('```') || /function|class|const|let|var|import|export|return|async|await/.test(text)) {
    return 'code';
  }
  // Check for list patterns (numbered lists, bullet points, or dashes)
  if (/^\s*(?:[0-9]+\.|[-*•])\s/m.test(text)) {
    return 'list';
  }
  // Check for markdown headings
  if (/^#{1,6}\s/m.test(text)) {
    return 'article';
  }
  // Check for long-form content
  if (text.length > 500 || text.split('\n').length > 5) {
    return 'article';
  }
  return 'conversation';
}

// Helper function to enhance formatting based on content type
function enhanceFormatting(text, contentType) {
  // First, apply common formatting
  let formatted = text
    .replace(/\s+$/gm, '') // Remove trailing whitespace
    .replace(/^\s+/gm, ''); // Remove leading whitespace

  switch (contentType) {
    case 'code':
      // Enhanced code block formatting
      formatted = formatted.replace(/```(\w+)?([\s\S]*?)```/g, (match, lang, code) => {
        const trimmedCode = code.trim();
        const language = lang || '';
        return `\n\`\`\`${language}\n${trimmedCode}\n\`\`\`\n`;
      });
      // Improve inline code formatting
      formatted = formatted.replace(/`([^`]+)`/g, '`$1`');
      break;

    case 'list':
      // Enhanced list formatting
      formatted = formatted.split('\n').map(line => {
        if (line.match(/^\s*(?:[0-9]+\.|[-*•])\s/)) {
          return '  ' + line.trim(); // Add consistent indentation
        }
        return line;
      }).join('\n');
      break;

    case 'article':
      // Enhanced article formatting
      formatted = formatted.split('\n\n').map(paragraph => {
        // Preserve list items and code blocks
        if (paragraph.match(/^\s*(?:[0-9]+\.|[-*•])\s/) || paragraph.includes('```')) {
          return paragraph;
        }
        // Add line breaks after sentences while preserving markdown
        return paragraph
          .replace(/([.!?])(?=\s+|$)(?!\]|\))/g, '$1\n')
          .replace(/\n{3,}/g, '\n\n'); // Normalize multiple line breaks
      }).join('\n\n');
      break;

    default: // conversation
      // Preserve natural flow while ensuring readability
      formatted = formatted
        .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
        .trim();
      break;
  }

  // Final cleanup
  return formatted
    .replace(/\n{3,}/g, '\n\n') // Final normalization of line breaks
    .trim();
}
