// @workspace Revenue-Optimized Hero Component with Ad Integration

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function RevenueHero() {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Load Google AdSense (replace with your publisher ID)
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXX'); // Replace with actual ID
    document.head.appendChild(script);

    script.onload = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (err) {
        console.warn('AdSense load failed:', err);
      }
    };
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400">
            AI-Powered Smart Home
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Your intelligent hub for modern living. Built with Grok, Llama 3.3, and Claude Opus 4.5.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:scale-105 transition-transform">
              Get Started Free
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition">
              View Demo
            </button>
          </div>
        </div>

        {/* Ad Placement - Strategic but Non-Intrusive */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-4 text-center">Sponsored</p>
            <ins
              className="adsbygoogle"
              style={{ display: 'block', textAlign: 'center' }}
              data-ad-layout="in-article"
              data-ad-format="fluid"
              data-ad-slot="XXXXXXXXXX"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon="🤖"
            title="Multi-AI Intelligence"
            description="Grok for speed, Llama for multilingual, Claude for complex tasks"
          />
          <FeatureCard
            icon="⚡"
            title="Auto-Generated Content"
            description="Fresh blog posts and features every 4 hours"
          />
          <FeatureCard
            icon="💰"
            title="Revenue Optimized"
            description="Built-in monetization with ads and affiliate support"
          />
        </div>

        {/* Analytics Tracking */}
        <AnalyticsTracker />
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-400/50 transition-all hover:scale-105">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function AnalyticsTracker() {
  useEffect(() => {
    // Google Analytics 4 (replace with your GA4 ID)
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX'); // Replace with actual GA4 ID

      // Track custom events for revenue optimization
      gtag('event', 'page_view', {
        page_title: 'Revenue Hero',
        page_location: window.location.href,
      });
    }
  }, []);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
    </>
  );
}
