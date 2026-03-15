/**
 * User Logout Endpoint
 * POST /api/auth/logout
 * Clears session and logs out user
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface LogoutResponse {
  success: boolean;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LogoutResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  try {
    // Clear session cookie
    res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[Logout Error]', error);
    res.status(500).json({
      success: false,
    });
  }
}
