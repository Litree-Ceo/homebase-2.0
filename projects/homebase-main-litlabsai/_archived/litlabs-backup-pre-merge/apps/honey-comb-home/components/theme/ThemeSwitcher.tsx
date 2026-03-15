
import React, { useState } from 'react';
import { themes, ThemeId } from '../../config/themes';
import styles from './ThemeSwitcher.module.css';

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<ThemeId>('cyber');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as ThemeId);
    // Optionally: persist to localStorage or context
    document.body.style.background = themes[e.target.value as ThemeId].backgroundColor;
  };

  return (
    <div className={styles.themeSwitcher}>
      <label htmlFor="theme-select">Theme: </label>
      <select id="theme-select" value={theme} onChange={handleChange}>
        {Object.entries(themes).map(([id, t]) => (
          <option key={id} value={id}>{t.name}</option>
        ))}
      </select>
        <span className={`${styles.themePreview} ${styles[theme]}`}>
        {themes[theme].name} Preview
      </span>
    </div>
  );
};

export default ThemeSwitcher;
