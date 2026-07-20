/**
 * 公司（tenant）相关类型定义。对应后端 admin-api.yaml 1.4.0
 * (Tenant tag 下的所有端点)。
 *
 * 注：内部命名"tenant"，对外 UI 文案叫"公司"。详见 ADR-0014。
 */

export type TenantStatus = 'ACTIVE' | 'DISABLED';

export type TenantResponse = {
  id: string;
  name: string;
  code: string;
  status: TenantStatus;
  contactName: string | null;
  contactPhone: string | null;
  packageId: string;
  packageName: string | null;
  /** 套餐积分（创建时一次性赋值；PRD §3.3） */
  packagePoints: number | null;
  apiKeyMasked: string | null;
  /** 管理员总数（PRD §3.2：租户管理员 + 普通管理员）；后端 join user_relation 算出 */
  adminCount: number | null;
  /** 管理员总席位上限（= 套餐 normal_admin_limit，含 TA）；PRD §3.2 列表展示 adminCount / adminLimit */
  adminLimit: number | null;
  /** 社交账号池已分配给下属管理员的总额度 */
  socialPoolAllocated: number | null;
  /** 社交账号池上限（= 套餐 social_account_limit） */
  socialPoolLimit: number | null;
  /** 已绑定的社交账号数：该公司当前所有未被软删除的社交账号总数（含所有普通管理员名下） */
  socialPoolBound: number | null;
  createdAt: string;
  updatedAt: string;

  // ────── 余额聚合字段（仅 withBalance=true 时返回；其余请求字段不存在或为 null） ──────
  /** 累计充值积分（来自外部 /balance.totalRecharge，已扣减退款，即真实充值净值）。 */
  totalRecharge?: number | null;
  /** 累计退款（= 上游 refundDetail 三项之和）。仅供展示，无需再从 totalRecharge 中扣减。 */
  totalRefund?: number | null;
  /** 总剩余（来自外部 /balance.totalPoints）。 */
  totalPoints?: number | null;
  /** 本月消耗（后端聚合上游 /points/consume 当月记录绝对值求和）。 */
  monthConsume?: number | null;
  freeVideoUsed?: number | null;
  freeVideoRemaining?: number | null;
  /** 余额状态（上游 /balance.status，1=正常 等）。 */
  balanceStatus?: number | null;
  /** 余额拉取失败的错误码；成功时省略。 */
  balanceError?: string | null;
  /** 本月消耗聚合失败的错误码；成功时省略（与 balanceError 相互独立）。 */
  monthConsumeError?: string | null;
};

export type PageTenantResponseData = {
  list: TenantResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type TenantListQueryParams = {
  page?: number;
  pageSize?: number;
  status?: TenantStatus;
  keyword?: string;
  /** 套餐 id；不传或为空表示「全部」。后端 @RequestParam packageId */
  packageId?: string | number;
  /**
   * true 时后端会对本页每行调外部 /balance + 聚合本月消耗，响应行携带
   * totalRecharge / totalPoints / monthConsume / freeVideo* / balanceStatus
   * 等额外字段。命中后端 Redis 缓存（10s TTL）的请求不会触发外部 HTTP。
   * 默认 false：保持轻量响应，所有不需要余额的调用方零开销。
   */
  withBalance?: boolean;
};

/** 控制台运营看板统计响应。 */
export type TenantStatsResponse = {
  total: number;
  thisMonthCreated: number;
  lastMonthCreated: number;
  /** 月环比差值，可正可负，0 持平 */
  monthDelta: number;
};

export type CreateTenantRequest = {
  name: string;
  code: string;
  packageId: string | number;
  contactName?: string;
  contactPhone?: string;
};

export type UpdateTenantRequest = {
  name: string;
  packageId: string | number;
  contactName?: string;
  contactPhone?: string;
};
