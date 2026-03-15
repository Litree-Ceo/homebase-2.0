import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/social/feed - Get user's feed
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Get posts from user's friends and public posts
    const postsSnapshot = await adminDb
      .collection("posts")
      .where("privacy", "==", "public")
      .orderBy("created_at", "desc")
      .limit(50)
      .get();

    const posts = await Promise.all(
      postsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get user info
        const userDoc = await adminDb.collection("users").doc(data.user_id).get();
        const userData = userDoc.data();

        // Check if current user has reacted
        const reactionDoc = await adminDb
          .collection("reactions")
          .where("user_id", "==", user.uid)
          .where("target_type", "==", "post")
          .where("target_id", "==", doc.id)
          .limit(1)
          .get();

        const userReaction = !reactionDoc.empty 
          ? reactionDoc.docs[0].data().reaction_type 
          : null;

        return {
          id: doc.id,
          ...data,
          user_name: userData?.displayName || "Unknown User",
          user_avatar: userData?.photoURL || "",
          user_reaction: userReaction,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    console.error("Error fetching feed:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch feed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
