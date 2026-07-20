/**
 * 个人配额（admin-user-quota）。对应后端 admin-api.yaml 1.6.0（UserQuota tag）。
 *
 * PRD §4.1 普通管理员管理底部展示「已绑定 X / 已分配 Y / 总上限 Z」三段；
 * 新建 / 编辑普通管理员的「社交账号创建上限」字段写入用 assignQuota。
 *
 * 三段口径：
 *   已绑定 (totalBoundCount) = 公司下未软删的社交账号总数（PRD §3.2「已使用」）
 *   已分配 (totalAssigned)   = ∑ 各管理员的 personalQuota（PRD §4.1「所有个人上限之和」）
 *   总上限 (packageLimit)    = 公司当前套餐的社交账号总上限（PRD §1.3）
 *
 * 不变式（业务流保证）：已绑定 ≤ 已分配 ≤ 总上限
 */

export type QuotaAssignment = {
  userId: string;
  username: string;
  personalQuota: number;
};

export type QuotaSummary = {
  tenantId: string;
  /** 公司当前套餐名称（PRD §1.3：标准版/专业版/企业版），未关联套餐时为 null */
  packageName: string | null;
  /** 公司当前套餐的社交账号总上限（社交账号数） */
  packageLimit: number;
  /** 已分配总和 = ∑ user_relation.personal_quota；被禁用账号的 quota 已置 0 不计入 */
  totalAssigned: number;
  /** 已绑定数 = 公司下未软删的社交账号总数（PRD §3.2「已使用」口径） */
  totalBoundCount: number;
  /** 剩余可分配（packageLimit - totalAssigned） */
  available: number;
  /**
   * 公司当前套餐的管理员总席位上限（PRD §1.3 / §4.1，含租户管理员自身）。
   * 普通管理员可创建数 = normalAdminLimit - 1（TA 固定占 1 席）。
   * 标准版 0 / 专业版 3 / 企业版 10。
   */
  normalAdminLimit: number;
  /** 本公司当前已创建的管理员数量（含 TA + 已建 NA，含被禁用） */
  normalAdminCount: number;
  /** 各管理员个人上限明细 */
  assignments: QuotaAssignment[];
};

export type AssignQuotaRequest = {
  personalQuota: number;
};

/**
 * 当前登录用户的个人配额状态——/api/v1/admin/users/me/quota-status 的响应。
 * 用于「添加账号」页加载时判断 是否还允许再绑社交账号。
 */
export type PersonalQuotaStatus = {
  /** -1 表示无限制（PLATFORM_ADMIN 或未配置 user_relation） */
  personalQuota: number;
  /** 该用户名下未软删 account 行数 */
  currentBoundCount: number;
  /** 还可再绑数量；无限制时为 null */
  available: number | null;
  /** personalQuota === -1 时为 true */
  unlimited: boolean;
};
