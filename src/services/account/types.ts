/** 平台编码，与后端 Platform.code 一致 */
export type PlatformCode = 'douyin' | 'xiaohongshu';

export const PLATFORM_CODE = {
  DOUYIN: 'douyin',
  XIAOHONGSHU: 'xiaohongshu',
} as const satisfies Record<string, PlatformCode>;

export type AccountLoginPlatformAvailability = 'enabled' | 'disabled';

export type AccountLoginPlatformOption = {
  value: PlatformCode;
  label: string;
  availability: AccountLoginPlatformAvailability;
  disabledReason?: string;
};

export const ACCOUNT_LOGIN_PLATFORM_OPTIONS: AccountLoginPlatformOption[] = [
  {
    value: PLATFORM_CODE.DOUYIN,
    label: '抖音',
    availability: 'enabled',
  },
  {
    value: PLATFORM_CODE.XIAOHONGSHU,
    label: '小红书',
    availability: 'disabled',
    disabledReason: '因封控原因暂时下线',
  },
];

/** 与后端 `AccountStatus` 枚举 JSON 序列化值一致 */
export type AccountStatusCode = 'ONLINE' | 'STOPPED' | 'INVALID';

export const ACCOUNT_STATUS_CODE = {
  ONLINE: 'ONLINE',
  STOPPED: 'STOPPED',
  INVALID: 'INVALID',
} as const satisfies Record<string, AccountStatusCode>;

/** ProTable 筛选等与后端查询参数对齐 */
export const ACCOUNT_STATUS_CODE_VALUE_ENUM = {
  ONLINE: { text: '在线' },
  STOPPED: { text: '已停止' },
  INVALID: { text: '失效' },
} as const;

/** 账号操作日志类型 */
export type AccountLogOperationCode =
  | 'START'
  | 'STOP'
  | 'DELETE'
  | 'LOGIN'
  | 'EXPIRED'
  | 'ASSIGN_OWNER'
  | 'RECLAIM_OWNER'
  | 'TRANSFER_OWNER';

export const ACCOUNT_LOG_OPERATION_CODE = {
  START: 'START',
  STOP: 'STOP',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  EXPIRED: 'EXPIRED',
  ASSIGN_OWNER: 'ASSIGN_OWNER',
  RECLAIM_OWNER: 'RECLAIM_OWNER',
  TRANSFER_OWNER: 'TRANSFER_OWNER',
} as const satisfies Record<string, AccountLogOperationCode>;

/** 登录会话状态 */
export type LoginSessionStatusCode =
  | 'WAITING_SCAN'
  | 'NEED_AUTH'
  | 'SUCCESS'
  | 'EXPIRED'
  | 'FAILED';

export const LOGIN_SESSION_STATUS_CODE = {
  WAITING_SCAN: 'WAITING_SCAN',
  NEED_AUTH: 'NEED_AUTH',
  SUCCESS: 'SUCCESS',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
} as const satisfies Record<string, LoginSessionStatusCode>;

export type LoginNextAuthStep = 'NONE' | 'SMS' | 'OTHER';

/** 错误信息 */
export type ErrorInfo = {
  field: string;
  message: string;
};

/** 登录地区代码（城市级），如 `CQ`、`BJ`、`SZ` */
export type RegionCode = string;

export type City = {
  code: RegionCode;
  name: string;
  enabled: boolean;
  sortOrder: number;
};

export type Province = {
  code: RegionCode;
  name: string;
  isMunicipality: boolean;
  enabled: boolean;
  sortOrder: number;
  cities: City[];
};

export type RegionDictionaryData = {
  provinces: Province[];
  defaultCityCode: RegionCode | null;
  updatedAt: string | null;
};

/** 账号状态是否可以删除（STOPPED、INVALID 可删） */
export function accountStatusCanDelete(status: AccountStatusCode): boolean {
  return (
    status === ACCOUNT_STATUS_CODE.STOPPED ||
    status === ACCOUNT_STATUS_CODE.INVALID
  );
}

/** @deprecated 使用 accountStatusCanDelete 代替 */
export const accountRunStatusCanDelete = (status: string): boolean => {
  return status === 'STOPPED' || status === 'INVALID';
};

export type AccountQueryParams = {
  platform?: PlatformCode;
  status?: AccountStatusCode;
  keyword?: string;
  page?: number;
  pageSize?: number;
};

export type AccountLogQueryParams = {
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
};

export type VerifyCodeRequest = {
  platform: string;
  phoneNumber: string;
  region: RegionCode;
  /**
   * reactivate 流程目标账号 id；新增流程留空。
   * 后端据此切换："跳过手机号重复校验 + 校验账号 INVALID + (platform, phoneNumber) 一致"。
   */
  accountId?: string;
};

export type SubmitCodeRequest = {
  platform: string;
  phoneNumber: string;
  code: string;
  requestId: string;
  region: RegionCode;
  /** 与 VerifyCodeRequest.accountId 含义一致；submit 也校验是为防止前端绕过 verifyCode 直接 POST */
  accountId?: string;
};

export type ReactivateInitResponse = {
  accountId: string;
  platform: PlatformCode;
  phoneNumber: string;
  nickname: string;
};

export type RefreshQrCodeRequest = {
  sessionId: string;
};

export type InitQrLoginRequest = {
  platform: string;
  accountId?: string;
};

export type QrLoginInitResponse = {
  sessionId: string;
  qrCodeUrl: string;
  expireSeconds: number;
  nextAuthStep: LoginNextAuthStep;
};

export type AuthSubmitRequest = {
  sessionId: string;
  authType: Exclude<LoginNextAuthStep, 'NONE'>;
  code?: string;
  accountId?: string;
};

export type AuthSubmitResponse = {
  status: 'SUCCESS';
};

export type BatchOperationRequest = {
  ids: string[];
};

export type VerifyCodeResponse = {
  requestId: string;
  countdown: number;
};

export type QrCodeResponse = {
  flow: 'NEED_QR' | 'SMS_ONLY';
  sessionId: string;
  qrCodeUrl: string | null;
  expireSeconds: number | null;
};

/**
 * FAILED 状态时的原因码：
 * - `REACTIVATE_REJECTED`：reactivate 流程下扫码账号与原账号不一致 / 目标账号已不存在
 * - `ACCOUNT_NO_ALREADY_BOUND_GLOBAL`：新增流程下 browser-agent 返回的 account_no 已被其他管理员绑定
 *   （openspec change account-binding-uniqueness-fix）
 */
export type LoginFailureReason =
  | 'REACTIVATE_REJECTED'
  | 'ACCOUNT_NO_ALREADY_BOUND_GLOBAL';

export const LOGIN_FAILURE_REASON_MESSAGE: Record<LoginFailureReason, string> =
  {
    REACTIVATE_REJECTED: '扫码账号与原账号不一致，请重新扫码',
    ACCOUNT_NO_ALREADY_BOUND_GLOBAL:
      '该账号已被其他管理员绑定，如需迁移请联系管理员',
  };

export type LoginStatusResponse = {
  status: LoginSessionStatusCode;
  nextAuthStep?: LoginNextAuthStep;
  maskedPhone?: string | null;
  requestId?: string | null;
  authMessage?: string | null;
  account?: AccountResponse;
  /** FAILED 状态时的原因码，见 {@link LoginFailureReason} */
  failureReason?: LoginFailureReason | string | null;
};

export type AccountResponse = {
  id: string;
  accountNo: string;
  platform: PlatformCode;
  phoneNumber: string;
  nickname: string;
  avatar: string;
  status: AccountStatusCode;
  followers: string;
  posts: string;
  likes: string;
  /** 评审原型 V2.0：账号当前归属管理员。正式接口未定稿前仅作为可选字段展示。 */
  ownerUserId?: string | null;
  ownerName?: string | null;
  loginRegion: RegionCode | null;
  loginRegionName: string | null;
  tokenExpireAt: string;
  createdAt: string;
};

export type AccountLogResponse = {
  id: string;
  operation: AccountLogOperationCode;
  description: string;
  operator: string;
  createdAt: string;
};

export type BatchOperationResponse = {
  successCount: number;
  skippedCount: number;
};

export type PageDataAccountResponse = {
  list: AccountResponse[];
  page: number;
  pageSize: number;
  total: string;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PageDataAccountLogResponse = {
  list: AccountLogResponse[];
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
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
};

/** Result 包装类型 */
export type ResultVoid = ResultBase & {
  data: null;
};

export type ResultRegionDictionary = ResultBase & {
  data: RegionDictionaryData;
};

export type ResultVerifyCodeResponse = ResultBase & {
  data: VerifyCodeResponse;
};

export type ResultQrCodeResponse = ResultBase & {
  data: QrCodeResponse;
};

export type ResultQrLoginInitResponse = ResultBase & {
  data: QrLoginInitResponse;
};

export type ResultAuthSubmitResponse = ResultBase & {
  data: AuthSubmitResponse;
};

export type ResultLoginStatusResponse = ResultBase & {
  data: LoginStatusResponse;
};

export type ResultAccountResponse = ResultBase & {
  data: AccountResponse;
};

export type ResultPageAccountResponse = ResultBase & {
  data: PageDataAccountResponse;
};

export type ResultPageAccountLogResponse = ResultBase & {
  data: PageDataAccountLogResponse;
};

export type ResultBatchOperationResponse = ResultBase & {
  data: BatchOperationResponse;
};

export type ResultReactivateInitResponse = ResultBase & {
  data: ReactivateInitResponse;
};

/** @deprecated 使用 AccountStatusCode 代替 */
export type AccountRunStatus = AccountStatusCode;

/** @deprecated 使用 ACCOUNT_STATUS_CODE 代替 */
export const ACCOUNT_RUN_STATUS = ACCOUNT_STATUS_CODE;

/** @deprecated 使用 ACCOUNT_STATUS_CODE_VALUE_ENUM 代替 */
export const ACCOUNT_RUN_STATUS_VALUE_ENUM = ACCOUNT_STATUS_CODE_VALUE_ENUM;
