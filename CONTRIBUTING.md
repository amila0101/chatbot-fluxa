# Contributing to Chatbot Project

Thank you for considering contributing to our Chatbot project! This document outlines the process for contributing to the project and helps to streamline our development workflow.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Project Setup](#project-setup)
  - [Development Workflow](#development-workflow)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Style Guidelines](#style-guidelines)
  - [Code Style](#code-style)
  - [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)
- [Review Process](#review-process)
- [Security](#security)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

We expect all contributors to:
- Be respectful and inclusive
- Be collaborative
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Project Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/chatbot-fluxa.git
   cd chatbot-fluxa
   ```
3. Install dependencies:
   ```bash
   npm run install-deps
   ```
4. Set up environment variables:
   - Copy `.env.example` to `.env` in both server and client directories
   - Update the variables with your credentials
5. Start the development server:
   ```bash
   npm run dev
   ```

### Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```
2. Make your changes
3. Run tests to ensure your changes don't break existing functionality:
   ```bash
   npm run verify
   ```
4. Commit your changes (see [Commit Messages](#commit-messages) below)
5. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request from your fork to the main repository

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue using the **Bug Report** template. This template will guide you to provide all the necessary information, including:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment information (browser, OS, etc.)

### Suggesting Features

We welcome feature suggestions! Please create an issue using the **Feature Request** template. This template will guide you to provide all the necessary information, including:

- A clear, descriptive title
- Detailed description of the proposed feature
- Problem statement and proposed solution
- Any relevant mockups or examples
- Explanation of why this feature would be useful to most users

### Reporting Technical Debt

We value code quality and maintainability. If you identify technical debt or code that needs refactoring, please create an issue using the **Technical Debt** template. This template will guide you to provide information about:

- Description of the technical debt
- Location in the codebase
- Current impact on the project
- Proposed solution
- Effort estimation
- Benefits of addressing it

### Pull Requests

1. Update your fork to the latest code on the main branch
2. Create a new branch for your changes
3. Make your changes
4. Test your changes thoroughly
5. Create a pull request with a clear description of the changes

When creating a pull request, you can use one of our templates by adding a query parameter to the PR creation URL:

- **Default**: General purpose template (default)
- **Feature**: For adding new features (`?template=feature.md`)
- **Bugfix**: For fixing bugs (`?template=bugfix.md`)
- **Documentation**: For documentation updates (`?template=documentation.md`)
- **Dependency**: For dependency updates (`?template=dependency.md`)

For example, to use the feature template, your URL would look like:
```
https://github.com/username/repo/compare/main...branch?template=feature.md
```

## Style Guidelines

### Code Style

- Follow the existing code style in the project
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused on a single task
- Remove console.log statements before submitting

#### Client-side (React)
- Use functional components with hooks
- Follow React best practices
- Use CSS modules for styling

#### Server-side (Node.js/Express)
- Use async/await for asynchronous operations
- Follow RESTful API design principles
- Implement proper error handling

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(client): add user authentication component

- Add login form
- Implement JWT token storage
- Add protected routes

Resolves #123
```

## Testing

- Write tests for all new features and bug fixes
- Run the existing test suite before submitting your changes:
  ```bash
  npm run test:client
  npm run test:server
  ```
- Aim for high test coverage
- Test both happy paths and edge cases

### Client Testing
- Use React Testing Library for component tests
- Test user interactions and UI behavior

### Server Testing
- Use Jest for unit tests
- Test API endpoints with supertest

## Documentation

- Update documentation when changing functionality
- Use clear and consistent language
- Include code examples where appropriate
- Keep README and other docs up to date with changes

## Review Process

All submissions require review before being merged:

1. Automated checks must pass (tests, linting, etc.)
2. At least one maintainer must approve the changes
3. Address any feedback or requested changes
4. Once approved, a maintainer will merge your pull request

## Security

Security is a top priority for this project. Please follow these guidelines:

- Never commit sensitive information (API keys, credentials, etc.)
- Report security vulnerabilities privately to the maintainers
- Follow the security best practices outlined in our [SECURITY.md](SECURITY.md) file
- Run security audits regularly with `npm audit`

For more information on our security practices, please refer to the [SECURITY.md](SECURITY.md) file.

---

Thank you for contributing to our project! Your efforts help make this project better for everyone.
