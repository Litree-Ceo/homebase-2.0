import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Simplified auth - get user ID from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const admin = await import("firebase-admin");
    
    let uid: string;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      uid = decodedToken.uid;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { itemId, itemType } = await req.json();

    // Generate affiliate link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://litlabs-evlla8c7n-larry-bols-projects.vercel.app";
    const affiliateLink = `${baseUrl}/${itemType}/${itemId}?ref=${uid}`;

    return NextResponse.json({
      affiliateLink,
      commission: 0.20, // 20% commission
      trackingCode: `${uid}-${itemId}-${Date.now()}`,
    });
  } catch (error) {
    console.error("Affiliate link error:", error);
    return NextResponse.json(
      { error: "Failed to generate affiliate link" },
      { status: 500 }
    );
  }
}
