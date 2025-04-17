# Environment Variables

This document provides a comprehensive reference for all environment variables used in Chatbot Fluxa.

## Overview

Chatbot Fluxa uses environment variables for configuration to:

1. Keep sensitive information out of the codebase
2. Allow for different configurations in different environments
3. Simplify deployment across various platforms
4. Enable customization without code changes

## Environment Files

Environment variables are typically stored in `.env` files:

- `.env`: Default environment variables (not committed to version control)
- `.env.example`: Example environment file with placeholder values (committed to version control)
- `.env.development`: Development-specific variables (optional)
- `.env.production`: Production-specific variables (optional)
- `.env.test`: Test-specific variables (optional)

## Server Environment Variables

These variables are used by the server-side code.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/chatbot` or `mongodb+srv://user:password@cluster.mongodb.net/chatbot` |
| `AI_API_KEY` | OpenAI API key | `sk-abcdef123456789` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Port for the server to listen on | `5000` | `3000` |
| `NODE_ENV` | Environment mode | `development` | `production`, `development`, `test` |
| `LOG_LEVEL` | Logging verbosity | `info` | `debug`, `info`, `warn`, `error` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | `https://example.com,http://localhost:3000` |
| `RATE_LIMIT_MAX` | Maximum requests per window | `5` | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `60000` | `3600000` |
| `JWT_SECRET` | Secret for JWT token signing | - | `your-secret-key` |
| `JWT_EXPIRY` | JWT token expiry time | `1d` | `7d`, `24h`, `60m` |
| `AI_MODEL` | Default AI model to use | `default` | `gpt-3.5-turbo`, `gemini-pro` |
| `OPENAI_API_KEY` | OpenAI API key (alternative to AI_API_KEY) | - | `sk-abcdef123456789` |

## Client Environment Variables

These variables are used by the client-side code.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_GEMINI_API_KEY` | Google Gemini API key | `AIzaSyABC123DEF456` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `REACT_APP_API_URL` | URL of the backend API | `/api` | `https://api.example.com` |
| `REACT_APP_DEFAULT_MODEL` | Default AI model | `gemini` | `openai` |
| `REACT_APP_THEME` | Default theme | `dark` | `light`, `dark` |
| `SKIP_PREFLIGHT_CHECK` | Skip Create React App preflight check | `false` | `true` |
| `NODE_OPTIONS` | Node.js options | - | `--openssl-legacy-provider` |

## CI/CD Environment Variables

These variables are used in CI/CD pipelines and deployment processes.

### GitHub Actions

| Variable | Description | Example |
|----------|-------------|---------|
| `VERCEL_TOKEN` | Vercel API token | `vercel_token_123456` |
| `VERCEL_ORG_ID` | Vercel organization ID | `team_abcdefg` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_123456` |
| `MONGODB_URI` | MongoDB connection string for tests | `mongodb://localhost:27017/test` |
| `AI_API_KEY` | AI API key for tests | `dummy-key` |
| `REACT_APP_GEMINI_API_KEY` | Gemini API key for tests | `dummy-key` |

### Vercel Deployment

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:password@cluster.mongodb.net/chatbot` |
| `AI_API_KEY` | OpenAI API key | `sk-abcdef123456789` |
| `REACT_APP_GEMINI_API_KEY` | Google Gemini API key | `AIzaSyABC123DEF456` |
| `NODE_ENV` | Environment mode | `production` |

## Synthetic Monitoring Environment Variables

These variables are used by the synthetic monitoring system.

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NODE_ENV` | Environment mode | `development` | `production`, `staging` |
| `LOG_LEVEL` | Logging verbosity | `info` | `debug`, `info`, `warn`, `error` |
| `STAGING_API_URL` | Staging API URL | - | `https://staging-api.chatbot-fluxa.com/api` |
| `STAGING_WEB_URL` | Staging web URL | - | `https://staging.chatbot-fluxa.com` |
| `PRODUCTION_API_URL` | Production API URL | - | `https://api.chatbot-fluxa.com/api` |
| `PRODUCTION_WEB_URL` | Production web URL | - | `https://chatbot-fluxa.com` |
| `TEST_ADMIN_TOKEN` | Admin token for tests | - | `test-admin-token` |
| `SLACK_WEBHOOK_URL` | Slack webhook for alerts | - | `https://hooks.slack.com/services/...` |
| `SLACK_CHANNEL` | Slack channel for alerts | `#monitoring-alerts` | `#alerts` |
| `ALERT_EMAIL_RECIPIENTS` | Email recipients for alerts | - | `admin@example.com,oncall@example.com` |
| `ALERT_EMAIL_FROM` | From address for alert emails | `monitoring@chatbot-fluxa.com` | `alerts@example.com` |

## Setting Environment Variables

### Local Development

1. Create a `.env` file in the appropriate directory (root, client, or server)
2. Add variables in the format `KEY=value`
3. Restart the application to apply changes

Example `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/chatbot
AI_API_KEY=your_openai_api_key_here
PORT=5000
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with its key and value
4. Redeploy your application to apply changes

### GitHub Actions

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add each secret with its name and value
4. Reference secrets in workflows using `${{ secrets.SECRET_NAME }}`

## Security Considerations

- Never commit `.env` files to version control
- Use different values for different environments
- Rotate API keys and secrets regularly
- Use the least privileged access for API keys
- Consider using a secrets manager for production environments

## Troubleshooting

### Common Issues

#### Environment Variables Not Loading

- Ensure the `.env` file is in the correct location
- Verify the variable name is correct (case-sensitive)
- Restart the application after changing environment variables
- Check that `dotenv` is properly configured

#### "Invalid API Key" Errors

- Verify the API key is correct and active
- Check for whitespace in the API key value
- Ensure the API key has the necessary permissions
- Verify the API service is available

#### Client-Side Variables Not Working

- Ensure client-side variables start with `REACT_APP_`
- Rebuild the client after changing environment variables
- Check that the variables are referenced correctly in code

## Best Practices

1. **Use `.env.example`**: Provide an example environment file with placeholder values
2. **Document All Variables**: Keep this reference up to date with all variables
3. **Validate Required Variables**: Check for required variables on application startup
4. **Use Sensible Defaults**: Provide default values for optional variables
5. **Environment-Specific Files**: Use different files for different environments
6. **Minimal Production Variables**: Only use necessary variables in production
