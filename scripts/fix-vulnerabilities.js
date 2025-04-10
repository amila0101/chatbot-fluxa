#!/usr/bin/env node

/**
 * This script helps fix security vulnerabilities in the project
 * Run with: node scripts/fix-vulnerabilities.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function runCommand(command, cwd = process.cwd()) {
  try {
    return execSync(command, { stdio: 'inherit', cwd });
  } catch (err) {
    error(`Command failed: ${command}`);
    return false;
  }
}

// Main function
async function fixVulnerabilities() {
  log('🔒 Fixing security vulnerabilities...', colors.cyan);
  
  // Fix client vulnerabilities
  info('Fixing client vulnerabilities...');
  const clientDir = path.join(process.cwd(), 'client');
  
  // Install specific versions of vulnerable packages
  runCommand('npm install nth-check@^2.0.1 postcss@^8.4.31 svgo@^3.0.2 @svgr/plugin-svgo@^8.0.1 css-select@^5.1.0 --save-dev', clientDir);
  
  // Clean and reinstall
  runCommand('npm ci --legacy-peer-deps', clientDir);
  
  // Fix server vulnerabilities
  info('Fixing server vulnerabilities...');
  const serverDir = path.join(process.cwd(), 'server');
  runCommand('npm audit fix', serverDir);
  
  // Final check
  info('Running final security check...');
  try {
    execSync('npm run security-check', { stdio: 'pipe' });
    success('All vulnerabilities have been fixed!');
  } catch (err) {
    const output = err.stdout.toString();
    if (output.includes('0 vulnerabilities')) {
      success('All vulnerabilities have been fixed!');
    } else {
      warning('Some vulnerabilities could not be automatically fixed.');
      warning('You may need to run: npm run security-fix-force');
      console.log(output);
    }
  }
}

// Run the fix
fixVulnerabilities().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
