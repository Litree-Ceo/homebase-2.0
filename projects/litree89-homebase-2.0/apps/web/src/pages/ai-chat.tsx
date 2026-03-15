/**
 * Smart AI Chat Demo - Showcase real AI integration
 * Built for LITLABS 2026
 */

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { aiClient } from '@/lib/aiIntegration';
import { analytics } from '@/lib/smartFeatures';
import { useOnlineStatus, useDebounce } from '@/hooks/useSmartFeatures';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOnline = useOnlineStatus();
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (debouncedInput.length > 3) {
      analytics.track('chat_typing', { length: debouncedInput.length });
    }
  }, [debouncedInput]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    analytics.track('chat_message_sent', { length: userMessage.content.length });

    try {
      await aiClient.streamChat(userMessage.content, chunk => {
        setStreamingContent(prev => prev + chunk);
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: streamingContent,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
      analytics.track('chat_response_received', { length: assistantMessage.content.length });
    } catch (error) {
      console.error('Chat error:', error);
      analytics.track('chat_error', { error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Explain quantum computing in simple terms',
    'Write a haiku about coding',
    'Give me 3 startup ideas for 2026',
    'Best practices for React performance',
  ];

  return (
    <>
      <Head>
        <title>AI Chat | LITLABS Smart Studio</title>
        <meta name="description" content="Experience real-time AI chat powered by Grok" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/"
                className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-block"
              >
                ← Back to Studio
              </Link>
              <h1 className="text-4xl font-display gradient-text">Smart AI Chat</h1>
              <p className="text-slate-400 mt-2">
                Powered by Grok AI • Real-time streaming responses
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`status-indicator ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
                />
                <span className="text-slate-400">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </header>

          {/* Chat Container */}
          <div className="glass-dark rounded-3xl p-6 min-h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h2 className="text-xl font-display mb-2">Start a conversation</h2>
                  <p className="text-slate-400 mb-6">Ask me anything or try a quick prompt below</p>

                  {/* Quick Prompts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {quickPrompts.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt);
                          analytics.track('quick_prompt_clicked', { prompt });
                        }}
                        className="glass smart-hover p-4 rounded-xl text-left text-sm text-slate-300 hover:text-white hover:bg-purple-500/20"
                      >
                        <span className="text-purple-400 mr-2">→</span>
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } smart-reveal visible`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      message.role === 'user' ? 'bg-purple-600 text-white' : 'glass text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs opacity-70">
                        {message.role === 'user' ? 'You' : 'AI'}
                      </span>
                      <span className="text-xs opacity-50">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Streaming Response */}
              {streamingContent && (
                <div className="flex justify-start smart-reveal visible">
                  <div className="max-w-[80%] glass rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs opacity-70">AI</span>
                      <span className="text-xs opacity-50">typing...</span>
                    </div>
                    <p className="whitespace-pre-wrap">{streamingContent}</p>
                    <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1" />
                  </div>
                </div>
              )}

              {isLoading && !streamingContent && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl px-5 py-3">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  isOnline
                    ? 'Type your message... (Shift+Enter for new line)'
                    : "You're offline. Check your connection."
                }
                disabled={!isOnline || isLoading}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none disabled:opacity-50"
                rows={3}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !isOnline || isLoading}
                aria-label="Send message"
                className="absolute right-3 bottom-3 w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all smart-hover focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{messages.length} messages in this conversation</span>
              <span>Powered by Grok AI</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
