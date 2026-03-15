import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_UID = process.env.ADMIN_UID;
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "dyingbreed243@gmail.com";
const ADMIN_MASTER_KEY = process.env.ADMIN_MASTER_KEY;

/**
 * Verify if current user is an admin
 * Used by admin pages to validate access
 */
export async function GET(request: NextRequest) {
  try {
    // Emergency master key override (server-side env only)
    const suppliedMasterKey = request.headers.get("x-admin-master-key");
    if (ADMIN_MASTER_KEY && suppliedMasterKey === ADMIN_MASTER_KEY) {
      return NextResponse.json({
        isAdmin: true,
        uid: "master-key",
        email: ADMIN_EMAIL,
        via: "master-key",
      });
    }

    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      (ADMIN_UID && user.uid === ADMIN_UID) ||
      (ADMIN_EMAIL && user.email === ADMIN_EMAIL);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      isAdmin: true,
      uid: user.uid,
      email: user.email,
    });
  } catch (error) {
    console.error("Admin verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
