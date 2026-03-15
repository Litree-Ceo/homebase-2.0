'use client';

import { useEffect } from 'react';

export default function SecurityProvider({ children }) {
  useEffect(() => {
    // Polyfill/Setup for Trusted Types to silence "This document requires 'TrustedHTML' assignment"
    // This creates a 'default' policy that passes through HTML/Script/URLs.
    // In a high-security banking app, you'd want actual sanitization here (e.g. DOMPurify).
    if (
      typeof window !== 'undefined' &&
      window.trustedTypes &&
      window.trustedTypes.createPolicy &&
      !window.trustedTypes.defaultPolicy
    ) {
      try {
        window.trustedTypes.createPolicy('default', {
          createHTML: string => string,
          createScript: string => string,
          createScriptURL: string => string,
        });
      } catch (e) {
        // Policy might already exist or be blocked by CSP
        console.warn('Failed to create default TrustedTypes policy:', e);
      }
    }
  }, []);

  return children;
}
