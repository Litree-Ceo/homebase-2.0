import { NextRequest } from 'next/server';
import { getAdminAuth } from './firebase-admin';

export async function getUserFromRequest(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    if (!auth) {
      console.error('Firebase Admin not initialized');
      return null;
    }
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return null;
    }

    // Verify token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (user.uid !== process.env.ADMIN_UID) {
    return Response.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }
  
  return user;
}
