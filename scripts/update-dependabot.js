#!/usr/bin/env node

/**
 * This script helps update the Dependabot configuration based on the current dependencies
 * Run with: node scripts/update-dependabot.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

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
async function updateDependabotConfig() {
  log('🔄 Updating Dependabot configuration...', colors.cyan);
  
  const dependabotPath = path.join(process.cwd(), '.github', 'dependabot.yml');
  
  // Check if dependabot.yml exists
  if (!fs.existsSync(dependabotPath)) {
    error('Dependabot configuration file not found at .github/dependabot.yml');
    process.exit(1);
  }
  
  try {
    // Read the current configuration
    const dependabotContent = fs.readFileSync(dependabotPath, 'utf8');
    const dependabotConfig = yaml.parse(dependabotContent);
    
    // Read package.json files
    const rootPackageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const clientPackageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'client', 'package.json'), 'utf8'));
    const serverPackageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'server', 'package.json'), 'utf8'));
    
    // Extract dependencies
    const rootDeps = { 
      ...rootPackageJson.dependencies || {}, 
      ...rootPackageJson.devDependencies || {} 
    };
    const clientDeps = { 
      ...clientPackageJson.dependencies || {}, 
      ...clientPackageJson.devDependencies || {} 
    };
    const serverDeps = { 
      ...serverPackageJson.dependencies || {}, 
      ...serverPackageJson.devDependencies || {} 
    };
    
    // Update groups based on actual dependencies
    const updates = dependabotConfig.updates;
    
    // Update root project groups
    const rootUpdate = updates.find(u => u.directory === '/');
    if (rootUpdate && rootUpdate.groups) {
      info('Updating root project dependency groups...');
      // You can customize this logic based on your grouping preferences
    }
    
    // Update client groups
    const clientUpdate = updates.find(u => u.directory === '/client');
    if (clientUpdate && clientUpdate.groups) {
      info('Updating client dependency groups...');
      
      // Find React packages
      const reactPackages = Object.keys(clientDeps).filter(dep => 
        dep.startsWith('react') || dep.startsWith('@testing-library/')
      );
      
      if (reactPackages.length > 0) {
        clientUpdate.groups['react-packages'].patterns = reactPackages.map(dep => {
          return dep.includes('/') ? dep.replace('/', '\\/') : dep;
        });
        success(`Found ${reactPackages.length} React-related packages`);
      }
    }
    
    // Update server groups
    const serverUpdate = updates.find(u => u.directory === '/server');
    if (serverUpdate && serverUpdate.groups) {
      info('Updating server dependency groups...');
      
      // Find Express packages
      const expressPackages = Object.keys(serverDeps).filter(dep => 
        dep.startsWith('express') || dep === 'cors' || dep === 'body-parser'
      );
      
      // Find database packages
      const dbPackages = Object.keys(serverDeps).filter(dep => 
        dep.startsWith('mongoose') || dep.startsWith('mongodb')
      );
      
      if (expressPackages.length > 0) {
        serverUpdate.groups['express-packages'].patterns = expressPackages.map(dep => {
          return dep.includes('/') ? dep.replace('/', '\\/') : dep;
        });
        success(`Found ${expressPackages.length} Express-related packages`);
      }
      
      if (dbPackages.length > 0) {
        serverUpdate.groups['database-packages'].patterns = dbPackages.map(dep => {
          return dep.includes('/') ? dep.replace('/', '\\/') : dep;
        });
        success(`Found ${dbPackages.length} database-related packages`);
      }
    }
    
    // Write updated configuration
    fs.writeFileSync(dependabotPath, yaml.stringify(dependabotConfig));
    success('Dependabot configuration updated successfully!');
    
  } catch (err) {
    error(`Failed to update Dependabot configuration: ${err.message}`);
    process.exit(1);
  }
}

// Run the update
updateDependabotConfig().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
