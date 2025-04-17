# Blue-Green Deployment Guide

This document explains the blue-green deployment strategy implemented for the Chatbot Fluxa application.

## Overview

Blue-green deployment is a technique that reduces downtime and risk by running two identical production environments called Blue and Green. At any time, only one of the environments is live, serving all production traffic. The other environment remains idle.

### Benefits

- **Zero Downtime Deployments**: Users experience no downtime during deployments
- **Easy Rollbacks**: If issues are detected, traffic can be immediately routed back to the previous environment
- **Testing in Production-Like Environment**: The new version can be tested in a production-like environment before receiving traffic
- **Gradual Transition**: Can be combined with canary deployments for gradual traffic shifting

## Architecture

Our blue-green deployment setup consists of:

1. **Blue Environment**: One production environment (typically the current stable version)
2. **Green Environment**: Another production environment (typically the new version being deployed)
3. **Traffic Router**: Vercel's domain management that directs traffic to either Blue or Green
4. **Health Checks**: Automated checks to verify the new deployment is healthy before switching traffic

## Deployment Process

### Automatic Deployment (via CI/CD)

1. Code is pushed to the main branch
2. CI/CD pipeline runs tests
3. If tests pass, the pipeline:
   - Determines which environment is currently active (Blue or Green)
   - Deploys to the inactive environment
   - Runs health checks on the new deployment
   - If health checks pass, switches traffic to the new environment

### Manual Deployment

```bash
# Deploy using the blue-green strategy (automatically selects the inactive environment)
npm run deploy:blue-green

# Force deployment to a specific environment
npm run deploy:blue
npm run deploy:green
```

## Rollback Process

If issues are detected after deployment, you can quickly roll back:

### Automatic Rollback

The deployment script includes health checks. If these fail, the deployment will not switch traffic to the new environment.

### Manual Rollback

```bash
# Roll back to the previous environment
npm run rollback
```

You can also use the GitHub Actions rollback workflow by:

1. Going to the "Actions" tab in the GitHub repository
2. Selecting the "Rollback Deployment" workflow
3. Clicking "Run workflow"
4. Selecting the environment to roll back to (previous, blue, or green)

## Monitoring During Deployment

During and after deployment, monitor:

1. **Health Checks**: `/api/health` endpoint should return status "ok"
2. **Error Rates**: Watch for increased error rates in logs
3. **Response Times**: Monitor for performance degradation
4. **User Experience**: Verify critical user journeys still work

## Environment Variables

The blue-green deployment process uses the following environment variables:

- `ENVIRONMENT_NAME`: Set to either "blue" or "green" to identify the environment
- `PRODUCTION_DOMAIN`: The main production domain (e.g., chatbot-fluxa.com)
- `BLUE_DOMAIN`: The domain for the blue environment (e.g., blue.chatbot-fluxa.com)
- `GREEN_DOMAIN`: The domain for the green environment (e.g., green.chatbot-fluxa.com)
- `INTERNAL_CHECK_TOKEN`: Token for accessing detailed health information

## Terraform Infrastructure

The blue-green deployment infrastructure is managed using Terraform:

```bash
# Initialize Terraform
cd terraform/blue-green
terraform init

# Apply the configuration
terraform apply
```

## Troubleshooting

### Common Issues

1. **Traffic Not Switching**
   - Check Vercel domain configuration
   - Verify health checks are passing

2. **Health Checks Failing**
   - Check application logs
   - Verify the application is running correctly
   - Check if the health endpoint is accessible

3. **Deployment Failing**
   - Check CI/CD logs
   - Verify Vercel configuration

### Getting Help

If you encounter issues with the blue-green deployment process, contact the DevOps team or refer to the internal documentation for more detailed troubleshooting steps.
