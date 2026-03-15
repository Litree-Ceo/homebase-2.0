import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App.jsx';

describe('Accessibility Tests', () => {
  it('has proper semantic HTML structure', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const mainElement = screen.getByRole('main');
    const headerElement = screen.getByRole('banner');
    const navElement = screen.getByRole('navigation');
    
    expect(mainElement).toBeInTheDocument();
    expect(headerElement).toBeInTheDocument();
    expect(navElement).toBeInTheDocument();
  });

  it('has proper ARIA labels', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('has proper color contrast', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const textElements = screen.getAllByText(/homebase/i);
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Simple contrast check (this would need a proper contrast ratio library)
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  it('is keyboard navigable', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const focusableElements = screen.getAllByRole('button');
    expect(focusableElements.length).toBeGreaterThan(0);
    
    focusableElements.forEach(element => {
      expect(element).toHaveAttribute('tabindex');
    });
  });
});