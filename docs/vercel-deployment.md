# Vercel Deployment Guide

This guide explains how to set up and deploy the chatbot project to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- [Vercel CLI](https://vercel.com/docs/cli) installed globally (`npm install -g vercel`)
- Node.js 18.x or higher

## Setup

### 1. Automatic Setup

We've created a script to help you set up Vercel for this project:

```bash
npm run setup-vercel
```

This script will:
- Check if Vercel CLI is installed
- Link your project to Vercel
- Pull environment variables from Vercel

### 2. Manual Setup

If you prefer to set up Vercel manually:

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Link your project to Vercel:
   ```bash
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env
   ```

## Environment Variables

Make sure to set the following environment variables in your Vercel project:

- `MONGODB_URI`: Your MongoDB connection string
- `AI_API_KEY`: Your OpenAI API key
- `REACT_APP_GEMINI_API_KEY`: Your Google Gemini API key

## Deployment

### Manual Deployment

To deploy your project manually:

```bash
npm run deploy
```

Or using the Vercel CLI directly:

```bash
vercel --prod
```

### GitHub Integration

For automatic deployments via GitHub:

1. Connect your GitHub repository to Vercel
2. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

You can find your organization ID and project ID in the `.vercel/project.json` file after linking your project.

## Troubleshooting

### Project Not Found Error

If you see an error like:

```
Error: Project not found ({"VERCEL_PROJECT_ID":"***","VERCEL_ORG_ID":"***"})
```

This means the project IDs in your environment don't match any existing projects in your Vercel account. To fix this:

1. Run the setup script:
   ```bash
   npm run setup-vercel
   ```

2. Update your GitHub secrets with the correct IDs from `.vercel/project.json`

### Deployment Fails

If deployment fails:

1. Check your Vercel logs for specific errors
2. Verify that all required environment variables are set
3. Make sure your project builds locally with `npm run build`
4. Check that your `vercel.json` configuration is correct

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
