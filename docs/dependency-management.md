# Dependency Management

This document outlines how dependencies are managed in this project, including automated updates and security patches.

## Automated Dependency Updates

We use GitHub's Dependabot to automatically keep our dependencies up-to-date and address security vulnerabilities.

### How It Works

1. **Weekly Scans**: Dependabot scans our dependencies every Monday at 09:00 UTC.
2. **Pull Requests**: When updates are available, Dependabot creates pull requests with the changes.
3. **Automated Testing**: Our CI/CD pipeline automatically tests these updates to ensure they don't break anything.
4. **Review Process**: Pull requests require review before merging.

### Configuration

The Dependabot configuration is located in `.github/dependabot.yml`. It includes:

- Separate configurations for the root project, client, and server
- Weekly update schedule
- Grouping of related dependencies
- Exclusion of major version updates (to avoid breaking changes)

## Security Scanning

We use several tools to scan for security vulnerabilities:

### GitHub CodeQL

CodeQL performs static code analysis to find potential security issues in our codebase. It runs:
- On every push to the main branch
- On every pull request to the main branch
- Weekly (every Monday at 12:00 UTC)

The configuration is in `.github/workflows/codeql-analysis.yml`.

### npm audit

We run `npm audit` as part of our CI/CD pipeline to check for known vulnerabilities in our dependencies. This happens:
- During the build process
- When dependency updates are proposed

## Handling Dependency Updates

### For Contributors

When you receive a Dependabot pull request:

1. Review the changes and check the CI/CD results
2. Test locally if necessary
3. Approve and merge if everything looks good

### For Maintainers

Regular maintenance tasks:

1. Review and merge Dependabot pull requests promptly
2. Run `npm audit fix` periodically to address vulnerabilities
3. Update the Dependabot configuration as project needs change

## Manual Security Checks

In addition to automated checks, you can run these commands locally:

```bash
# Check for vulnerabilities in production dependencies
npm audit --production

# Check for vulnerabilities in all dependencies
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix

# Update all dependencies to their latest versions
npm update
```

## Best Practices

1. **Keep Dependencies Minimal**: Only add dependencies that are truly needed
2. **Prefer Established Libraries**: Choose well-maintained libraries with good security records
3. **Pin Versions**: Use exact versions or appropriate version ranges
4. **Regular Audits**: Periodically review all dependencies for necessity and security
