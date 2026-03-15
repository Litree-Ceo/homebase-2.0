'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Terminal } from 'lucide-react';
import { agentService, AgentMessage } from '@/lib/agent-service';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init',
          role: 'assistant',
          content: "I am Agent Zero. Systems online. How can I assist you with your studio or metaverse operations today?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await agentService.processMessage(userMsg.content, {
        currentPath: window.location.pathname
      });
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Agent Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "⚠️ **CONNECTION ERROR**: Unable to reach Neural Gateway. Running in offline mode.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                height: isMinimized ? 'auto' : '500px',
                width: '350px'
              }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 bg-black/80 backdrop-blur-xl border border-lab-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-display font-bold text-sm tracking-wider flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-lab-purple-400" />
                    AGENT ZERO <span className="text-[10px] bg-lab-purple-500/20 px-1.5 py-0.5 rounded text-lab-purple-300">V2.0</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              {!isMinimized && (
                <>
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-3 text-sm",
                            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                            msg.role === 'user' 
                              ? "bg-lab-blue-500/20 border-lab-blue-500/50 text-lab-blue-400" 
                              : "bg-lab-purple-500/20 border-lab-purple-500/50 text-lab-purple-400"
                          )}>
                            {msg.role === 'user' ? <UserIcon /> : <Bot className="w-4 h-4" />}
                          </div>
                          <div className={cn(
                            "p-3 rounded-2xl max-w-[80%]",
                            msg.role === 'user' 
                              ? "bg-lab-blue-500/10 border border-lab-blue-500/20 text-blue-100 rounded-tr-sm" 
                              : "bg-lab-purple-500/10 border border-lab-purple-500/20 text-purple-100 rounded-tl-sm"
                          )}>
                            <div className="prose prose-invert prose-xs">
                              {msg.content.split('\n').map((line, i) => (
                                <p key={i} className="m-0 min-h-[1.2em]">{line}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-3 text-sm">
                           <div className="w-8 h-8 rounded-full bg-lab-purple-500/20 border border-lab-purple-500/50 flex items-center justify-center shrink-0 text-lab-purple-400">
                             <Bot className="w-4 h-4" />
                           </div>
                           <div className="p-3 rounded-2xl bg-lab-purple-500/10 border border-lab-purple-500/20 text-purple-100 rounded-tl-sm flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-lab-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                             <span className="w-1.5 h-1.5 rounded-full bg-lab-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                             <span className="w-1.5 h-1.5 rounded-full bg-lab-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                           </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-white/5">
                    <div className="relative flex items-center">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Command Agent Zero..."
                        className="bg-black/50 border-white/10 focus-visible:ring-lab-purple-500/50 pr-10 text-xs h-10 rounded-xl"
                      />
                      <Button 
                        size="icon" 
                        type="submit" 
                        disabled={!input.trim() || isTyping}
                        className="absolute right-1 w-8 h-8 rounded-lg bg-lab-purple-500 hover:bg-lab-purple-400 text-white shadow-lg shadow-purple-900/20"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border backdrop-blur-md group",
            isOpen 
              ? "bg-lab-purple-500 border-lab-purple-400 text-white shadow-purple-500/20" 
              : "bg-black/60 border-white/20 text-lab-purple-400 hover:border-lab-purple-500/50 hover:text-white hover:bg-lab-purple-500/20"
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6 group-hover:animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
