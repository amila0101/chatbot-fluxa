# Testing Guide

This document outlines our testing approach and provides guidance for running tests in different environments.

## Test Types

Our application uses three types of tests:

1. **Unit Tests**: Test individual components and functions in isolation
2. **Integration Tests**: Test interactions between components and services
3. **End-to-End (E2E) Tests**: Test the entire application from the user's perspective

## Running Tests

### Unit Tests

Unit tests are located in the `client/src` directory and use Jest with React Testing Library.

```bash
# Run unit tests
npm run test:client
```

### Integration Tests

Integration tests are located in the `server/test` directory and use Jest with Supertest.

```bash
# Run integration tests
npm run test:server
```

### End-to-End Tests

E2E tests are located in the `e2e/cypress/e2e` directory and use Cypress.

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with browser UI
cd e2e && npm run test:e2e:open

# Run E2E tests in specific browsers
cd e2e && npm run test:e2e:chrome
cd e2e && npm run test:e2e:firefox
```

### Running All Tests

```bash
# Run all tests sequentially
npm run verify

# Run all tests in parallel
npm run test:parallel
```

## Parallel Test Execution

We use parallel test execution to speed up the testing process:

1. **Unit and Integration Tests**: Run in parallel using Jest's built-in parallelization
2. **E2E Tests**: Run in parallel using our custom parallel runner

### How Parallel Execution Works

- **Unit/Integration Tests**: Jest automatically distributes test files across multiple workers
- **E2E Tests**: Our custom runner splits test files into chunks and runs each chunk in a separate Cypress process

### Configuration

You can configure the parallel execution in the following files:

- **Unit/Integration Tests**: `jest.config.js` in the respective directories
- **E2E Tests**: `e2e/run-parallel.js`

## CI/CD Integration

Our GitHub Actions workflows run tests in parallel to speed up the CI/CD pipeline:

1. **Vercel Deployment Workflow**: Runs unit, integration, and E2E tests in parallel using a matrix strategy
2. **Node.js Matrix Testing Workflow**: Tests compatibility across different Node.js versions

## Writing Tests

### Unit Tests

```javascript
// Example unit test
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

### Integration Tests

```javascript
// Example integration test
const request = require('supertest');
const app = require('../app');

describe('API Tests', () => {
  test('GET /api/health returns 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
});
```

### E2E Tests

```javascript
// Example E2E test
describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the chat interface', () => {
    cy.get('[data-testid="chat-container"]').should('exist');
  });
});
```

## Best Practices

1. **Test Pyramid**: Write more unit tests than integration tests, and more integration tests than E2E tests
2. **Isolation**: Ensure tests are isolated and don't depend on each other
3. **Mocking**: Use mocks for external dependencies to ensure tests are reliable
4. **Data-testid**: Use data-testid attributes for selecting elements in tests
5. **Continuous Testing**: Run tests frequently during development
