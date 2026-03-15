/**
 * @fileoverview HomeBase Core Utilities
 * @module @homebase/core
 * @description Shared utilities, constants, and helper functions for HomeBase 2.0
 */

// Configuration helpers
const config = {
  /**
   * Get environment variable with optional default
   * @param {string} key - Environment variable name
   * @param {string} [defaultValue] - Default value if not set
   * @returns {string|undefined}
   */
  getEnv: (key, defaultValue) => process.env[key] || defaultValue,

  /**
   * Check if running in production
   * @returns {boolean}
   */
  isProduction: () => process.env.NODE_ENV === 'production',

  /**
   * Check if running in development
   * @returns {boolean}
   */
  isDevelopment: () => process.env.NODE_ENV !== 'production',
};

// Logging utilities with consistent formatting
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  debug: (message, ...args) => {
    if (config.isDevelopment()) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};

// Async utilities
const async = {
  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Retry an async function with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {number} [maxRetries=3] - Maximum retry attempts
   * @param {number} [delay=1000] - Initial delay in ms
   * @returns {Promise<any>}
   */
  retry: async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (i < maxRetries - 1) {
          await async.sleep(delay * Math.pow(2, i));
        }
      }
    }
    throw lastError;
  },
};

// Validation utilities
const validate = {
  /**
   * Check if value is a non-empty string
   * @param {any} value
   * @returns {boolean}
   */
  isNonEmptyString: (value) => typeof value === 'string' && value.trim().length > 0,

  /**
   * Check if value is a valid email
   * @param {string} email
   * @returns {boolean}
   */
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
};

module.exports = {
  config,
  logger,
  async,
  validate,
};
