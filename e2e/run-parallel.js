#!/usr/bin/env node

/**
 * Script to run Cypress tests in parallel
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const waitOn = require('wait-on');

// Configuration
const config = {
  // Number of parallel processes to run (default: number of CPU cores)
  numProcesses: Math.max(1, os.cpus().length - 1),
  // Directory containing test files
  testDir: path.join(__dirname, 'cypress', 'e2e'),
  // Browser to use
  browser: 'electron',
  // Whether to run in headless mode
  headless: true,
};

// Get all test files
function getTestFiles() {
  const files = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.cy.js')) {
        files.push(fullPath);
      }
    }
  }

  scanDir(config.testDir);
  return files;
}

// Split files into chunks for parallel execution
function splitFiles(files, numChunks) {
  const chunks = Array.from({ length: numChunks }, () => []);

  files.forEach((file, index) => {
    chunks[index % numChunks].push(file);
  });

  return chunks;
}

// Run Cypress with specific files
function runCypress(files, index) {
  const args = [
    'run',
    '--browser', config.browser,
    '--headless', config.headless,
    '--spec', files.join(','),
    '--config', 'retries=3',
    '--config', 'defaultCommandTimeout=30000',
    '--config', 'requestTimeout=30000',
    '--config', 'responseTimeout=30000',
    '--config', 'pageLoadTimeout=60000',
  ];

  console.log(`[Process ${index + 1}] Running tests: ${files.map(f => path.basename(f)).join(', ')}`);

  const cypress = spawn('cypress', args, {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: {
      ...process.env,
      CYPRESS_BASE_URL: 'http://localhost:3000',
      DEBUG: 'cypress:*',
    },
  });

  return new Promise((resolve, reject) => {
    cypress.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Cypress process ${index + 1} exited with code ${code}`));
      }
    });
  });
}

// Check if server is running
async function checkServerReady() {
  console.log('Checking if server is running at http://localhost:3000...');
  try {
    await waitOn({
      resources: ['http://localhost:3000'],
      timeout: 120000, // 120 seconds timeout
      interval: 2000, // Check every 2 seconds
      verbose: true, // Enable verbose logging
      httpTimeout: 30000, // 30 seconds HTTP timeout
    });
    console.log('✅ Server is running and ready!');
    return true;
  } catch (error) {
    console.error('❌ Server is not running or not responding!');
    console.error('Please start the server with `npm run start` before running tests.');
    return false;
  }
}

// Main function
async function main() {
  console.log(`🚀 Running Cypress tests in parallel with ${config.numProcesses} processes`);

  // First check if server is ready
  const isServerReady = await checkServerReady();
  if (!isServerReady) {
    process.exit(1);
  }

  const files = getTestFiles();
  console.log(`Found ${files.length} test files`);

  if (files.length === 0) {
    console.log('No test files found. Exiting.');
    return;
  }

  // Adjust number of processes if we have fewer files than processes
  const numProcesses = Math.min(files.length, config.numProcesses);
  const chunks = splitFiles(files, numProcesses);

  console.log(`Split tests into ${chunks.length} chunks for parallel execution`);

  const startTime = Date.now();

  try {
    await Promise.all(chunks.map((chunk, index) => runCypress(chunk, index)));

    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ All tests completed successfully in ${duration.toFixed(2)}s`);
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error(`❌ Tests failed after ${duration.toFixed(2)}s`);
    console.error(error.message);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
