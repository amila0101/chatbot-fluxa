const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');
const notifier = require('./notifier');

class BaseTest {
  constructor(name) {
    this.name = name;
    this.browser = null;
    this.page = null;
    this.startTime = null;
    this.environment = config.environment;
    this.baseApiUrl = config.baseUrls[this.environment].api;
    this.baseWebUrl = config.baseUrls[this.environment].web;
    this.failureCount = 0;
    this.maxRetries = config.testSettings.retries;
    this.timeout = config.testSettings.timeout;
    this.screenshotDir = config.testSettings.screenshotDir;
    
    // Create screenshot directory if it doesn't exist
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }
  
  /**
   * Initialize the test
   */
  async init() {
    this.startTime = Date.now();
    logger.info(`Starting test: ${this.name}`, {
      test: this.name,
      environment: this.environment,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Run the test with retries
   */
  async run() {
    await this.init();
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logger.info(`Retry attempt ${attempt}/${this.maxRetries} for test: ${this.name}`);
        }
        
        await this.execute();
        
        // If we get here, the test passed
        this.failureCount = 0;
        const duration = Date.now() - this.startTime;
        
        logger.info(`Test passed: ${this.name}`, {
          test: this.name,
          duration,
          environment: this.environment
        });
        
        return true;
      } catch (error) {
        const duration = Date.now() - this.startTime;
        
        logger.error(`Test failed: ${this.name}`, {
          test: this.name,
          error: error.message,
          stack: error.stack,
          duration,
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
          environment: this.environment
        });
        
        // Take screenshot if browser is available
        if (this.page) {
          await this.takeScreenshot(`${this.name.replace(/\s+/g, '-').toLowerCase()}-failure-${Date.now()}`);
        }
        
        // If we've exhausted all retries, notify about the failure
        if (attempt === this.maxRetries) {
          this.failureCount++;
          
          // Only send notification if we've reached the alert threshold
          if (this.failureCount >= config.monitoring.alertThreshold) {
            await notifier.sendNotification(
              this.name,
              this.environment,
              error,
              {
                duration,
                attempts: attempt + 1,
                url: this.currentUrl || 'N/A'
              }
            );
          }
          
          return false;
        }
      }
    }
  }
  
  /**
   * Execute the test (to be implemented by subclasses)
   */
  async execute() {
    throw new Error('execute() method must be implemented by subclasses');
  }
  
  /**
   * Initialize browser for UI tests
   */
  async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set default timeout
    this.page.setDefaultTimeout(this.timeout);
    
    // Track current URL
    this.page.on('framenavigated', frame => {
      if (frame === this.page.mainFrame()) {
        this.currentUrl = frame.url();
      }
    });
    
    // Log console messages from the browser
    this.page.on('console', msg => {
      logger.debug(`Browser console [${msg.type()}]: ${msg.text()}`);
    });
    
    return this.page;
  }
  
  /**
   * Close browser
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
  
  /**
   * Make an API request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} - Response data
   */
  async apiRequest(method, endpoint, data = null, headers = {}) {
    const url = `${this.baseApiUrl}${endpoint}`;
    
    try {
      const response = await axios({
        method,
        url,
        data,
        headers,
        timeout: this.timeout
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`API request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error(`API request failed: No response received from ${url}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`API request setup failed: ${error.message}`);
      }
    }
  }
  
  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} - Path to the screenshot
   */
  async takeScreenshot(name) {
    if (!this.page) {
      logger.warn('Cannot take screenshot: No browser page available');
      return null;
    }
    
    const filename = `${name}-${Date.now()}.png`;
    const screenshotPath = path.join(this.screenshotDir, filename);
    
    try {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      logger.info(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Measure performance of a function
   * @param {string} label - Performance label
   * @param {Function} fn - Function to measure
   * @param {number} threshold - Performance threshold in milliseconds
   * @returns {Promise<{duration: number, result: any}>} - Duration and result
   */
  async measurePerformance(label, fn, threshold) {
    const start = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      logger.info(`Performance [${label}]: ${duration}ms`, {
        label,
        duration,
        threshold
      });
      
      if (threshold && duration > threshold) {
        logger.warn(`Performance threshold exceeded for ${label}: ${duration}ms > ${threshold}ms`);
      }
      
      return { duration, result };
    } catch (error) {
      const duration = Date.now() - start;
      
      logger.error(`Performance [${label}] Error: ${duration}ms`, {
        label,
        duration,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Wait for a condition to be true
   * @param {Function} conditionFn - Condition function that returns a boolean
   * @param {number} timeout - Timeout in milliseconds
   * @param {string} errorMessage - Error message if timeout is reached
   * @returns {Promise<void>}
   */
  async waitForCondition(conditionFn, timeout = this.timeout, errorMessage = 'Condition timeout') {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await conditionFn()) {
        return;
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(errorMessage);
  }
  
  /**
   * Clean up resources
   */
  async cleanup() {
    await this.closeBrowser();
  }
}

module.exports = BaseTest;
