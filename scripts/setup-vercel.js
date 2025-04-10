#!/usr/bin/env node

/**
 * This script helps set up Vercel for the project
 * Run with: node scripts/setup-vercel.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function runCommand(command) {
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (err) {
    error(`Command failed: ${command}`);
    return false;
  }
}

// Main function
async function setupVercel() {
  log('🚀 Setting up Vercel for your project...', colors.cyan);
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (err) {
    info('Vercel CLI not found. Installing...');
    if (!runCommand('npm install -g vercel')) {
      error('Failed to install Vercel CLI. Please install it manually with: npm install -g vercel');
      process.exit(1);
    }
  }
  
  // Check if project is already linked to Vercel
  const vercelConfigPath = path.join(process.cwd(), '.vercel', 'project.json');
  let isLinked = false;
  
  if (fs.existsSync(vercelConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      if (config.projectId && config.orgId) {
        isLinked = true;
        success('Project is already linked to Vercel.');
        info(`Project ID: ${config.projectId}`);
        info(`Organization ID: ${config.orgId}`);
      }
    } catch (err) {
      warning('Found .vercel/project.json but it appears to be invalid.');
    }
  }
  
  if (!isLinked) {
    info('Linking project to Vercel...');
    info('You will be prompted to log in to Vercel if not already logged in.');
    info('Follow the prompts to set up your project.');
    
    if (!runCommand('vercel link')) {
      error('Failed to link project to Vercel.');
      process.exit(1);
    }
    
    success('Project linked to Vercel successfully!');
  }
  
  // Pull environment variables
  info('Pulling environment variables from Vercel...');
  if (!runCommand('vercel env pull .env')) {
    warning('Failed to pull environment variables. This is not critical, but you may need to set them manually.');
  }
  
  // Final instructions
  success('Vercel setup complete!');
  info('\nNext steps:');
  info('1. Make sure your GitHub repository has the following secrets set:');
  info('   - VERCEL_TOKEN: Your Vercel API token');
  info('   - VERCEL_ORG_ID: Your Vercel organization ID');
  info('   - VERCEL_PROJECT_ID: Your Vercel project ID');
  info('\n2. You can find these values by running:');
  info('   - For VERCEL_TOKEN: Create a token at https://vercel.com/account/tokens');
  info('   - For VERCEL_ORG_ID and VERCEL_PROJECT_ID: Check .vercel/project.json');
  info('\n3. To deploy manually, run:');
  info('   vercel --prod');
}

// Run the setup
setupVercel().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
