'use client';

import { useState, useEffect } from 'react';
import { themes, ThemeId } from '@/config/themes';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('cyber');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeId | null;
    if (saved && themes[saved]) {
      setCurrentTheme(saved);
    }
  }, []);

  const handleThemeChange = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('theme', themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
      >
        Theme: {themes[currentTheme].name}
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 rounded-lg bg-black/90 border border-white/10 shadow-xl overflow-hidden z-50">
          {Object.values(themes).map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 ${
                currentTheme === theme.id ? 'bg-white/10' : ''
              }`}
            >
              <span
                className="w-4 h-4 rounded-full"
                style={{ background: theme.primaryColor }}
              />
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
