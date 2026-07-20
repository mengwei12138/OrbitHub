/** 管理员角色枚举 */
export type AdminRole = 'TENANT_ADMIN' | 'NORMAL_ADMIN';

export const ADMIN_ROLE = {
  TENANT_ADMIN: 'TENANT_ADMIN',
  NORMAL_ADMIN: 'NORMAL_ADMIN',
} as const satisfies Record<string, AdminRole>;

export const ADMIN_ROLE_VALUE_ENUM = {
  TENANT_ADMIN: { text: '租户管理员' },
  NORMAL_ADMIN: { text: '普通管理员' },
} as const;

/** 管理员状态枚举 */
export type AdminStatus = 'ENABLED' | 'DISABLED' | 'FROZEN';

export const ADMIN_STATUS = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
  FROZEN: 'FROZEN',
} as const satisfies Record<string, AdminStatus>;

export const ADMIN_STATUS_VALUE_ENUM = {
  ENABLED: { text: '启用', status: 'Enable' },
  DISABLED: { text: '禁用', status: 'Disable' },
  FROZEN: { text: '冻结', status: 'Error' },
} as const;

/** 管理员查询参数 */
export type AdminQueryParams = {
  status?: AdminStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
};

/** 管理员响应数据 */
export type AdminResponse = {
  id: string;
  name: string;
  phone: string;
  role: AdminRole;
  status: AdminStatus;
  createdSocialAccounts: number;
  socialAccountLimit: number;
  lastLoginAt: string | null;
  createdAt: string;
};

/** 租户信息响应数据 */
export type TenantInfoResponse = {
  usedAccounts: number;
  totalAccounts: number;
  packageName: string;
};

/** 创建管理员请求 */
export type CreateAdminRequest = {
  name: string;
  phone: string;
  status: AdminStatus;
  socialAccountLimit: number;
};

/** 更新管理员请求 */
export type UpdateAdminRequest = {
  name: string;
  status: AdminStatus;
  socialAccountLimit: number;
};

/** 分页数据响应 */
export type PageDataAdminResponse = {
  list: AdminResponse[];
  page: number;
  pageSize: number;
  total: string;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

/** 统一响应体基础结构 */
export type ResultBase = {
  code: number;
  success: boolean;
  message: string;
  errors?: { field: string; message: string }[];
  detail?: string;
  ts: string;
};

/** Result 包装类型 */
export type ResultVoid = ResultBase & {
  data: null;
};

export type ResultAdminResponse = ResultBase & {
  data: AdminResponse;
};

export type ResultPageAdminResponse = ResultBase & {
  data: PageDataAdminResponse;
};

export type ResultTenantInfoResponse = ResultBase & {
  data: TenantInfoResponse;
};
