import { type NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';
import { jwtVerify, SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';

const secretStr = process.env.JWT_SECRET;
const secret = secretStr ? new TextEncoder().encode(secretStr) : undefined;

/**
 * Local POST /api/auth/refresh
 *
 * Refreshes the local accessToken if valid.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!secret) throw new Error('JWT_SECRET is not configured');

    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'No active session' } },
        { status: 401 }
      );
    }

    let payload;
    try {
      // For a real refresh, you might want to allow expired tokens here 
      // if you check a database session, but since we are purely stateless JWT here:
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch {
      const response = NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'Invalid or expired token' } },
        { status: 401 }
      );
      response.cookies.delete('accessToken');
      return response;
    }

    // Issue a new token
    const newPayload = {
      sub: payload.sub,
      email: payload.email,
    };

    const newAccessToken = await new SignJWT(newPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .setJti(uuidv4())
      .sign(secret);

    const response = NextResponse.json<ApiResponse>(
      { success: true, message: 'Session refreshed' },
      { status: 200 }
    );

    // Set new accessToken cookie
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[AUTH] Refresh error:', error);
    const response = NextResponse.json<ApiResponse>(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
    response.cookies.delete('accessToken');
    return response;
  }
}
