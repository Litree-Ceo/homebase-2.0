'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Mic, MicOff, Volume2 } from 'lucide-react';

type VoiceMode = 'browser' | 'whisper';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  mode?: VoiceMode;
}

export function VoiceInput({
  onTranscript,
  mode = 'browser',
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentMode, setCurrentMode] = useState<VoiceMode>(mode);
  const [supportedModes, setSupportedModes] = useState<VoiceMode[]>([]);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const modes: VoiceMode[] = [];

    // Check browser speech support
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      modes.push('browser');
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        setError(`Browser error: ${event.error}`);
        setIsListening(false);
      };
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcript + ' ');
            onTranscript(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        if (interimTranscript) {
          setTranscript((prev) => prev.split(' ').slice(0, -1).join(' ') + ' ' + interimTranscript);
        }
      };
    }

    // Check Whisper support (requires recording capability)
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      modes.push('whisper');
    }

    setSupportedModes(modes);

    // Set initial mode to first available
    if (modes.length > 0 && !modes.includes(mode)) {
      setCurrentMode(modes[0]);
    }
  }, [mode, onTranscript]);

  const startBrowserRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    setError('');
    setTranscript('');
    recognitionRef.current.start();
  };

  const stopBrowserRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startWhisperRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendToWhisper(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err: any) {
      setError(`Microphone access denied: ${err.message}`);
    }
  };

  const stopWhisperRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendToWhisper = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await response.json();
      setTranscript(data.text);
      onTranscript(data.text);
    } catch (err: any) {
      setError(`Whisper error: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (currentMode === 'browser') {
      if (isListening) {
        stopBrowserRecording();
      } else {
        startBrowserRecording();
      }
    } else {
      if (isListening) {
        stopWhisperRecording();
      } else {
        startWhisperRecording();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Mode Selector */}
      {supportedModes.length > 1 && (
        <div className="flex gap-2">
          {supportedModes.map((m) => (
            <button
              key={m}
              onClick={() => setCurrentMode(m)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                currentMode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={isListening || isTranscribing}
            >
              {m === 'browser' ? 'Browser Speech' : 'Whisper'}
            </button>
          ))}
        </div>
      )}

      {/* Main Voice Input */}
      <div className="border-2 border-gray-300 rounded-lg p-6 space-y-4">
        <button
          onClick={toggleRecording}
          disabled={isTranscribing}
          className={`w-full py-4 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isTranscribing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Transcribing...
            </>
          ) : isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Recording
            </>
          )}
        </button>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-gray-600 mb-1">Transcript:</p>
            <p className="text-lg text-gray-900">{transcript}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Status Indicator */}
        {isListening && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Volume2 className="w-4 h-4 animate-pulse" />
            Listening... ({currentMode === 'browser' ? 'Browser' : 'Whisper'})
          </div>
        )}
      </div>

      {/* Mode Info */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
        <p className="font-semibold mb-1">Current Mode: {currentMode === 'browser' ? 'Browser Speech API' : 'OpenAI Whisper'}</p>
        {currentMode === 'browser' && (
          <p>Works in Chrome/Edge/Safari. Less accurate but no API key needed.</p>
        )}
        {currentMode === 'whisper' && (
          <p>Requires OPENAI_API_KEY in .env.local. More accurate transcription.</p>
        )}
      </div>
    </div>
  );
}
