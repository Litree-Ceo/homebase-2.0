import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/social/posts/[postId]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { postId } = params;

    const commentsSnapshot = await adminDb
      .collection("comments")
      .where("post_id", "==", postId)
      .where("parent_comment_id", "==", null)
      .orderBy("created_at", "asc")
      .get();

    const comments = await Promise.all(
      commentsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await adminDb.collection("users").doc(data.user_id).get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          ...data,
          user_name: userData?.displayName || "Unknown User",
          user_avatar: userData?.photoURL || "",
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ comments });
  } catch (error: unknown) {
    console.error("Error fetching comments:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch comments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/social/posts/[postId]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { postId } = params;
    const body = await request.json();
    const { content, parent_comment_id, media_url, media_type } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const commentData = {
      post_id: postId,
      user_id: user.uid,
      parent_comment_id: parent_comment_id || null,
      content: content.trim(),
      media_url: media_url || null,
      media_type: media_type || null,
      mentions: [],
      reactions_count: 0,
      replies_count: 0,
      is_edited: false,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    const commentRef = await adminDb.collection("comments").add(commentData);

    // Increment post comments count
    await adminDb.collection("posts").doc(postId).update({
      comments_count: FieldValue.increment(1),
    });

    return NextResponse.json({ 
      success: true, 
      comment_id: commentRef.id 
    });
  } catch (error: unknown) {
    console.error("Error adding comment:", error);
    const message = error instanceof Error ? error.message : "Failed to add comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
