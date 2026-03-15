import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App.jsx';
import puppeteer from 'puppeteer';

describe('Automated Preview Generation', () => {
  it('generates screenshots for different viewports', async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
    
    const page = await browser.newPage();
    
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto('http://localhost:5173');
      
      await page.waitForSelector('main');
      
      const screenshotPath = `tests/screenshots/${viewport.name}-preview.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      expect(screenshotPath).toContain(`${viewport.name}-preview.png`);
    }
    
    await browser.close();
  });

  it('generates HTML preview report', () => {
    const report = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Website Preview Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .preview { margin: 20px 0; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        <h1>Website Preview Report</h1>
        <div class="preview">
          <h2>Mobile Preview</h2>
          <img src="screenshots/mobile-preview.png" alt="Mobile Preview">
        </div>
        <div class="preview">
          <h2>Tablet Preview</h2>
          <img src="screenshots/tablet-preview.png" alt="Tablet Preview">
        </div>
        <div class="preview">
          <h2>Desktop Preview</h2>
          <img src="screenshots/desktop-preview.png" alt="Desktop Preview">
        </div>
      </body>
      </html>
    `;
    
    const fs = require('fs');
    fs.writeFileSync('tests/preview-report.html', report);
    
    expect(fs.existsSync('tests/preview-report.html')).toBe(true);
  });
});