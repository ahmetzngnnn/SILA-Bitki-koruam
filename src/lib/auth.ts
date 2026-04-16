/**
 * Authentication Helper Functions
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Protect an API route - requires authentication
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<any> {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions);
  return !!session;
}

/**
 * Get access token from session (for Google Sheets API calls)
 */
export async function getAccessToken(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  const session = await getServerSession(req, res, authOptions);
  return (session?.accessToken as string) || null;
}
