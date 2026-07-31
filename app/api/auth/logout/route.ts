import { type NextRequest, NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/auth/session';
import type { ApiResponse } from '@/types/api';

const AUTH_API_URL = process.env.AUTH_API_URL;

/**
 * BFF Proxy: POST /api/auth/logout
 *
 * 1. Reads session to get the access token.
 * 2. Calls the auth service to revoke the session server-side.
 * 3. Clears the workshop session cookie.
 */
export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (session?.sessionId) {
      // Attempt to revoke session in auth service (best-effort)
      await fetch(`${AUTH_API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.sessionId}`,
        },
      }).catch(() => {
        // Non-blocking — local session will be cleared regardless
      });
    }

    // Delete workshop session cookie
    await deleteSession();

    const response = NextResponse.json<ApiResponse>(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Also clear the auth service refreshToken cookie and proxy accessToken cookie
    response.cookies.delete('refreshToken');
    response.cookies.delete('accessToken');

    return response;
  } catch (error) {
    console.error('[BFF] Logout error:', error);
    // Still clear session even on error
    await deleteSession().catch(() => {});
    return NextResponse.json<ApiResponse>(
      { success: false, error: { message: 'Logout failed' } },
      { status: 500 }
    );
  }
}
