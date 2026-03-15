import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({
        activities: generateMockActivities(),
      });
    }
    
    // Get recent activity from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const activitiesSnapshot = await db
      .collection("activity_feed")
      .where("timestamp", ">=", oneDayAgo)
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    const activities = activitiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        user: data.userName || "Anonymous",
        action: data.action,
        time: getRelativeTime(data.timestamp.toDate()),
        amount: data.amount,
      };
    });

    // If no real activities, return mock data for demo
    if (activities.length === 0) {
      return NextResponse.json({
        activities: generateMockActivities(),
      });
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Live activity error:", error);
    // Return mock data on error for smooth UX
    return NextResponse.json({
      activities: generateMockActivities(),
    });
  }
}

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function generateMockActivities() {
  const names = ["Alex", "Sam", "Jordan", "Casey", "Taylor", "Morgan", "Riley", "Avery"];
  const actions = [
    { type: "signup", action: "joined LitLabs", amount: undefined },
    { type: "upgrade", action: "upgraded to Pro", amount: 49 },
    { type: "content", action: "generated AI content", amount: undefined },
    { type: "referral", action: "referred a friend", amount: 5 },
    { type: "sale", action: "sold a template", amount: 19 },
  ];

  return Array.from({ length: 10 }, (_, i) => {
    const activity = actions[Math.floor(Math.random() * actions.length)];
    return {
      id: `mock-${i}`,
      type: activity.type,
      user: names[Math.floor(Math.random() * names.length)],
      action: activity.action,
      time: `${Math.floor(Math.random() * 60)}m ago`,
      amount: activity.amount,
    };
  });
}
