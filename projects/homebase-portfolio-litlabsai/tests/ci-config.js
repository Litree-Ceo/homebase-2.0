import { describe, it, expect } from '@jest/globals';
import { execSync } from 'child_process';

describe('Continuous Integration Tests', () => {
  it('builds successfully', () => {
    try {
      execSync('npm run build', { cwd: '../', stdio: 'pipe' });
      expect(true).toBe(true);
    } catch (error) {
      expect(false).toBe(true);
    }
  });

  it('passes linting', () => {
    try {
      execSync('npm run lint', { cwd: '../', stdio: 'pipe' });
      expect(true).toBe(true);
    } catch (error) {
      expect(false).toBe(true);
    }
  });

  it('runs all tests', () => {
    try {
      execSync('npm test', { cwd: '../', stdio: 'pipe' });
      expect(true).toBe(true);
    } catch (error) {
      expect(false).toBe(true);
    }
  });

  it('checks for security vulnerabilities', () => {
    try {
      execSync('npm audit --audit-level=moderate', { cwd: '../', stdio: 'pipe' });
      expect(true).toBe(true);
    } catch (error) {
      expect(false).toBe(true);
    }
  });
});