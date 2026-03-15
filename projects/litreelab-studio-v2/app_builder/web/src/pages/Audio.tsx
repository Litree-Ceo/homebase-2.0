import { useState, useRef } from 'react';
import { Mic, Play, Square, Music, Upload, Volume2 } from 'lucide-react';

export default function AudioPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="audio-page">
      <header className="page-header">
        <h1><Music size={28} /> Audio Studio</h1>
        <p>Record, edit, and manage audio content</p>
      </header>

      <div className="audio-grid">
        {/* Recording Section */}
        <div className="audio-card recorder">
          <h2>Voice Recorder</h2>
          <div className={`recorder-visualizer ${isRecording ? 'recording' : ''}`}>
            <div className="visualizer-bars">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
          
          <div className="recorder-controls">
            {!isRecording ? (
              <button className="record-btn" onClick={startRecording}>
                <Mic size={32} />
                <span>Start Recording</span>
              </button>
            ) : (
              <button className="stop-btn" onClick={stopRecording}>
                <Square size={32} />
                <span>Stop Recording</span>
              </button>
            )}
          </div>

          {audioUrl && (
            <div className="playback-section">
              <h3>Recording Preview</h3>
              <audio controls src={audioUrl} className="audio-player" />
              <div className="playback-actions">
                <a 
                  href={audioUrl} 
                  download={`recording-${Date.now()}.wav`}
                  className="download-link"
                >
                  Download Recording
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Audio Library */}
        <div className="audio-card library">
          <h2>Audio Library</h2>
          <div className="upload-area">
            <Upload size={48} />
            <p>Drag & drop audio files here</p>
            <span>or click to browse</span>
          </div>
          
          <div className="audio-list">
            <div className="audio-item empty">
              <Volume2 size={24} />
              <p>No audio files yet</p>
              <span>Record or upload audio to see it here</span>
            </div>
          </div>
        </div>

        {/* Audio Effects */}
        <div className="audio-card effects">
          <h2>Audio Effects</h2>
          <div className="effects-grid">
            {['Reverb', 'Echo', 'Normalize', 'Compressor', 'EQ', 'Noise Gate'].map(effect => (
              <button key={effect} className="effect-btn" disabled>
                {effect}
              </button>
            ))}
          </div>
          <p className="effects-hint">Effects will be available in a future update</p>
        </div>

        {/* Transcription */}
        <div className="audio-card transcription">
          <h2>Transcription</h2>
          <div className="transcription-area">
            <Play size={48} />
            <p>Convert speech to text</p>
            <span>Upload audio or use a recording to transcribe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
