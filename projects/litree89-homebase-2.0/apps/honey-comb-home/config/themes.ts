// Honeycomb Vision Theme Presets for LitreeLabs
// Extend or modify as needed for new themes or color tokens

export type ThemeId = 'cyber' | 'midnight' | 'sunrise' | 'arctic' | 'ocean' | 'forest';

export interface ThemePreset {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  borderColor: string;
  textColor: string;
  cardColor: string;
  glowColor: string;
  // Add more tokens as needed
}

export const themes: Record<ThemeId, ThemePreset> = {
  cyber: {
    name: 'Cyber',
    primaryColor: '#ff00cc',
    secondaryColor: '#00fff7',
    backgroundColor: '#0a0a23',
    accentColor: '#ff00cc',
    borderColor: '#22223b',
    textColor: '#f8f8ff',
    cardColor: '#18182f',
    glowColor: '#ff00cc',
  },
  midnight: {
    name: 'Midnight',
    primaryColor: '#1a237e',
    secondaryColor: '#00bcd4',
    backgroundColor: '#121212',
    accentColor: '#00bcd4',
    borderColor: '#23234a',
    textColor: '#e3e3e3',
    cardColor: '#181828',
    glowColor: '#00bcd4',
  },
  sunrise: {
    name: 'Sunrise',
    primaryColor: '#ff9800',
    secondaryColor: '#ffd600',
    backgroundColor: '#fff8e1',
    accentColor: '#ff9800',
    borderColor: '#ffe0b2',
    textColor: '#3e2723',
    cardColor: '#fff3e0',
    glowColor: '#ffd600',
  },
  arctic: {
    name: 'Arctic',
    primaryColor: '#00bcd4',
    secondaryColor: '#b2ebf2',
    backgroundColor: '#e0f7fa',
    accentColor: '#00bcd4',
    borderColor: '#b2ebf2',
    textColor: '#004d40',
    cardColor: '#b2ebf2',
    glowColor: '#00bcd4',
  },
  ocean: {
    name: 'Ocean',
    primaryColor: '#01579b',
    secondaryColor: '#00b8d4',
    backgroundColor: '#e1f5fe',
    accentColor: '#00b8d4',
    borderColor: '#0288d1',
    textColor: '#013243',
    cardColor: '#b3e5fc',
    glowColor: '#00b8d4',
  },
  forest: {
    name: 'Forest',
    primaryColor: '#388e3c',
    secondaryColor: '#a5d6a7',
    backgroundColor: '#e8f5e9',
    accentColor: '#43a047',
    borderColor: '#a5d6a7',
    textColor: '#1b5e20',
    cardColor: '#c8e6c9',
    glowColor: '#43a047',
  },
};
