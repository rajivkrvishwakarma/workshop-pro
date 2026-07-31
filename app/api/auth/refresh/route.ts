import { type NextRequest, NextResponse } from 'next/server';
import { createSession, getSession } from '@/lib/auth/session';
import type { SessionPayload } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

const AUTH_API_URL = process.env.AUTH_API_URL;

/**
 * BFF Proxy: POST /api/auth/refresh
 *
 * Calls the auth service refresh endpoint using the refreshToken cookie,
 * then updates the workshop session cookie with a fresh access token.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const session = await getSession();

    if (!refreshToken || !session) {
      const response = NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'No active session' } },
        { status: 401 }
      );
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      response.cookies.delete('ws_session');
      return response;
    }

    // Call auth service refresh endpoint
    const authResponse = await fetch(`${AUTH_API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionId}`,
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    let authData: any = {};
    const contentType = authResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      authData = await authResponse.json();
    } else {
      const text = await authResponse.text();
      authData = { success: false, error: { message: text || 'Unknown error from auth service' } };
    }

    if (!authResponse.ok || !authData.success || !authData.data) {
      const response = NextResponse.json<ApiResponse>(
        { success: false, error: { message: authData.error?.message ?? 'Session refresh failed' } },
        { status: authResponse.status === 429 ? 429 : 401 }
      );
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      response.cookies.delete('ws_session');
      return response;
    }

    // Update session with new access token
    const updatedSession: SessionPayload = {
      ...session,
      sessionId: authData.data.accessToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    await createSession(updatedSession);

    const response = NextResponse.json<ApiResponse>(
      { success: true, message: 'Session refreshed' },
      { status: 200 }
    );

    // Set new accessToken cookie for proxy.ts
    response.cookies.set('accessToken', authData.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[BFF] Refresh error:', error);
    const response = NextResponse.json<ApiResponse>(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('ws_session');
    return response;
  }
}
