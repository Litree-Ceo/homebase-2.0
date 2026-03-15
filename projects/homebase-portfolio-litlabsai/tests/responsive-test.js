import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App.jsx';

describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(({ name, width, height }) => {
    it(`renders correctly on ${name} (${width}x${height})`, () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/homebase/i)).toBeInTheDocument();
      expect(document.body).toHaveStyle(`width: ${width}px`);
    });
  });

  it('handles mobile menu correctly', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const mobileMenu = screen.getByRole('navigation');
    expect(mobileMenu).toBeInTheDocument();
  });
});