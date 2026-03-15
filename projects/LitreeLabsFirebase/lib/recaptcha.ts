export async function verifyRecaptcha(token?: string): Promise<{ ok: boolean; score?: number; error?: string }> {
  if (!process.env.RECAPTCHA_SECRET) return { ok: true };
  if (!token) return { ok: false, error: 'missing-recaptcha-token' };

  try {
    const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    if (!data.success) return { ok: false, error: 'recaptcha-failed' };
    return { ok: true, score: data.score };
  } catch {
    return { ok: false, error: 'recaptcha-error' };
  }
}

export default { verifyRecaptcha };
