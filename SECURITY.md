# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. Email the project maintainers directly or use GitHub's private vulnerability reporting feature
3. Include as much information as possible:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

## Security Measures

This project implements several security measures:

1. **Automated Dependency Updates**: We use Dependabot to keep dependencies up-to-date and address security vulnerabilities.
2. **Code Scanning**: We use GitHub CodeQL to scan for potential security issues in our codebase.
3. **Dependency Review**: All dependency updates are automatically tested before being merged.
4. **Regular Security Audits**: We regularly run `npm audit` to check for vulnerabilities.

## Best Practices

When contributing to this project, please follow these security best practices:

1. Keep all dependencies up-to-date
2. Do not commit sensitive information (API keys, credentials, etc.)
3. Use environment variables for configuration
4. Validate all user inputs
5. Follow the principle of least privilege
6. Use HTTPS for all external communications
