import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/social/posts - Get all posts
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

    const postsSnapshot = await adminDb
      .collection("posts")
      .orderBy("created_at", "desc")
      .limit(50)
      .get();

    const posts = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    console.error("Error fetching posts:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/social/posts - Create a new post
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
    const { content, media_urls, media_types, privacy, feeling, location, tagged_users } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const postData = {
      user_id: user.uid,
      content: content.trim(),
      media_urls: media_urls || [],
      media_types: media_types || [],
      privacy: privacy || "public",
      feeling: feeling || null,
      location: location || null,
      tagged_users: tagged_users || [],
      is_pinned: false,
      is_archived: false,
      views_count: 0,
      shares_count: 0,
      comments_count: 0,
      reactions_count: 0,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    const postRef = await adminDb.collection("posts").add(postData);

    return NextResponse.json({ 
      success: true, 
      post_id: postRef.id 
    });
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    const message = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
