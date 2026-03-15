import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalMessages: 482,
    playbooks: 73,
    dmsHandled: 1249,
    salesPlays: 112,
    revenue: 89000,
    activeUsers: 2847,
  });
}
