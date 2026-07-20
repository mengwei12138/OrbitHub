import type { RoleCode } from '@/store/types';

export const FALLBACK_DEFAULT_ROUTE = '/account';

export const DEFAULT_ROUTE_BY_ROLE: Record<string, string> = {
  PLATFORM_ADMIN: '/management/console',
  TENANT_ADMIN: '/management/admin-management',
  NORMAL_ADMIN: '/account',
};

export const getDefaultRouteByRoles = (
  roles: RoleCode[] | undefined,
  fallback = FALLBACK_DEFAULT_ROUTE,
): string =>
  roles?.map((role) => DEFAULT_ROUTE_BY_ROLE[role]).find((path) => !!path) ??
  fallback;
