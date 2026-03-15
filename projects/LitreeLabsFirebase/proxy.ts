import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Admin guard:
// A) Verify HS256 JWT in SESSION_COOKIE_NAME with JWT_SECRET; require admin role or matching email.
// B) If ADMIN_VALIDATE_URL is set, call it with cookies; allow if { admin: true } or { ok: true }.
// Dev override: x-admin-preview: true header.

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "session_token";
const VALIDATE_URL = process.env.ADMIN_VALIDATE_URL; // e.g., https://your-api.com/admin/validate
const JWT_SECRET = process.env.JWT_SECRET;

function base64UrlDecode(input: string) {
  const pad = "===".slice((input.length + 3) % 4);
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function verifyJwtHS256(token: string | undefined, secret?: string) {
  if (!token || !secret) return null;
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) return null;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);
    const ok = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!ok) return null;
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

async function isAllowedByValidator(req: NextRequest) {
  if (!VALIDATE_URL) return undefined;
  try {
    const res = await fetch(VALIDATE_URL, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return Boolean(data?.admin || data?.ok);
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const isAdminPath = url.pathname.startsWith("/labstudio/admin") || url.pathname.startsWith("/admin");
  if (!isAdminPath) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const hasDevHeader = req.headers.get("x-admin-preview") === "true";

  const validated = await isAllowedByValidator(req);
  const payload = await verifyJwtHS256(token, JWT_SECRET);
  const allowedByJwt =
    !!payload &&
    (payload?.role === "admin" || (ADMIN_EMAIL && payload?.email === ADMIN_EMAIL));

  const isAllowed = hasDevHeader || validated === true || allowedByJwt;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/labstudio/admin/:path*", "/admin/:path*"],
};
