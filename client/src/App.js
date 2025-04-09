import React from 'react';
import Chatbot from './Chatbot';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Chatbot />
    </ThemeProvider>
  );
}

export default App; 