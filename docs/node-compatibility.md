# Node.js Compatibility Guide

This document outlines our approach to ensuring compatibility across multiple Node.js versions and provides guidance for developers working with different Node.js environments.

## Supported Node.js Versions

Our application is tested and supported on the following Node.js versions:

| Version | Support Level | Notes |
|---------|--------------|-------|
| Node.js 18.x | Primary | Fully supported and used in production |
| Node.js 20.x | Secondary | Tested regularly, may require additional flags |
| Node.js 22.x | Experimental | Basic compatibility tested, may have issues |

The minimum required Node.js version is **18.x**.

## Matrix Testing

We use GitHub Actions to automatically test our codebase across multiple Node.js versions. This helps us:

1. Ensure compatibility with newer Node.js releases
2. Identify breaking changes early
3. Provide guidance for developers using different environments

The matrix testing workflow runs:
- On every push to main and development branches
- On pull requests to main and development branches
- Weekly (Sunday at midnight UTC)
- On-demand via manual trigger

## Compatibility Reports

After each matrix test run, a compatibility report is generated and uploaded as an artifact. This report includes:

- Test results for each Node.js version
- Specific issues encountered
- Recommendations for each version

You can access these reports from the GitHub Actions workflow runs.

## Known Issues and Workarounds

### Node.js 20.x and 22.x

**Issue**: OpenSSL-related errors when building the client application.

**Workaround**: Use the `--openssl-legacy-provider` flag:

```bash
# For running the development server
NODE_OPTIONS=--openssl-legacy-provider npm run dev

# For building
NODE_OPTIONS=--openssl-legacy-provider npm run build

# For running tests
NODE_OPTIONS=--openssl-legacy-provider npm run test:client
```

For convenience, we've added scripts that automatically include this flag:

```bash
# For development
npm run dev:safe

# For testing with legacy provider
npm run test:client:legacy
```

These flags are automatically applied in our CI/CD pipelines for Node.js 20.x and above.

### React Scripts Compatibility

**Issue**: `react-scripts` (v3.0.1) has compatibility issues with newer Node.js versions.

**Workaround**: Set the `SKIP_PREFLIGHT_CHECK=true` environment variable:

```bash
# In .env file
SKIP_PREFLIGHT_CHECK=true
```

## Best Practices

1. **Specify Node.js version in your development environment**:
   - Use nvm: `nvm use 18`
   - Use .nvmrc file (included in the repo)

2. **Test on multiple versions when making significant changes**:
   - Run the matrix testing workflow manually
   - Check compatibility reports

3. **Document version-specific issues**:
   - Update this document when discovering new issues
   - Include workarounds when possible

4. **Use version-specific scripts when needed**:
   - For Node.js 20+: `npm run dev:safe` (includes necessary flags)

## Local Testing with Multiple Node.js Versions

You can test your changes locally with different Node.js versions using nvm. We've added a script to automate this process:

```bash
# Run tests across all Node.js versions
npm run test:node-matrix
```

Or you can test manually with specific versions:

```bash
# Install nvm if you haven't already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Install and test with Node.js 18
nvm install 18
nvm use 18
npm run verify

# Test with Node.js 20
nvm install 20
nvm use 20
# Use our scripts with legacy provider flags
npm run test:client:legacy
npm run test:server
npm run build

# Test with Node.js 22
nvm install 22
nvm use 22
# Use our scripts with legacy provider flags
npm run test:client:legacy
npm run test:server
npm run build
```

## Updating Node.js Support

When a new Node.js LTS version is released:

1. Add it to the matrix testing workflow
2. Run the workflow manually to assess compatibility
3. Document any issues and workarounds
4. Update this guide with the new support status

## Future Plans

- Upgrade `react-scripts` to a newer version for better compatibility with modern Node.js
- Gradually transition primary support to Node.js 20.x as Node.js 18.x approaches end-of-life
- Implement automated compatibility reporting in pull requests
