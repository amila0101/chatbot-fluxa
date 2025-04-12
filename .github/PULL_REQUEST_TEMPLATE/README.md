# Pull Request Templates

This directory contains templates for different types of pull requests. When creating a new PR, you can specify which template to use by adding a query parameter to the PR creation URL.

## Available Templates

- **Default**: General purpose template for most changes
  - Used when no specific template is selected
  
- **Feature**: For adding new features
  - Use with: `?template=feature.md`
  
- **Bugfix**: For fixing bugs
  - Use with: `?template=bugfix.md`
  
- **Documentation**: For documentation updates
  - Use with: `?template=documentation.md`
  
- **Dependency**: For dependency updates
  - Use with: `?template=dependency.md`

## How to Use a Specific Template

When creating a new pull request, add the query parameter `template=filename.md` to the URL.

For example, to use the feature template, your URL would look like:
```
https://github.com/username/repo/compare/main...branch?template=feature.md
```

## Creating a Custom Template

If you need to create a new template type:

1. Create a new Markdown file in this directory
2. Follow the naming convention: `type.md`
3. Update this README to include the new template
