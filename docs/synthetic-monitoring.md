# Synthetic Monitoring Guide

This document provides comprehensive information about the synthetic monitoring setup for the Chatbot Fluxa application.

## Overview

Synthetic monitoring simulates user interactions with the application to proactively detect issues before they impact real users. Our monitoring system tests critical user journeys at regular intervals and alerts the team when issues are detected.

## Critical User Journeys

We monitor the following critical user journeys:

1. **Application Availability (Health Check)**
   - API health endpoint availability
   - Web application loading and rendering
   - Critical UI elements presence

2. **Chat Functionality**
   - Sending messages to the chatbot
   - Receiving responses from the AI
   - Message rendering in the UI

3. **Rate Limiting Behavior**
   - Proper enforcement of rate limits
   - Appropriate error responses
   - UI handling of rate limit errors

4. **Admin Access**
   - Authentication requirements
   - Authorization validation
   - Admin functionality availability

5. **Error Handling**
   - 404 page functionality
   - Input validation
   - Network error handling
   - Graceful error presentation

## Monitoring Architecture

Our synthetic monitoring system consists of:

1. **Test Runners**: Node.js scripts that simulate user interactions
2. **Scheduler**: Cron-based scheduler that runs tests at defined intervals
3. **Notification System**: Alerts via email and Slack when issues are detected
4. **Logging**: Detailed logs of test executions and results
5. **Performance Tracking**: Measurement of response times and performance metrics

## Test Frequency

| Test | Frequency | Environments |
|------|-----------|--------------|
| Health Check | Every 5 minutes | All |
| Chat Functionality | Every 15 minutes | All |
| Rate Limiting | Every 2 hours | All |
| Admin Access | Every 4 hours | All |
| Error Handling | Every 6 hours | All |

## Alert Thresholds

Alerts are triggered based on the following conditions:

1. **Consecutive Failures**: 2 or more consecutive test failures
2. **Performance Degradation**: Response times exceeding defined thresholds:
   - Health Check API: > 500ms
   - Chat Response: > 3000ms
   - Page Load: > 2000ms

## Running Tests Manually

You can run the synthetic tests manually using the following commands:

```bash
# Install dependencies
cd monitoring
npm install

# Run all tests
npm run monitor:all

# Run specific test
npm run monitor:health
npm run monitor:chat
npm run monitor:rate-limit
npm run monitor:admin
npm run monitor:error

# Run tests in specific environment
npm run monitor -- --environment production
```

## Setting Up Scheduled Monitoring

To set up scheduled monitoring:

1. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with appropriate values
   ```

2. Start the scheduler:
   ```bash
   npm run monitor:schedule
   ```

3. For production deployment, use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start scheduler.js --name "synthetic-monitoring"
   pm2 save
   ```

## Notification Setup

### Slack Integration

1. Create a Slack app in your workspace
2. Add a webhook URL to your app
3. Set the `SLACK_WEBHOOK_URL` environment variable
4. Optionally set the `SLACK_CHANNEL` environment variable

### Email Notifications

1. Configure email recipients in the `ALERT_EMAIL_RECIPIENTS` environment variable
2. Set the sender email in the `ALERT_EMAIL_FROM` environment variable
3. In a production setup, configure an email service provider

## Extending the Monitoring

To add a new synthetic test:

1. Create a new test file in the `synthetic-tests` directory
2. Extend the `BaseTest` class
3. Implement the `execute()` method
4. Add the test to the `tests` object in `index.js`
5. Add a schedule in `scheduler.js`

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   - Check network connectivity
   - Verify application is running
   - Increase timeout settings in config.js

2. **Authentication Failures**
   - Verify test credentials are valid
   - Check token expiration
   - Ensure proper environment variables are set

3. **Browser Automation Issues**
   - Ensure Puppeteer dependencies are installed
   - Check for UI changes that might break selectors
   - Review screenshots for visual clues

### Logs

Logs are stored in the `logs` directory:

- `combined.log`: All log messages
- `error.log`: Error messages only

### Screenshots

Screenshots are stored in the `screenshots` directory and are named with the test name and timestamp.

## Best Practices

1. **Keep Tests Focused**: Each test should focus on a specific user journey
2. **Maintain Test Independence**: Tests should not depend on each other
3. **Handle Flakiness**: Use retries and robust selectors to reduce flakiness
4. **Regular Maintenance**: Update tests when the application changes
5. **Monitor the Monitors**: Regularly review test results and performance

## Integration with Monitoring Dashboard

The synthetic monitoring results can be integrated with monitoring dashboards:

1. **Prometheus Integration**: Export test results as Prometheus metrics
2. **Grafana Dashboard**: Visualize test results and performance metrics
3. **Status Page**: Update a public status page based on test results

## SLA Monitoring

The synthetic monitoring system helps track SLAs:

1. **Availability**: Percentage of successful health checks
2. **Performance**: Response times within defined thresholds
3. **Functionality**: Success rate of critical user journeys

## References

- [Puppeteer Documentation](https://pptr.dev/)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)
- [Winston Logger Documentation](https://github.com/winstonjs/winston)
- [Axios Documentation](https://axios-http.com/docs/intro)
