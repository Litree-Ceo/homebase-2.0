import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/social/shares - Share a post
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const body = await request.json();
    const { post_id, share_message, share_type, target_id } = body;

    if (!post_id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Check if post exists
    const postDoc = await adminDb.collection("posts").doc(post_id).get();
    if (!postDoc.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const shareData = {
      user_id: user.uid,
      post_id,
      share_message: share_message || null,
      share_type: share_type || "timeline",
      target_id: target_id || null,
      created_at: FieldValue.serverTimestamp(),
    };

    const shareRef = await adminDb.collection("shares").add(shareData);

    // Increment share count on post
    await adminDb.collection("posts").doc(post_id).update({
      shares_count: FieldValue.increment(1),
    });

    return NextResponse.json({ 
      success: true, 
      share_id: shareRef.id 
    });
  } catch (error: unknown) {
    console.error("Error sharing post:", error);
    const message = error instanceof Error ? error.message : "Failed to share post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
