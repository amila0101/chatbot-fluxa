#!/usr/bin/env node

/**
 * Custom test runner for React applications
 * This script runs Jest directly instead of using react-scripts
 */

const jest = require('jest');
const path = require('path');
const fs = require('fs');

// Set environment variables
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';
process.env.SKIP_PREFLIGHT_CHECK = 'true';

// Make sure any symlinks in the project folder are resolved
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// Define paths
const paths = {
  appSrc: resolveApp('src'),
  appPackageJson: resolveApp('package.json'),
  appNodeModules: resolveApp('node_modules'),
};

// Create Jest configuration
const createJestConfig = () => {
  const packageJson = require(paths.appPackageJson);
  
  return {
    roots: ['<rootDir>/src'],
    collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/*.d.ts'],
    setupFiles: [require.resolve('react-app-polyfill/jsdom')],
    setupFilesAfterEnv: [
      '<rootDir>/src/setupTests.js'
    ],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
      '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
    ],
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(js|jsx)$': require.resolve('babel-jest'),
      '^.+\\.css$': require.resolve('./config/jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|css|json)$)': require.resolve('./config/jest/fileTransform.js'),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    modulePaths: [],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
      '^.+\\.css$': require.resolve('identity-obj-proxy'),
    },
    moduleFileExtensions: [
      'web.js',
      'js',
      'web.jsx',
      'jsx',
      'json',
      'node'
    ],
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname',
    ],
    resetMocks: true,
  };
};

// Create the Jest config directory and transform files
const configDir = path.join(appDirectory, 'config', 'jest');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Create cssTransform.js
const cssTransformPath = path.join(configDir, 'cssTransform.js');
if (!fs.existsSync(cssTransformPath)) {
  fs.writeFileSync(
    cssTransformPath,
    `'use strict';

module.exports = {
  process() {
    return 'module.exports = {};';
  },
  getCacheKey() {
    return 'cssTransform';
  },
};
`
  );
}

// Create fileTransform.js
const fileTransformPath = path.join(configDir, 'fileTransform.js');
if (!fs.existsSync(fileTransformPath)) {
  fs.writeFileSync(
    fileTransformPath,
    `'use strict';

const path = require('path');
const camelcase = require('camelcase');

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));
    
    if (filename.match(/\\.svg$/)) {
      const pascalCaseFilename = camelcase(path.parse(filename).name, {
        pascalCase: true,
      });
      const componentName = \`Svg\${pascalCaseFilename}\`;
      return \`
        const React = require('react');
        module.exports = {
          __esModule: true,
          default: \${assetFilename},
          ReactComponent: React.forwardRef(function \${componentName}(props, ref) {
            return {
              $$typeof: Symbol.for('react.element'),
              type: 'svg',
              ref: ref,
              key: null,
              props: Object.assign({}, props, {
                children: \${assetFilename}
              })
            };
          }),
        };
      \`;
    }

    return \`module.exports = \${assetFilename};\`;
  },
  getCacheKey() {
    return 'fileTransform';
  },
};
`
  );
}

// Run Jest with the custom config
const argv = process.argv.slice(2);

// Add default arguments for CI mode
if (argv.includes('--ci')) {
  if (!argv.includes('--coverage')) {
    argv.push('--coverage');
  }
  if (!argv.includes('--watchAll=false')) {
    argv.push('--watchAll=false');
  }
}

jest.run([
  ...argv,
  '--config',
  JSON.stringify(createJestConfig()),
]);
