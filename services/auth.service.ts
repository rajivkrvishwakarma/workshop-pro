import type { AuthUser, LoginFormValues, LoginResponse } from '@/types/auth';
import { get, post } from '@/lib/api/axios';

/**
 * Client-side auth service.
 * All calls go to Next.js BFF routes (/api/auth/*) — never directly to auth service.
 */
export const authService = {
  /**
   * Login with email + password.
   * BFF route sets httpOnly cookies on success.
   */
  async login(credentials: LoginFormValues): Promise<LoginResponse> {
    const response = await post<LoginResponse>('/auth/login', credentials);
    if (!response.data) throw new Error(response.error?.message ?? 'Login failed');
    return response.data;
  },

  /**
   * Logout — clears server-side cookies and revokes session in auth service.
   */
  async logout(): Promise<void> {
    await post('/auth/logout');
  },

  /**
   * Fetch current authenticated user from the auth service via BFF.
   */
  async getMe(): Promise<AuthUser> {
    const response = await get<AuthUser>('/auth/me');
    if (!response.data) throw new Error('Failed to fetch user');
    return response.data;
  },
};
