# Getting Started with Chatbot Fluxa

This tutorial will guide you through setting up your development environment and running the Chatbot Fluxa application locally.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** (version 9.x or higher)
- **Git**
- **MongoDB** (local installation or cloud instance)

## Step 1: Clone the Repository

First, clone the Chatbot Fluxa repository to your local machine:

```bash
git clone https://github.com/yourusername/chatbot-fluxa.git
cd chatbot-fluxa
```

## Step 2: Install Dependencies

Install all required dependencies for both the client and server:

```bash
npm run install-deps
```

This command will install dependencies for the root project, client, and server.

## Step 3: Set Up Environment Variables

1. Create `.env` files in both the server and client directories:

```bash
# In the root directory
cp server/.env.example server/.env
cp client/.env.example client/.env
```

2. Open `server/.env` in your text editor and update the following variables:

```
MONGODB_URI=mongodb://localhost:27017/chatbot
AI_API_KEY=your_openai_api_key_here
```

3. Open `client/.env` and update:

```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** For testing purposes, you can use the application without valid API keys, but chat functionality will be limited to mock responses.

## Step 4: Start the Development Server

Run the development server with the following command:

```bash
npm run dev
```

This will start both the backend server and the frontend development server concurrently. The application should automatically open in your default browser at [http://localhost:3000](http://localhost:3000).

If you encounter any issues with Node.js compatibility, try using the safe development mode:

```bash
npm run dev:safe
```

## Step 5: Explore the Application

Once the application is running, you can:

1. Try sending a message in the chat interface
2. Toggle between light and dark mode using the theme switch
3. Explore the sidebar navigation

## Step 6: Run Tests

To ensure everything is working correctly, run the test suite:

```bash
# Run client tests
npm run test:client

# Run server tests
npm run test:server

# Run all tests in parallel
npm run test:parallel
```

## Troubleshooting

### Common Issues

#### "Error: Cannot find module 'react-scripts'"

Run `npm run install-deps` again to ensure all dependencies are installed correctly.

#### MongoDB Connection Issues

Make sure MongoDB is running on your machine or update the `MONGODB_URI` in your `.env` file to point to your MongoDB instance.

#### Node.js Version Compatibility

If you encounter issues related to Node.js compatibility, check your Node.js version:

```bash
node --version
```

If you're using a version other than 18.x, consider using a tool like nvm to switch versions:

```bash
nvm use 18
```

## Next Steps

Congratulations! You've successfully set up and run Chatbot Fluxa locally. Next, you might want to:

- Continue with the [Building Your First Chatbot](first-chatbot.md) tutorial
- Learn how to [Customize the Chat Interface](customizing-interface.md)
- Explore the [API Reference](../reference/api-reference.md) to understand available endpoints

If you encountered any issues not covered in the troubleshooting section, please check the [FAQ](../resources/faq.md) or [open an issue](https://github.com/yourusername/chatbot-fluxa/issues/new) on GitHub.
