// Force Next.js recompile
import { type NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import type { SessionPayload } from '@/types/auth';
import type { ApiResponse } from '@/types/api';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { workshopUsers } from '@/drizzle/schema/workshop-users';
import { workshopUserRoles } from '@/drizzle/schema/roles';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';

const secretStr = process.env.JWT_SECRET;
const secret = secretStr ? new TextEncoder().encode(secretStr) : undefined;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const { email, password } = await request.json() as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    // 1. Find user by email
    const [user] = await db.select().from(workshopUsers).where(eq(workshopUsers.email, email)).limit(1);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'Invalid credentials' } },
        { status: 401 }
      );
    }

    // 2. Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'Invalid credentials' } },
        { status: 401 }
      );
    }

    // 3. Check if active
    if (!user.isActive) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'Account is disabled' } },
        { status: 403 }
      );
    }

    // 4. Generate JWT payload
    const tokenPayload = {
      sub: user.id, // Subject is the user ID
      email: user.email,
    };

    // 5. Sign JWT
    const accessToken = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .setJti(uuidv4())
      .sign(secret);

    // Build user response object
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: [], // To be populated properly via /me endpoint or here
      permissions: [],
    };

    const response = NextResponse.json<ApiResponse<{ user: typeof userResponse }>>(
      { success: true, data: { user: userResponse } },
      { status: 200 }
    );

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
    console.error('[AUTH] Login error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
