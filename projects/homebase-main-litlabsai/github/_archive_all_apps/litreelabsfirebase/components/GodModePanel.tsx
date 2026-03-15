'use client';

import { useState } from 'react';
import { Sparkles, Video, Target, Zap, Brain } from 'lucide-react';

interface GodModeResult {
  plan?: string[];
  research?: Array<{ query: string; findings: string }>;
  content?: string;
  script?: string;
  scenes?: Array<{ time: string; visual: string; audio: string; text?: string }>;
  hooks?: string[];
  topStrategies?: string[];
  contentGaps?: string[];
  confidence?: number;
  executionTime?: number;
}

export default function GodModePanel() {
  const [mode, setMode] = useState<'execute' | 'video' | 'competitor'>('execute');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GodModeResult | null>(null);
  
  // Execute mode
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [includeResearch, setIncludeResearch] = useState(true);
  
  // Video mode
  const [videoTopic, setVideoTopic] = useState('');
  const [duration, setDuration] = useState(30);
  const [platform, setPlatform] = useState<'tiktok' | 'youtube' | 'instagram'>('tiktok');
  const [style, setStyle] = useState<'educational' | 'entertaining' | 'salesy' | 'storytelling'>('entertaining');
  
  // Competitor mode
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');

  const handleExecute = async () => {
    setLoading(true);
    setResult(null);

    try {
      let body: any = { mode };

      if (mode === 'execute') {
        body = { ...body, task, context, includeResearch };
      } else if (mode === 'video') {
        body = { ...body, topic: videoTopic, duration, platform, style };
      } else if (mode === 'competitor') {
        body = { ...body, businessType, location, platforms: ['instagram', 'tiktok'] };
      }

      const response = await fetch('/api/ai/god-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute');
      }

      setResult(data.result);
    } catch (error: any) {
      alert(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8" />
            <h1 className="text-3xl font-bold">GOD MODE 🧠</h1>
          </div>
          <p className="text-purple-100 max-w-2xl">
            Ultra-intelligent AI that researches, strategizes, and executes like a $500/hour expert.
            Pulls from multiple sources to deliver perfect results every time.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setMode('execute')}
          className={`p-4 rounded-xl border-2 transition-all ${
            mode === 'execute'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
              : 'border-gray-200 dark:border-gray-800 hover:border-purple-300'
          }`}
        >
          <Sparkles className={`w-6 h-6 mb-2 ${mode === 'execute' ? 'text-purple-600' : 'text-gray-400'}`} />
          <h3 className="font-semibold">Smart Execute</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Research & create anything</p>
        </button>

        <button
          onClick={() => setMode('video')}
          className={`p-4 rounded-xl border-2 transition-all ${
            mode === 'video'
              ? 'border-pink-500 bg-pink-50 dark:bg-pink-950'
              : 'border-gray-200 dark:border-gray-800 hover:border-pink-300'
          }`}
        >
          <Video className={`w-6 h-6 mb-2 ${mode === 'video' ? 'text-pink-600' : 'text-gray-400'}`} />
          <h3 className="font-semibold">Video Scripts</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Scene-by-scene breakdowns</p>
        </button>

        <button
          onClick={() => setMode('competitor')}
          className={`p-4 rounded-xl border-2 transition-all ${
            mode === 'competitor'
              ? 'border-red-500 bg-red-50 dark:bg-red-950'
              : 'border-gray-200 dark:border-gray-800 hover:border-red-300'
          }`}
        >
          <Target className={`w-6 h-6 mb-2 ${mode === 'competitor' ? 'text-red-600' : 'text-gray-400'}`} />
          <h3 className="font-semibold">Competitor Intel</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Spy on top performers</p>
        </button>
      </div>

      {/* Input Forms */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {mode === 'execute' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">What do you need?</label>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g., Create a viral TikTok script about my new lash package..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Additional Context (optional)</label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., I'm a lash tech in Miami, targeting young professionals..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeResearch}
                onChange={(e) => setIncludeResearch(e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm">Include research & competitor analysis (takes longer but better results)</span>
            </label>
          </div>
        )}

        {mode === 'video' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video Topic</label>
              <input
                type="text"
                value={videoTopic}
                onChange={(e) => setVideoTopic(e.target.value)}
                placeholder="e.g., Why classic lashes are making a comeback"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration-input" className="block text-sm font-medium mb-2">Duration (seconds)</label>
                <input
                  id="duration-input"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500"
                  aria-label="Duration in seconds"
                />
              </div>
              <div>
                <label htmlFor="platform-select" className="block text-sm font-medium mb-2">Platform</label>
                <select
                  id="platform-select"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500"
                  aria-label="Select video platform"
                >
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram Reel</option>
                  <option value="youtube">YouTube Short</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="style-select" className="block text-sm font-medium mb-2">Style</label>
              <select
                id="style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500"
                aria-label="Select content style"
              >
                <option value="entertaining">Entertaining</option>
                <option value="educational">Educational</option>
                <option value="salesy">Sales-focused</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>
          </div>
        )}

        {mode === 'competitor' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Business Type</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g., Lash extension studio"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location (optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Los Angeles, CA"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={loading || (mode === 'execute' && !task) || (mode === 'video' && !videoTopic) || (mode === 'competitor' && !businessType)}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              God Mode Thinking...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Execute God Mode
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          {/* Confidence Score */}
          {result.confidence && (
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Confidence Score</span>
                  <span className="text-sm font-bold text-purple-600">{Math.round(result.confidence * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                    style={{ width: `${result.confidence * 100}%` }}
                    role="progressbar"
                    aria-valuenow={result.confidence * 100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Confidence score: ${Math.round(result.confidence * 100)}%`}
                  ></div>
                </div>
              </div>
              {result.executionTime && (
                <span className="text-xs text-gray-500">{(result.executionTime / 1000).toFixed(1)}s</span>
              )}
            </div>
          )}

          {/* Plan */}
          {result.plan && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Execution Plan
              </h3>
              <ol className="space-y-2">
                {result.plan.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Research */}
          {result.research && result.research.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Research Findings</h3>
              <div className="space-y-3">
                {result.research.map((r, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-purple-600 mb-2">{r.query}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{r.findings}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {result.content && (
            <div>
              <h3 className="font-semibold mb-3">Generated Content</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">{result.content}</pre>
              </div>
            </div>
          )}

          {/* Video Script */}
          {result.script && (
            <div>
              <h3 className="font-semibold mb-3">Video Script</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">{result.script}</pre>
              </div>
            </div>
          )}

          {/* Scenes */}
          {result.scenes && result.scenes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Scene Breakdown</h3>
              <div className="space-y-3">
                {result.scenes.map((scene, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono bg-purple-100 dark:bg-purple-900 text-purple-600 px-2 py-1 rounded">
                        {scene.time}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Visual:</span>
                        <p className="mt-1">{scene.visual}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Audio:</span>
                        <p className="mt-1">{scene.audio}</p>
                      </div>
                    </div>
                    {scene.text && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-500 text-sm">Text Overlay:</span>
                        <p className="mt-1 text-sm font-bold">{scene.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hooks */}
          {result.hooks && result.hooks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Hook Options</h3>
              <div className="space-y-2">
                {result.hooks.map((hook, i) => (
                  <div key={i} className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 rounded-lg p-3 border border-pink-200 dark:border-pink-800">
                    <p className="text-sm font-medium">{hook}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Analysis */}
          {result.topStrategies && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Top Strategies</h3>
                <ul className="space-y-2">
                  {result.topStrategies.map((strategy, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {result.contentGaps && (
                <div>
                  <h3 className="font-semibold mb-3">Content Gaps (Opportunities)</h3>
                  <ul className="space-y-2">
                    {result.contentGaps.map((gap, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-yellow-600">★</span>
                        <span className="text-sm">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
