import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/social/reactions - Add or update a reaction
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
    const { target_type, target_id, reaction_type } = body;

    if (!target_type || !target_id || !reaction_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validTypes = ["post", "comment", "message"];
    if (!validTypes.includes(target_type)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    const validReactions = [
      "like", "love", "fire", "rocket", "clap", "laugh", "thinking", "wow", "sad", "angry"
    ];
    if (!validReactions.includes(reaction_type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    // Check if user already reacted
    const existingReaction = await adminDb
      .collection("reactions")
      .where("user_id", "==", user.uid)
      .where("target_type", "==", target_type)
      .where("target_id", "==", target_id)
      .limit(1)
      .get();

    if (!existingReaction.empty) {
      // Update existing reaction
      const reactionDoc = existingReaction.docs[0];
      await reactionDoc.ref.update({
        reaction_type,
        created_at: FieldValue.serverTimestamp(),
      });
    } else {
      // Create new reaction
      await adminDb.collection("reactions").add({
        user_id: user.uid,
        target_type,
        target_id,
        reaction_type,
        created_at: FieldValue.serverTimestamp(),
      });

      // Increment reaction count on target
      const collection = target_type === "post" ? "posts" : "comments";
      await adminDb.collection(collection).doc(target_id).update({
        reactions_count: FieldValue.increment(1),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error adding reaction:", error);
    const message = error instanceof Error ? error.message : "Failed to add reaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/social/reactions - Remove a reaction
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const target_type = searchParams.get("target_type");
    const target_id = searchParams.get("target_id");

    if (!target_type || !target_id) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const reactionSnapshot = await adminDb
      .collection("reactions")
      .where("user_id", "==", user.uid)
      .where("target_type", "==", target_type)
      .where("target_id", "==", target_id)
      .limit(1)
      .get();

    if (reactionSnapshot.empty) {
      return NextResponse.json({ error: "Reaction not found" }, { status: 404 });
    }

    await reactionSnapshot.docs[0].ref.delete();

    // Decrement reaction count
    const collection = target_type === "post" ? "posts" : "comments";
    await adminDb.collection(collection).doc(target_id).update({
      reactions_count: FieldValue.increment(-1),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error removing reaction:", error);
    const message = error instanceof Error ? error.message : "Failed to remove reaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
