import React, { useEffect, useState } from 'react';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { themes, ThemeId } from '@/config/themes';
import styles from './index.module.css';

const honeycombCells = [
  'Worlds',
  'Widgets',
  'Marketplace',
  'AI Chat',
  'Payments',
  'Team',
  'Presence',
  'Glow Lab',
  'Settings',
];

const bots = [
  { name: 'Copilot', status: '🟢 Online' },
  { name: 'MoneyBot', status: '🟢 Ready' },
  { name: 'SocialBot', status: '🟢 Active' },
];

export default function Home() {
  const [theme, setTheme] = useState<ThemeId>('cyber');
  const [aiStatus, setAiStatus] = useState('🟢 Online');

  useEffect(() => {
    // Persist theme
    const saved = localStorage.getItem('theme') as ThemeId | null;
    if (saved && themes[saved]) setTheme(saved);
  }, []);

  useEffect(() => {
    document.body.style.background = themes[theme].backgroundColor;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Set CSS variables for theme colors
  const themeVars = {
    '--theme-text-color': themes[theme].textColor,
    '--theme-bg-color': themes[theme].backgroundColor,
    '--theme-primary-color': themes[theme].primaryColor,
    '--theme-secondary-color': themes[theme].secondaryColor,
  } as React.CSSProperties;

  return (
    <div className={styles.root} style={themeVars}>
      <header className={styles.header}>
        <h1 className={styles.title}>{'LitreeLabs MetaVerse'}</h1>
        <p className={styles.subtitle}>
          {'For the People. Social, Smart, and Dope Vibes. Income for All.'}
        </p>
        <ThemeSwitcher />
      </header>
      <main>
        <div className={styles.honeycomb}>
          {honeycombCells.map((cell) => (
            <div
              key={cell}
              className={styles.cell}
              style={{
                background: `linear-gradient(135deg, var(--theme-primary-color) 60%, var(--theme-secondary-color) 100%)`,
                clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
              }}
            >
              {cell}
            </div>
          ))}
          <div className={styles.commandCenter}>
            <h3>🛰️ Command Center</h3>
            <p>
              Status: <span className={styles.status}>{aiStatus}</span>
            </p>
            <button onClick={() => setAiStatus('🟢 AI Module Docked!')} className={styles.button}>
              Dock AI Module
            </button>
            <button onClick={() => setAiStatus('🟢 Copilot Launched!')} className={styles.button}>
              Launch Copilot
            </button>
            <div className={styles.bots}>
              <strong>Bots:</strong>
              <ul className={styles.botList}>
                {bots.map((bot) => (
                  <li key={bot.name}>
                    {bot.name}: {bot.status}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} LitreeLabs. Built for the People. Income, Community, and
        MetaVerse Vibes.
      </footer>
    </div>
  );
}
