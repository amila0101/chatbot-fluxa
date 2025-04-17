#!/usr/bin/env node

/**
 * Blue-Green Deployment Script
 * 
 * This script manages blue-green deployments for the Chatbot Fluxa application.
 * It handles:
 * 1. Determining the current active environment (blue or green)
 * 2. Deploying to the inactive environment
 * 3. Running health checks on the new deployment
 * 4. Switching traffic to the new environment if health checks pass
 * 5. Providing rollback capability if needed
 */

const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const colors = require('chalk');

// Configuration
const config = {
  vercelToken: process.env.VERCEL_TOKEN,
  vercelOrgId: process.env.VERCEL_ORG_ID,
  vercelProjectId: process.env.VERCEL_PROJECT_ID,
  productionDomain: process.env.PRODUCTION_DOMAIN || 'chatbot-fluxa.com',
  blueDomain: process.env.BLUE_DOMAIN || 'blue.chatbot-fluxa.com',
  greenDomain: process.env.GREEN_DOMAIN || 'green.chatbot-fluxa.com',
  healthEndpoint: '/api/health',
  healthCheckRetries: 5,
  healthCheckInterval: 5000, // 5 seconds
  deploymentTimeout: 300000, // 5 minutes
};

// Logging functions
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function success(message) {
  console.log(colors.green(`[${new Date().toISOString()}] ✅ ${message}`));
}

function error(message) {
  console.error(colors.red(`[${new Date().toISOString()}] ❌ ${message}`));
}

function warning(message) {
  console.warn(colors.yellow(`[${new Date().toISOString()}] ⚠️ ${message}`));
}

// Verify required environment variables
function checkEnvironment() {
  const requiredVars = ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Determine which environment is currently active (blue or green)
async function getCurrentEnvironment() {
  try {
    log('Determining current active environment...');
    
    // Get the current production deployment
    const cmd = `vercel domains ls ${config.productionDomain} --token ${config.vercelToken}`;
    const output = execSync(cmd).toString();
    
    // Check if blue or green is the current production
    if (output.includes(config.blueDomain)) {
      success('Current active environment: BLUE');
      return 'blue';
    } else if (output.includes(config.greenDomain)) {
      success('Current active environment: GREEN');
      return 'green';
    } else {
      warning('Could not determine current environment, defaulting to BLUE');
      return 'blue';
    }
  } catch (err) {
    warning(`Error determining current environment: ${err.message}`);
    warning('Defaulting to BLUE environment');
    return 'blue';
  }
}

// Deploy to the target environment
async function deployToEnvironment(environment) {
  try {
    log(`Deploying to ${environment.toUpperCase()} environment...`);
    
    // Set environment variable for the deployment
    process.env.ENVIRONMENT_NAME = environment;
    
    // Deploy using Vercel CLI
    const cmd = `vercel --prod --token ${config.vercelToken} --scope ${config.vercelOrgId} --confirm`;
    execSync(cmd, { stdio: 'inherit' });
    
    success(`Deployed to ${environment.toUpperCase()} environment`);
    return true;
  } catch (err) {
    error(`Deployment to ${environment.toUpperCase()} failed: ${err.message}`);
    return false;
  }
}

// Run health checks on the target environment
async function runHealthChecks(environment) {
  const domain = environment === 'blue' ? config.blueDomain : config.greenDomain;
  const healthUrl = `https://${domain}${config.healthEndpoint}`;
  
  log(`Running health checks on ${environment.toUpperCase()} environment: ${healthUrl}`);
  
  for (let i = 0; i < config.healthCheckRetries; i++) {
    try {
      log(`Health check attempt ${i + 1}/${config.healthCheckRetries}...`);
      const response = await axios.get(healthUrl, { timeout: 10000 });
      
      if (response.status === 200 && response.data.status === 'ok') {
        success(`Health check passed for ${environment.toUpperCase()} environment`);
        return true;
      } else {
        warning(`Health check returned unexpected response: ${JSON.stringify(response.data)}`);
      }
    } catch (err) {
      warning(`Health check failed: ${err.message}`);
    }
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, config.healthCheckInterval));
  }
  
  error(`Health checks failed for ${environment.toUpperCase()} environment after ${config.healthCheckRetries} attempts`);
  return false;
}

// Switch traffic to the target environment
async function switchTraffic(environment) {
  try {
    log(`Switching traffic to ${environment.toUpperCase()} environment...`);
    
    const domain = environment === 'blue' ? config.blueDomain : config.greenDomain;
    
    // Update the production domain to point to the new environment
    const cmd = `vercel domains add ${config.productionDomain} ${domain} --token ${config.vercelToken}`;
    execSync(cmd, { stdio: 'inherit' });
    
    success(`Traffic switched to ${environment.toUpperCase()} environment`);
    return true;
  } catch (err) {
    error(`Failed to switch traffic: ${err.message}`);
    return false;
  }
}

// Rollback to the previous environment
async function rollback(currentEnv) {
  const previousEnv = currentEnv === 'blue' ? 'green' : 'blue';
  
  warning(`Rolling back to ${previousEnv.toUpperCase()} environment...`);
  
  const success = await switchTraffic(previousEnv);
  
  if (success) {
    success(`Rolled back to ${previousEnv.toUpperCase()} environment`);
  } else {
    error('Rollback failed');
  }
  
  return success;
}

// Main function
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const forceEnv = args.find(arg => arg.startsWith('--env='))?.split('=')[1];
    const skipHealthCheck = args.includes('--skip-health-check');
    const forceRollback = args.includes('--rollback');
    
    // Check environment variables
    checkEnvironment();
    
    // Get current environment
    const currentEnv = await getCurrentEnvironment();
    
    if (forceRollback) {
      await rollback(currentEnv);
      return;
    }
    
    // Determine target environment
    const targetEnv = forceEnv || (currentEnv === 'blue' ? 'green' : 'blue');
    
    log(`Target environment for deployment: ${targetEnv.toUpperCase()}`);
    
    // Deploy to target environment
    const deploySuccess = await deployToEnvironment(targetEnv);
    
    if (!deploySuccess) {
      error('Deployment failed, aborting');
      process.exit(1);
    }
    
    // Run health checks
    let healthCheckSuccess = true;
    if (!skipHealthCheck) {
      healthCheckSuccess = await runHealthChecks(targetEnv);
    }
    
    if (!healthCheckSuccess) {
      error('Health checks failed, not switching traffic');
      
      if (await confirmPrompt('Do you want to proceed with traffic switch anyway?')) {
        warning('Proceeding with traffic switch despite health check failures');
      } else {
        process.exit(1);
      }
    }
    
    // Switch traffic
    const switchSuccess = await switchTraffic(targetEnv);
    
    if (!switchSuccess) {
      error('Traffic switch failed');
      process.exit(1);
    }
    
    success(`Blue-green deployment completed successfully. New active environment: ${targetEnv.toUpperCase()}`);
  } catch (err) {
    error(`Deployment failed: ${err.message}`);
    process.exit(1);
  }
}

// Helper function for confirmation prompts
function confirmPrompt(message) {
  return new Promise(resolve => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(`${message} (y/N) `, answer => {
      readline.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Run the script
main();
