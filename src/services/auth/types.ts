import type { Result } from '@/api/types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  userId: string;
  username: string;
  /** 与后端 sys_user.roles JSON 对齐：PLATFORM_ADMIN / TENANT_ADMIN / NORMAL_ADMIN */
  roles: Array<'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'NORMAL_ADMIN' | string>;
  tenantId: string | null;
  loginTime: string;
  loginIp: string;
  permissions: string[];
  scope: object;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_expires_in?: number;
  user: AuthUser;
}

export type ResultTokenResponse = Result<TokenResponse>;
