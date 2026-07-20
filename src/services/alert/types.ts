export type WarningState =
  | 'PENDING_UNREAD'
  | 'PENDING_READ'
  | 'IGNORED'
  | 'RESOLVED';

export const WARNING_STATE = {
  PENDING_UNREAD: 'PENDING_UNREAD',
  PENDING_READ: 'PENDING_READ',
  IGNORED: 'IGNORED',
  RESOLVED: 'RESOLVED',
} as const satisfies Record<string, WarningState>;

export type WarningLevel = 'HIGH' | 'MEDIUM' | 'NORMAL';

export const WARNING_LEVEL = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  NORMAL: 'NORMAL',
} as const satisfies Record<string, WarningLevel>;

export type WarningCategory =
  | 'all'
  | 'ACCOUNT_EXCEPTION'
  | 'CONTENT_EXCEPTION'
  | 'FOLLOWER_EXCEPTION';

export const WARNING_CATEGORY = {
  ALL: 'all',
  ACCOUNT_EXCEPTION: 'ACCOUNT_EXCEPTION',
  CONTENT_EXCEPTION: 'CONTENT_EXCEPTION',
  FOLLOWER_EXCEPTION: 'FOLLOWER_EXCEPTION',
} as const satisfies Record<string, WarningCategory>;

export type BatchOperationType = 'MARK_ALL_READ' | 'CLEAR_IGNORED';

export const BATCH_OPERATION_TYPE = {
  MARK_ALL_READ: 'MARK_ALL_READ',
  CLEAR_IGNORED: 'CLEAR_IGNORED',
} as const satisfies Record<string, BatchOperationType>;

export type ErrorInfo = {
  field: string;
  message: string;
};

export type ResultBase = {
  code: number;
  success: boolean;
  message: string;
  ts: string;
};

export type WarningItem = {
  warningId: string;
  accountId: string;
  contentId?: string;
  accountName: string;
  platform: 'douyin' | 'xiaohongshu';
  level: WarningLevel;
  category: WarningCategory;
  eventType: string;
  message: string;
  state: WarningState;
  createdAt: string;
};

export type WarningSummary = {
  totalPending: string;
  unreadPending: string;
  abnormalAccountCount: string;
};

export type PageWarningItem = {
  list: WarningItem[];
  page: number;
  pageSize: number;
  total: string;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type WarningListResponse = {
  summary: WarningSummary;
  pageData: PageWarningItem;
};

export type WarningStateChangeResponse = {
  warningId: string;
  oldState: WarningState;
  newState: WarningState;
};

export type BatchWarningOperationResponse = {
  affectedCount: string;
  operation: BatchOperationType;
};

export type ResultWarningListResponse = ResultBase & {
  data: WarningListResponse;
};

export type ResultWarningStateChangeResponse = ResultBase & {
  data: WarningStateChangeResponse;
};

export type ResultBatchWarningOperationResponse = ResultBase & {
  data: BatchWarningOperationResponse;
};

/**
 * 预警接口的平台过滤值；与 statistics 模块 PlatformFilter 同语义。
 * 'all' / undefined 时不传 platform，后端走"不限平台"分支。
 */
export type WarningPlatformFilter = 'all' | 'douyin' | 'xiaohongshu';

export type WarningListQueryParams = {
  type?: WarningCategory;
  keyword?: string;
  /**
   * 平台过滤；与 /api/v1/datacenter/overview 同口径——指定具体平台时，
   * 后端 SHALL 把列表 + summary + 批量操作都限定到该平台下的可见账号集。
   * 'all' 或 undefined 时不传 platform query。
   */
  platform?: WarningPlatformFilter;
  page?: number;
  pageSize?: number;
  /**
   * 预警状态过滤数组
   * - 默认后端只返回 PENDING_UNREAD 和 PENDING_READ 状态的预警
   * - 如需查看已忽略的预警，需要传递包含 'IGNORED' 的状态数组
   * @example status=['PENDING_UNREAD', 'PENDING_READ', 'IGNORED'] 查看所有未处理和已忽略的预警
   */
  status?: WarningState[];
};
