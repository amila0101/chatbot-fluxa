const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent'; 

const GEMINI_API_KEY = 'AIzaSyCYM8XiqTB0s1wmY5kYTdqF4uWhDDj5Twg'; // Replace with process.env.REACT_APP_GEMINI_API_KEY for production

export const generateGeminiResponse = async (prompt) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const listModelsUrl = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
    const modelResponse = await fetch(listModelsUrl);
    const models = await modelResponse.json();
    console.log('Available models:', models);

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
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
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

    const formattedText = formatText(generatedText);
    const contentType = detectContentType(formattedText);
    return enhanceFormatting(formattedText, contentType);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to get response from Gemini API');
  }
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
