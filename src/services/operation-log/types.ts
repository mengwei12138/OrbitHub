/**
 * 操作日志相关类型。对应后端 admin-api.yaml 1.4.0（OperationLog tag）。
 *
 * 字段命名对齐后端 OperationLogResponse：
 * - 操作人 = userId（后端返回 id；展示名/角色由前端 join 用户列表）
 * - 所属公司 = tenantId（前端 join 公司列表展示 name）
 * - "操作内容" 直接展示后端拼好的 operationContent（已含「字段: 原值 → 新值」格式）
 */

export type OperationLogResponse = {
  id: string;
  userId: string | null;
  /** 写时快照的操作人展示串（"超管" / "{tenantName} 租户管理员" 等）。null 表示历史数据未回填或匿名 → 前端展示"系统"。 */
  operatorLabel: string | null;
  tenantId: string | null;
  /** 操作类型枚举码，后端规约见 OPERATION_LOG_OPERATION_TYPE_VALUE_ENUM */
  operationType: string;
  operationContent: string | null;
  targetId: string | null;
  targetName: string | null;
  ip: string | null;
  userAgent: string | null;
  /** ISO 8601 */
  createdAt: string;
};

/** 列表查询参数（与后端 query string 对齐） */
export type OperationLogQueryParams = {
  userId?: string;
  /** 操作人模糊关键字（匹配 username/phoneNumber 子串）。 */
  userKeyword?: string;
  tenantId?: string;
  operationType?: string;
  /** ISO 8601 区间起 */
  startTime?: string;
  /** ISO 8601 区间止 */
  endTime?: string;
  page?: number;
  pageSize?: number;
};

export type PageOperationLogResponseData = {
  list: OperationLogResponse[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * 操作类型枚举（与 OperationLogAspect 内部约定的码值对齐）。
 * 命中未列出的类型时 OperationTypeTag 会原样回显码值。
 */
// 与后端 @OperationLog(operationType=...) 注解字面值严格对齐
export const OPERATION_LOG_OPERATION_TYPE_VALUE_ENUM = {
  'admin.tenant.create': { text: '新增公司' },
  'admin.tenant.update': { text: '编辑公司' },
  'admin.tenant.disable': { text: '禁用公司' },
  'admin.tenant.enable': { text: '启用公司' },
  'admin.proxy.tenant-recharge': { text: '手动充值' },
  'admin.user.create': { text: '新增管理员' },
  'admin.user.update': { text: '编辑管理员' },
  'admin.user.disable': { text: '禁用管理员' },
  'admin.user.enable': { text: '启用管理员' },
  'admin.user.reset-password': { text: '重置密码' },
  'admin.user-quota.assign': { text: '设置社交账号上限' },
  'admin.user.delete': { text: '删除管理员' },
  'admin.package.create': { text: '新增套餐' },
  'admin.package.update': { text: '编辑套餐' },
  'admin.package.delete': { text: '删除套餐' },
  'admin.tenant.package-change': { text: '套餐变更' },
  'account.owner.assign': { text: '社交账号分配' },
  'account.owner.reclaim': { text: '社交账号收回' },
  'account.owner.transfer': { text: '社交账号移交' },
  'ai-assistant.rule.update': { text: 'AI助手规则变更' },
  'admin.role-permission.assign': { text: '角色权限调整' },
} as const satisfies Record<string, { text: string }>;

export type OperationLogOperationType =
  keyof typeof OPERATION_LOG_OPERATION_TYPE_VALUE_ENUM;
