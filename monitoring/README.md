# Chatbot Fluxa Synthetic Monitoring

This directory contains the synthetic monitoring system for the Chatbot Fluxa application. The monitoring system simulates user interactions with the application to proactively detect issues before they impact real users.

## Features

- Automated testing of critical user journeys
- Scheduled monitoring at configurable intervals
- Performance measurement and threshold alerting
- Screenshot capture for visual verification
- Detailed logging of test executions
- Notification system for alerting on failures
- Docker support for containerized deployment

## Critical User Journeys

The following critical user journeys are monitored:

1. **Application Availability (Health Check)**
2. **Chat Functionality**
3. **Rate Limiting Behavior**
4. **Admin Access**
5. **Error Handling**

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with appropriate values
   ```

### Running Tests Manually

```bash
# Run all tests
npm run monitor:all

# Run specific test
npm run monitor:health
npm run monitor:chat
npm run monitor:rate-limit
npm run monitor:admin
npm run monitor:error

# Run tests in specific environment
npm run monitor -- --environment production --verbose
```

### Setting Up Scheduled Monitoring

```bash
# Start the scheduler
npm run monitor:schedule
```

### Docker Deployment

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## Configuration

Configuration is managed through the `config.js` file and environment variables. Key configuration options include:

- **Environment**: development, staging, or production
- **Base URLs**: API and web application URLs for each environment
- **Test Settings**: Timeouts, retries, and intervals
- **Monitoring Settings**: Alert thresholds and notification channels
- **Performance Thresholds**: Response time thresholds for different operations

## Directory Structure

```
monitoring/
├── synthetic-tests/       # Individual test implementations
│   ├── health-check.js    # Application availability test
│   ├── chat-journey.js    # Chat functionality test
│   ├── rate-limit-test.js # Rate limiting behavior test
│   ├── admin-journey.js   # Admin access test
│   └── error-handling.js  # Error handling test
├── utils/                 # Utility functions
│   ├── BaseTest.js        # Base test class
│   ├── logger.js          # Logging utility
│   └── notifier.js        # Notification utility
├── config.js              # Configuration settings
├── index.js               # Main entry point for running tests
├── scheduler.js           # Cron-based scheduler
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # This file
```

## Extending the Monitoring

To add a new synthetic test:

1. Create a new test file in the `synthetic-tests` directory
2. Extend the `BaseTest` class
3. Implement the `execute()` method
4. Add the test to the `tests` object in `index.js`
5. Add a schedule in `scheduler.js`

## Logs and Screenshots

- Logs are stored in the `logs` directory
- Screenshots are stored in the `screenshots` directory

## Documentation

For more detailed information, see the [Synthetic Monitoring Guide](../docs/synthetic-monitoring.md).
