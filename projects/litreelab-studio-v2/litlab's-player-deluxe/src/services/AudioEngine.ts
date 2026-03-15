import { EQ_FREQUENCIES } from '../constants';

export class AudioEngine {
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private audio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
  }

  private initContext() {
    if (this.context) return;
    
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.source = this.context.createMediaElementSource(this.audio);
    this.gainNode = this.context.createGain();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;

    // Create EQ filters
    this.filters = EQ_FREQUENCIES.map(freq => {
      const filter = this.context!.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      return filter;
    });

    // Chain: Source -> Filters -> Analyser -> Gain -> Destination
    let lastNode: AudioNode = this.source;
    this.filters.forEach(filter => {
      lastNode.connect(filter);
      lastNode = filter;
    });
    lastNode.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
  }

  getAnalyser() {
    this.initContext();
    return this.analyser;
  }

  load(url: string) {
    this.initContext();
    this.audio.src = url;
    this.audio.load();
  }

  play() {
    if (this.context?.state === 'suspended') {
      this.context.resume();
    }
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  seek(time: number) {
    this.audio.currentTime = time;
  }

  setVolume(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  setBandGain(index: number, gain: number) {
    if (this.filters[index]) {
      this.filters[index].gain.value = gain;
    }
  }

  getAudioElement() {
    return this.audio;
  }
}

export const audioEngine = new AudioEngine();
