'use client';
import { useState } from 'react';
import FlashNav from '../../components/FlashNav';
import {
  Brain,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  Send,
  Bot,
  Zap,
  Code,
} from 'lucide-react';

// Updated Model List based on user request
const MODELS = [
  {
    id: 'thudm/glm-4-9b-chat',
    name: 'GLM-4 9B',
    provider: 'Z-ai',
    type: 'chat',
    tier: 'free',
    description:
      'Balanced performance and speed. Excellent for bilingual (English/Chinese) tasks and general chat.',
    color: 'from-blue-600 to-indigo-500',
  },
  {
    id: 'mistralai/mistral-7b-instruct-v0.3',
    name: 'Mistral 7B',
    provider: 'Mistral AI',
    type: 'chat',
    tier: 'free',
    description:
      'High efficiency open-weight model. Great for quick reasoning and text generation.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    id: 'google/gemma-7b-it',
    name: 'Google Gemma 7B',
    provider: 'Google',
    type: 'chat',
    tier: 'free',
    description:
      'Built from the same research and technology as Gemini. Lightweight and state-of-the-art.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'microsoft/phi-3-mini-4k-instruct',
    name: 'Microsoft Phi-3',
    provider: 'Microsoft',
    type: 'code',
    tier: 'free',
    description:
      'Surprisingly powerful small model. Excellent for logic puzzles and basic coding tasks.',
    color: 'from-cyan-500 to-blue-400',
  },
  {
    id: 'meta/llama-3-70b-instruct',
    name: 'Meta Llama 3 70B',
    provider: 'Meta',
    type: 'chat',
    tier: 'pro',
    description: 'Top-tier reasoning and coding capabilities. Best for general assistance.',
    color: 'from-purple-600 to-pink-500',
  },
  {
    id: 'nvidia/nemotron-4-340b-instruct',
    name: 'NVIDIA Nemotron-4',
    provider: 'NVIDIA',
    type: 'chat',
    tier: 'pro',
    description:
      'Massive parameter model optimized for synthetic data generation and complex logic.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    type: 'image',
    tier: 'pro',
    description: 'High-fidelity image generation for studio assets and textures.',
    color: 'from-rose-500 to-red-600',
  },
];

export default function CortexPage() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Welcome to Flash Cortex. I am powered by NVIDIA NIM microservices. How can I assist your creative process today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/cortex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (data.image) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.content, image: data.image },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.content || data.error || 'Error occurred' },
        ]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'System Error: Unable to connect to Flash Cortex.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar - Model Selector */}
      <div className="w-full md:w-80 border-r border-white/10 p-4 flex flex-col h-[40vh] md:h-screen overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
            <Zap className="text-yellow-400 fill-yellow-400" />
            FLASH <span className="text-gray-500">CORTEX</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            SYSTEM STATUS: <span className="text-green-500">OPERATIONAL</span>
          </p>
        </div>

        <div className="space-y-2">
          {MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`w-full p-3 rounded-xl border text-left transition-all group relative overflow-hidden ${
                selectedModel.id === model.id
                  ? 'bg-white/10 border-white/20 shadow-lg'
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <div className="absolute inset-0 bg-linear-to-r from-hc-purple/20 to-hc-bright-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex justify-between items-start mb-1 relative z-10">
                <span className="font-bold text-sm">{model.name}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                    model.tier === 'pro'
                      ? 'bg-linear-to-r from-purple-500 to-pink-500'
                      : 'bg-gray-700'
                  }`}
                >
                  {model.tier.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-400 mb-2">{model.provider}</div>
              <p className="text-[10px] text-gray-500 leading-tight">{model.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[60vh] md:h-screen bg-linear-to-b from-gray-900 to-black">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-white text-black font-medium'
                    : 'bg-white/5 border border-white/10 text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 opacity-50 text-xs font-bold uppercase">
                  {msg.role === 'user' ? (
                    'You'
                  ) : (
                    <>
                      <Bot size={12} /> {selectedModel.name}
                    </>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.image && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/20">
                    <img src={msg.image} alt="Generated Content" className="w-full h-auto" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
                <span className="text-xs text-gray-500 ml-2 font-mono">
                  PROCESSING VIA NVIDIA NIM...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`Message ${selectedModel.name}...`}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600 font-mono">
              Powered by NVIDIA NIM • Latency: ~45ms • Region: US-East
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
