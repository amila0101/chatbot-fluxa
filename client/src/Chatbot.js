import React, { useState, useRef } from 'react';
import { FiCommand, FiCopy, FiMoon, FiSun, FiUser, FiSettings, FiBook, FiArchive, FiStar, FiSend, FiChevronDown, FiChevronRight, FiMessageSquare, FiCode, FiImage, FiCpu, FiEye, FiServer, FiBookOpen, FiFileText, FiTerminal, FiSearch, FiBox, FiUpload, FiZap, FiX, FiFile } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { generateGeminiResponse } from './services/geminiService';
import { useTheme } from './context/ThemeContext';
import { PremiumFeatures } from './components/PremiumFeatures';
import { Payment } from './components/Payment';
import './styles/Chatbot.css';

function Chatbot() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const [activeMode, setActiveMode] = useState('chat');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Theme colors
  const theme = {
    background: isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white',
    sidebar: isDarkMode ? 'bg-[#1E1E1E]' : 'bg-gray-50',
    text: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textDark: isDarkMode ? 'text-white' : 'text-gray-900',
    border: isDarkMode ? 'border-gray-800' : 'border-gray-200',
    input: isDarkMode ? 'bg-[#1A1B26]' : 'bg-gray-50',
    inputBorder: isDarkMode ? '' : 'border border-gray-200',
    hover: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100',
    accent: 'text-[#2DA8D4]',
    button: isDarkMode ? 'bg-[#1A1B26]' : 'bg-white',
    buttonBorder: isDarkMode ? '' : 'border border-gray-200',
  };

  // Navigation items
  const navigationItems = [
    {
      section: 'Platform',
      items: [
        {
          id: 'playground',
          icon: <FiCommand />,
          label: 'Playground',
          submenu: [
            { id: 'chat', label: 'Chat Mode', icon: <FiMessageSquare /> },
            { id: 'code', label: 'Code Assistant', icon: <FiCode /> },
            { id: 'image', label: 'Image Generation', icon: <FiImage /> }
          ]
        },
        { id: 'history', icon: <FiBook />, label: 'History' },
        { id: 'starred', icon: <FiStar />, label: 'Starred' },
        { id: 'settings', icon: <FiSettings />, label: 'Settings' },
      ]
    },
    {
      section: 'Models',
      items: [
        {
          id: 'models',
          icon: <FiArchive />,
          label: 'Models',
          submenu: [
            { id: 'gemini-pro', label: 'Gemini Pro', icon: <FiCpu /> },
            { id: 'gemini-vision', label: 'Gemini Vision', icon: <FiEye /> },
            { id: 'palm', label: 'PaLM', icon: <FiServer /> }
          ]
        },
      ]
    },
    {
      section: 'Documentation',
      items: [
        {
          id: 'docs',
          icon: <FiBook />,
          label: 'Documentation',
          submenu: [
            { id: 'api-docs', label: 'API Reference', icon: <FiCode /> },
            { id: 'guides', label: 'Guides', icon: <FiBookOpen /> },
            { id: 'examples', label: 'Examples', icon: <FiTerminal /> }
          ]
        },
      ]
    },
    {
      section: 'Projects',
      items: [
        { id: 'design', icon: <FiCommand />, label: 'Design Engineering' },
        { id: 'sales', icon: <FiArchive />, label: 'Sales & Marketing' },
        { id: 'travel', icon: <FiBook />, label: 'Travel' },
      ]
    },
  ];

  // Add these action buttons above the input area
   
  const actionButtons = [
    { id: 'web', icon: <FiSearch className="w-4 h-4" />, label: 'Web Search' },
    { id: 'app', icon: <FiBox className="w-4 h-4" />, label: 'App Builder' },
    { id: 'deep', icon: <FiZap className="w-4 h-4" />, label: 'Deep Research' },
    { id: 'upload', icon: <FiUpload className="w-4 h-4" />, label: 'Upload' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // Handle file upload
    if (activeMode === 'upload' && selectedFile) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (input.trim()) {
          formData.append('instructions', input);
        }

        // Add message to chat about file processing
        setMessages(prev => [...prev, {
          text: `Processing file: ${selectedFile.name}`,
          sender: 'user',
        timestamp: new Date().toISOString()
      }]);

        // Here you would normally make an API call to process the file
        // For now, we'll simulate a response
        await new Promise(resolve => setTimeout(resolve, 2000));

        setMessages(prev => [...prev, {
          text: `File processed successfully: ${selectedFile.name}`,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }]);

        setSelectedFile(null);
        setInput('');
      } catch (error) {
        console.error('Error processing file:', error);
        setMessages(prev => [...prev, {
          text: `Error processing file: ${error.message}`,
          sender: 'bot',
          error: true,
          timestamp: new Date().toISOString()
        }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular chat message handling
    if (!input.trim() || isLoading) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = input;
    setInput(''); // Clear input right away

    try {
      // Add typing indicator
      setMessages(prev => [...prev, {
        text: '...',
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);

      // Get AI response based on mode
      let prompt = currentInput;
      switch (activeMode) {
        case 'web':
          prompt = `Search the web for: ${currentInput}`;
          break;
        case 'app':
          prompt = `Create an app design and structure for: ${currentInput}`;
          break;
        case 'deep':
          prompt = `Perform deep research on: ${currentInput}`;
          break;
        default:
          prompt = currentInput;
      }

      const response = await generateGeminiResponse(prompt);

      // Replace typing indicator with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        // Replace the last message (typing indicator) with the actual response
        newMessages[newMessages.length - 1] = {
          text: response,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        return newMessages;
      });
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
        // Add error message to chat
      setMessages(prev => [...prev, {
        text: `Error: ${error.message}. Please try again.`,
        sender: 'bot',
        error: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    // You can also add preview functionality here if needed
  };

  const handlePaymentSuccess = () => {
    setIsPremium(true);
    setShowPayment(false);
    // You might want to store this in your backend/localStorage
  };

  return (
    <div className={`flex h-screen ${theme.background} theme-transition`}>
      {/* Sidebar */}
      <div className={`w-64 ${theme.sidebar} border-r ${theme.border} flex flex-col`}>
        {/* Logo */}
        <div className={`p-4 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#2DA8D4] to-[#0EA5E9] rounded-lg" />
            <span className={`${theme.textDark} text-xl font-semibold gradient-text`}>
              Fluxa<span>AI</span>
            </span>
          </div>
        </div>

        {/* Updated Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {navigationItems.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h3 className="text-gray-500 text-sm mb-2">{section.section}</h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavigationItem key={item.id} item={item} theme={theme} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User */}
        <div className={`p-4 border-t ${theme.border}`}>
          <button className={`w-full flex items-center gap-2 px-3 py-2 ${theme.text} ${theme.hover} rounded-lg`}>
            <FiUser />
            <span className="text-sm">fluxa@gmail.com</span>
            </button>
        </div>
      </div>

      {/* Main Content - Modified for centered layout */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 ${theme.button} ${theme.text} rounded-full text-sm`}>
              Fluxa AI Assistant
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <button
                onClick={() => setShowPremium(true)}
                className="px-4 py-2 bg-[#2DA8D4] text-white rounded-lg hover:bg-[#2B96BC] transition-colors"
              >
                Upgrade to Premium
              </button>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 ${theme.text} hover:text-[#2DA8D4] transition-colors`}
            >
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 bg-gray-700 rounded-full" />
          </div>
        </div>

        {/* Modified Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-[800px] mx-auto px-4"> {/* Adjusted width and padding */}
            {messages.length === 0 ? (
              // Welcome screen when no messages
              <div className="text-center mb-8">
                <h1 className={`text-5xl font-bold ${theme.textDark} mb-4`}>
                  Ask Fluxa AI <span className="text-[#2DA8D4]">Anything.</span>
                </h1>
              </div>
            ) : (
              // Messages area when there are messages
              <div className="mb-8 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar pr-2">
            {messages.map((message, index) => (
                  <ChatMessage
                key={index}
                    message={message}
                    theme={theme}
                    isDarkMode={isDarkMode}
                  />
                ))}
            </div>
          )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              <button
                onClick={() => setActiveMode('web')}
                className={`px-3 py-1.5 ${
                  activeMode === 'web'
                    ? 'bg-[#2DA8D4] text-white'
                    : `${theme.button} ${theme.buttonBorder} ${theme.text}`
                } rounded-full hover:bg-[#2DA8D4] hover:text-white transition-colors flex items-center gap-2`}
              >
                <FiSearch className="w-4 h-4" />
                Web Search
              </button>
              <button
                onClick={() => setActiveMode('app')}
                className={`px-3 py-1.5 ${
                  activeMode === 'app'
                    ? 'bg-[#2DA8D4] text-white'
                    : `${theme.button} ${theme.buttonBorder} ${theme.text}`
                } rounded-full hover:bg-[#2DA8D4] hover:text-white transition-colors flex items-center gap-2`}
              >
                <FiCommand className="w-4 h-4" />
                App Builder
              </button>
              <button
                onClick={() => setActiveMode('deep')}
                className={`px-3 py-1.5 ${
                  activeMode === 'deep'
                    ? 'bg-[#2DA8D4] text-white'
                    : `${theme.button} ${theme.buttonBorder} ${theme.text}`
                } rounded-full hover:bg-[#2DA8D4] hover:text-white transition-colors flex items-center gap-2`}
              >
                <FiZap className="w-4 h-4" />
                Deep Research
              </button>
              <button
                onClick={() => setActiveMode('upload')}
                className={`px-3 py-1.5 ${
                  activeMode === 'upload'
                    ? 'bg-[#2DA8D4] text-white'
                    : `${theme.button} ${theme.buttonBorder} ${theme.text}`
                } rounded-full hover:bg-[#2DA8D4] hover:text-white transition-colors flex items-center gap-2`}
              >
                <FiUpload className="w-4 h-4" />
                Upload
              </button>
        </div>

            {/* Input Area - Made more compact */}
            <div className={`relative ${theme.input} ${theme.inputBorder} rounded-lg overflow-hidden input-gradient shadow-md`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className={`w-full bg-transparent py-4 px-4 ${theme.text} focus:outline-none resize-none`}
                rows="1"
                style={{ minHeight: '60px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-[#2DA8D4] rounded-lg"
                >
                  <FiCommand className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-[#2DA8D4] text-white rounded-lg hover:bg-[#2B96BC] transition-colors flex items-center gap-2 hover-scale"
                >
                  Send
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPremium && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPremium(false)}
        >
          <div
            className={`${theme.background} rounded-xl max-h-[90vh] overflow-y-auto relative`}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPremium(false)}
              className={`absolute top-4 right-4 p-2 ${theme.text} hover:text-[#2DA8D4] rounded-full`}
            >
              <FiX className="w-6 h-6" />
            </button>

            <PremiumFeatures
              theme={theme}
              onSubscribe={(plan) => {
                setSelectedPlan(plan);
                setShowPremium(false);
                setShowPayment(true);
              }}
            />
          </div>
        </div>
      )}

      {showPayment && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPayment(false)}
        >
          <div
            className={`${theme.background} rounded-xl relative`}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPayment(false)}
              className={`absolute top-4 right-4 p-2 ${theme.text} hover:text-[#2DA8D4] rounded-full`}
            >
              <FiX className="w-6 h-6" />
            </button>

            <Payment
              theme={theme}
              plan={selectedPlan}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NavigationItem({ item, theme }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => item.submenu && setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 px-3 py-2 ${theme.text} ${theme.hover} rounded-lg group`}
      >
        <span className="text-[#2DA8D4]">{item.icon}</span>
        <span>{item.label}</span>
        {item.submenu && (
          <span className="ml-auto transform transition-transform duration-200">
            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        )}
      </button>

      {/* Submenu */}
      {item.submenu && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="ml-6 mt-1 space-y-1"
        >
          {item.submenu.map((subItem) => (
            <button
              key={subItem.id}
              className={`w-full flex items-center gap-2 px-3 py-2 ${theme.text} ${theme.hover} rounded-lg text-sm`}
            >
              <span className="text-gray-500">{subItem.icon}</span>
              <span>{subItem.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function QuickAction({ text, theme }) {
  return (
    <button className={`px-4 py-2 ${theme.button} ${theme.text} rounded-full hover:bg-[#2DA8D4] hover:text-white transition-colors`}>
      {text}
    </button>
  );
}

// Add this new component for the action buttons
function ActionButton({ icon, label, onClick, isActive, theme }) {
  return (
              <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-[#2DA8D4] text-white'
          : `${theme.button} ${theme.buttonBorder} ${theme.text} hover:bg-[#2DA8D4] hover:text-white`
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Add these helper functions
function getPlaceholder(mode) {
  switch (mode) {
    case 'web':
      return 'Search the web...';
    case 'app':
      return 'Describe the app you want to build...';
    case 'deep':
      return 'Ask for in-depth research...';
    case 'upload':
      return 'Upload a file or paste content...';
    default:
      return 'Ask anything...';
  }
}

function getButtonText(mode) {
  switch (mode) {
    case 'web':
      return 'Search';
    case 'app':
      return 'Build';
    case 'deep':
      return 'Research';
    case 'upload':
      return 'Upload';
    default:
      return 'Send';
  }
}

function UploadArea({ theme, isActive, fileInputRef, handleFile }) {
  return (
    <div
      className={`w-full p-8 border-2 border-dashed rounded-xl transition-colors ${
        isActive
          ? 'border-[#2DA8D4] bg-[#2DA8D4]/10'
          : `${theme.border} ${theme.input}`
      }`}
    >
      <div className="text-center">
        <FiUpload className="w-12 h-12 mx-auto mb-4 text-[#2DA8D4]" />
        <h3 className={`text-lg font-medium ${theme.textDark} mb-2`}>
          Drag & Drop your file here
        </h3>
        <p className={`text-sm ${theme.text} mb-4`}>
          Supports PDF, DOC, TXT, and other text formats
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#2DA8D4] text-white rounded-lg hover:bg-[#2B96BC] transition-colors"
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept=".pdf,.doc,.docx,.txt,.rtf"
        />
      </div>
    </div>
  );
}

function SelectedFile({ file, onRemove, theme }) {
  return (
    <div className={`flex items-center justify-between p-4 ${theme.input} rounded-lg`}>
      <div className="flex items-center gap-3">
        <FiFile className="w-6 h-6 text-[#2DA8D4]" />
        <div>
          <p className={`font-medium ${theme.textDark}`}>{file.name}</p>
          <p className={`text-sm ${theme.text}`}>
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className={`p-2 ${theme.text} hover:text-red-500 rounded-full`}
      >
        <FiX className="w-5 h-5" />
              </button>
            </div>
  );
}

function ChatMessage({ message, theme, isDarkMode }) {
  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 message-appear`}>
      <div className={`max-w-[80%] theme-transition sender-${message.sender} ${
        message.sender === 'user'
          ? 'bg-[#2DA8D4] text-white hover-scale'
          : `${theme.input} ${theme.inputBorder} ${theme.text} custom-scrollbar`
      } rounded-lg p-3 shadow-md`}>
        {message.text === '...' ? (
          <div className="typing-indicator">
            <span className="typing-indicator-dot"></span>
            <span className="typing-indicator-dot"></span>
            <span className="typing-indicator-dot"></span>
          </div>
        ) : (
          <div className="message-content whitespace-pre-wrap">{message.text}</div>
        )}
        <div className={`text-xs mt-1 ${
          message.sender === 'user'
            ? 'text-white/70'
            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default Chatbot;