/**
 * Smart Features Library - AI-powered enhancements for HomeBase 2.0
 * Built for LITLABS 2026
 */

// Smart Analytics Tracker
export class SmartAnalytics {
  private static instance: SmartAnalytics;
  private readonly sessionId: string;
  private readonly events: Array<{ type: string; data: unknown; timestamp: number }> = [];

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): SmartAnalytics {
    if (!SmartAnalytics.instance) {
      SmartAnalytics.instance = new SmartAnalytics();
    }
    return SmartAnalytics.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  track(eventType: string, data?: unknown): void {
    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };
    this.events.push(event);

    // Send to API in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAPI(event);
    }
  }

  private async sendToAPI(event: unknown): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.debug('Analytics not sent:', error);
    }
  }

  getSessionData() {
    return {
      sessionId: this.sessionId,
      events: this.events,
      duration: this.events.length > 0 ? Date.now() - this.events[0].timestamp : 0,
    };
  }
}

// Smart Performance Monitor
export class PerformanceMonitor {
  private readonly metrics: Map<string, number[]> = new Map();

  mark(label: string): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(globalThis.performance.now());
  }

  measure(startLabel: string, endLabel: string): number {
    const starts = this.metrics.get(startLabel);
    const ends = this.metrics.get(endLabel);

    if (!starts || !ends || starts.length === 0 || ends.length === 0) {
      return 0;
    }

    return ends.at(-1)! - starts.at(-1)!;
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Smart Content Preloader
export class ContentPreloader {
  private readonly preloadedUrls = new Set<string>();

  async preloadImage(url: string): Promise<void> {
    if (this.preloadedUrls.has(url)) return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedUrls.add(url);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async preloadMultiple(urls: string[]): Promise<void> {
    await Promise.all(urls.map(url => this.preloadImage(url)));
  }

  isPreloaded(url: string): boolean {
    return this.preloadedUrls.has(url);
  }
}

// Smart User Preferences
export class SmartPreferences {
  private readonly storageKey = 'homebase-prefs';

  get<T>(key: string, defaultValue: T): T {
    if (globalThis.localStorage === undefined) return defaultValue;

    try {
      const stored = localStorage.getItem(`${this.storageKey}:${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    if (globalThis.localStorage === undefined) return;

    try {
      localStorage.setItem(`${this.storageKey}:${key}`, JSON.stringify(value));
    } catch (error) {
      console.debug('Failed to save preference:', error);
    }
  }

  remove(key: string): void {
    if (globalThis.localStorage === undefined) return;
    localStorage.removeItem(`${this.storageKey}:${key}`);
  }

  clear(): void {
    if (globalThis.localStorage === undefined) return;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.storageKey)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Smart Animation Controller
export class AnimationController {
  private observers: IntersectionObserver[] = [];

  observeElement(
    element: HTMLElement,
    callback: (isVisible: boolean) => void,
    options?: IntersectionObserverInit,
  ): void {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => callback(entry.isIntersecting));
      },
      { threshold: 0.1, ...options },
    );

    observer.observe(element);
    this.observers.push(observer);
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Smart API Client with auto-retry
export class SmartAPIClient {
  private readonly baseURL: string;
  private readonly retryCount = 3;
  private readonly retryDelay = 1000;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    for (let i = 0; i < this.retryCount; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (i === this.retryCount - 1) throw error;
        await this.delay(this.retryDelay * (i + 1));
      }
    }

    throw new Error('Request failed after retries');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instances
export const analytics = SmartAnalytics.getInstance();
export const performance = new PerformanceMonitor();
export const preloader = new ContentPreloader();
export const preferences = new SmartPreferences();
export const animations = new AnimationController();
export const api = new SmartAPIClient();
