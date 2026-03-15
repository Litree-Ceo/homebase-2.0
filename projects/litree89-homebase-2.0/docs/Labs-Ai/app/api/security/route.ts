import { NextResponse } from "next/server";

export async function GET() {
  const logs = [
    {
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
      event: "✅ Successful Login",
      details: "Chrome on Windows (Washington, DC) - 192.168.1.1",
    },
    {
      time: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(),
      event: "🔐 Password Reset",
      details: "You reset your password successfully",
    },
    {
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
      event: "✅ Device Verified",
      details: "MacBook Pro added to trusted devices",
    },
  ];

  return NextResponse.json({ logs });
}
