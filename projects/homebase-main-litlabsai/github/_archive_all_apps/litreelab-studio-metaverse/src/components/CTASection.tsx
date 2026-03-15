'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-r from-lab-purple-900/30 to-lab-green-900/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-brand-primary/20 rounded-full blur-[100px] -z-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center relative"
      >
        <div className="glass-card p-12 border border-lab-purple-500/30">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                          bg-lab-purple-500/20 border border-lab-purple-500/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-lab-purple-400" />
            <span className="text-sm text-lab-purple-400 font-semibold">Join 12,000+ creators</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Your <span className="text-gradient">Empire</span>?
          </h2>

          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Start creating, trading, and existing in the metaverse today. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/hub"
              className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Explore Metaverse
            </Link>
          </div>

          <p className="mt-6 text-white/40 text-sm">
            Free forever. Upgrade when you&apos;re ready.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
