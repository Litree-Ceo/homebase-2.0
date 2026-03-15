import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { ModelInfo } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isCode?: boolean;
  language?: string;
}

type AIMode = 'chat' | 'code' | 'agent' | 'vision';


interface CodeResponse {
  code: string;
  language: string;
  model: string;
  explanation: string;
}

interface AgentResponse {
  response: string;
  model: string;
  provider: string;
}

interface VisionResponse {
  code: string;
  model: string;
}

interface ChatResponse {
  response: string;
  model: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `🤖 **Overlord AI Assistant**

I have access to 6 state-of-the-art **FREE** models via OpenRouter:

🧠 **gpt-oss-120b** — Complex reasoning & agents
💻 **qwen3-coder-480b** — Best free coding model  
⚡ **step-3.5-flash** — Lightning fast responses
👁️ **qwen3-vl** — Vision/UI to code
🎨 **arcee-trinity** — Creative tasks
🤖 **glm-4.5-air** — Agent loops with thinking mode

Select a mode below and start chatting!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>('chat');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [agentFast, setAgentFast] = useState(false);
  const [, setModels] = useState<Record<string, ModelInfo> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Load models info
    api
      .assistantModels()
      .then(setModels as (value: unknown) => void | PromiseLike<void>)
      .catch(() => {});
  }, []);

  const generateId = () => Math.random().toString(36).substring(7);

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      switch (mode) {
        case 'code': {
          const codeResponse: CodeResponse = await api.generateCode(
            input,
            codeLanguage
          );
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: 'assistant',
              content: `**${codeResponse.language.toUpperCase()} Code** (via ${codeResponse.model})\n\n${codeResponse.explanation}`,
              timestamp: new Date(),
            },
            {
              id: generateId(),
              role: 'assistant',
              content: codeResponse.code,
              timestamp: new Date(),
              isCode: true,
              language: codeResponse.language,
            },
          ]);
          break;
        }

        case 'agent': {
          const agentResponse: AgentResponse = await api.agentTask(
            input,
            undefined,
            agentFast
          );
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: 'assistant',
              content: `**Agent Response** (via ${agentResponse.model})\n\n${agentResponse.response}`,
              timestamp: new Date(),
            },
          ]);
          break;
        }

        case 'vision': {
          const visionResponse: VisionResponse = await api.visionToCode(input);
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: 'assistant',
              content: `**UI → React Code** (via ${visionResponse.model})`,
              timestamp: new Date(),
            },
            {
              id: generateId(),
              role: 'assistant',
              content: visionResponse.code,
              timestamp: new Date(),
              isCode: true,
              language: 'tsx',
            },
          ]);
          break;
        }

        case 'chat':
        default: {
          const history = messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({
              role: m.role,
              content: m.content,
            }));

          const chatResponse: ChatResponse = await api.chatWithAssistant(
            input,
            history,
            'default'
          );
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: 'assistant',
              content: chatResponse.response,
              timestamp: new Date(),
            },
          ]);
          break;
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: `❌ **Error**\n\n${errorMessage}\n\n⚠️ Make sure you have set OPENROUTER_API_KEY in your .env file.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat cleared. How can I help you?',
        timestamp: new Date(),
      },
    ]);
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'code':
        return `Describe the ${codeLanguage} code you want (e.g., "Create a function to fetch data from an API with error handling")...`;
      case 'agent':
        return agentFast
          ? 'Give the agent a task (fast mode with thinking)...'
          : 'Give the agent a task (best reasoning + tool use)...';
      case 'vision':
        return 'Describe the UI/mockup (e.g., "A dark-themed dashboard with sidebar, header with user avatar, and main content area with stats cards")...';
      default:
        return 'Ask me anything...';
    }
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white rounded-lg overflow-hidden shadow-2xl fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[90] w-[calc(100vw-2rem)] md:w-[440px] h-[70vh] md:h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h2 className="font-bold text-lg">AI Assistant</h2>
            <p className="text-xs text-gray-400">
              6 Free Models via OpenRouter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Clear chat"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-800/50 border-b border-gray-700">
        {[
          { key: 'chat', label: '💬 Chat', desc: 'General conversation' },
          { key: 'code', label: '💻 Code', desc: 'Code generation' },
          { key: 'agent', label: '🤖 Agent', desc: 'Agent tasks' },
          { key: 'vision', label: '👁️ Vision', desc: 'UI → Code' },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key as AIMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
              mode === m.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={m.desc}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode-specific Options */}
      {mode === 'code' && (
        <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-700 flex items-center gap-3">
          <span className="text-sm text-gray-400">Language:</span>
          <select
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            className="bg-gray-700 text-white text-sm rounded px-3 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="tsx">React/TSX</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="bash">Bash</option>
            <option value="sql">SQL</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
          </select>
          <span className="text-xs text-gray-500 ml-2">
            Uses qwen3-coder-480b (best free coding model)
          </span>
        </div>
      )}

      {mode === 'agent' && (
        <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-700 flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agentFast}
              onChange={(e) => setAgentFast(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-300">
              Fast mode (glm-4.5-air with thinking)
            </span>
          </label>
          <span className="text-xs text-gray-500 ml-auto">
            {agentFast
              ? 'Fast + thinking mode'
              : 'Best reasoning (gpt-oss-120b)'}
          </span>
        </div>
      )}

      {mode === 'vision' && (
        <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-700">
          <span className="text-xs text-gray-500">
            Uses qwen3-vl-235b — Describe your UI and I&apos;ll generate
            React/Tailwind code
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg overflow-hidden ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isCode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-700 text-white'
              }`}
            >
              {message.isCode ? (
                <div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
                    <span className="text-xs text-gray-400 uppercase font-semibold">
                      {message.language}
                    </span>
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre className="p-3 text-sm overflow-x-auto max-h-96">
                    <code className="font-mono">{message.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="p-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content.split('\n').map((line, i) => {
                    const isBold = line.startsWith('**') && line.endsWith('**');
                    const cleanLine = line.replace(/\*\*/g, '');
                    return (
                      <p
                        key={i}
                        className={isBold ? 'font-bold mb-1' : 'mb-0.5'}
                      >
                        {cleanLine}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span className="text-sm text-gray-400">
                {mode === 'code'
                  ? 'Generating code...'
                  : mode === 'agent'
                    ? 'Agent thinking...'
                    : mode === 'vision'
                      ? 'Analyzing UI...'
                      : 'Thinking...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={getPlaceholder()}
            className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-gray-500">
            Enter to send • Shift+Enter for new line
          </p>
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Get free API key →
          </a>
        </div>
      </div>
    </div>
  );
};
