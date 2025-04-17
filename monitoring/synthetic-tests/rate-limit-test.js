const BaseTest = require('../utils/BaseTest');
const config = require('../config');
const logger = require('../utils/logger');

class RateLimitTest extends BaseTest {
  constructor() {
    super('Rate Limit Test');
  }
  
  async execute() {
    logger.info('Executing rate limit test');
    
    // Test rate limiting behavior
    const testMessage = config.testData.chat.validMessages[1];
    const requests = [];
    const MAX_REQUESTS = 10; // We'll send 10 requests to trigger rate limiting
    
    // Send multiple requests in quick succession
    for (let i = 0; i < MAX_REQUESTS; i++) {
      requests.push(
        this.apiRequest('POST', '/chat', { message: `${testMessage} - ${i}` })
          .then(result => ({ status: 'success', result }))
          .catch(error => ({ status: 'error', error: error.message }))
      );
    }
    
    // Wait for all requests to complete
    const results = await Promise.all(requests);
    
    // Check if rate limiting was triggered
    const rateLimited = results.some(result => 
      result.status === 'error' && result.error.includes('429')
    );
    
    if (!rateLimited) {
      throw new Error(`Rate limiting was not triggered after ${MAX_REQUESTS} requests`);
    }
    
    // Count successful and rate-limited requests
    const successful = results.filter(result => result.status === 'success').length;
    const limited = results.filter(result => 
      result.status === 'error' && result.error.includes('429')
    ).length;
    
    logger.info('Rate limit test passed', {
      totalRequests: MAX_REQUESTS,
      successfulRequests: successful,
      rateLimitedRequests: limited
    });
    
    // Now test UI behavior with rate limiting
    await this.initBrowser();
    
    try {
      // Navigate to the application
      await this.page.goto(this.baseWebUrl, { waitUntil: 'networkidle2' });
      
      // Verify chat interface is loaded
      await this.page.waitForSelector('[data-testid="message-input"]');
      await this.page.waitForSelector('[data-testid="send-button"]');
      
      // Send multiple messages quickly
      for (let i = 0; i < 6; i++) {
        // Type a message
        await this.page.type('[data-testid="message-input"]', `Quick message ${i}`);
        
        // Click send button
        await this.page.click('[data-testid="send-button"]');
        
        // Wait a very short time between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Take screenshot after sending multiple messages
      await this.takeScreenshot('rate-limit-test-messages-sent');
      
      // Wait for error message to appear (this assumes the UI shows an error message for rate limiting)
      // Note: This might need to be adjusted based on how your UI handles rate limiting
      await this.waitForCondition(async () => {
        const errorMessages = await this.page.evaluate(() => {
          const messages = Array.from(document.querySelectorAll('[data-testid="bot-message"]'));
          return messages.some(el => el.textContent.includes('Error') || el.textContent.includes('too many requests'));
        });
        return errorMessages;
      }, 10000, 'Rate limit error message not displayed in UI');
      
      // Take screenshot of final state
      await this.takeScreenshot('rate-limit-test-complete');
      
      logger.info('UI rate limit test passed');
    } finally {
      await this.closeBrowser();
    }
    
    return true;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const test = new RateLimitTest();
  test.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Unhandled error in rate limit test', error);
      process.exit(1);
    });
}

module.exports = RateLimitTest;
