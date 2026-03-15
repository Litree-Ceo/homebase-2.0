/**
 * Smart React Hooks for HomeBase 2.0
 * Enhanced UX with intelligent features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { analytics, preferences, performance, preloader } from '@/lib/smartFeatures';

// Smart visibility hook with analytics
export function useSmartVisibility(elementRef: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);

        if (entry.isIntersecting && !hasTracked.current) {
          analytics.track('element_visible', {
            element: element.id || element.className,
          });
          hasTracked.current = true;
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef]);

  return isVisible;
}

// Smart theme preference with persistence
export function useSmartTheme() {
  // eslint-disable-next-line react/hook-use-state
  const [theme, _setThemeInternal] = useState<'light' | 'dark' | 'auto'>(() =>
    preferences.get('theme', 'auto'),
  );

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    _setThemeInternal(newTheme);
    preferences.set('theme', newTheme);
    analytics.track('theme_changed', { theme: newTheme });
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'auto') {
      const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return { theme, setTheme };
}

// Smart performance tracker for components
export function usePerformanceTracker(componentName: string) {
  useEffect(() => {
    const startLabel = `${componentName}_mount_start`;
    const endLabel = `${componentName}_mount_end`;

    performance.mark(startLabel);

    return () => {
      performance.mark(endLabel);
      const duration = performance.measure(startLabel, endLabel);
      analytics.track('component_render', {
        component: componentName,
        duration,
      });
    };
  }, [componentName]);
}

// Smart image preloader hook
export function useImagePreload(urls: string[]) {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let completed = 0;

    const loadImages = async () => {
      for (const url of urls) {
        await preloader.preloadImage(url);
        completed++;
        setProgress((completed / urls.length) * 100);
      }
      setLoaded(true);
    };

    loadImages();
  }, [urls]);

  return { loaded, progress };
}

// Smart scroll position tracker
export function useSmartScroll() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollPosition = () => {
      const currentScrollY = globalThis.scrollY;
      setScrollY(currentScrollY);

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }

      lastScrollY.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    globalThis.addEventListener('scroll', handleScroll, { passive: true });
    return () => globalThis.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY, scrollDirection };
}

// Smart debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Smart online status detector
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      analytics.track('connection_restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      analytics.track('connection_lost');
    };

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Smart reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
