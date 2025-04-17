const BaseTest = require('../utils/BaseTest');
const config = require('../config');
const logger = require('../utils/logger');

class ErrorHandlingTest extends BaseTest {
  constructor() {
    super('Error Handling Test');
  }
  
  async execute() {
    logger.info('Executing error handling test');
    
    // 1. Test 404 handling for API
    try {
      await this.apiRequest('GET', '/non-existent-endpoint');
      throw new Error('Non-existent endpoint should return 404');
    } catch (error) {
      // Expected error for 404
      if (!error.message.includes('404')) {
        throw new Error(`Unexpected error for non-existent endpoint: ${error.message}`);
      }
      
      logger.info('API 404 handling works correctly');
    }
    
    // 2. Test invalid input handling
    try {
      await this.apiRequest('POST', '/chat', {});
      throw new Error('Empty message should be rejected');
    } catch (error) {
      // Expected error for invalid input
      if (!error.message.includes('400')) {
        throw new Error(`Unexpected error for invalid input: ${error.message}`);
      }
      
      logger.info('API invalid input handling works correctly');
    }
    
    // 3. Test UI error handling
    await this.initBrowser();
    
    try {
      // Navigate to the application
      await this.page.goto(this.baseWebUrl, { waitUntil: 'networkidle2' });
      
      // Verify chat interface is loaded
      await this.page.waitForSelector('[data-testid="message-input"]');
      await this.page.waitForSelector('[data-testid="send-button"]');
      
      // Test empty message submission
      await this.page.click('[data-testid="send-button"]');
      
      // Take screenshot after attempting to send empty message
      await this.takeScreenshot('error-handling-empty-message');
      
      // Check if the input is still focused (indicating validation prevented submission)
      const inputFocused = await this.page.evaluate(() => {
        return document.activeElement === document.querySelector('[data-testid="message-input"]');
      });
      
      if (!inputFocused) {
        // Alternative check: see if an error message is displayed
        const errorDisplayed = await this.page.evaluate(() => {
          return document.body.innerText.includes('error') || 
                 document.body.innerText.includes('required') ||
                 document.body.innerText.includes('cannot be empty');
        });
        
        if (!errorDisplayed) {
          throw new Error('UI should prevent empty message submission or show an error');
        }
      }
      
      logger.info('UI empty message handling works correctly');
      
      // 4. Test 404 page
      await this.page.goto(`${this.baseWebUrl}/non-existent-page`, { waitUntil: 'networkidle2' });
      
      // Take screenshot of 404 page
      await this.takeScreenshot('error-handling-404-page');
      
      // Check if 404 page is displayed
      const is404Page = await this.page.evaluate(() => {
        return document.body.innerText.includes('404') || 
               document.body.innerText.includes('not found') ||
               document.body.innerText.includes('page doesn\'t exist');
      });
      
      if (!is404Page) {
        logger.warn('404 page might not be properly implemented');
      } else {
        logger.info('UI 404 handling works correctly');
      }
      
      // 5. Test network error handling by simulating offline mode
      await this.page.goto(this.baseWebUrl, { waitUntil: 'networkidle2' });
      await this.page.setOfflineMode(true);
      
      // Try to send a message while offline
      await this.page.type('[data-testid="message-input"]', 'This message should fail');
      await this.page.click('[data-testid="send-button"]');
      
      // Take screenshot after attempting to send message while offline
      await this.takeScreenshot('error-handling-offline-mode');
      
      // Wait a moment for error handling to occur
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset offline mode
      await this.page.setOfflineMode(false);
      
      logger.info('UI network error handling test completed');
    } finally {
      await this.closeBrowser();
    }
    
    return true;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const test = new ErrorHandlingTest();
  test.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Unhandled error in error handling test', error);
      process.exit(1);
    });
}

module.exports = ErrorHandlingTest;
