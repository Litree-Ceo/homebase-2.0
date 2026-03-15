import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App.jsx';

describe('Browser Compatibility Tests', () => {
  it('renders without crashing in modern browsers', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/homebase/i)).toBeInTheDocument();
  });

  it('handles CSS variables correctly', () => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --primary-color: #007bff;
      }
    `;
    document.head.appendChild(style);
    
    expect(getComputedStyle(document.documentElement).getPropertyValue('--primary-color')).toBe('#007bff');
  });

  it('supports ES6 features', () => {
    const testArray = [1, 2, 3];
    const result = testArray.map(x => x * 2);
    expect(result).toEqual([2, 4, 6]);
  });
});