import type { WorkshopRole } from '@/constants/roles';
import type { PermissionKey } from '@/constants/permissions';
import type { AuthUser } from './auth';

/**
 * Checks if a user has a specific permission.
 */
export function hasPermission(user: AuthUser | null, permission: PermissionKey): boolean {
  if (!user) return false;
  return (user.permissions || []).includes(permission);
}

/**
 * Checks if a user has any of the given permissions.
 */
export function hasAnyPermission(user: AuthUser | null, permissions: PermissionKey[]): boolean {
  if (!user) return false;
  return permissions.some((p) => (user.permissions || []).includes(p));
}

/**
 * Checks if a user has all of the given permissions.
 */
export function hasAllPermissions(user: AuthUser | null, permissions: PermissionKey[]): boolean {
  if (!user) return false;
  return permissions.every((p) => (user.permissions || []).includes(p));
}

/**
 * Checks if a user has a specific role.
 */
export function hasRole(user: AuthUser | null, role: WorkshopRole): boolean {
  if (!user) return false;
  return (user.roles || []).includes(role);
}
