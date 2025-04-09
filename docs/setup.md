# Chatbot Project Setup Guide

## Overview
This document provides comprehensive setup instructions for the Chatbot project, including development environment setup, deployment processes, and monitoring configuration.

## Prerequisites
- Node.js 18.x or higher
- MongoDB
- GitHub account
- Render account
- UptimeRobot account
- Sentry account
- Terraform CLI

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd chatbot-project
```

2. Install dependencies:
```bash
# Server setup
cd server
npm install

# Client setup
cd ../client
npm install
```

3. Configure environment variables:
- Copy `.env.example` to `.env` in both server and client directories
- Update the variables with your credentials

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD pipeline:

1. **Testing**: Automated tests run on every push and pull request
2. **Security Scanning**: CodeQL analysis for security vulnerabilities
3. **Deployment**: Automatic deployment to Render on main branch updates

### Pipeline Configuration
- Location: `.github/workflows/main.yml`
- Triggers: Push to main branch, Pull Requests
- Stages: test → security → deploy

## Infrastructure as Code

Terraform is used to manage cloud infrastructure:

1. Initialize Terraform:
```bash
cd terraform
terraform init
```

2. Configure variables in `terraform.tfvars`:
```hcl
render_api_key = "your-key"
uptimerobot_api_key = "your-key"
# Add other required variables
```

3. Apply configuration:
```bash
terraform apply
```

## Monitoring Setup

### Sentry Integration
1. Create a project in Sentry
2. Add DSN to environment variables
3. Error tracking is automatically configured

### UptimeRobot Monitoring
1. Configured via Terraform
2. Monitors application health endpoint
3. Alerts configured for downtime

## Security

### CodeQL Analysis
- Automated security scanning
- Runs on every push and pull request
- Results available in GitHub Security tab

### Best Practices
- No secrets in code
- Regular dependency updates
- Security headers configured
- Rate limiting implemented

## API Documentation

API documentation is available via Swagger UI at `/api-docs` endpoint.

### Key Endpoints
- POST `/chat`: Main chat endpoint
- GET `/health`: Health check endpoint

## Deployment

### Render Deployment
1. Automatic deployment via GitHub Actions
2. Environment variables managed via Terraform
3. Health checks configured

### Monitoring Deployment
1. UptimeRobot monitors application status
2. Sentry tracks errors and performance
3. Logs available in Render dashboard

## Troubleshooting

### Common Issues
1. **Deployment Failures**
   - Check GitHub Actions logs
   - Verify Render configuration
   - Confirm environment variables

2. **Monitoring Alerts**
   - Check application logs
   - Verify database connectivity
   - Check API rate limits

## Maintenance

### Regular Tasks
1. Update dependencies monthly
2. Review security scan reports
3. Monitor error rates and performance
4. Backup database regularly

### Scaling
1. Render automatic scaling configured
2. Database scaling via MongoDB Atlas
3. CDN integration available if needed