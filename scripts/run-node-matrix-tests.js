#!/usr/bin/env node

/**
 * Node.js Matrix Testing Script
 *
 * This script helps run tests across multiple Node.js versions using nvm.
 * It requires nvm to be installed on the system.
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

function runCommand(command, options = {}) {
  try {
    return execSync(command, { stdio: options.silent ? 'ignore' : 'inherit' });
  } catch (err) {
    if (!options.ignoreError) {
      error(`Command failed: ${command}`);
      if (err.message) {
        error(err.message);
      }
      if (options.exitOnError) {
        process.exit(1);
      }
    }
    return false;
  }
}

// Check if nvm is installed
function checkNvm() {
  try {
    // Try to source nvm and check if it's available
    const nvmPath = path.join(process.env.HOME || process.env.USERPROFILE, '.nvm/nvm.sh');
    if (fs.existsSync(nvmPath)) {
      info('NVM found at: ' + nvmPath);
      return true;
    }

    // Try running nvm command
    execSync('nvm --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    error('NVM is not installed or not available in the current shell.');
    info('Please install NVM from: https://github.com/nvm-sh/nvm');
    info('Or run this script in a shell where NVM is available.');
    return false;
  }
}

// Main function
async function runMatrixTests() {
  log('🧪 Running Node.js Matrix Tests', colors.cyan);

  // Check if nvm is available
  if (!checkNvm()) {
    process.exit(1);
  }

  // Node.js versions to test
  const nodeVersions = ['18', '20', '22'];
  const results = {};

  // Save current Node.js version to restore later
  let currentNodeVersion;
  try {
    currentNodeVersion = execSync('node -v').toString().trim();
    info(`Current Node.js version: ${currentNodeVersion}`);
  } catch (err) {
    warning('Could not determine current Node.js version');
  }

  // Run tests for each Node.js version
  for (const version of nodeVersions) {
    log(`\n📌 Testing with Node.js ${version}`, colors.magenta);

    // Install Node.js version if not already installed
    info(`Installing Node.js ${version} (if needed)...`);
    runCommand(`nvm install ${version}`, { ignoreError: true });

    // Use the installed version
    info(`Switching to Node.js ${version}...`);
    if (!runCommand(`nvm use ${version}`, { ignoreError: true })) {
      error(`Failed to switch to Node.js ${version}`);
      results[version] = 'FAILED';
      continue;
    }

    // Verify Node.js version
    const nodeVersion = execSync('node -v').toString().trim();
    info(`Using Node.js ${nodeVersion}`);

    // Set environment variables for all Node.js versions
    process.env.SKIP_PREFLIGHT_CHECK = 'true';
    info('Set SKIP_PREFLIGHT_CHECK=true for compatibility');

    // We don't need to set NODE_OPTIONS here anymore since we're using specific scripts
    // that already include the necessary flags

    // Run server tests
    info('Running server tests...');
    const serverTestsResult = runCommand('npm run test:server', { ignoreError: true });

    // Run client tests using our custom test runner
    info('Running client tests...');
    const clientTestsResult = runCommand('npm run test:client', { ignoreError: true });

    // Try building the project using our custom build script
    info('Building project...');
    const buildResult = runCommand('npm run build', { ignoreError: true });

    // Record results
    if (serverTestsResult && clientTestsResult && buildResult) {
      results[version] = 'PASSED';
      success(`All tests passed on Node.js ${version}`);
    } else {
      results[version] = 'FAILED';
      if (!serverTestsResult) error('Server tests failed');
      if (!clientTestsResult) error('Client tests failed');
      if (!buildResult) error('Build failed');
    }

    // Reset environment variables
    delete process.env.SKIP_PREFLIGHT_CHECK;
  }

  // Restore original Node.js version
  if (currentNodeVersion) {
    info(`Restoring Node.js ${currentNodeVersion}...`);
    runCommand(`nvm use ${currentNodeVersion.replace('v', '')}`, { ignoreError: true });
  }

  // Generate report
  log('\n📊 Node.js Compatibility Report', colors.cyan);
  log('=============================', colors.cyan);

  for (const [version, result] of Object.entries(results)) {
    const resultColor = result === 'PASSED' ? colors.green : colors.red;
    log(`Node.js ${version}: ${result}`, resultColor);
  }

  // Save report to file
  const reportContent = `# Node.js Compatibility Report
Generated on ${new Date().toISOString()}

| Node.js Version | Status |
|----------------|--------|
${Object.entries(results).map(([version, result]) => `| ${version} | ${result} |`).join('\n')}

## Notes

- Node.js 18.x is the primary supported version
- Node.js 20.x and 22.x may require the --openssl-legacy-provider flag for client builds
`;

  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `node-compatibility-${new Date().toISOString().split('T')[0]}.md`);
  fs.writeFileSync(reportPath, reportContent);

  success(`Report saved to ${reportPath}`);
}

// Run the script
runMatrixTests().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
