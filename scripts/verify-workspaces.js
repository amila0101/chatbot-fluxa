const fs = require('fs');
const path = require('path');

function verifyWorkspaces() {
  const rootPath = path.resolve(__dirname, '..');
  const rootPackageJson = require('../package.json');
  
  // Check if workspaces are defined
  if (!rootPackageJson.workspaces || !Array.isArray(rootPackageJson.workspaces)) {
    throw new Error('Workspaces not properly defined in root package.json');
  }

  // Verify each workspace
  rootPackageJson.workspaces.forEach(workspace => {
    const workspacePath = path.join(rootPath, workspace);
    const packageJsonPath = path.join(workspacePath, 'package.json');

    // Check if workspace directory exists
    if (!fs.existsSync(workspacePath)) {
      throw new Error(`Workspace directory not found: ${workspace}`);
    }

    // Check if package.json exists in workspace
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json not found in workspace: ${workspace}`);
    }

    // Verify package.json content
    const workspacePackageJson = require(packageJsonPath);
    if (!workspacePackageJson.name) {
      throw new Error(`Name not defined in ${workspace}/package.json`);
    }
  });

  console.log('✅ Workspace verification completed successfully');
  console.log('Found workspaces:', rootPackageJson.workspaces);
}

try {
  verifyWorkspaces();
} catch (error) {
  console.error('❌ Workspace verification failed:', error.message);
  process.exit(1);
}