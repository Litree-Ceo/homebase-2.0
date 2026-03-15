'use client';

import { useState } from 'react';

export default function TestAIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ SUCCESS!\n\n${data.message}\n\nAI Response: ${data.aiResponse}`);
      } else {
        setError(`❌ FAILED: ${data.error}\n\nDetails: ${data.details || 'No additional details'}`);
      }
    } catch (err) {
      setError(`❌ FETCH ERROR: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 gradient-text">🧪 AI Tools Test Page</h1>
        
        <div className="glass p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-2">Quick Status Check</h2>
          <p className="text-slate-300 mb-4">
            This page tests if your Google AI API key is configured correctly.
          </p>
          
          <button
            onClick={testAPI}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Testing...' : '🚀 Test AI Connection'}
          </button>
        </div>

        {result && (
          <div className="glass p-6 rounded-xl mb-6 border-2 border-emerald-500">
            <pre className="text-sm whitespace-pre-wrap text-emerald-400 font-mono">
              {result}
            </pre>
          </div>
        )}

        {error && (
          <div className="glass p-6 rounded-xl mb-6 border-2 border-red-500">
            <pre className="text-sm whitespace-pre-wrap text-red-400 font-mono">
              {error}
            </pre>
          </div>
        )}

        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">📝 Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Get API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Google AI Studio</a></li>
            <li>Open <code className="bg-slate-800 px-2 py-1 rounded">.env.local</code> in your editor</li>
            <li>Replace <code className="bg-slate-800 px-2 py-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY</code> value</li>
            <li>Restart dev server (<code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code>)</li>
            <li>Click "Test AI Connection" above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
