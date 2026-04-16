/**
 * Authentication Helper Functions & NextAuth Configuration
 */

import { type NextAuthOptions, type Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth/next';
import type { JWT } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * NextAuth OAuth2 Configuration
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope:
            'openid profile email https://www.googleapis.com/auth/spreadsheets',
          prompt: 'consent',
          access_type: 'offline',
        },
      },
    }),
  ],

  callbacks: {
    /**
     * JWT callback - Store tokens in JWT
     */
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Refresh token if expired
      if (token.expiresAt && Date.now() > (token.expiresAt as number) * 1000) {
        return refreshAccessToken(token);
      }

      return token;
    },

    /**
     * Session callback - Pass tokens to session
     */
    async session({ session, token }) {
      if (session && token) {
        session.accessToken = token.accessToken as string;
        session.user = {
          ...session.user,
          email: token.email as string,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: (token.refreshToken as string) || '',
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) {
      throw refreshed;
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

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

/**
 * Extend Session interface to include accessToken
 */
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

/**
 * Extend JWT interface
 */
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}
