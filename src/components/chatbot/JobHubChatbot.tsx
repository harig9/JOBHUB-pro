import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';
import { Job, Resume } from '../../types/index.js';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  Bot,
  User as UserIcon,
  Mic,
  MicOff,
  ChevronDown,
  RefreshCw,
  Target,
  Calendar,
  Briefcase,
  Info,
  Code2,
} from 'lucide-react';

import { ActiveTab } from '../Navbar.js';
import { useTheme, AccentColor } from '../../context/ThemeContext.js';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface JobHubChatbotProps {
  jobs?: Job[];
  resumes?: Resume[];
  onNavigateTab?: (tab: ActiveTab) => void;
}

const STARTER_PROMPTS = [
  { label: '🎯 How to reach 85%+ ATS?', prompt: 'How can I optimize my resume to reliably score 85%+ across enterprise ATS algorithms like Greenhouse and Workday?' },
  { label: '📅 Upcoming Deadlines & Interviews', prompt: 'Summarize my current upcoming deadlines, scheduled interview dates, and next milestones.' },
  { label: '💼 Stripe System Design Prep', prompt: 'Give me a structured STAR preparation guide and architectural checklist for a distributed platforms role at Stripe.' },
  { label: '✍️ Cover Letter Opening', prompt: 'Give me three high-converting opening hooks for my senior engineering cover letter.' },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  role: 'assistant',
  content: `Hello! I'm your **JobHub Pro AI Assistant** powered by Gemini.

I can help you:
- **ATS 85%+ Optimization**: Keyword density, bullet improvements, and gap analysis
- **Mock Interviews**: STAR method answers, system design frameworks, and bar-raiser tips
- **Opportunity Strategy**: Navigating upcoming deadlines, interview dates, and recruiter check-ins
- **Compensation & Negotiation**: Base, equity, and counter-offer strategies

How can I help accelerate your career today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
};

const ACCENT_TEXT_CLASSES: Record<AccentColor, string> = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  violet: 'text-violet-600 dark:text-violet-400',
  slate: 'text-slate-800 dark:text-slate-200',
};

const ACCENT_BUTTON_CLASSES: Record<AccentColor, string> = {
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  blue: 'bg-blue-600 hover:bg-blue-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  violet: 'bg-violet-600 hover:bg-violet-700',
  slate: 'bg-slate-700 hover:bg-slate-800',
};

export function JobHubChatbot({ jobs = [], resumes = [], onNavigateTab }: JobHubChatbotProps) {
  const { showToast } = useToast();
  const { accentColor } = useTheme();

  const accentTextClass = ACCENT_TEXT_CLASSES[accentColor] || ACCENT_TEXT_CLASSES.indigo;
  const accentButtonClass = ACCENT_BUTTON_CLASSES[accentColor] || ACCENT_BUTTON_CLASSES.indigo;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('jobhub_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_MESSAGE];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jobhub_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Speech Recognition (Dictation)
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.', 'info');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your question now', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // Build API payload
      const payloadMessages = updatedHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextData = {
        jobsCount: jobs.length,
        resumesCount: resumes.length,
        upcomingDeadlines: jobs.filter((j) => j.deadline).map((j) => `${j.company}: ${j.deadline}`),
        upcomingInterviews: jobs.filter((j) => j.interviewDate).map((j) => `${j.company} on ${j.interviewDate}`),
      };

      const res = await api.sendChatMessage(payloadMessages, contextData);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: res.reply || "I'm here to help with your career and application pipeline. Could you clarify your question?",
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        role: 'assistant',
        content: `I'm currently running in algorithmic mode. To optimize your ATS score, align your resume's technical keywords directly with your target job description and quantify your impact using the STAR method.`,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear chat conversation history?')) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem('jobhub_chat_history');
      showToast('Conversation reset', 'info');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simple Markdown Formatter
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-2 mb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1 text-[11px] leading-relaxed">
            <span className="text-indigo-500 font-bold shrink-0">•</span>
            <span>{renderInlineBold(text)}</span>
          </div>
        );
      }
      // Numbered list (e.g. 1. )
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="my-0.5 pl-1 text-[11px] leading-relaxed">
            {renderInlineBold(line.trim())}
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-1 text-[11px] leading-relaxed">
          {renderInlineBold(line)}
        </p>
      );
    });
  };

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            title="Open JobHub Pro AI Assistant"
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-600/40 transition-all duration-200 cursor-pointer border border-indigo-400/30"
          >
            <div className="relative">
              <Bot className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-700 animate-pulse" />
            </div>
            <span className="tracking-tight">JobHub Pro AI</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
              3.8 Flash
            </span>
          </button>
        </div>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-5 right-5 z-50 w-96 sm:w-[420px] max-w-[calc(100vw-2.5rem)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 ${
            isMinimized ? 'h-14' : 'h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                  <span>JobHub Pro AI Assistant</span>
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gemini 3.8 Flash Active</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                title="About JobHub Pro AI Assistant"
                aria-label="About JobHub Pro AI Assistant"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand chat' : 'Minimize chat'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          isUser
                            ? 'bg-slate-800 dark:bg-slate-700 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {isUser ? <UserIcon className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        <div className="break-words">
                          {isUser ? <p className="text-[11px] leading-relaxed">{msg.content}</p> : renderFormattedContent(msg.content)}
                        </div>
                        <div
                          className={`text-[9px] mt-1 text-right font-mono ${
                            isUser ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Starter Quick Suggestions (Shown if conversation has <= 2 messages) */}
              {messages.length <= 2 && (
                <div className="px-3 py-1.5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {STARTER_PROMPTS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[10px] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input Box */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-colors">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask JobHub Pro AI Assistant..."
                    className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none max-h-24 font-sans leading-relaxed"
                  />

                  {/* Speech Dictation Button */}
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    title={isListening ? 'Stop listening' : 'Dictate question via voice'}
                    className={`p-1 rounded-lg transition cursor-pointer ${
                      isListening
                        ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50 animate-pulse'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isLoading}
                    className={`p-1.5 rounded-lg ${accentButtonClass} disabled:opacity-40 text-white transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed shrink-0`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Developer Credit & About Footer (Directly below message input area) */}
              <div className="py-2.5 px-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 select-none flex items-center justify-between gap-3 text-xs font-sans transition-colors shrink-0">
                <div className="flex flex-col text-left leading-tight min-w-0">
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 tracking-tight truncate">
                    JobHub Pro AI Assistant
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Code2 className={`w-2.5 h-2.5 shrink-0 ${accentTextClass}`} />
                    <span>
                      Created by <strong className={`font-semibold ${accentTextClass}`}>Manikanta & Hari</strong>
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAboutOpen(true)}
                  title="About JobHub Pro AI Assistant"
                  aria-label="About JobHub Pro AI Assistant"
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer shrink-0 px-2 py-1 rounded-lg bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                >
                  <Info className="w-3 h-3 text-slate-400" />
                  <span>About</span>
                </button>
              </div>
            </>
          )}

          {/* About Information Modal / Dialog Overlay */}
          {isAboutOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="About JobHub Pro AI Assistant"
              className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setIsAboutOpen(false)}
            >
              <div
                className="w-full max-w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      About
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAboutOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    aria-label="Close About Dialog"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3.5 space-y-3 text-xs text-left">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Product
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      JobHub Pro — AI Career Suite
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Assistant
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      JobHub Pro AI Assistant
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Developers
                    </span>
                    <p className={`font-semibold mt-0.5 ${accentTextClass}`}>
                      Manikanta & Hari
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Purpose
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      An AI-powered career assistant designed to help users with job applications, resume improvement, interview preparation, and career development.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAboutOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
