# Synthetic Monitoring for Chatbot Fluxa

This directory contains a simple but effective synthetic monitoring solution for the Chatbot Fluxa application. The monitoring system simulates user interactions with the application's API to proactively detect issues.

## Features

- Automated testing of critical API endpoints
- Scheduled monitoring at configurable intervals
- Detailed logging of test executions
- HTML report generation
- Simple and reliable implementation

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install axios node-cron
   ```

## Usage

### Running Tests Manually

To run the synthetic monitoring tests once:

```bash
node synthetic-monitor.js
```

### Generating a Report

To run the tests and generate an HTML report:

```bash
node generate-report.js
```

Reports are saved in the `reports` directory.

### Setting Up Scheduled Monitoring

To start the scheduler that runs tests at regular intervals:

```bash
node synthetic-scheduler.js
```

By default, tests run every 5 minutes. You can change this by setting the `TEST_SCHEDULE` environment variable with a cron expression:

```bash
TEST_SCHEDULE="0 */1 * * *" node synthetic-scheduler.js  # Run every hour
```

## Configuration

The monitoring configuration is defined in the `synthetic-monitor.js` file. You can modify the following settings:

- `baseUrl`: The base URL of the API (default: `http://localhost:5000/api`)
- `timeout`: Request timeout in milliseconds (default: `10000`)
- `retries`: Number of retry attempts for failed tests (default: `2`)
- `tests`: Array of test configurations

### Adding a New Test

To add a new test, add an entry to the `tests` array in `synthetic-monitor.js`:

```javascript
{
  name: 'My New Test',
  endpoint: '/my-endpoint',
  method: 'GET',  // or POST, PUT, DELETE, etc.
  data: { key: 'value' },  // Optional request body for POST/PUT
  headers: { 'Authorization': 'Bearer token' },  // Optional headers
  expectedStatus: 200,  // Expected HTTP status code
  validate: (data) => data && data.someProperty === 'expectedValue'  // Validation function
}
```

## Logs and Reports

- Logs are stored in the `logs` directory
  - `synthetic-monitor.log`: Test execution logs
  - `scheduler.log`: Scheduler logs
- Reports are stored in the `reports` directory

## Running as a Service

For production deployment, you can use a process manager like PM2:

```bash
# Install PM2
npm install -g pm2

# Start the scheduler as a service
pm2 start synthetic-scheduler.js --name "synthetic-monitoring"

# Save the PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

## Troubleshooting

If you encounter issues:

1. Check the logs in the `logs` directory
2. Verify the API is running and accessible
3. Check network connectivity
4. Ensure the test configurations match the actual API endpoints

## Extending the Monitoring

This synthetic monitoring solution can be extended in several ways:

1. Add more tests for additional endpoints
2. Implement more complex validation logic
3. Add notification mechanisms (email, Slack, etc.)
4. Integrate with monitoring dashboards
5. Add performance metrics collection
