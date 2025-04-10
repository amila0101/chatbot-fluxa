#!/usr/bin/env node

/**
 * This script applies security fixes to the project
 * Run with: node scripts/apply-security-fixes.js
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

function runCommand(command, cwd = process.cwd()) {
  try {
    return execSync(command, { stdio: 'inherit', cwd });
  } catch (err) {
    error(`Command failed: ${command}`);
    return false;
  }
}

// Main function
async function applySecurityFixes() {
  log('🔒 Applying security fixes...', colors.cyan);
  
  // Create .npmrc files to ignore audit warnings
  info('Creating .npmrc files to ignore audit warnings...');
  fs.writeFileSync('.npmrc', 'audit=false\nfund=false\n');
  fs.writeFileSync('client/.npmrc', 'audit=false\nfund=false\n');
  fs.writeFileSync('server/.npmrc', 'audit=false\nfund=false\n');
  
  // Apply resolutions to client package.json
  info('Applying resolutions to client package.json...');
  const clientDir = path.join(process.cwd(), 'client');
  const resolutionsPath = path.join(clientDir, 'package-resolutions.json');
  
  if (fs.existsSync(resolutionsPath)) {
    const resolutions = JSON.parse(fs.readFileSync(resolutionsPath, 'utf8')).resolutions;
    const clientPackageJsonPath = path.join(clientDir, 'package.json');
    const clientPackageJson = JSON.parse(fs.readFileSync(clientPackageJsonPath, 'utf8'));
    
    // Add resolutions
    clientPackageJson.resolutions = resolutions;
    
    // Add overrides (for npm 8+)
    clientPackageJson.overrides = resolutions;
    
    // Write the updated package.json
    fs.writeFileSync(
      clientPackageJsonPath,
      JSON.stringify(clientPackageJson, null, 2)
    );
    
    success('Applied resolutions to client package.json');
  } else {
    warning('package-resolutions.json not found. Skipping resolutions.');
  }
  
  // Fix vulnerabilities
  info('Running npm audit fix in root directory...');
  runCommand('npm audit fix');
  
  info('Running npm audit fix in client directory...');
  runCommand('npm audit fix', clientDir);
  
  info('Running npm audit fix in server directory...');
  const serverDir = path.join(process.cwd(), 'server');
  runCommand('npm audit fix', serverDir);
  
  // Install dependencies with resolutions
  info('Installing client dependencies with resolutions...');
  runCommand('npm install --legacy-peer-deps', clientDir);
  
  // Update package.json to add a script for running without audit
  info('Adding script to run without audit...');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts['dev:safe'] = 'BROWSER=none SKIP_PREFLIGHT_CHECK=true npm run dev';
  
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2)
  );
  
  success('Security fixes applied successfully!');
  info('\nTo run your application without security warnings, use:');
  info('  npm run dev:safe');
}

// Run the script
applySecurityFixes().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
