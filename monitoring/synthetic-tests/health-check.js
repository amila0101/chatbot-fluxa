const BaseTest = require('../utils/BaseTest');
const config = require('../config');
const logger = require('../utils/logger');

class HealthCheckTest extends BaseTest {
  constructor() {
    super('Health Check Test');
  }
  
  async execute() {
    logger.info('Executing health check test');
    
    // Test API health endpoint
    const { duration, result } = await this.measurePerformance(
      'API Health Check',
      () => this.apiRequest('GET', '/health'),
      config.performanceThresholds.healthCheck
    );
    
    // Validate response
    if (!result || result.status !== 'ok') {
      throw new Error(`Health check failed: Invalid response: ${JSON.stringify(result)}`);
    }
    
    logger.info('API health check passed', { duration, result });
    
    // Test web application availability
    await this.initBrowser();
    
    try {
      // Measure page load performance
      const { duration: pageLoadDuration } = await this.measurePerformance(
        'Web App Load',
        async () => {
          await this.page.goto(this.baseWebUrl, { waitUntil: 'networkidle2' });
          return true;
        },
        config.performanceThresholds.pageLoad
      );
      
      // Verify critical elements are present
      await this.page.waitForSelector('[data-testid="chat-container"]');
      await this.page.waitForSelector('[data-testid="message-input"]');
      await this.page.waitForSelector('[data-testid="send-button"]');
      
      logger.info('Web application health check passed', { 
        duration: pageLoadDuration,
        url: this.baseWebUrl
      });
      
      // Take a screenshot for reference
      await this.takeScreenshot('health-check-success');
    } finally {
      await this.closeBrowser();
    }
    
    return true;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const test = new HealthCheckTest();
  test.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Unhandled error in health check test', error);
      process.exit(1);
    });
}

module.exports = HealthCheckTest;
