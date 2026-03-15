export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
}

export interface EqualizerSettings {
  bands: number[]; // Gain values for each band (-12 to 12)
  enabled: boolean;
}

export type PlaybackStatus = 'playing' | 'paused' | 'stopped';
