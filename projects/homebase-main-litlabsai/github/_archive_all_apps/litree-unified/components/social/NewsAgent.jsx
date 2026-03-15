'use client';
import { useState, useEffect, useRef } from 'react';
import { Zap, Music, Radio, Globe } from 'lucide-react';

const NEWS_TOPICS = [
  'Futuristic Music Tech & AI Audio',
  'New Album Drops in the Metaverse',
  'Underground Artist Spotlight',
  'LiTree System Updates',
  'Global Design & Fashion Trends',
  'Viral Music Challenges',
];

const AGENT_PERSONAS = [
  { name: 'LiTree News Bot', handle: 'news_bot', avatar: null, role: 'System Reporter' },
  { name: 'Music Pulse', handle: 'audio_core', avatar: null, role: 'Music Curator' },
  { name: 'Tech Radar', handle: 'tech_scout', avatar: null, role: 'Tech Analyst' },
  { name: 'Vibe Check', handle: 'vibe_check', avatar: null, role: 'Trend Watcher' },
];

export default function NewsAgent({ onNewPost }) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Standby');
  const timerRef = useRef(null);

  const generateNews = async () => {
    setStatus('Generating content...');

    // Select random topic and persona
    const topic = NEWS_TOPICS[Math.floor(Math.random() * NEWS_TOPICS.length)];
    const persona = AGENT_PERSONAS[Math.floor(Math.random() * AGENT_PERSONAS.length)];

    try {
      // Call our internal API which bridges to NVIDIA NIM
      const response = await fetch('/api/cortex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a short, exciting social media post about ${topic}. Use emojis. Keep it under 280 characters.`,
          model: 'z-ai/glm4.7', // Use GLM-4 for fast text generation
        }),
      });

      const data = await response.json();
      const content = data.result || `Update on ${topic}: Systems nominal. #LiTree`;

      const newPost = {
        id: Date.now(),
        name: persona.name,
        handle: persona.handle,
        time: 'Just now',
        content: content,
        likes: Math.floor(Math.random() * 50).toString(),
        comments: Math.floor(Math.random() * 10).toString(),
        reposts: Math.floor(Math.random() * 5).toString(),
        isFlashGenerated: true,
        avatar: null,
      };

      onNewPost(newPost);
      setStatus('Broadcasting...');
      setTimeout(() => setStatus('Scanning...'), 2000);
    } catch (error) {
      console.error('News Agent Error:', error);
      setStatus('Connection Interrupted');
    }
  };

  useEffect(() => {
    if (isActive) {
      setStatus('Scanning...');
      // Generate news every 15-30 seconds
      const interval = setInterval(generateNews, 20000);
      timerRef.current = interval;
      // Trigger one immediately
      generateNews();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('Standby');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  return (
    <div className="border-b border-white/10 p-4 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
          ></div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio size={14} className="text-hc-bright-gold" />
              Flash News Agent
            </h3>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{status}</p>
          </div>
        </div>

        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
            isActive
              ? 'bg-hc-purple/20 border-hc-purple text-hc-light-purple shadow-[0_0_10px_rgba(168,85,247,0.3)]'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          {isActive ? 'LIVE ON AIR' : 'OFFLINE'}
        </button>
      </div>
    </div>
  );
}
