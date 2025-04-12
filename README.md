# Chatbot Fluxa

A modern chatbot application built with React and Node.js.

## Features

- AI-powered chat interface
- Real-time responses
- User-friendly interface
- Secure API integration

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/chatbot-fluxa.git
   cd chatbot-fluxa
   ```

2. Install dependencies
   ```bash
   npm run install-deps
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env` in both server and client directories
   - Update the variables with your credentials

4. Start the development server
   ```bash
   npm run dev
   ```

## Contributing

We welcome contributions to this project! Please check out our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest features.

### Issue Templates

When creating a new issue, please use one of our issue templates:

- **Bug Report**: For reporting bugs or unexpected behavior
- **Feature Request**: For suggesting new features or enhancements
- **Technical Debt**: For reporting code that needs refactoring
- **General Issue**: For issues that don't fit into other categories

### Pull Request Templates

When submitting a pull request, you can use one of our specialized templates by adding a query parameter to the PR creation URL:

- **Default**: General purpose template (default)
- **Feature**: For adding new features (`?template=feature.md`)
- **Bugfix**: For fixing bugs (`?template=bugfix.md`)
- **Documentation**: For documentation updates (`?template=documentation.md`)
- **Dependency**: For dependency updates (`?template=dependency.md`)

## Documentation

For more detailed information, please check the [docs](docs/) directory.

## SLA Monitoring

We maintain Service Level Agreements (SLAs) for issue resolution to ensure timely responses and fixes. Our system automatically:

- Tracks response and resolution times for all issues
- Labels issues based on their SLA status
- Generates compliance reports
- Alerts the team when SLAs are at risk

For details on our SLA policies and how the monitoring works, see the [SLA Monitoring Guide](docs/sla-monitoring.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.