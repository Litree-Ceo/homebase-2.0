/**
 * Accessibility Hooks
 * Custom hooks for managing accessibility features
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Hook to announce changes to screen readers
 */
export function useAnnouncer(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const [announcement, setAnnouncement] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (message) {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new announcement
      setAnnouncement(message);

      // Clear announcement after screen reader has time to read it
      timeoutRef.current = setTimeout(() => {
        setAnnouncement('');
      }, 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message]);

  return {
    announcement,
    priority,
  };
}

/**
 * Hook to manage focus trapping
 */
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active && containerRef.current) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Get focusable elements
      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Focus first element
      firstElement?.focus();

      // Handle tab navigation
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      // Handle escape key
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          previousFocusRef.current?.focus();
        }
      };

      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscapeKey);
        previousFocusRef.current?.focus();
      };
    }
  }, [active]);

  return containerRef;
}

/**
 * Hook to manage reduced motion preference
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to manage high contrast preference
 */
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

/**
 * Hook to manage keyboard navigation
 */
export function useKeyboardNav() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
}

/**
 * Hook to manage skip links
 */
export function useSkipLinks() {
  const skipLinksRef = useRef<Array<{ id: string; text: string; target: string }>>([]);

  const addSkipLink = (id: string, text: string, target: string) => {
    skipLinksRef.current.push({ id, text, target });
  };

  const removeSkipLink = (id: string) => {
    skipLinksRef.current = skipLinksRef.current.filter(link => link.id !== id);
  };

  return {
    skipLinks: skipLinksRef.current,
    addSkipLink,
    removeSkipLink,
  };
}

/**
 * Helper function to get focusable elements
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(selectors));
}

/**
 * Hook to manage live regions
 */
export function useLiveRegion(id: string, message: string, priority: 'polite' | 'assertive' = 'polite') {
  const [content, setContent] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (message) {
      // Clear previous content first (forces re-announcement)
      setContent('');
      
      // Set new content after a brief delay
      timeoutRef.current = setTimeout(() => {
        setContent(message);
      }, 100);

      // Clear content after announcement
      timeoutRef.current = setTimeout(() => {
        setContent('');
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message]);

  return {
    id,
    content,
    priority,
  };
}