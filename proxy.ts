import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ROUTES } from '@/constants/routes';

/**
 * Next.js 16 Proxy (formerly `middleware`).
 *
 * Runs on every matching request BEFORE rendering.
 * Performs OPTIMISTIC auth checks for frontend routes using the session cookie.
 * Performs STRICT auth checks for API routes by verifying the JWT.
 *
 * ⚠️  Proxy runtime is Node.js in Next.js 16 — edge runtime is not supported.
 */

const SESSION_COOKIE = 'accessToken';

/** Routes that do NOT require authentication */
const PUBLIC_ROUTES = new Set<string>([ROUTES.LOGIN]);

/** Routes that should redirect authenticated users away (login page) */
const AUTH_ROUTES = new Set<string>([ROUTES.LOGIN]);

/** Paths that proxy should never touch */
const SKIP_PATTERNS = [
  /^\/_next\/static/,
  /^\/_next\/image/,
  /^\/public\//,
  /\.(ico|png|jpg|jpeg|svg|webp|gif|woff|woff2|ttf|otf|css|js|map)$/,
];

const secretStr = process.env.JWT_SECRET;
const secret = secretStr ? new TextEncoder().encode(secretStr) : undefined;

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (SKIP_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasSession = Boolean(token);

  // --- API ROUTE PROTECTION ---
  if (pathname.startsWith('/api/')) {
    // Exclude /api/auth or other public APIs if needed
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    if (!secret) {
      console.error("SESSION_SECRET is not defined in environment variables");
      return NextResponse.json({ error: 'Internal Server Error: Missing Secret' }, { status: 500 });
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify the JWT signature
      const { payload } = await jwtVerify(token, secret);
      
      // Pass the user ID to API routes via a custom header
      const requestHeaders = new Headers(request.headers);
      if (payload.sub) {
        requestHeaders.set('x-user-id', payload.sub);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  // --- FRONTEND ROUTE PROTECTION ---
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // Unauthenticated user trying to access protected route → redirect to login
  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login → redirect to dashboard
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
