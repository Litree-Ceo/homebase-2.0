'use client';
import { useState } from 'react';
import { Image as ImageIcon, Smile, MapPin, Calendar, Zap, Sparkles } from 'lucide-react';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="border-b border-white/10 p-4 bg-black/20 backdrop-blur-sm">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gray-700 to-gray-600 border border-white/10 flex-shrink-0" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What is happening in the studio?"
            className="w-full bg-transparent border-none text-xl placeholder-gray-500 focus:ring-0 resize-none min-h-25 text-white"
          />

          {/* Flash AI Assist */}
          <div className="flex items-center gap-2 mb-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-hc-purple/10 text-hc-light-purple text-xs font-bold hover:bg-hc-purple/20 transition-colors border border-hc-purple/20">
              <Sparkles size={12} />
              <span>Enhance with Flash</span>
            </button>
          </div>

          <div className="flex justify-between items-center border-t border-white/5 pt-3">
            <div className="flex gap-2 text-hc-bright-gold">
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-hc-bright-gold">
                <ImageIcon size={20} />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-hc-bright-gold">
                <Zap size={20} />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-hc-bright-gold">
                <Smile size={20} />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-hc-bright-gold">
                <Calendar size={20} />
              </button>
            </div>

            <button
              disabled={!content.trim()}
              className="px-6 py-2 bg-hc-purple hover:bg-hc-purple/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all shadow-[0_0_15px_rgba(107,33,168,0.2)]"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
