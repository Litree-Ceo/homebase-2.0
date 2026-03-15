import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc,
  updateDoc,
  increment,
  doc,
  Timestamp,
} from "firebase/firestore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ referralCode: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const { referralCode } = await params;

    // Find user with this referral code
    const q = query(
      collection(db, "users"),
      where("referralCode", "==", referralCode),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    const referrerData = snapshot.docs[0].data();

    // Return referrer info (without sensitive data)
    return NextResponse.json({
      referrerName: referrerData.displayName || "LitLabs Member",
      referralCode,
      discountCode: `REFER${referralCode.toUpperCase()}`,
      discountPercentage: 20,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching referral info:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch referral information" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ referralCode: string }> }
) {
  try {
    const { referralCode } = await params;
    const { newUserEmail, newUserUid } = await req.json();

    // Find referrer
    const q = query(
      collection(db!, "users"),
      where("referralCode", "==", referralCode),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    const referrerId = snapshot.docs[0].id;

    // Record referral
    await addDoc(collection(db!, "referrals"), {
      referrerId,
      referralCode,
      newUserEmail,
      newUserUid,
      createdAt: Timestamp.now(),
      status: "pending", // pending, converted, credited
      bonusAmount: 0,
    });

    // Update referrer's referral count
    await updateDoc(doc(db!, "users", referrerId), {
      referralCount: increment(1),
      pendingReferrals: increment(1),
    });

    return NextResponse.json({
      success: true,
      message: "Referral recorded",
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error recording referral:", err.message);
    return NextResponse.json(
      { error: "Failed to record referral" },
      { status: 500 }
    );
  }
}
