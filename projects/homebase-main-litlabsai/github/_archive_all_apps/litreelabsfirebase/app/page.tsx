"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* COSMIC BACKGROUND */}
      <div className="cosmic-bg" />
      <div className="grid-overlay" />
      
      {/* FLOATING ORBS */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      
      {/* PARTICLES */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* CURSOR GLOW */}
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0 transition-transform duration-300"
        style={{
          left: mousePos.x - 192,
          top: mousePos.y - 192,
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="container-wide relative z-10">
        {/* ============================================
            NAVIGATION
            ============================================ */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
          <div className="container-wide flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg font-bold animate-pulse-glow">
                LL
              </div>
              <div>
                <span className="text-xl font-bold gradient-text">LitLabs</span>
                <span className="text-xs block text-gray-400">AI Command Center</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-300 hover:text-white hover:text-glow transition-all">Features</a>
              <a href="#pricing" className="text-sm text-gray-300 hover:text-white hover:text-glow transition-all">Pricing</a>
              <a href="#testimonials" className="text-sm text-gray-300 hover:text-white hover:text-glow transition-all">Success</a>
              <Link href="/marketplace" className="text-sm text-gray-300 hover:text-white hover:text-glow transition-all">Marketplace</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth" className="btn-outline text-sm py-2 px-6">
                Login
              </Link>
              <Link href="/dashboard" className="btn-gradient text-sm py-2 px-6">
                Launch App 🚀
              </Link>
            </div>
          </div>
        </nav>

        {/* ============================================
            HERO SECTION
            ============================================ */}
        <section className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center max-w-5xl mx-auto px-4">
            {/* Badge */}
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
              <span className="hero-badge animate-float">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live Now — Join 12,000+ Creators
              </span>
            </div>

            {/* Main Headline */}
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl font-black mt-8 leading-tight animate-slide-up opacity-0"
              style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
              <span className="text-white">Your AI</span>
              <br />
              <span className="gradient-text-animated">Money Machine</span>
            </h1>

            {/* Subheadline */}
            <p 
              className="text-xl md:text-2xl text-gray-400 mt-8 max-w-3xl mx-auto leading-relaxed animate-slide-up opacity-0"
              style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
            >
              LitLabs OS handles your <span className="text-cyan-400 text-glow-cyan">content</span>, 
              closes your <span className="text-purple-400 text-glow">DMs</span>, 
              catches <span className="text-red-400">fraud</span>, 
              and stacks your <span className="text-green-400 text-glow-green">bread</span> — 
              all while you live your life.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-wrap justify-center gap-6 mt-12 animate-slide-up opacity-0"
              style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
            >
              <Link href="/dashboard" className="btn-gradient text-lg px-10 py-4 flex items-center gap-3">
                Start Making Money
                <span className="text-2xl">→</span>
              </Link>
              <Link href="#demo" className="btn-neon text-lg px-10 py-4 flex items-center gap-3">
                Watch Demo
                <span className="text-2xl">▶</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div 
              className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-gray-500 animate-slide-up opacity-0"
              style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
            >
              <span className="flex items-center gap-2">✅ No credit card required</span>
              <span className="flex items-center gap-2">✅ 14-day free trial</span>
              <span className="flex items-center gap-2">✅ Cancel anytime</span>
            </div>

            {/* Floating Preview Card */}
            <div 
              className="mt-20 animate-slide-up opacity-0"
              style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
            >
              <div className="glass-card rounded-3xl p-2 max-w-4xl mx-auto animate-float">
                <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden">
                  {/* Browser Bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-gray-400">app.litlabs.io/dashboard</span>
                    </div>
                  </div>
                  
                  {/* Dashboard Preview */}
                  <div className="p-6 grid grid-cols-3 gap-4">
                    <div className="glass rounded-xl p-4 space-y-2">
                      <span className="text-xs text-gray-400">Revenue Today</span>
                      <p className="text-3xl font-bold text-green-400">$2,847</p>
                      <span className="text-xs text-green-400">↑ 23% from yesterday</span>
                    </div>
                    <div className="glass rounded-xl p-4 space-y-2">
                      <span className="text-xs text-gray-400">New Leads</span>
                      <p className="text-3xl font-bold text-cyan-400">147</p>
                      <span className="text-xs text-cyan-400">↑ 12 in last hour</span>
                    </div>
                    <div className="glass rounded-xl p-4 space-y-2">
                      <span className="text-xs text-gray-400">AI Actions</span>
                      <p className="text-3xl font-bold text-purple-400">89</p>
                      <span className="text-xs text-purple-400">Running on autopilot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            STATS BAR
            ============================================ */}
        <section className="py-20">
          <div className="glass-card rounded-3xl p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2 animate-scale-in opacity-0" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
                <p className="stat-number">12K+</p>
                <p className="text-gray-400">Active Creators</p>
              </div>
              <div className="space-y-2 animate-scale-in opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
                <p className="stat-number">$4.2M</p>
                <p className="text-gray-400">Revenue Generated</p>
              </div>
              <div className="space-y-2 animate-scale-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
                <p className="stat-number">2.1M</p>
                <p className="text-gray-400">AI Actions/Day</p>
              </div>
              <div className="space-y-2 animate-scale-in opacity-0" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
                <p className="stat-number">4.9★</p>
                <p className="text-gray-400">User Rating</p>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ============================================
            FEATURES SECTION
            ============================================ */}
        <section id="features" className="section-padding">
          <div className="text-center mb-20">
            <span className="hero-badge mb-4">🔥 Superpowers</span>
            <h2 className="text-4xl md:text-6xl font-bold mt-4">
              <span className="text-white">Everything You Need to</span>
              <br />
              <span className="gradient-text">Dominate Your Niche</span>
            </h2>
            <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
              6 AI-powered tools working 24/7 so you can focus on what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎨"
              title="Content Engine"
              description="Generate viral posts, captions, and hashtags in seconds. Stay visible without the burnout."
              color="purple"
            />
            <FeatureCard
              icon="💬"
              title="DM Closer"
              description="Turn 'how much?' into booked appointments with AI-powered sales scripts that sound like you."
              color="cyan"
            />
            <FeatureCard
              icon="🎯"
              title="Promo Builder"
              description="Flash sales, bundle deals, and limited offers generated for slow days. Never scramble again."
              color="green"
            />
            <FeatureCard
              icon="🛡️"
              title="Fraud Guard"
              description="Real-time login monitoring, payment verification, and scam detection. Sleep peacefully."
              color="red"
            />
            <FeatureCard
              icon="🎤"
              title="Brand Voice"
              description="Train the AI to match your tone, slang, and personality. It's like having a clone."
              color="pink"
            />
            <FeatureCard
              icon="📊"
              title="Live Dashboard"
              description="All your metrics in one place — leads, bookings, revenue, security alerts. No more chaos."
              color="orange"
            />
          </div>
        </section>

        <div className="section-divider" />

        {/* ============================================
            HOW IT WORKS
            ============================================ */}
        <section id="demo" className="section-padding">
          <div className="text-center mb-20">
            <span className="hero-badge mb-4">⚡ Simple Setup</span>
            <h2 className="text-4xl md:text-6xl font-bold mt-4">
              <span className="text-white">Running in</span>
              <br />
              <span className="gradient-text">Under 5 Minutes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step="01"
              title="Tell Us Your World"
              description="Your niche, services, prices, and dream clients. LitLabs builds your AI brain from scratch."
            />
            <StepCard
              step="02"
              title="Connect Your Channels"
              description="Hook up IG, TikTok, your booking system. One script, and the AI starts working."
            />
            <StepCard
              step="03"
              title="Watch Money Stack"
              description="Check your dashboard, see leads converting, and adjust when you feel like it."
            />
          </div>
        </section>

        <div className="section-divider" />

        {/* ============================================
            PRICING SECTION
            ============================================ */}
        <section id="pricing" className="section-padding">
          <div className="text-center mb-20">
            <span className="hero-badge mb-4">💎 Pricing</span>
            <h2 className="text-4xl md:text-6xl font-bold mt-4">
              <span className="text-white">Choose Your</span>
              <br />
              <span className="gradient-text">Money Level</span>
            </h2>
            <p className="text-xl text-gray-400 mt-6">
              Start free. Upgrade when LitLabs is obviously paying for itself.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="$49"
              description="Perfect for getting started"
              features={[
                "Daily content engine",
                "DM reply scripts",
                "Basic promo generator",
                "Email support",
                "1 connected account",
              ]}
              highlighted={false}
            />
            <PricingCard
              name="Pro"
              price="$99"
              description="Most popular choice"
              features={[
                "Everything in Starter",
                "7-day content packs",
                "Brand voice training",
                "Fraud detection",
                "Priority support",
                "5 connected accounts",
              ]}
              highlighted={true}
            />
            <PricingCard
              name="Deluxe"
              price="$199"
              description="For serious bosses"
              features={[
                "Everything in Pro",
                "Holiday templates",
                "1-on-1 coaching",
                "Custom integrations",
                "24/7 VIP support",
                "Unlimited accounts",
              ]}
              highlighted={false}
            />
          </div>

          <p className="text-center text-gray-500 mt-12">
            ✨ All plans include 14-day free trial • No contracts • Cancel anytime
          </p>
        </section>

        <div className="section-divider" />

        {/* ============================================
            TESTIMONIALS
            ============================================ */}
        <section id="testimonials" className="section-padding">
          <div className="text-center mb-20">
            <span className="hero-badge mb-4">🏆 Success Stories</span>
            <h2 className="text-4xl md:text-6xl font-bold mt-4">
              <span className="text-white">Real People,</span>
              <br />
              <span className="gradient-text">Real Results</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Chen"
              role="Nail Tech, LA"
              avatar="👑"
              quote="Went from 2 clients/day to fully booked in 3 weeks. The DM bot handles everything while I focus on my art."
              revenue="+$4,200/mo"
              color="purple"
            />
            <TestimonialCard
              name="Marcus Johnson"
              role="Barber, Atlanta"
              avatar="💈"
              quote="The content engine saved me 10 hours/week. Now I just post and stack bread. Game changer."
              revenue="+$6,890/mo"
              color="cyan"
            />
            <TestimonialCard
              name="Priya Patel"
              role="Lash Artist, Miami"
              avatar="✨"
              quote="My station page brings in referrals on autopilot. I'm making money in my sleep now."
              revenue="+$8,350/mo"
              color="green"
            />
          </div>
        </section>

        <div className="section-divider" />

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="section-padding">
          <div className="glass-card rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold">
                <span className="text-white">Ready to</span>
                <br />
                <span className="gradient-text-animated">Stack Bread?</span>
              </h2>
              <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
                Join 12,000+ creators already making money on autopilot with LitLabs OS.
              </p>
              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <Link href="/dashboard" className="btn-gradient text-xl px-12 py-5">
                  Start Free Trial →
                </Link>
                <Link href="/earn" className="btn-neon text-xl px-12 py-5">
                  Start Earning
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            FOOTER
            ============================================ */}
        <footer className="py-16 border-t border-white/10">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                  LL
                </div>
                <span className="text-lg font-bold">LitLabs OS</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered money machine for beauty pros and service bosses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/earn" className="hover:text-white transition-colors">Earn</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} LitLabs OS. All rights reserved.</span>
            <span>Made with 💜 for creators everywhere</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

// ============================================
// COMPONENTS
// ============================================

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/60 hover:shadow-purple-500/20",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-cyan-500/20",
    green: "from-green-500/20 to-green-500/5 border-green-500/30 hover:border-green-500/60 hover:shadow-green-500/20",
    red: "from-red-500/20 to-red-500/5 border-red-500/30 hover:border-red-500/60 hover:shadow-red-500/20",
    pink: "from-pink-500/20 to-pink-500/5 border-pink-500/30 hover:border-pink-500/60 hover:shadow-pink-500/20",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 hover:border-orange-500/60 hover:shadow-orange-500/20",
  };

  return (
    <div className={`glass-card rounded-2xl p-8 bg-gradient-to-br ${colorClasses[color]} transition-all duration-500 cursor-pointer group`}>
      <div className="feature-icon mb-6 group-hover:scale-110 transition-transform">
        <span>{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:gradient-text transition-all">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-8 relative group">
      <span className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-black group-hover:scale-110 transition-transform">
        {step}
      </span>
      <div className="pt-8">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-8 relative transition-all duration-500 ${
        highlighted
          ? "glass-card border-2 border-purple-500 scale-105 shadow-2xl shadow-purple-500/30"
          : "glass-card hover:scale-105"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full">
          MOST POPULAR
        </span>
      )}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-4xl font-black gradient-text">{price}<span className="text-lg text-gray-400">/mo</span></p>
        <p className="text-sm text-gray-400 mt-2">{description}</p>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/dashboard"
        className={`block text-center py-4 rounded-xl font-semibold transition-all ${
          highlighted
            ? "btn-gradient"
            : "btn-outline"
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  avatar,
  quote,
  revenue,
  color,
}: {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  revenue: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: "border-purple-500/30 hover:border-purple-500/60",
    cyan: "border-cyan-500/30 hover:border-cyan-500/60",
    green: "border-green-500/30 hover:border-green-500/60",
  };
  
  const revenueColors: Record<string, string> = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    green: "text-green-400",
  };

  return (
    <div className={`glass-card rounded-2xl p-8 ${colorClasses[color]} transition-all duration-500`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl">
          {avatar}
        </div>
        <div>
          <h4 className="font-bold">{name}</h4>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>
      <p className="text-gray-300 leading-relaxed mb-6">"{quote}"</p>
      <p className={`text-xl font-bold ${revenueColors[color]}`}>{revenue}</p>
    </div>
  );
}
