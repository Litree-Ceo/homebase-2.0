import { NextResponse } from "next/server";

// In-memory fallback; replace with DB calls (e.g., Firestore/Prisma) keyed by user.
const memoryStore = new Map<string, { intensity?: string; particles?: boolean; sound?: boolean }>();

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "session_token";
const JWT_SECRET = process.env.JWT_SECRET;

function base64UrlDecode(input: string) {
  const pad = "===".slice((input.length + 3) % 4);
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function verifyJwtHS256(token: string | undefined) {
  if (!token || !JWT_SECRET) return null;
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) return null;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
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

function readCookieToken(req: Request) {
  const raw = req.headers.get("cookie") || "";
  const token = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")[1];
  return token;
}

async function getUserKey(req: Request) {
  const token = readCookieToken(req);
  const payload = await verifyJwtHS256(token);
  if (!payload) return null;
  // Prefer sub, fallback to email
  return (payload.sub as string) || (payload.email as string) || null;
}

export async function GET(req: Request) {
  const key = await getUserKey(req);
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prefs = memoryStore.get(key) || {};
  return NextResponse.json(prefs);
}

export async function POST(req: Request) {
  const key = await getUserKey(req);
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { intensity, particles, sound } = body || {};
  memoryStore.set(key, { intensity, particles, sound });
  return NextResponse.json({ saved: true });
}
