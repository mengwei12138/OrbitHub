import type { APIRequestContext, Page } from '@playwright/test';

/**
 * PRD §7 后台管理 e2e 共享工具。
 *
 * 后端 local profile 配的 `dev-roles: PLATFORM_ADMIN` + `dev-user-id: 1`，所以浏览器调用
 * /api 全部以"超管"身份进出，无需登录态。但前端路由 access 校验仍需要 userStore 里有 token +
 * roles=PLATFORM_ADMIN，所以测试启动时塞一个最小化的 user-storage 到 localStorage。
 */

export const SUPER_ADMIN_USER_STORAGE = {
  state: {
    token: 'e2e-platform-admin-token',
    userInfo: {
      id: '1',
      username: 'admin',
      tenantId: null,
    },
    permissions: [
      // 覆盖所有 admin:* 权限点，让前端 <Access path="..."> 全部放行；
      // 真实鉴权由后端 RBAC 兜底。
      'admin:tenant:list',
      'admin:tenant:view',
      'admin:tenant:create',
      'admin:tenant:update',
      'admin:tenant:disable',
      'admin:tenant:enable',
      'admin:user:list',
      'admin:user:view',
      'admin:user:create',
      'admin:user:update',
      'admin:user:disable',
      'admin:user:enable',
      'admin:user:reset-password',
      'admin:user:delete',
      'admin:user-quota:assign',
      'admin:package:list',
      'admin:package:view',
      'admin:package:create',
      'admin:package:update',
      'admin:package:delete',
      'admin:proxy:balance',
      'admin:proxy:consume',
      'admin:proxy:recharge-log',
      'admin:proxy:task-list',
      'admin:proxy:tenant-recharge',
      'admin:operation-log:list',
      'admin:operation-log:view',
    ],
    roles: ['PLATFORM_ADMIN'],
  },
  version: 0,
};

export const TENANT_ADMIN_USER_STORAGE = (
  userId: string,
  tenantId: string,
) => ({
  state: {
    token: 'e2e-tenant-admin-token',
    userInfo: {
      id: userId,
      username: `tadm${userId}`,
      tenantId,
    },
    permissions: [
      'admin:user:list',
      'admin:user:view',
      'admin:user:create',
      'admin:user:update',
      'admin:user:disable',
      'admin:user:enable',
      'admin:user-quota:assign',
      'admin:proxy:balance',
      'admin:proxy:consume',
      'admin:proxy:recharge-log',
      'admin:operation-log:list',
    ],
    roles: ['TENANT_ADMIN'],
  },
  version: 0,
});

/** 在导航前把 user-storage 写入 localStorage，并让前端把 ENABLE_ACCESS_CHECK 打开 */
export async function loginAs(
  page: Page,
  state:
    | typeof SUPER_ADMIN_USER_STORAGE
    | ReturnType<typeof TENANT_ADMIN_USER_STORAGE>,
): Promise<void> {
  await page.addInitScript((s) => {
    window.localStorage.setItem('user-storage', JSON.stringify(s));
  }, state);
}

/** 通过 backend API（PLATFORM_ADMIN 上下文）做种子，避免依赖 UI */
export async function seedTenantViaApi(
  api: APIRequestContext,
  body: {
    name: string;
    code: string;
    packageId: string;
    contactName: string;
    contactPhone: string;
  },
): Promise<string> {
  const r = await api.post('http://localhost:8082/api/v1/admin/tenants', {
    headers: {
      'X-Auth-User': JSON.stringify({
        userId: '1',
        username: 'admin',
        roles: ['PLATFORM_ADMIN'],
      }),
    },
    data: body,
  });
  const text = await r.text();
  if (!r.ok()) throw new Error(`seedTenant failed ${r.status()}: ${text}`);
  const j = JSON.parse(text);
  if (!j.success) throw new Error(`seedTenant failed: ${j.message}`);
  return j.data.id as string;
}

export async function seedTenantAdminViaApi(
  api: APIRequestContext,
  body: {
    username: string;
    phoneNumber: string;
    password: string;
    tenantId: string;
  },
): Promise<string> {
  const r = await api.post('http://localhost:8082/api/v1/admin/users', {
    headers: {
      'X-Auth-User': JSON.stringify({
        userId: '1',
        username: 'admin',
        roles: ['PLATFORM_ADMIN'],
      }),
    },
    data: {
      username: body.username,
      phoneNumber: body.phoneNumber,
      password: body.password,
      roles: ['TENANT_ADMIN'],
      tenantId: body.tenantId,
      personalQuota: 0,
    },
  });
  const text = await r.text();
  if (!r.ok()) throw new Error(`seedTenantAdmin failed ${r.status()}: ${text}`);
  const j = JSON.parse(text);
  if (!j.success) throw new Error(`seedTenantAdmin failed: ${j.message}`);
  return j.data.id as string;
}

/** 时间戳 → 唯一后缀（8位），用于避免连续多次测试运行的 unique 冲突 */
export function uniqueSuffix(): string {
  const ts = Date.now().toString();
  return ts.substring(ts.length - 8);
}

/**
 * 生成符合 11 位中国大陆手机号格式的测试号：
 * 前缀 13/15/18 + 8 位数字（时间戳末 5 位 + 3 位随机，避免同毫秒内并发冲突）
 */
export function uniquePhone(
  prefix: '138' | '139' | '137' | '136' | '188' = '138',
): string {
  const ts = Date.now().toString();
  const tail5 = ts.substring(ts.length - 5);
  const rand3 = Math.floor(100 + Math.random() * 900);
  return `${prefix}${tail5}${rand3}`;
}
