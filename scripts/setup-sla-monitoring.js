#!/usr/bin/env node

/**
 * Setup SLA Monitoring
 * 
 * This script sets up the necessary directories and initial files for SLA monitoring.
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

// Main function
async function setupSlaMonitoring() {
  log('🔧 Setting up SLA monitoring...', colors.cyan);
  
  // Create reports directory
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    info('Creating reports directory...');
    fs.mkdirSync(reportsDir, { recursive: true });
  } else {
    info('Reports directory already exists');
  }
  
  // Create public directory for dashboard
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    info('Creating public directory...');
    fs.mkdirSync(publicDir, { recursive: true });
  } else {
    info('Public directory already exists');
  }
  
  // Install required dependencies
  info('Installing required dependencies...');
  try {
    execSync('npm install @octokit/rest --save-dev', { stdio: 'inherit' });
    success('Dependencies installed');
  } catch (err) {
    warning('Failed to install dependencies. You may need to install them manually:');
    log('npm install @octokit/rest --save-dev');
  }
  
  // Create an empty initial report
  const initialReport = {
    timestamp: new Date().toISOString(),
    totalIssues: 0,
    withinSla: 0,
    slaCaution: 0,
    slaBreached: 0,
    noSla: 0,
    issuesByPriority: {
      critical: { total: 0, breached: 0 },
      high: { total: 0, breached: 0 },
      medium: { total: 0, breached: 0 },
      low: { total: 0, breached: 0 },
      none: { total: 0, breached: 0 }
    }
  };
  
  const initialReportPath = path.join(reportsDir, `sla-report-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(initialReportPath, JSON.stringify(initialReport, null, 2));
  
  // Create an initial dashboard
  info('Generating initial dashboard...');
  try {
    execSync('node scripts/generate-sla-dashboard.js', { stdio: 'inherit' });
    success('Initial dashboard generated');
  } catch (err) {
    warning('Failed to generate initial dashboard. You can generate it later with:');
    log('npm run sla-dashboard');
  }
  
  success('SLA monitoring setup complete!');
  info('\nYou can now use the following commands:');
  log('  npm run monitor-sla     - Run SLA monitoring');
  log('  npm run sla-report      - Generate SLA report');
  log('  npm run sla-dashboard   - Generate SLA dashboard');
}

// Run the script
setupSlaMonitoring().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
