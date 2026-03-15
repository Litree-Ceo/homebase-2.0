'use client';

import { useState } from 'react';
import { generateAIContent } from '../lib/god-mode';

export default function GodModePanel() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'smart' | 'fast'>('smart');

  const handleExecute = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(''); // Clear previous result
    try {
      // Use the API route instead of direct server function
      const response = await fetch('/api/cortex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: { id: mode === 'smart' ? 'z-ai/glm4.7' : 'meta/llama3-70b-instruct' },
          type: 'text',
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setResult(data.content);
    } catch (error: any) {
      setResult('Error executing God Mode: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flash-card border-hc-purple/30 bg-black/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hc-purple to-hc-bright-gold flex items-center justify-center text-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          🧠
        </div>
        <div>
          <h2 className="font-black text-2xl tracking-tight text-white">
            GOD MODE <span className="text-hc-bright-gold text-sm align-top">BETA</span>
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-hc-purple">
            Powered by NVIDIA Flash Cortex
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Mode Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setMode('smart')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'smart'
                ? 'bg-hc-purple text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Smart Execute (GLM-4)
          </button>
          <button
            onClick={() => setMode('fast')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'fast'
                ? 'bg-hc-bright-gold text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Fast Generate (Llama 3)
          </button>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
            Directive
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe exactly what you need... (e.g., 'Research 5 competitors for a digital agency and write a strategy')"
            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hc-purple/50 focus:ring-1 focus:ring-hc-purple/50 transition-all resize-none font-mono"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleExecute}
          disabled={loading || !prompt}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
            loading
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-hc-purple to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <span className="animate-spin">⚡</span> PROCESSING...
            </>
          ) : (
            <>
              <span className="text-xl">⚡</span> EXECUTE GOD MODE
            </>
          )}
        </button>

        {/* Result Area */}
        {result && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-hc-purple via-hc-bright-gold to-hc-purple opacity-50 rounded-t-xl"></div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-hc-bright-gold">
                Intelligence Report
              </span>
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-hc-purple animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-hc-purple animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-hc-purple animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></span>
              </div>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-sm leading-relaxed text-gray-200 font-mono shadow-inner max-h-100 overflow-y-auto custom-scrollbar">
              <div className="prose prose-invert prose-sm max-w-none">
                {/* Render Image or Text */}
                {result.startsWith('![Generated Texture]') ? (
                  <img
                    src={result.match(/\((.*?)\)/)?.[1] || ''}
                    alt="Generated Texture"
                    className="w-full h-auto rounded-lg shadow-lg border border-white/20"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">{result}</pre>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="text-lg">📋</span> Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
