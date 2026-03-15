// Rate limiter for Labs AI
export async function checkRateLimit(userId: string) {
  // For development, always allow (simulate under limit)
  return { ok: true, retryAfter: 0 };
}
