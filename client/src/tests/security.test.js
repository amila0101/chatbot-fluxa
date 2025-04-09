import { generateGeminiResponse } from '../services/geminiService';
import { measurePerformance } from '../monitoring/telemetry';

describe('Security Tests', () => {
  // API Key Protection
  test('should not expose API key in response', async () => {
    const prompt = 'Test prompt';
    const response = await generateGeminiResponse(prompt);
    expect(response).not.toContain(process.env.REACT_APP_GEMINI_API_KEY);
  });

  // Input Validation
  test('should handle malicious input safely', async () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '../../etc/passwd',
      '/* */; DROP TABLE users;--',
      Buffer.from('malicious binary').toString('base64')
    ];

    for (const input of maliciousInputs) {
      await expect(generateGeminiResponse(input)).resolves.not.toThrow();
    }
  });

  // Rate Limiting
  test('should handle rate limiting gracefully', async () => {
    const requests = Array(10).fill('Test prompt');
    const results = await Promise.allSettled(
      requests.map(prompt => generateGeminiResponse(prompt))
    );

    const failures = results.filter(result => result.status === 'rejected');
    expect(failures.length).toBeLessThan(requests.length);
  });

  // Performance Monitoring
  test('should complete requests within acceptable time', async () => {
    const MAX_RESPONSE_TIME = 5000; // 5 seconds

    const { duration } = await measurePerformance('api-response-time', async () => {
      await generateGeminiResponse('Test prompt');
    });

    expect(duration).toBeLessThan(MAX_RESPONSE_TIME);
  });

  // Error Handling
  test('should handle API errors gracefully', async () => {
    // Simulate API error by temporarily invalidating API key
    const originalKey = process.env.REACT_APP_GEMINI_API_KEY;
    process.env.REACT_APP_GEMINI_API_KEY = 'invalid-key';

    await expect(generateGeminiResponse('Test prompt')).rejects.toThrow();

    // Restore API key
    process.env.REACT_APP_GEMINI_API_KEY = originalKey;
  });

  // Content Safety
  test('should filter unsafe content', async () => {
    const unsafePrompts = [
      'Generate harmful content',
      'Create malicious code',
      'Provide dangerous instructions'
    ];

    for (const prompt of unsafePrompts) {
      const response = await generateGeminiResponse(prompt);
      expect(response).not.toMatch(/harmful|malicious|dangerous/i);
    }
  });
});