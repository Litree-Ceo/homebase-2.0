import { useState, useEffect, useRef } from 'react';

// Dummy track data - replace with actual Spotify/local track fetching
const initialTrack = {
  title: 'Cyber-Phonk',
  artist: 'OVERLORD',
  albumArt: 'https://picsum.photos/seed/overlord/150/150',
  url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/DS-1_main_engine_firing.ogg', // Placeholder audio
};

export default function FloatingMediaPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [track, setTrack] = useState(initialTrack);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
      };

      const setAudioTime = () => setCurrentTime(audio.currentTime);
      const handleTrackEnd = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener('loadedmetadata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('ended', handleTrackEnd);

      if (isPlaying) {
        audio.play().catch(err => console.error('Error playing audio:', err));
      } else {
        audio.pause();
      }

      return () => {
        audio.removeEventListener('loadedmetadata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', handleTrackEnd);
      };
    }
  }, [track, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => setIsExpanded(true)} className="w-16 h-16 bg-gray-800 border-2 border-purple-500/50 rounded-full flex items-center justify-center shadow-lg hover:border-purple-500 transition-all">
          <img src={track.albumArt} alt="Album Art" className="w-12 h-12 rounded-full" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl text-white overflow-hidden">
      <audio ref={audioRef} src={track.url} />
      <div className="p-4">
        <div className="flex items-center gap-4">
          <img src={track.albumArt} alt="Album Art" className="w-16 h-16 rounded-md flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{track.title}</p>
            <p className="text-sm text-gray-400 truncate">{track.artist}</p>
          </div>
          <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white transition-colors">
            &times;
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors">Prev</button>
          <button onClick={togglePlay} className="w-12 h-12 flex items-center justify-center bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors">
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
