/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  ListMusic, 
  SlidersHorizontal, 
  Maximize2,
  Music,
  Disc,
  Settings,
  Search,
  Sparkles,
  FolderTree,
  Mic
} from 'lucide-react';
import { Track, PlaybackStatus } from './types';
import { DEFAULT_TRACKS, EQ_FREQUENCIES } from './constants';
import { audioEngine } from './services/AudioEngine';
import { Visualizer } from './components/Visualizer';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [currentTrack, setCurrentTrack] = useState<Track>(DEFAULT_TRACKS[0]);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('stopped');
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [activeView, setActiveView] = useState<'now-playing' | 'library' | 'equalizer' | 'ai-folders'>('now-playing');
  const [eqGains, setEqGains] = useState<number[]>(new Array(10).fill(0));
  const [smartFolders, setSmartFolders] = useState<{ name: string; tracks: string[] }[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const audioRef = useRef<HTMLAudioElement>(audioEngine.getAudioElement());

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => handleNext();
    const handlePlay = () => setPlaybackStatus('playing');
    const handlePause = () => setPlaybackStatus('paused');

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    audioEngine.load(currentTrack.audioUrl);
    if (playbackStatus === 'playing') {
      audioEngine.play();
    }
  }, [currentTrack]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  const handleTogglePlay = () => {
    if (playbackStatus === 'playing') {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleNext = () => {
    const currentIndex = DEFAULT_TRACKS.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % DEFAULT_TRACKS.length;
    setCurrentTrack(DEFAULT_TRACKS[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = DEFAULT_TRACKS.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + DEFAULT_TRACKS.length) % DEFAULT_TRACKS.length;
    setCurrentTrack(DEFAULT_TRACKS[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audioEngine.seek(time);
    setCurrentTime(time);
  };

  const handleEqChange = (index: number, value: number) => {
    const newGains = [...eqGains];
    newGains[index] = value;
    setEqGains(newGains);
    audioEngine.setBandGain(index, value);
  };

  const handleAIOrganize = async () => {
    setIsOrganizing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Organize these tracks into 3-4 logical "Smart Folders" based on genre, mood, or style. 
        Return ONLY a JSON array of objects with "name" and "tracks" (array of track IDs).
        Tracks: ${JSON.stringify(DEFAULT_TRACKS.map(t => ({ id: t.id, title: t.title, artist: t.artist, album: t.album })))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                tracks: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "tracks"]
            }
          }
        }
      });
      
      const data = JSON.parse(response.text);
      setSmartFolders(data);
      setActiveView('ai-folders');
    } catch (error) {
      console.error("AI Organization failed:", error);
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleVoiceCommand = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript;
      setVoiceCommand(command);
      
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `The user said: "${command}". 
          Your task is to control a music player. 
          Available tracks: ${JSON.stringify(DEFAULT_TRACKS.map(t => ({ id: t.id, title: t.title, artist: t.artist })))}
          Return a JSON object with:
          - "action": "play", "pause", "next", "prev", "set_volume", or "none"
          - "trackId": (optional) the ID of the track to play
          - "volume": (optional) number between 0 and 1
          - "message": a short confirmation message to show the user.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING },
                trackId: { type: Type.STRING },
                volume: { type: Type.NUMBER },
                message: { type: Type.STRING }
              }
            }
          }
        });

        const result = JSON.parse(response.text);
        setAiResponse(result.message);

        if (result.action === 'play') {
          if (result.trackId) {
            const track = DEFAULT_TRACKS.find(t => t.id === result.trackId);
            if (track) setCurrentTrack(track);
          }
          audioEngine.play();
        } else if (result.action === 'pause') {
          audioEngine.pause();
        } else if (result.action === 'next') {
          handleNext();
        } else if (result.action === 'prev') {
          handlePrev();
        } else if (result.action === 'set_volume' && result.volume !== undefined) {
          setVolume(result.volume);
        }

        setTimeout(() => setAiResponse(""), 3000);
      } catch (error) {
        console.error("Voice AI failed:", error);
      } finally {
        setIsListening(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 md:p-8 bg-hw-bg">
      <div className="hw-panel w-full max-w-5xl h-full max-h-[800px] flex flex-col overflow-hidden relative">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-hw-accent flex items-center justify-center is-active-glow">
              <Disc className="text-white w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif italic text-lg leading-tight">LitLab'S</span>
              <span className="hw-label text-[8px]">Player Deluxe</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/5">
            <NavButton 
              active={activeView === 'library'} 
              onClick={() => setActiveView('library')}
              icon={<ListMusic size={16} />}
              label="Library"
            />
            <NavButton 
              active={activeView === 'now-playing'} 
              onClick={() => setActiveView('now-playing')}
              icon={<Music size={16} />}
              label="Player"
            />
            <NavButton 
              active={activeView === 'ai-folders'} 
              onClick={() => setActiveView('ai-folders')}
              icon={<FolderTree size={16} />}
              label="Smart"
            />
            <NavButton 
              active={activeView === 'equalizer'} 
              onClick={() => setActiveView('equalizer')}
              icon={<SlidersHorizontal size={16} />}
              label="EQ"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleAIOrganize}
              className={`text-hw-text-secondary hover:text-hw-accent transition-colors ${isOrganizing ? 'animate-pulse' : ''}`}
              title="AI Organize"
            >
              <Sparkles size={20} />
            </button>
            <button 
              onClick={handleVoiceCommand}
              className={`text-hw-text-secondary hover:text-hw-accent transition-colors relative ${isListening ? 'text-hw-accent' : ''}`}
              title="Voice Assistant"
            >
              <Mic size={20} />
              {isListening && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-hw-accent rounded-full animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* AI Notification Overlay */}
        <AnimatePresence>
          {(isListening || aiResponse) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-hw-accent text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-mono text-xs"
            >
              <Sparkles size={16} className="animate-pulse" />
              {isListening ? "Listening for command..." : aiResponse}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeView === 'now-playing' && (
              <motion.div 
                key="now-playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col md:flex-row p-8 gap-12 items-center justify-center"
              >
                {/* Album Art Section */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-hw-accent/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <motion.div 
                    layoutId="album-art"
                    className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 relative z-10"
                  >
                    <img 
                      src={currentTrack.coverUrl} 
                      alt={currentTrack.album}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 hw-knob-track flex items-center justify-center bg-hw-card z-20">
                    <div className="hw-label text-[8px]">Hi-Res</div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md w-full">
                  <div className="hw-label mb-2">Now Playing</div>
                  <h1 className="text-4xl font-bold mb-2 tracking-tight line-clamp-1">{currentTrack.title}</h1>
                  <p className="text-xl text-hw-text-secondary font-serif italic mb-6">{currentTrack.artist} — {currentTrack.album}</p>
                  
                  <div className="w-full mb-8">
                    <Visualizer />
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex justify-between hw-value">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(currentTrack.duration)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max={currentTrack.duration} 
                      value={currentTime} 
                      onChange={handleSeek}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-hw-accent"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'library' && (
              <motion.div 
                key="library"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-8 overflow-y-auto"
              >
                <div className="hw-label mb-6">Your Collection</div>
                <div className="grid gap-2">
                  {DEFAULT_TRACKS.map((track) => (
                    <button 
                      key={track.id}
                      onClick={() => {
                        setCurrentTrack(track);
                        setActiveView('now-playing');
                      }}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all group ${
                        currentTrack.id === track.id ? 'bg-hw-accent/10 border border-hw-accent/20' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={track.coverUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${currentTrack.id === track.id ? 'text-hw-accent' : 'text-white'}`}>{track.title}</div>
                        <div className="text-xs text-hw-text-secondary">{track.artist}</div>
                      </div>
                      <div className="hw-value text-hw-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(track.duration)}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'ai-folders' && (
              <motion.div 
                key="ai-folders"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full p-8 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <div className="hw-label mb-2">AI Smart Folders</div>
                    <h2 className="text-2xl font-bold">Intelligent Organization</h2>
                  </div>
                  <button 
                    onClick={handleAIOrganize}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hw-accent text-white text-xs font-mono is-active-glow"
                  >
                    <Sparkles size={14} /> RE-SCAN
                  </button>
                </div>

                {smartFolders.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-hw-text-secondary border-2 border-dashed border-white/5 rounded-2xl">
                    <Sparkles size={48} className="mb-4 opacity-20" />
                    <p>Click "Re-Scan" to let AI organize your library</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {smartFolders.map((folder) => (
                      <div key={folder.name} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                          <FolderTree className="text-hw-accent" size={20} />
                          <h3 className="font-bold text-lg">{folder.name}</h3>
                        </div>
                        <div className="space-y-2">
                          {folder.tracks.map(trackId => {
                            const track = DEFAULT_TRACKS.find(t => t.id === trackId);
                            return track ? (
                              <button 
                                key={trackId}
                                onClick={() => {
                                  setCurrentTrack(track);
                                  setActiveView('now-playing');
                                }}
                                className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-sm text-hw-text-secondary hover:text-white transition-colors flex items-center gap-2"
                              >
                                <div className="w-1 h-1 rounded-full bg-hw-accent" />
                                {track.title}
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeView === 'equalizer' && (
              <motion.div 
                key="equalizer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full p-8 flex flex-col"
              >
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <div className="hw-label mb-2">Graphic Equalizer</div>
                    <h2 className="text-2xl font-bold">10-Band Precision</h2>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono hover:bg-white/10 transition-colors">RESET</button>
                    <button className="px-4 py-2 rounded-lg bg-hw-accent text-white text-xs font-mono is-active-glow">FLAT</button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-between gap-2">
                  {EQ_FREQUENCIES.map((freq, i) => (
                    <div key={freq} className="flex-1 flex flex-col items-center gap-4 h-full">
                      <div className="flex-1 w-full bg-white/5 rounded-full relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-hw-accent/20 border-t border-hw-accent"
                          style={{ height: `${((eqGains[i] + 12) / 24) * 100}%` }}
                        />
                        <input 
                          type="range"
                          min="-12"
                          max="12"
                          step="0.5"
                          value={eqGains[i]}
                          onChange={(e) => handleEqChange(i, parseFloat(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                          style={{ writingMode: 'bt-lr' } as any}
                        />
                      </div>
                      <div className="hw-label text-[8px] rotate-45 mt-4">
                        {freq < 1000 ? `${freq}Hz` : `${freq/1000}kHz`}
                      </div>
                      <div className="hw-value text-[9px] text-hw-accent">{eqGains[i] > 0 ? '+' : ''}{eqGains[i]}dB</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-6 bg-black/40 border-t border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-8">
            {/* Mini Info */}
            <div className="hidden md:flex items-center gap-4 w-1/4">
              <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center overflow-hidden">
                <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{currentTrack.title}</div>
                <div className="text-[10px] text-hw-text-secondary truncate uppercase tracking-wider">{currentTrack.artist}</div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex-1 flex items-center justify-center gap-6">
              <button 
                onClick={handlePrev}
                className="text-hw-text-secondary hover:text-white transition-colors p-2"
              >
                <SkipBack size={24} />
              </button>
              
              <button 
                onClick={handleTogglePlay}
                className="w-16 h-16 rounded-full bg-white text-hw-card flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {playbackStatus === 'playing' ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>

              <button 
                onClick={handleNext}
                className="text-hw-text-secondary hover:text-white transition-colors p-2"
              >
                <SkipForward size={24} />
              </button>
            </div>

            {/* Volume & Extras */}
            <div className="flex items-center justify-end gap-6 w-1/4">
              <div className="flex items-center gap-3 group">
                <Volume2 size={18} className="text-hw-text-secondary group-hover:text-white transition-colors" />
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
              <button className="text-hw-text-secondary hover:text-white transition-colors">
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono transition-all ${
        active 
          ? 'bg-white text-hw-card shadow-lg' 
          : 'text-hw-text-secondary hover:text-white'
      }`}
    >
      {icon}
      <span className={active ? 'inline' : 'hidden md:inline'}>{label}</span>
    </button>
  );
}
