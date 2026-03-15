/* global describe, it, expect, jest, React, performance */
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App.jsx';
import React from 'react';

describe('Performance Tests', () => {
  it('loads within acceptable time', async () => {
    const startTime = performance.now();
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    await screen.findByText(/homebase/i);
    const loadTime = performance.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
  });

  it('does not exceed memory limits', () => {
    const initialMemory = performance.memory.usedJSHeapSize;
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const finalMemory = performance.memory.usedJSHeapSize;
    const memoryUsage = finalMemory - initialMemory;
    
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // Should use less than 50MB
  });

  it('handles component mounting efficiently', () => {
    const mountSpy = jest.spyOn(React, 'useEffect');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(mountSpy).toHaveBeenCalledTimes(1);
    mountSpy.mockRestore();
  });
});