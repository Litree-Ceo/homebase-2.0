// Authentication helper for Labs AI
import { NextRequest } from "next/server";

export function getUserFromRequest(req: NextRequest) {
  // For development, return a mock user object with a uid
    return { uid: "dev-user-123" }; // req is unused
}
