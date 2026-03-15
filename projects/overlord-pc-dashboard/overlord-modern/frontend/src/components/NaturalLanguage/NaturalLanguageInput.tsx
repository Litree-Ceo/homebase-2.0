import React, { useState } from 'react';

interface GenerationResult {
  project_id: string;
  status: string;
  message: string;
  preview?: {
    intent: string;
    entities: {
      frameworks: string[];
      features: string[];
      data_models: string[];
    };
    files_generated: {
      frontend: number;
      backend: number;
      database: number;
    };
  };
}

import { api } from '../../services/api';

const NaturalLanguageInput: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const data = await api.generateApp(prompt);
      setResponse(data as GenerationResult);
    } catch (error) {
      console.error('Error generating application:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!response?.project_id) return;

    try {
      const res = await fetch(
        `/api/v1/app-builder/download/${response.project_id}`
      );
      const data = await res.json();

      // Convert hex string to bytes
      const byteArray = new Uint8Array(
        data.content.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
      );
      const blob = new Blob([byteArray], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download project');
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-2">AI App Builder</h1>
      <p className="mb-6 text-gray-400 max-w-2xl">
        Describe the application you want to build in plain English. I&apos;ll
        generate a complete React frontend and Node.js backend for you.
      </p>

      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-400 mb-2">Example prompts:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Create a to-do list app with user authentication',
            'Build an e-commerce site with shopping cart',
            'Make a blog with posts and comments',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-gray-300 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="flex-grow p-4 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        placeholder="Describe your application here... (e.g., 'Create a task management app with user authentication and real-time notifications')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isLoading}
        rows={4}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300">
          ❌ {error}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⚡</span>
              Generating...
            </>
          ) : (
            <>🚀 Generate Application</>
          )}
        </button>

        {response && (
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            📥 Download
          </button>
        )}
      </div>

      {response && (
        <div className="mt-6 p-5 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-400 text-xl">✓</span>
            <h2 className="text-lg font-bold text-green-400">
              {response.message}
            </h2>
          </div>

          {response.preview && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Intent</p>
                <p className="text-gray-300 capitalize">
                  {response.preview.intent.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Features</p>
                <p className="text-gray-300">
                  {response.preview.entities.features.join(', ') || 'None'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Data Models</p>
                <p className="text-gray-300">
                  {response.preview.entities.data_models.join(', ') || 'None'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Files Generated</p>
                <div className="flex gap-3">
                  <span className="text-blue-400">
                    Frontend: {response.preview.files_generated.frontend}
                  </span>
                  <span className="text-purple-400">
                    Backend: {response.preview.files_generated.backend}
                  </span>
                  <span className="text-yellow-400">
                    DB: {response.preview.files_generated.database}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageInput;
