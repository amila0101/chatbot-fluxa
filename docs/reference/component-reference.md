# Component Reference

This document provides detailed information about the React components used in Chatbot Fluxa, their props, and usage examples.

## Table of Contents

- [Core Components](#core-components)
  - [Chatbot](#chatbot)
  - [ChatMessage](#chatmessage)
  - [Sidebar](#sidebar)
  - [ThemeProvider](#themeprovider)
- [UI Components](#ui-components)
  - [PremiumFeatures](#premiumfeatures)
  - [Payment](#payment)
  - [ActionButton](#actionbutton)
  - [FileUpload](#fileupload)
- [Layout Components](#layout-components)
  - [SidebarSection](#sidebarsection)
  - [SidebarItem](#sidebaritem)
  - [Submenu](#submenu)
- [Form Components](#form-components)
  - [ChatInput](#chatinput)
  - [Button](#button)
  - [Toggle](#toggle)

## Core Components

### Chatbot

The main component that renders the entire chatbot interface.

**File Location:** `client/src/Chatbot.js`

**Props:**

None. This is the top-level component that manages its own state.

**State:**

| State Variable | Type | Description |
|----------------|------|-------------|
| input | string | Current text in the chat input |
| isLoading | boolean | Whether a message is being processed |
| activeMode | string | Current chat mode (e.g., 'chat', 'code') |
| selectedFile | File | Currently selected file for upload |
| dragActive | boolean | Whether a file is being dragged over the drop area |
| isPremium | boolean | Whether the user has premium features |
| showPremium | boolean | Whether to show the premium features modal |
| showPayment | boolean | Whether to show the payment modal |
| messages | array | Array of chat messages |
| selectedPlan | object | Selected subscription plan |

**Usage Example:**

```jsx
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Chatbot from './Chatbot';

function App() {
  return (
    <ThemeProvider>
      <Chatbot />
    </ThemeProvider>
  );
}
```

**Notes:**

- This component uses the `ThemeContext` for theme management
- Handles all chat logic and UI rendering
- Manages file uploads and premium features

### ChatMessage

Renders an individual chat message, either from the user or the bot.

**File Location:** `client/src/components/ChatMessage.js`

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| message | object | Yes | - | Message object containing text, sender, and timestamp |
| theme | object | Yes | - | Theme object with styling properties |
| isDarkMode | boolean | Yes | - | Whether dark mode is active |

**Message Object Structure:**

```javascript
{
  text: "Hello, how can I help you?",
  sender: "bot", // or "user"
  timestamp: "2023-04-17T14:27:47.491Z",
  error: false // optional, true if this is an error message
}
```

**Usage Example:**

```jsx
import React from 'react';
import ChatMessage from './components/ChatMessage';

function ChatHistory({ messages, theme, isDarkMode }) {
  return (
    <div className="chat-history">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
}
```

**Notes:**

- Renders different styles based on the message sender
- Handles code formatting with syntax highlighting
- Supports error message styling

### Sidebar

Renders the application sidebar with navigation and settings.

**File Location:** `client/src/components/Sidebar.js`

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | object | Yes | - | Theme object with styling properties |
| menuItems | array | Yes | - | Array of menu item objects |
| activeItem | string | Yes | - | ID of the currently active menu item |
| onItemSelect | function | Yes | - | Callback when a menu item is selected |
| toggleTheme | function | Yes | - | Function to toggle between light and dark mode |
| isDarkMode | boolean | Yes | - | Whether dark mode is active |

**Menu Item Structure:**

```javascript
{
  section: "Main",
  items: [
    {
      id: "chat",
      icon: <FiMessageSquare />,
      label: "Chat",
      submenu: [] // Optional submenu items
    }
  ]
}
```

**Usage Example:**

```jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { menuItems } from './data/menuItems';
import { useTheme } from './context/ThemeContext';

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeItem, setActiveItem] = useState('chat');
  
  const theme = {
    // Theme properties
  };
  
  return (
    <div className="app-container">
      <Sidebar
        theme={theme}
        menuItems={menuItems}
        activeItem={activeItem}
        onItemSelect={setActiveItem}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
      <main>
        {/* Main content */}
      </main>
    </div>
  );
}
```

**Notes:**

- Renders collapsible sections
- Supports nested submenus
- Includes theme toggle and user profile section

### ThemeProvider

Context provider for theme management.

**File Location:** `client/src/context/ThemeContext.js`

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | node | Yes | - | Child components that will have access to the theme context |

**Context Values:**

| Value | Type | Description |
|-------|------|-------------|
| isDarkMode | boolean | Whether dark mode is active |
| toggleTheme | function | Function to toggle between light and dark mode |

**Usage Example:**

```jsx
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';

function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
```

**Hook Usage:**

```jsx
import React from 'react';
import { useTheme } from './context/ThemeContext';

function ThemedComponent() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
}
```

**Notes:**

- Provides theme context to all child components
- Includes a custom hook for easy access to theme values

## UI Components

### PremiumFeatures

Displays premium features and subscription plans.

**File Location:** `client/src/components/PremiumFeatures.js`

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | object | Yes | - | Theme object with styling properties |
| onSubscribe | function | Yes | - | Callback when a plan is selected |

**Usage Example:**

```jsx
import React, { useState } from 'react';
import { PremiumFeatures } from './components/PremiumFeatures';

function App() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  
  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };
  
  const theme = {
    // Theme properties
  };
  
  return (
    <div>
      <PremiumFeatures 
        theme={theme} 
        onSubscribe={handleSubscribe} 
      />
      {showPayment && (
        <Payment 
          theme={theme} 
          plan={selectedPlan} 
          onSuccess={() => setShowPayment(false)} 
        />
      )}
    </div>
  );
}
```

**Notes:**

- Displays feature cards and pricing plans
- Handles plan selection and subscription flow

### Payment

Renders a payment form for premium subscriptions.

**File Location:** `client/src/components/Payment.js`

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | object | Yes | - | Theme object with styling properties |
| plan | object | Yes | - | Selected subscription plan |
| onSuccess | function | Yes | - | Callback when payment is successful |

**Plan Object Structure:**

```javascript
{
  name: "Pro",
  price: "$19/month",
  features: [
    "Everything in Basic",
    "Unlimited requests",
    "Priority support",
    "Advanced AI models",
    "API access"
  ]
}
```

**Usage Example:**

```jsx
import React from 'react';
import { Payment } from './components/Payment';

function CheckoutPage({ theme, selectedPlan }) {
  const handlePaymentSuccess = () => {
    console.log('Payment successful');
    // Update user status, redirect, etc.
  };
  
  return (
    <div className="checkout-page">
      <Payment 
        theme={theme} 
        plan={selectedPlan} 
        onSuccess={handlePaymentSuccess} 
      />
    </div>
  );
}
```

**Notes:**

- Collects and validates payment information
- Displays plan summary
- Provides secure payment processing UI

## Form Components

### ChatInput

Renders the chat input area with message input and action buttons.

**File Location:** `client/src/components/ChatInput.js`

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | string | Yes | - | Current input value |
| onChange | function | Yes | - | Callback when input changes |
| onSubmit | function | Yes | - | Callback when form is submitted |
| isLoading | boolean | No | false | Whether a message is being processed |
| placeholder | string | No | "Type a message..." | Input placeholder text |
| theme | object | Yes | - | Theme object with styling properties |
| actionButtons | array | No | [] | Array of action button objects |

**Action Button Structure:**

```javascript
{
  id: "web",
  icon: <FiSearch />,
  label: "Web Search",
  onClick: () => {} // Optional, defaults to onActionClick prop
}
```

**Usage Example:**

```jsx
import React, { useState } from 'react';
import ChatInput from './components/ChatInput';

function ChatInterface({ theme, onSendMessage }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    await onSendMessage(input);
    setInput('');
    setIsLoading(false);
  };
  
  const actionButtons = [
    { id: 'web', icon: <FiSearch />, label: 'Web Search' },
    { id: 'upload', icon: <FiUpload />, label: 'Upload' }
  ];
  
  return (
    <ChatInput
      value={input}
      onChange={setInput}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      theme={theme}
      actionButtons={actionButtons}
    />
  );
}
```

**Notes:**

- Includes file drop zone functionality
- Supports action buttons for additional features
- Handles loading state with visual feedback

## Utility Functions

### generateGeminiResponse

Sends a prompt to the Google Gemini API and returns the response.

**File Location:** `client/src/services/geminiService.js`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | - | The prompt to send to the Gemini API |

**Returns:**

Promise that resolves to the generated text response.

**Usage Example:**

```javascript
import { generateGeminiResponse } from './services/geminiService';

async function handleUserMessage(message) {
  try {
    const response = await generateGeminiResponse(message);
    console.log('AI Response:', response);
    return response;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}
```

**Notes:**

- Requires a valid Gemini API key in environment variables
- Handles error cases and provides meaningful error messages
- Includes logging for debugging purposes
