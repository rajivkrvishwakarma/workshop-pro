import { type NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import type { SessionPayload } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

const AUTH_API_URL = process.env.AUTH_API_URL;

/**
 * BFF Proxy: POST /api/auth/login
 *
 * 1. Forwards credentials to the authorization-service.
 * 2. On success: creates an httpOnly session cookie and returns user data.
 * 3. The refreshToken from the auth service remains in its own httpOnly cookie
 *    via the Set-Cookie header that gets forwarded to the browser.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { email: string; password: string };

    // Forward login request to auth service
    const authResponse = await fetch(`${AUTH_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: authData.error?.message ?? 'Login failed' } },
        { status: authResponse.status === 429 ? 429 : (authResponse.status >= 400 ? authResponse.status : 401) }
      );
    }

    const { accessToken, user } = authData.data;

    // Build session payload (in production: add roles/permissions from a db lookup)
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const sessionPayload: SessionPayload = {
      userId: user.id,
      sessionId: accessToken, // We use the access token as session identifier
      email: user.email,
      roles: [], // TODO: populate from workshop_user_roles on next phase
      permissions: [],
      expiresAt,
    };

    // Create httpOnly session cookie
    await createSession(sessionPayload);

    // Forward the refreshToken cookie from the auth service to the browser
    const response = NextResponse.json<ApiResponse<{ user: typeof user }>>(
      { success: true, data: { user } },
      { status: 200 }
    );

    // Forward Set-Cookie header from auth service (carries the refreshToken)
    const setCookieHeader = authResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }

    // Set accessToken cookie for proxy.ts
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[BFF] Login error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
