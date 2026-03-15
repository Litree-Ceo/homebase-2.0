/**
 * Accessibility Test Component
 * Simple test to verify accessibility features are working
 */

import { useState, useEffect } from 'react';

export function AccessibilityTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const runAccessibilityTests = () => {
    setIsTesting(true);
    const results: string[] = [];

    // Test 1: Focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    results.push(`✓ Found ${focusableElements.length} focusable elements`);

    // Test 2: ARIA labels
    const elementsWithAriaLabel = document.querySelectorAll('[aria-label], [aria-labelledby]');
    results.push(`✓ Found ${elementsWithAriaLabel.length} elements with ARIA labels`);

    // Test 3: Semantic HTML
    const semanticElements = document.querySelectorAll('main, nav, section, article, aside');
    results.push(`✓ Found ${semanticElements.length} semantic HTML elements`);

    // Test 4: Skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    const skipLink = Array.from(skipLinks).find(link => link.textContent?.includes('Skip'));
    results.push(skipLink ? '✓ Skip link found' : '⚠ Skip link not found');

    // Test 5: Live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    results.push(`✓ Found ${liveRegions.length} live regions`);

    // Test 6: Progress bars
    const progressBars = document.querySelectorAll('[role="progressbar"]');
    results.push(`✓ Found ${progressBars.length} accessible progress bars`);

    // Test 7: Form labels
    const forms = document.querySelectorAll('form');
    forms.forEach((form, index) => {
      const labels = form.querySelectorAll('label, [aria-label], [aria-labelledby]');
      const inputs = form.querySelectorAll('input, select, textarea');
      results.push(`✓ Form ${index + 1}: ${labels.length} labels for ${inputs.length} inputs`);
    });

    // Test 8: Color contrast (basic check)
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button');
    let contrastIssues = 0;
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      // Basic check - in real implementation, you'd use a proper contrast checking algorithm
      if (color === backgroundColor) {
        contrastIssues++;
      }
    });
    results.push(contrastIssues === 0 ? '✓ No obvious color contrast issues' : `⚠ Found ${contrastIssues} potential contrast issues`);

    setTestResults(results);
    setIsTesting(false);
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const testKeyboardNavigation = () => {
    announceToScreenReader('Starting keyboard navigation test. Use Tab to navigate.');
    
    // Add visual focus indicator test
    const style = document.createElement('style');
    style.textContent = `
      *:focus-visible {
        outline: 3px solid #ff0000 !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      document.head.removeChild(style);
      announceToScreenReader('Keyboard navigation test complete');
    }, 5000);
  };

  const testScreenReader = () => {
    announceToScreenReader('This is a test announcement for screen readers.');
    announceToScreenReader('If you can hear this, the live region is working correctly.');
  };

  const testFocusManagement = () => {
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
      announceToScreenReader(`Focused first of ${focusableElements.length} focusable elements`);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg border border-purple-500/30">
      <h2 className="text-xl font-bold mb-4 text-purple-400">Accessibility Test Panel</h2>
      
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={runAccessibilityTests}
            disabled={isTesting}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            aria-label="Run comprehensive accessibility tests"
          >
            {isTesting ? 'Testing...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={testKeyboardNavigation}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Test keyboard navigation with visual indicators"
          >
            Test Keyboard Nav
          </button>
          
          <button
            onClick={testScreenReader}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Test screen reader announcements"
          >
            Test Screen Reader
          </button>
          
          <button
            onClick={testFocusManagement}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="Test focus management"
          >
            Test Focus
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Test Results:</h3>
            <ul className="space-y-1 text-sm font-mono" role="list">
              {testResults.map((result, index) => (
                <li key={index} className={result.includes('✓') ? 'text-green-400' : result.includes('⚠') ? 'text-yellow-400' : 'text-gray-300'}>
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-yellow-400">Quick Accessibility Tips:</h3>
          <ul className="text-sm space-y-1 text-gray-300" role="list">
            <li>• Use Tab to navigate between interactive elements</li>
            <li>• Look for purple focus indicators when navigating</li>
            <li>• Screen readers will announce dynamic updates</li>
            <li>• Use Escape to close modals and cancel operations</li>
            <li>• Press / to focus search when available</li>
          </ul>
        </div>
      </div>
    </div>
  );
}