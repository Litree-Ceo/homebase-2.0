/**
 * Accessibility Helper Components
 * Reusable components for improved accessibility
 */

import type { ReactNode } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: 'span' | 'div' | 'p';
}

/**
 * Visually hidden content that is still accessible to screen readers
 */
export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component
      className="sr-only"
      aria-hidden="false"
    >
      {children}
    </Component>
  );
}

interface LiveRegionProps {
  children: ReactNode;
  type?: 'polite' | 'assertive';
  id?: string;
}

/**
 * Live region for dynamic content announcements
 */
export function LiveRegion({ children, type = 'polite', id }: LiveRegionProps) {
  return (
    <div
      aria-live={type}
      aria-atomic="true"
      id={id}
      className="sr-only"
    >
      {children}
    </div>
  );
}

interface SkipLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * Skip link for keyboard navigation
 */
export function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`skip-link ${className}`}
    >
      {children}
    </a>
  );
}

interface FocusTrapProps {
  children: ReactNode;
  onEscape?: () => void;
}

/**
 * Focus trap for modals and dialogs
 */
export function FocusTrap({ children, onEscape }: FocusTrapProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onEscape) {
      onEscape();
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      role="presentation"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

interface AriaStatusProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Status message component for screen readers
 */
export function AriaStatus({ message, type = 'info' }: AriaStatusProps) {
  const statusType = {
    info: 'status',
    success: 'status',
    warning: 'alert',
    error: 'alert',
  }[type];

  return (
    <div
      role={statusType}
      aria-live="polite"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Keyboard navigation helper
 */
export function useKeyboardNavigation() {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Common keyboard shortcuts
    switch (e.key) {
      case 'Escape':
        // Close modals, cancel operations
        const openModal = document.querySelector('[role="dialog"]');
        if (openModal) {
          const closeButton = openModal.querySelector('[data-close]') as HTMLButtonElement;
          closeButton?.click();
        }
        break;
      case '/':
        // Focus search if available
        if (!e.ctrlKey && !e.metaKey) {
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            e.preventDefault();
            searchInput.focus();
          }
        }
        break;
    }
  };

  return { handleKeyDown };
}

/**
 * Focus management utilities
 */
export const FocusManager = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  },

  /**
   * Trap focus within a container
   */
  trapFocus(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Restore focus to a previously focused element
   */
  restoreFocus(element: HTMLElement | null) {
    if (element) {
      element.focus();
    }
  },
};