import { type NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';
import type { ApiResponse } from '@/types/api';

/**
 * Local POST /api/auth/logout
 *
 * 1. Clears the workshop session cookie.
 */
export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    // Delete workshop session cookie wrapper if used
    await deleteSession();

    const response = NextResponse.json<ApiResponse>(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear local token cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
    await deleteSession().catch(() => {});
    return NextResponse.json<ApiResponse>(
      { success: false, error: { message: 'Logout failed' } },
      { status: 500 }
    );
  }
}
