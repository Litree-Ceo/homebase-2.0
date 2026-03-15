// Minimal in-memory token bucket for per-instance limits (no Redis to avoid build-time deps)
const inMemoryMap = new Map<string, { count: number; start: number }>();
const DEFAULT_WINDOW_SEC = parseInt(process.env.DEMO_RATE_LIMIT_WINDOW || '60', 10);
const DEFAULT_DEMO_RATE_LIMIT = parseInt(process.env.DEMO_RATE_LIMIT || '20', 10);
const WINDOW_MS = DEFAULT_WINDOW_SEC * 1000;
const MAX_PER_WINDOW = DEFAULT_DEMO_RATE_LIMIT;

export async function checkRateLimit(ip: string): Promise<{ ok: boolean; retryAfter?: number; remaining?: number }> {
  // In-memory limiter only
  const now = Date.now();
  const entry = inMemoryMap.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    inMemoryMap.set(ip, { count: 1, start: now });
    return { ok: true, remaining: Math.max(0, MAX_PER_WINDOW - 1) };
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((entry.start + WINDOW_MS - now) / 1000) };
  }

  // increment and persist the new count for this window
  entry.count++;
  inMemoryMap.set(ip, entry);
  return { ok: true, remaining: Math.max(0, MAX_PER_WINDOW - entry.count) };
}

export default { checkRateLimit };
