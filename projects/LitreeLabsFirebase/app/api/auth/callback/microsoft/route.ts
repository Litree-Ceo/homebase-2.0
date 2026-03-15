/**
 * Microsoft OAuth Callback Handler
 * Handles the OAuth 2.0 redirect and token exchange
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMicrosoftGraphClient } from '@/lib/microsoft-graph';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

if (!db) {
  throw new Error('Firebase database not initialized');
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/auth?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const graphClient = getMicrosoftGraphClient();
    const tokenResponse = await graphClient.getAccessToken(code);

    // Get user profile
    const userProfile = await graphClient.getUserProfile(tokenResponse.access_token);

    // Store token and user info in Firebase
    const userDocRef = doc(db as any, 'users', userProfile.id);
    await setDoc(
      userDocRef,
      {
        microsoftId: userProfile.id,
        email: userProfile.mail || userProfile.userPrincipalName,
        displayName: userProfile.displayName,
        officeLocation: userProfile.officeLocation,
        mobilePhone: userProfile.mobilePhone,
        tokens: {
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_in: tokenResponse.expires_in,
          created_at: new Date().toISOString(),
        },
        last_sync: new Date().toISOString(),
      },
      { merge: true }
    );

    // Redirect back to dashboard with success
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('microsoft_auth', 'success');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        '/auth?error=callback_failed&description=' +
          encodeURIComponent(error instanceof Error ? error.message : 'Unknown error'),
        request.url
      )
    );
  }
}
