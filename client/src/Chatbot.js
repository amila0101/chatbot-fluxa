import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCommand, FiMoon, FiSun, FiUser, FiSettings, FiSend,
  FiSearch, FiUpload, FiZap, FiX, FiCopy, FiRefreshCw,
  FiPlus, FiMessageSquare, FiTrash2, FiGlobe, FiMic,
  FiCheck, FiChevronDown,
} from 'react-icons/fi';
import { generateGeminiResponse } from './services/geminiService';
import { useTheme } from './context/ThemeContext';
import { PremiumFeatures } from './components/PremiumFeatures';
import { Payment } from './components/Payment';
import './styles/Chatbot.css';

/* ─── Static Data ────────────────────────────────────────────────────────── */
const MODELS = [
  { id: 'gemini-pro',    name: 'Gemini 1.5 Pro',  icon: '⚡', desc: 'Most capable'     },
  { id: 'gemini-flash',  name: 'Gemini Flash',     icon: '🚀', desc: 'Fastest responses' },
  { id: 'gemini-vision', name: 'Gemini Vision',    icon: '👁️', desc: 'Image & vision'   },
];

const MODES = [
  { id: 'web',    icon: <FiGlobe  className="w-3 h-3" />, label: 'Web Search'   },
  { id: 'deep',   icon: <FiZap    className="w-3 h-3" />, label: 'Deep Research' },
  { id: 'upload', icon: <FiUpload className="w-3 h-3" />, label: 'Upload'        },
  { id: 'voice',  icon: <FiMic    className="w-3 h-3" />, label: 'Voice'         },
];

const SUGGESTIONS = [
  { icon: '🚀', title: 'Build something',    prompt: 'Help me build a React dashboard component with charts and analytics' },
  { icon: '🔍', title: 'Deep research',      prompt: 'Explain the latest advancements in quantum computing for 2025'       },
  { icon: '💡', title: 'Brainstorm ideas',   prompt: 'Give me 10 innovative startup ideas in the AI space for 2025'        },
  { icon: '✍️', title: 'Write & edit',      prompt: 'Write a compelling product description for an AI-powered chatbot'    },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function uid() { return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

function getPlaceholder(mode) {
  return {
    web:    'Search the web for anything…',
    deep:   'Ask for deep research & analysis…',
    upload: 'Describe what to do with your file…',
    voice:  'Click the mic and start speaking…',
    chat:   'Message Fluxa AI…',
  }[mode] ?? 'Message Fluxa AI…';
}

function getBtnLabel(mode) {
  return { web: 'Search', deep: 'Research', upload: 'Process', voice: 'Send', chat: 'Send' }[mode] ?? 'Send';
}

/* ─── Inline text formatter (safe — no dangerouslySetInnerHTML) ──────────── */
function InlineText({ text }) {
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let last = 0, match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: 'plain', val: text.slice(last, match.index) });
    const raw = match[0];
    if (raw.startsWith('**'))      parts.push({ type: 'bold',   val: raw.slice(2, -2) });
    else if (raw.startsWith('*'))  parts.push({ type: 'em',     val: raw.slice(1, -1) });
    else if (raw.startsWith('`'))  parts.push({ type: 'code',   val: raw.slice(1, -1) });
    last = match.index + raw.length;
  }
  if (last < text.length) parts.push({ type: 'plain', val: text.slice(last) });

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === 'bold')  return <strong key={i}>{p.val}</strong>;
        if (p.type === 'em')    return <em key={i}>{p.val}</em>;
        if (p.type === 'code')  return <code key={i} className="inline-code">{p.val}</code>;
        return <span key={i}>{p.val}</span>;
      })}
    </>
  );
}

/* ─── Markdown message renderer ──────────────────────────────────────────── */
function MessageContent({ text }) {
  const segments = [];
  const codeRe = /```(\w+)?\n?([\s\S]*?)```/g;
  let last = 0, match;

  while ((match = codeRe.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: 'text', val: text.slice(last, match.index) });
    segments.push({ type: 'code', lang: match[1] || 'code', val: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ type: 'text', val: text.slice(last) });

  const copyCode = (code) => navigator.clipboard.writeText(code);

  return (
    <div className="message-md text-sm leading-relaxed">
      {segments.map((seg, si) => {
        if (seg.type === 'code') {
          return (
            <div key={si} className="code-wrapper">
              <div className="code-header">
                <span className="code-lang">{seg.lang}</span>
                <button onClick={() => copyCode(seg.val)} className="code-copy-btn">Copy</button>
              </div>
              <pre className="code-block"><code>{seg.val}</code></pre>
            </div>
          );
        }
        return seg.val.split('\n').map((line, li) => {
          if (!line.trim()) return <div key={`${si}-${li}`} className="h-2" />;
          if (/^#{1,3}\s/.test(line)) {
            const lvl = line.match(/^(#{1,3})\s/)[1].length;
            const cls = ['text-base font-bold mt-3 mb-1', 'text-sm font-bold mt-2', 'text-sm font-semibold mt-1'][lvl - 1];
            return <div key={`${si}-${li}`} className={cls}><InlineText text={line.replace(/^#{1,3}\s/, '')} /></div>;
          }
          if (/^[-•*]\s/.test(line)) {
            return (
              <div key={`${si}-${li}`} className="flex gap-2 my-0.5">
                <span className="text-purple-400 mt-0.5 flex-shrink-0 font-bold text-xs">•</span>
                <span><InlineText text={line.replace(/^[-•*]\s/, '')} /></span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^(\d+)\./)[1];
            return (
              <div key={`${si}-${li}`} className="flex gap-2 my-0.5">
                <span className="text-purple-400 flex-shrink-0 font-medium text-xs min-w-[1rem]">{num}.</span>
                <span><InlineText text={line.replace(/^\d+\.\s/, '')} /></span>
              </div>
            );
          }
          return <div key={`${si}-${li}`}><InlineText text={line} /></div>;
        });
      })}
    </div>
  );
}

/* ─── Single message bubble ──────────────────────────────────────────────── */
function MessageBubble({ message, isDark, copiedId, onCopy, onRegenerate, isLoading }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message-appear message-row flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className={`msg-avatar flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
        isUser
          ? isDark ? 'bg-white/10 text-gray-400' : 'bg-purple-100 text-purple-600'
          : 'btn-gradient text-white'
      }`}>
        {isUser ? <FiUser className="w-3.5 h-3.5" /> : 'F'}
      </div>

      {/* Bubble + actions */}
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'btn-gradient text-white rounded-br-sm'
            : isDark
              ? 'bg-[#16142A] border border-white/6 text-gray-100 rounded-bl-sm'
              : 'bg-[#F5F3FF] border border-purple-100 text-gray-900 rounded-bl-sm'
        }`}>
          {message.isTyping ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          ) : (
            <MessageContent text={message.text} />
          )}
        </div>

        {/* Timestamp + action row */}
        {!message.isTyping && (
          <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && (
              <div className="msg-actions flex items-center gap-1">
                <button
                  title="Copy"
                  onClick={() => onCopy(message.text, message.id)}
                  className="action-btn">
                  {copiedId === message.id
                    ? <FiCheck className="w-3 h-3 text-green-400" />
                    : <FiCopy  className="w-3 h-3" />}
                </button>
                {onRegenerate && (
                  <button title="Regenerate" onClick={onRegenerate} disabled={isLoading} className="action-btn disabled:opacity-40">
                    <FiRefreshCw className={`w-3 h-3 ${isLoading ? 'spin' : ''}`} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MAIN CHATBOT COMPONENT — Fluxa AI v2.1
   ═══════════════════════════════════════════════════════════════════════════ */
function Chatbot() {
  const { isDarkMode, toggleTheme } = useTheme();
  const isDark = isDarkMode;

  /* Chat sessions */
  const [sessions, setSessions] = useState([
    { id: 'init', title: 'New Chat', messages: [], createdAt: new Date() }
  ]);
  const [activeId, setActiveId] = useState('init');

  /* UI state */
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [activeMode, setActiveMode]   = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [copiedId, setCopiedId]       = useState(null);
  const [searchQ, setSearchQ]         = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [showModelMenu, setShowModelMenu] = useState(false);

  /* Premium */
  const [isPremium, setIsPremium]     = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  /* Refs */
  const inputRef      = useRef(null);
  const messagesEnd   = useRef(null);
  const chatAreaRef   = useRef(null);

  /* ── Derived ── */
  const activeSession  = sessions.find(s => s.id === activeId) || sessions[0];
  const messages       = activeSession?.messages || [];
  const filteredSessions = sessions.filter(s =>
    searchQ === '' || s.title.toLowerCase().includes(searchQ.toLowerCase())
  );
  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  /* ── Session helpers ── */
  const updateMessages = useCallback((updater) => {
    setSessions(prev => prev.map(s =>
      s.id === activeId
        ? { ...s, messages: typeof updater === 'function' ? updater(s.messages) : updater }
        : s
    ));
  }, [activeId]);

  const setSessionTitle = useCallback((title) => {
    setSessions(prev => prev.map(s =>
      s.id === activeId
        ? { ...s, title: title.slice(0, 38) + (title.length > 38 ? '…' : '') }
        : s
    ));
  }, [activeId]);

  const createNewChat = () => {
    const id = uid();
    setSessions(prev => [{ id, title: 'New Chat', messages: [], createdAt: new Date() }, ...prev]);
    setActiveId(id);
    setInput('');
    setActiveMode('chat');
  };

  const deleteChat = (chatId) => {
    setSessions(prev => {
      const rest = prev.filter(s => s.id !== chatId);
      if (rest.length === 0) {
        const newId = uid();
        setActiveId(newId);
        return [{ id: newId, title: 'New Chat', messages: [], createdAt: new Date() }];
      }
      if (chatId === activeId) setActiveId(rest[0].id);
      return rest;
    });
  };

  /* ── Scroll ── */
  useEffect(() => {
    if (messagesEnd.current) messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleScroll = () => {
    if (!chatAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
  };

  /* ── Copy ── */
  const copyMessage = useCallback((text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  /* ── Submit ── */
  const handleSubmit = async (promptOverride) => {
    const text = (typeof promptOverride === 'string' ? promptOverride : input).trim();
    if (!text || isLoading) return;

    const userMsg = { id: uid(), text, sender: 'user', timestamp: new Date().toISOString() };
    const typingMsg = { id: uid(), text: '...', sender: 'bot', isTyping: true, timestamp: new Date().toISOString() };

    if (messages.length === 0) setSessionTitle(text);

    updateMessages(prev => [...prev, userMsg, typingMsg]);
    setIsLoading(true);
    setInput('');
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }

    let prompt = text;
    if (activeMode === 'web')  prompt = `Search and provide current, accurate information about: ${text}`;
    if (activeMode === 'deep') prompt = `Provide a thorough, in-depth research analysis on: ${text}. Include key facts, examples, and insights.`;

    try {
      const response = await generateGeminiResponse(prompt);
      updateMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { id: uid(), text: response, sender: 'bot', timestamp: new Date().toISOString(), model: selectedModel }
      ]);
    } catch (err) {
      updateMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { id: uid(), text: `⚠️ Error: ${err.message}. Please try again.`, sender: 'bot', error: true, timestamp: new Date().toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Regenerate ── */
  const regenerate = async () => {
    if (isLoading) return;
    const lastUser = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUser) return;

    updateMessages(prev => {
      const lastBotIdx = [...prev].map((m, i) => ({ m, i })).reverse().find(({ m }) => m.sender === 'bot')?.i;
      return lastBotIdx != null ? prev.filter((_, i) => i !== lastBotIdx) : prev;
    });

    const typingMsg = { id: uid(), text: '...', sender: 'bot', isTyping: true, timestamp: new Date().toISOString() };
    updateMessages(prev => [...prev, typingMsg]);
    setIsLoading(true);

    try {
      const response = await generateGeminiResponse(lastUser.text);
      updateMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { id: uid(), text: response, sender: 'bot', timestamp: new Date().toISOString() }
      ]);
    } catch (err) {
      updateMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { id: uid(), text: `⚠️ ${err.message}`, sender: 'bot', error: true, timestamp: new Date().toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Theme classes ── */
  const bg       = isDark ? 'bg-[#08080F]'   : 'bg-white';
  const sidebar  = isDark ? 'bg-[#0E0C1A]'   : 'bg-[#FAF9FF]';
  const border   = isDark ? 'border-white/5'  : 'border-purple-100';
  const text     = isDark ? 'text-gray-300'   : 'text-gray-700';
  const textDark = isDark ? 'text-white'      : 'text-gray-900';
  const subtext  = isDark ? 'text-gray-500'   : 'text-gray-500';
  const inputBg  = isDark ? 'bg-[#0E0C1A] border-white/8' : 'bg-[#F8F7FF] border-purple-100';
  const hoverBg  = isDark ? 'hover:bg-white/5' : 'hover:bg-purple-50';

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className={`flex h-screen overflow-hidden theme-transition ${isDark ? 'dark' : 'light'} ${bg}`}>

      {/* ═══ SIDEBAR ═══════════════════════════════════════════════════════ */}
      <div className={`sidebar-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} flex-shrink-0 ${sidebar} border-r ${border} flex flex-col overflow-hidden`}>

        {/* Logo */}
        <div className={`flex items-center justify-between p-4 border-b ${border}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shadow-lg logo-pulse">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <div>
              <span className={`font-black text-lg gradient-text`}>Fluxa</span>
              <span className={`font-bold text-lg ${textDark}`}>AI</span>
              <span className={`text-xs ml-1.5 px-1.5 py-0.5 rounded-full btn-gradient text-white font-semibold`}>v2.1</span>
            </div>
          </div>
        </div>

        {/* New Chat button */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="new-chat-btn w-full btn-gradient text-white py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md">
            <FiPlus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-purple-100'}`}>
            <FiSearch className={`w-3.5 h-3.5 ${subtext} flex-shrink-0`} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search conversations…"
              className={`bg-transparent text-xs flex-1 outline-none ${text} placeholder-gray-500`}
            />
          </div>
        </div>

        {/* Chat Sessions list */}
        <div className="flex-1 overflow-y-auto custom-scroll px-2 py-1">
          {filteredSessions.length > 0 && (
            <p className={`text-xs font-medium px-2 py-1.5 ${subtext}`}>Recent Chats</p>
          )}
          {filteredSessions.map(session => (
            <div
              key={session.id}
              onClick={() => setActiveId(session.id)}
              className={`group session-item flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 cursor-pointer transition-all ${
                session.id === activeId ? 'session-active' : hoverBg
              }`}>
              <FiMessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${session.id === activeId ? 'text-purple-400' : subtext}`} />
              <span className={`text-sm flex-1 truncate ${session.id === activeId ? (isDark ? 'text-white' : 'text-gray-900') : text}`}>
                {session.title}
              </span>
              <button
                onClick={e => { e.stopPropagation(); deleteChat(session.id); }}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded ${isDark ? 'hover:text-red-400 text-gray-600' : 'hover:text-red-500 text-gray-400'} transition-all`}>
                <FiTrash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Model Selector */}
        <div className={`p-3 border-t ${border}`}>
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${isDark ? 'bg-white/5 border border-white/5 hover:bg-white/8' : 'bg-white border border-purple-100 hover:bg-purple-50'} transition-colors`}>
              <span className="text-base">{currentModel.icon}</span>
              <div className="flex-1 text-left">
                <div className={`text-xs font-semibold ${textDark}`}>{currentModel.name}</div>
                <div className={`text-xs ${subtext}`}>{currentModel.desc}</div>
              </div>
              <FiChevronDown className={`w-3 h-3 ${subtext} transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden shadow-2xl border ${
                    isDark ? 'bg-[#1A1728] border-purple-900/20' : 'bg-white border-purple-100'
                  }`}>
                  {MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model.id); setShowModelMenu(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-purple-50'
                      } ${selectedModel === model.id ? 'text-purple-400' : text}`}>
                      <span className="text-base">{model.icon}</span>
                      <div className="text-left flex-1">
                        <div className="font-medium text-xs">{model.name}</div>
                        <div className={`text-xs ${subtext}`}>{model.desc}</div>
                      </div>
                      {selectedModel === model.id && <FiCheck className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User profile */}
        <div className={`p-3 border-t ${border}`}>
          <button
            onClick={() => setShowPremium(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${hoverBg} transition-colors`}>
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center flex-shrink-0">
              <FiUser className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className={`text-xs font-semibold ${textDark} truncate`}>Fluxa User</div>
              <div className={`text-xs ${subtext}`}>{isPremium ? '✨ Premium' : 'Free Plan'}</div>
            </div>
            <FiSettings className={`w-3.5 h-3.5 ${subtext}`} />
          </button>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${border} ${isDark ? bg : 'bg-white'} z-10`}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${hoverBg} transition-colors flex-shrink-0`}
              title="Toggle sidebar">
              <FiCommand className={`w-4 h-4 ${subtext}`} />
            </button>
            <h1 className={`text-sm font-semibold truncate ${textDark}`}>
              {activeSession?.title || 'New Chat'}
            </h1>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${
              isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200'
            }`}>
              {currentModel.icon} {currentModel.name}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isPremium && (
              <button
                onClick={() => setShowPremium(true)}
                className="px-3 py-1.5 btn-gradient text-white text-xs rounded-lg font-semibold shadow-md">
                <span role="img" aria-label="sparkles">✨</span> Upgrade
              </button>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${hoverBg} transition-colors`}
              title="Toggle theme">
              {isDark ? <FiSun className={`w-4 h-4 ${subtext}`} /> : <FiMoon className={`w-4 h-4 ${subtext}`} />}
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={chatAreaRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto custom-scroll ${isDark ? bg : 'bg-white'}`}>

          {messages.length === 0 ? (
            /* ── Welcome Screen ── */
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <div className="logo-float mb-5">
                <div className="w-16 h-16 rounded-2xl btn-gradient flex items-center justify-center shadow-2xl logo-pulse">
                  <span className="text-white font-black text-2xl">F</span>
                </div>
              </div>
              <h1 className="text-3xl font-black mb-2 text-center">
                <span className="gradient-text">Hello, I'm Fluxa AI</span>
              </h1>
              <p className={`text-sm text-center mb-10 ${subtext}`}>
                Powered by {currentModel.name} · Your intelligent assistant for anything
              </p>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s.prompt); if (inputRef.current) inputRef.current.focus(); }}
                    className="suggestion-card text-left p-4 rounded-xl border transition-all">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className={`text-sm font-semibold mb-1 ${textDark}`}>{s.title}</div>
                    <div className={`text-xs leading-relaxed ${subtext} line-clamp-2`}>{s.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Message List ── */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isDark={isDark}
                  copiedId={copiedId}
                  onCopy={copyMessage}
                  onRegenerate={
                    idx === messages.length - 1 && msg.sender === 'bot' && !msg.isTyping
                      ? regenerate
                      : null
                  }
                  isLoading={isLoading}
                />
              ))}
              <div ref={messagesEnd} />
            </div>
          )}
        </div>

        {/* Scroll-to-bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { if (messagesEnd.current) messagesEnd.current.scrollIntoView({ behavior: 'smooth' }); }}
              className="absolute bottom-28 right-6 w-9 h-9 btn-gradient rounded-full flex items-center justify-center shadow-xl z-10">
              <FiChevronDown className="w-4 h-4 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── INPUT AREA ─────────────────────────────────────────────────── */}
        <div className={`px-4 py-4 border-t ${border} ${isDark ? bg : 'bg-white'}`}>
          <div className="max-w-3xl mx-auto">

            {/* Mode pills */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(prev => prev === mode.id ? 'chat' : mode.id)}
                  className={`mode-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeMode === mode.id
                      ? 'btn-gradient text-white shadow-md'
                      : isDark
                        ? 'bg-white/5 text-gray-500 border border-white/8 hover:bg-white/10 hover:text-gray-300'
                        : 'bg-white text-gray-500 border border-purple-100 hover:bg-purple-50 hover:text-purple-600'
                  }`}>
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Input box */}
            <div className={`input-box rounded-2xl border ${inputBg} input-glow transition-all`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={getPlaceholder(activeMode)}
                rows={1}
                maxLength={4000}
                className={`w-full bg-transparent px-4 pt-4 pb-2 text-sm focus:outline-none resize-none ${
                  isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                }`}
                style={{ minHeight: '56px', maxHeight: '220px' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 220) + 'px';
                }}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  <button className={`p-2 rounded-lg ${hoverBg} transition-colors`} title="Upload file">
                    <FiUpload className={`w-3.5 h-3.5 ${subtext}`} />
                  </button>
                  <button className={`p-2 rounded-lg ${hoverBg} transition-colors`} title="Voice input">
                    <FiMic className={`w-3.5 h-3.5 ${subtext}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-mono ${input.length > 3800 ? 'text-orange-400' : subtext}`}>
                    {input.length}/4000
                  </span>
                  <button
                    onClick={() => handleSubmit()}
                    disabled={isLoading || !input.trim()}
                    className="send-btn btn-gradient px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                    <FiSend className="w-3 h-3" />
                    {getBtnLabel(activeMode)}
                  </button>
                </div>
              </div>
            </div>

            <p className={`text-center text-xs mt-2 ${subtext}`}>
              Fluxa AI may make mistakes · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>{/* end main */}

      {/* ═══ PREMIUM MODAL ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPremium(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`${isDark ? 'bg-[#0E0C1A]' : 'bg-white'} rounded-2xl max-h-[90vh] overflow-y-auto relative border ${isDark ? 'border-purple-900/30' : 'border-purple-100'} shadow-2xl`}
              onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowPremium(false)}
              className={`absolute top-4 right-4 p-2 rounded-full ${hoverBg} ${subtext} transition-colors z-10`}>
              <FiX className="w-4 h-4" />
            </button>
            <PremiumFeatures
              theme={{ textDark, text, input: isDark ? 'bg-[#16142A]' : 'bg-purple-50', button: isDark ? 'bg-[#0E0C1A]' : 'bg-white', buttonBorder: isDark ? 'border border-white/10' : 'border border-purple-100' }}
              onSubscribe={plan => { setSelectedPlan(plan); setShowPremium(false); setShowPayment(true); }}
            />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PAYMENT MODAL ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPayment(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`${isDark ? 'bg-[#0E0C1A]' : 'bg-white'} rounded-2xl relative border ${isDark ? 'border-purple-900/30' : 'border-purple-100'} shadow-2xl`}
              onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowPayment(false)}
              className={`absolute top-4 right-4 p-2 rounded-full ${hoverBg} ${subtext} transition-colors z-10`}>
              <FiX className="w-4 h-4" />
            </button>
            <Payment
              theme={{ textDark, text, input: isDark ? 'bg-[#16142A]' : 'bg-purple-50', button: isDark ? 'bg-[#0E0C1A]' : 'bg-white', buttonBorder: isDark ? 'border border-white/10' : 'border border-purple-100', border: isDark ? 'border-white/10' : 'border-purple-100' }}
              plan={selectedPlan}
              onSuccess={() => { setIsPremium(true); setShowPayment(false); }}
            />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Chatbot;