import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get('code');

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code required' },
        { status: 400 }
      );
    }

    const dbRef = getAdminDb();
    if (!dbRef) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }
    const referralDoc = await dbRef.collection('referrals').doc(referralCode).get();

    if (!referralDoc.exists) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    const data = referralDoc.data() as any;
    return NextResponse.json({
      referrerName: data?.referrerName,
      referrerBusiness: data?.referrerBusiness,
      tier: data?.tier || 'free',
      bonus: data?.bonus || 10,
    });
  } catch (error) {
    console.error('Referral lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup referral' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid, referrerUid } = await request.json();

    if (!uid || !referrerUid) {
      return NextResponse.json(
        { error: 'UID and referrer UID required' },
        { status: 400 }
      );
    }

    const dbRef = getAdminDb();
    if (!dbRef) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }
    const referrerDoc = await dbRef.collection('users').doc(referrerUid).get();

    if (!referrerDoc.exists) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      );
    }

    const referrerData = referrerDoc.data() as any;

    await dbRef.collection('users').doc(uid).update({
      referredBy: referrerUid,
      referredAt: new Date(),
    });

    await dbRef.collection('users').doc(referrerUid).update({
      referralCount: (referrerData.referralCount || 0) + 1,
      totalReferralBonus: (referrerData.totalReferralBonus || 0) + 10,
    });

    await dbRef.collection('activity_log').add({
      type: 'signup',
      userName: `New user from ${referrerData.displayName}`,
      businessName: referrerData.businessName,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Referral recorded',
      bonus: 10,
    });
  } catch (error) {
    console.error('Referral creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
