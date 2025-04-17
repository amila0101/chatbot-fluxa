const BaseTest = require('../utils/BaseTest');
const config = require('../config');
const logger = require('../utils/logger');

class AdminJourneyTest extends BaseTest {
  constructor() {
    super('Admin Journey Test');
  }
  
  async execute() {
    logger.info('Executing admin journey test');
    
    // 1. Test unauthorized access
    try {
      await this.apiRequest('GET', '/admin');
      throw new Error('Admin access should require authentication');
    } catch (error) {
      // Expected error for unauthorized access
      if (!error.message.includes('401')) {
        throw new Error(`Unexpected error for unauthorized admin access: ${error.message}`);
      }
      
      logger.info('Unauthorized admin access correctly rejected');
    }
    
    // 2. Test with invalid token
    try {
      await this.apiRequest('GET', '/admin', null, {
        Authorization: `Bearer ${config.testData.admin.invalidToken}`
      });
      throw new Error('Admin access with invalid token should be rejected');
    } catch (error) {
      // Expected error for invalid token
      if (!error.message.includes('401')) {
        throw new Error(`Unexpected error for invalid token: ${error.message}`);
      }
      
      logger.info('Invalid admin token correctly rejected');
    }
    
    // 3. Test with valid token
    const { result } = await this.measurePerformance(
      'Admin API Access',
      () => this.apiRequest('GET', '/admin', null, {
        Authorization: `Bearer ${config.testData.admin.validToken}`
      }),
      config.performanceThresholds.healthCheck
    );
    
    // Validate response
    if (!result || !result.status || result.status !== 'authenticated') {
      throw new Error(`Admin access failed: Invalid response: ${JSON.stringify(result)}`);
    }
    
    logger.info('Admin API access passed', { result });
    
    // 4. Test admin UI journey (if applicable)
    // Note: This assumes there's an admin UI. If not, this part can be removed.
    await this.initBrowser();
    
    try {
      // Navigate to the admin login page (adjust URL as needed)
      const adminUrl = `${this.baseWebUrl}/admin`;
      await this.page.goto(adminUrl, { waitUntil: 'networkidle2' });
      
      // Take screenshot of admin login page
      await this.takeScreenshot('admin-journey-login-page');
      
      // Check if login form exists
      const hasLoginForm = await this.page.evaluate(() => {
        return !!document.querySelector('form') || 
               !!document.querySelector('input[type="password"]') ||
               !!document.querySelector('button[type="submit"]');
      });
      
      if (hasLoginForm) {
        logger.info('Admin login form detected');
        
        // This is a simplified example - in a real test, you would:
        // 1. Fill in the login form
        // 2. Submit the form
        // 3. Verify successful login
        // 4. Test admin functionality
        
        // For now, we'll just verify the login page loads
        logger.info('Admin UI journey partial test passed (login page loads)');
      } else {
        logger.warn('Admin login form not detected - skipping UI login test');
      }
    } finally {
      await this.closeBrowser();
    }
    
    return true;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const test = new AdminJourneyTest();
  test.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Unhandled error in admin journey test', error);
      process.exit(1);
    });
}

module.exports = AdminJourneyTest;
