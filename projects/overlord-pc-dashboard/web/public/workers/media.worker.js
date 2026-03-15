let audio;
let currentTrack = null;

self.onmessage = function(e) {
  const { command, track } = e.data;

  switch (command) {
    case 'load':
      if (audio) {
        audio.pause();
      }
      currentTrack = track;
      audio = new Audio(track.url);
      audio.addEventListener('loadedmetadata', () => {
        self.postMessage({ type: 'durationChange', duration: audio.duration });
      });
      audio.addEventListener('timeupdate', () => {
        self.postMessage({ type: 'timeUpdate', currentTime: audio.currentTime });
      });
      audio.addEventListener('ended', () => {
        self.postMessage({ type: 'trackEnd' });
      });
      self.postMessage({ type: 'trackLoaded', track: currentTrack });
      break;

    case 'play':
      if (audio) {
        audio.play().catch(err => console.error('Error playing audio:', err));
        self.postMessage({ type: 'playStateChange', isPlaying: true });
      }
      break;

    case 'pause':
      if (audio) {
        audio.pause();
        self.postMessage({ type: 'playStateChange', isPlaying: false });
      }
      break;

    case 'seek':
      if (audio) {
        audio.currentTime = e.data.time;
      }
      break;
    
    case 'setVolume':
      if (audio) {
        audio.volume = e.data.volume;
      }
      break;
  }
};
