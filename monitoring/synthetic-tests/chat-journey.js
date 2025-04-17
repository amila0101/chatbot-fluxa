const BaseTest = require('../utils/BaseTest');
const config = require('../config');
const logger = require('../utils/logger');

class ChatJourneyTest extends BaseTest {
  constructor() {
    super('Chat Journey Test');
  }
  
  async execute() {
    logger.info('Executing chat journey test');
    
    // Test API chat endpoint
    const testMessage = config.testData.chat.validMessages[0];
    
    // 1. Test API directly
    const { duration, result } = await this.measurePerformance(
      'API Chat Request',
      () => this.apiRequest('POST', '/chat', { message: testMessage }),
      config.performanceThresholds.chatResponse
    );
    
    // Validate API response
    if (!result || !result.response) {
      throw new Error(`Chat API request failed: Invalid response: ${JSON.stringify(result)}`);
    }
    
    logger.info('API chat request passed', { 
      duration, 
      messageLength: testMessage.length,
      responseLength: result.response.length
    });
    
    // 2. Test UI chat journey
    await this.initBrowser();
    
    try {
      // Navigate to the application
      await this.page.goto(this.baseWebUrl, { waitUntil: 'networkidle2' });
      
      // Verify chat interface is loaded
      await this.page.waitForSelector('[data-testid="chat-container"]');
      await this.page.waitForSelector('[data-testid="message-input"]');
      await this.page.waitForSelector('[data-testid="send-button"]');
      
      // Take screenshot of initial state
      await this.takeScreenshot('chat-journey-initial');
      
      // Type a message
      await this.page.type('[data-testid="message-input"]', testMessage);
      
      // Click send button
      await this.page.click('[data-testid="send-button"]');
      
      // Wait for user message to appear
      await this.page.waitForFunction(
        (message) => {
          const userMessages = Array.from(document.querySelectorAll('[data-testid="user-message"]'));
          return userMessages.some(el => el.textContent.includes(message));
        },
        {},
        testMessage
      );
      
      // Take screenshot after sending message
      await this.takeScreenshot('chat-journey-message-sent');
      
      // Wait for bot response (with timeout)
      await this.page.waitForSelector('[data-testid="bot-message"]', { timeout: 15000 });
      
      // Verify bot response is not empty
      const botResponseContent = await this.page.evaluate(() => {
        const botMessages = document.querySelectorAll('[data-testid="bot-message"]');
        return botMessages[botMessages.length - 1].textContent;
      });
      
      if (!botResponseContent || botResponseContent.trim() === '') {
        throw new Error('Bot response is empty');
      }
      
      // Take screenshot of final state
      await this.takeScreenshot('chat-journey-complete');
      
      logger.info('UI chat journey passed', {
        message: testMessage,
        responseLength: botResponseContent.length
      });
    } finally {
      await this.closeBrowser();
    }
    
    return true;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const test = new ChatJourneyTest();
  test.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Unhandled error in chat journey test', error);
      process.exit(1);
    });
}

module.exports = ChatJourneyTest;
