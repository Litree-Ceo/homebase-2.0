import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth-helper";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UserRecord = {
  uid: string;
  email?: string;
  businessName?: string;
  name?: string;
  tier?: string;
  status?: string;
  [key: string]: string | undefined;
};

// GET - List all users (Admin only)
export async function GET(req: NextRequest) {
  // Require admin authentication
  const adminUser = await requireAdmin(req);
  if (adminUser instanceof Response) {
    return adminUser; // Return unauthorized/forbidden response
  }

  try {
    const dbRef = getAdminDb();
    if (!dbRef) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }
    const usersSnap = await dbRef.collection("users").get();
    const users: UserRecord[] = [];

    usersSnap.forEach((docSnap) => {
      users.push({
        uid: docSnap.id,
        ...(docSnap.data() as Omit<UserRecord, 'uid'>),
      });
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Update user (ban, tier, etc) (Admin only)
export async function POST(req: NextRequest) {
  // Require admin authentication
  const adminUser = await requireAdmin(req);
  if (adminUser instanceof Response) {
    return adminUser; // Return unauthorized/forbidden response
  }

  try {
    const { uid, action, tier, reason } = await req.json();

    if (!uid || !action) {
      return NextResponse.json(
        { error: "Missing uid or action" },
        { status: 400 }
      );
    }

    const dbRef = getAdminDb();
    if (!dbRef) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }

    if (action === "ban") {
      await dbRef.collection("users").doc(uid).update({
        status: "suspended",
        bannedReason: reason || "Admin action",
        bannedAt: new Date().toISOString(),
      });
      return NextResponse.json(
        { message: "User banned successfully" },
        { status: 200 }
      );
    }

    if (action === "unban") {
      await dbRef.collection("users").doc(uid).update({
        status: "active",
        bannedReason: null,
        bannedAt: null,
      });
      return NextResponse.json(
        { message: "User unbanned successfully" },
        { status: 200 }
      );
    }

    if (action === "setTier") {
      if (!tier || !["free", "pro", "enterprise"].includes(tier)) {
        return NextResponse.json(
          { error: "Invalid tier" },
          { status: 400 }
        );
      }
      await dbRef.collection("users").doc(uid).update({
        tier,
        tierUpdatedAt: new Date().toISOString(),
      });
      return NextResponse.json(
        { message: `Tier set to ${tier}` },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
