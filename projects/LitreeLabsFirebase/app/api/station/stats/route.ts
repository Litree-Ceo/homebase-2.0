import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Get user ID from session cookie (simplified auth check)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session");
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For demo, extract UID from Firebase auth (you'd verify the session cookie properly in production)
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

    const db = getAdminDb();
        if (!db) {
          return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
        }
    
    // Get station stats from Firestore
    const stationDoc = await db.collection("stations").doc(uid).get();
    const stationData = stationDoc.exists ? stationDoc.data() : null;

    // Get referral count
    const referralsSnapshot = await db
      .collection("users")
      .where("referredBy", "==", uid)
      .get();

    // Calculate earnings (example: $5 per referral + subscription revenue share)
    const referralCount = referralsSnapshot.size;
    const referralEarnings = referralCount * 5;
    
    // Get user's subscription tier for additional earnings
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const subscriptionEarnings = userData?.affiliateEarnings || 0;

    return NextResponse.json({
      visits: stationData?.visits || 0,
      followers: stationData?.followers || 0,
      referrals: referralCount,
      earnings: referralEarnings + subscriptionEarnings,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Station stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch station stats" },
      { status: 500 }
    );
  }
}
