'use client';

import { useEffect, useState } from 'react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 flex items-center justify-center hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/70 transition-all z-40 text-slate-950 font-bold text-xl animate-slide-in"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
