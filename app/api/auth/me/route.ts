import { type NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';
import type { AuthUser } from '@/types/auth';
import { db } from '@/lib/db';
import { workshopUsers } from '@/drizzle/schema/workshop-users';
import { workshopUserRoles, workshopRoles } from '@/drizzle/schema/roles';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

const secretStr = process.env.JWT_SECRET;
const secret = secretStr ? new TextEncoder().encode(secretStr) : undefined;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    let payload;
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'Invalid token' } },
        { status: 401 }
      );
    }

    const userId = payload.sub;
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'Invalid token payload' } },
        { status: 401 }
      );
    }

    // 1. Fetch user from database
    const [user] = await db.select().from(workshopUsers).where(eq(workshopUsers.id, userId)).limit(1);

    if (!user || !user.isActive) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { message: 'User not found or disabled' } },
        { status: 401 }
      );
    }

    // 2. Fetch roles
    const rolesData = await db
      .select({ roleName: workshopRoles.name })
      .from(workshopUserRoles)
      .innerJoin(workshopRoles, eq(workshopRoles.id, workshopUserRoles.roleId))
      .where(eq(workshopUserRoles.userId, userId));

    const roles = rolesData.map((r) => r.roleName);

    // TODO: fetch permissions from workshop_role_permissions if implemented. 
    // For now, returning empty array.
    const permissions: string[] = [];

    const authUser: AuthUser = {
      userId: user.id,
      sessionId: token, // Used by client to identify current session token
      email: user.email,
      roles: roles as any[],
      permissions: permissions as any[],
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    };

    return NextResponse.json<ApiResponse<AuthUser>>(
      { success: true, data: authUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('[AUTH] /me error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
