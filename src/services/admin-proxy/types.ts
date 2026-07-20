/**
 * 外部矩阵服务代理相关类型。对应后端 admin-api.yaml 1.4.0（MatrixProxy tag）。
 *
 * 阶段①前端：rechargeTenant（公司列表的"充值"按钮）。
 * 阶段④前端：balance / consume / recharge-log 查询，撑起 PRD §3.3 全局积分 + §4.2 积分明细两个页面。
 */

export type RechargeTenantRequest = {
  /** 充值积分；后端 @Min(1) */
  points: number;
  /** 操作备注；可选，最多 200 字符；非空时拼入操作日志内容（备注：xxx） */
  remark?: string;
};

/** 公司余额（/api/v1/admin/proxy/balance） */
export type MatrixBalanceResponse = {
  /** 脱敏 api_key（后 4 位 + 前 4 位） */
  apiKeyMasked: string | null;
  /**
   * 套餐积分（创建公司时按套餐一次性赋值，PRD §3.3 永久固定）。
   * 后端从 tenant.package_id → package.points 取，与上游账本无关；本地缺失时为 null。
   * 直接展示此字段；**不要**再用 totalPoints + totalConsume − totalRecharge 反推
   * （上游退款只回填 totalPoints / totalRefund，不冲减 totalConsume，反推会把退款误算进套餐积分）。
   */
  packagePoints: number | null;
  /** 总剩余积分 = 套餐 + 充值 - 历史累计消费 */
  totalPoints: number | null;
  /** 累计充值（已扣减退款，即真实充值净值）。 */
  totalRecharge: number | null;
  /** 累计退款（= 上游 refundDetail 三项之和）。仅供展示，无需再从 totalRecharge 中扣减。 */
  totalRefund: number | null;
  /** 累计消费 */
  totalConsume: number | null;
  /** 本月消耗：当前自然月累计消耗积分（PRD §3.3）。上游不返回时为 null。 */
  monthConsume: number | null;
  /** 免费视频已用次数（全公司共 3 次） */
  freeVideoUsed: number | null;
  /** 免费视频剩余次数 */
  freeVideoRemaining: number | null;
  /** api_key 状态：1=ACTIVE 0=DISABLED */
  status: number | null;
};

/** 通用流水记录（消费 / 充值共用） */
export type MatrixRecordResponse = {
  id: string;
  apiKeyMasked: string | null;
  /** 变更积分；消费为负、充值为正 */
  changePoints: number;
  remark: string | null;
  taskId: string | null;
  createTime: string;
  /**
   * 操作人姓名（消费流水专用）。后端通过 taskId 反查 content_generation_log.user_id 再查 sys_user 得到；
   * 查不到（如充值流水 / 上游历史数据）时为 null，前端按"-"占位。
   */
  operatorName?: string | null;
};

export type ProxyPageData<T> = {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
};

/** 全局积分总览：单行公司 + 余额聚合（/api/v1/admin/proxy/tenants/balances） */
export type TenantBalanceResponse = {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  status: 'ACTIVE' | 'DISABLED';
  packagePoints: number | null;
  apiKeyMasked: string | null;
  totalPoints: number | null;
  /** 累计充值（已扣减退款，即真实充值净值）。 */
  totalRecharge: number | null;
  /** 累计退款（= 上游 refundDetail 三项之和）。仅供展示，无需再从 totalRecharge 中扣减。 */
  totalRefund: number | null;
  totalConsume: number | null;
  /** 本月消耗：当前自然月累计消耗积分（PRD §3.3）。上游不返回时为 null，前端按 "-" 占位。 */
  monthConsume: number | null;
  freeVideoUsed: number | null;
  freeVideoRemaining: number | null;
  /** 该公司管理员总数（TA + 普通管理员；与公司管理列表的 adminCount 同源） */
  adminCount: number | null;
  /** 上游 api_key 业务状态：1=ACTIVE 0=DISABLED；上游失败时 null */
  balanceStatus: number | null;
  /** 该行余额拉取失败时的错误码字符串；成功为 null */
  balanceError: string | null;
};

export type TenantBalanceQueryParams = {
  page?: number;
  pageSize?: number;
  status?: 'ACTIVE' | 'DISABLED';
  keyword?: string;
};

export type ProxyPageDataTenantBalance = {
  list: TenantBalanceResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

/** 流水查询参数（消费 / 充值通用） */
export type MatrixRecordQueryParams = {
  /** 平台管理员必传；租户管理员/普通管理员忽略 */
  tenantId?: string;
  current?: number;
  size?: number;
  /** 区间起，本地时间字面量 YYYY-MM-DD HH:mm:ss（上游不识别时区 / Z 后缀） */
  startTime?: string;
  /** 区间止，本地时间字面量 YYYY-MM-DD HH:mm:ss */
  endTime?: string;
  /** 仅消费流水：内容类型筛选，如 'VIDEO' / 'IMAGE' */
  type?: string;
  taskId?: string;
  /**
   * 仅消费流水：PRD §4.2 普通管理员维度筛选；后端按 taskId → user_id 反查后本地过滤。
   * "全部" 时省略该参数；选择具体管理员时传其 sys_user.id。
   */
  userId?: string | number;
};
