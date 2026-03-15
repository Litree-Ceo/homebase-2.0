'use client';

import { useState } from 'react';
import { VoiceInput } from '@/components/VoiceInput';

export default function VoiceTestPage() {
  const [finalTranscript, setFinalTranscript] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleTranscript = (text: string) => {
    setFinalTranscript(text);
    setHistory((prev) => [text, ...prev.slice(0, 9)]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Voice Input System</h1>
          <p className="text-gray-600">Test dual-mode voice transcription</p>
        </div>

        {/* Voice Input Component */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <VoiceInput onTranscript={handleTranscript} mode="browser" />
        </div>

        {/* Final Result */}
        {finalTranscript && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Transcript</h2>
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
              <p className="text-lg text-gray-800">{finalTranscript}</p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transcripts</h2>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-3 hover:bg-gray-50">
                  <p className="text-sm text-gray-600 mb-1">Transcription {idx + 1}</p>
                  <p className="text-gray-900">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
