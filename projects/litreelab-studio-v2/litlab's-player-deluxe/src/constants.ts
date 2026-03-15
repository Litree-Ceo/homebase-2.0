import { Track } from './types';

export const DEFAULT_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverUrl: 'https://picsum.photos/seed/m83/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 372,
  },
  {
    id: '2',
    title: 'Starlight',
    artist: 'Muse',
    album: 'Black Holes and Revelations',
    coverUrl: 'https://picsum.photos/seed/muse/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 425,
  },
  {
    id: '3',
    title: 'Instant Crush',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    coverUrl: 'https://picsum.photos/seed/daft/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 312,
  },
  {
    id: '4',
    title: 'The Less I Know The Better',
    artist: 'Tame Impala',
    album: 'Currents',
    coverUrl: 'https://picsum.photos/seed/tame/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 217,
  },
];

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
