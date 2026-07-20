/**
 * 用户（管理员级 sys_user）相关类型。对应后端 admin-api.yaml 1.4.0（User tag）。
 *
 * 阶段①前端：创建 TENANT_ADMIN（在新建公司成功后串调）
 * 阶段③前端：补 list / update / disable / enable / reset-password，
 *           覆盖 PRD §3.4（超管视角）+ §4.1（租户管理员视角）两套页面。
 */

export type UserRoleCode = 'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'NORMAL_ADMIN';

export type UserResponse = {
  id: string;
  username: string;
  phoneNumber: string;
  roles: UserRoleCode[];
  tenantId: string | null;
  /** 1=启用 0=禁用 */
  status: number;
  /** 仅 TENANT_ADMIN / NORMAL_ADMIN 有值；PLATFORM_ADMIN 为 null */
  personalQuota: number | null;
  /** 该用户名下未软删的社交账号数（已绑账号）；PRD §4.1 列表「已创建社交账号」列 */
  boundCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserRequest = {
  username: string;
  phoneNumber: string;
  /** 明文密码；后端 BCrypt 哈希后落库 */
  password: string;
  roles: UserRoleCode[];
  tenantId?: string | number | null;
  tenantAdminUserId?: string | number | null;
  personalQuota?: number | null;
};

/**
 * 后端 UpdateUserRequest 支持 username / phoneNumber / personalQuota（PRD 编辑允许改这三项；
 * 状态走 disable/enable 单独接口）。
 * 把 personalQuota 一并放在编辑请求里发送，后端在一条 admin.user.update 日志里合并展示，
 * 避免独立产生 admin.user-quota.assign 日志。
 */
export type UpdateUserRequest = {
  username?: string;
  phoneNumber?: string;
  /** 普通管理员社交账号创建上限；省略表示不改动配额。 */
  personalQuota?: number;
};

export type ResetPasswordRequest = {
  /** 明文新密码；后端 BCrypt 哈希后落库 */
  newPassword: string;
};

export type UserListQueryParams = {
  /** 后端按单角色过滤；PRD §4.1 同时显示 TENANT_ADMIN+NORMAL_ADMIN 时不传，依靠数据权限自动收敛本公司用户 */
  role?: UserRoleCode;
  /** 姓名或手机号关键字 */
  keyword?: string;
  /** 后端按 tenant 过滤；PLATFORM_ADMIN 必须传，TENANT_ADMIN 可不传（自动用本公司） */
  tenantId?: string | number;
  /** 1=启用 0=禁用；undefined 表示全部 */
  status?: number;
  page?: number;
  pageSize?: number;
};

export type PageUserResponseData = {
  list: UserResponse[];
  total: number;
  page: number;
  pageSize: number;
};
