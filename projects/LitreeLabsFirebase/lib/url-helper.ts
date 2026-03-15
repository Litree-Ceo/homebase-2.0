/**
 * Utility function to get the base URL consistently across the application
 * Prevents issues with multiple environment variable names
 */
export function getBaseUrl(): string {
  // Priority order: NEXT_PUBLIC_APP_URL > NEXT_PUBLIC_BASE_URL > production URL
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://litree-labstudio.com"
  );
}

/**
 * Build a full URL from a relative path
 */
export function buildUrl(path: string): string {
  const base = getBaseUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
