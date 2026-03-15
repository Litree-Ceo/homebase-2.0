'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { agentService } from '@/lib/agent-service';
import { usePathname } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I am Agent Zero. I can assist with trading analysis, content strategy, or metaverse navigation. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await agentService.processMessage(input, {
        currentPath: pathname || '/chat',
        user: { name: 'Creator', balance: 12450 }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col bg-lab-dark-900 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-lab-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-lab-blue-500/20 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <div className="glass border-b border-white/10 p-4 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-lab-purple-500/20">
              <Sparkles className="w-5 h-5 text-lab-purple-400" />
            </div>
            <div>
              <h1 className="text-white font-bold flex items-center gap-2">
                LiTreeLab AI <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">ONLINE</span>
              </h1>
              <p className="text-white/50 text-sm">Powered by Agent Zero</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 font-mono hidden sm:block">
            GATEWAY: 127.0.0.1:18789 // MODEL: GEMINI-1.5
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === 'user' ? 'bg-lab-purple-500/20' : 'bg-lab-green-500/20'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-lab-purple-400" />
                ) : (
                  <Bot className="w-5 h-5 text-lab-green-400" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user' ? 'bg-lab-purple-500/20 text-white' : 'glass text-white'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs text-white/40 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-lab-green-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-lab-green-400" />
              </div>
              <div className="glass p-4 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="glass border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about trading, metaverse, or content creation..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                       text-white placeholder-white/30
                       focus:outline-none focus:border-lab-purple-500/50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 rounded-xl bg-linear-to-r from-lab-purple-600 to-lab-green-600 
                       text-white font-semibold hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
