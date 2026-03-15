'use client';

import Link from 'next/link';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">AI-Powered Tools</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Labs AI
            </span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
            Advanced AI tools and automation for creators. 
            Build smarter, create faster, scale bigger.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all"
            >
              <Bot className="w-5 h-5" />
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            { title: 'AI Chat', desc: 'Intelligent conversations powered by advanced models' },
            { title: 'Content Gen', desc: 'Generate images, text, and more with AI' },
            { title: 'Automation', desc: 'Automate your workflow with smart agents' },
          ].map((feat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
              <p className="text-white/60">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
