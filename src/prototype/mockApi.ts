import type {
  AxiosAdapter,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

type PageData<T> = {
  list: T[];
  page: number;
  pageSize: number;
  total: number | string;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
};

const now = '2026-06-15 10:30:00';

type PrototypeRole = 'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'NORMAL_ADMIN';

const ROLE_KEY = 'mh-prototype-role';
const ACCOUNT_REQUEST_STORAGE_KEY = 'mh-prototype-account-requests';
const AI_ASSISTANT_WORKSPACE_STORAGE_KEY = 'mh-prototype-ai-assistant-workspace';
const AI_ASSISTANT_WORKSPACE_REVIEW_VERSION = '2026-07-08-review-flags-v1';

const userIdByRole: Record<PrototypeRole, string> = {
  PLATFORM_ADMIN: 'user-platform',
  TENANT_ADMIN: 'user-tenant',
  NORMAL_ADMIN: 'user-normal',
};

const getPrototypeRole = (): PrototypeRole => {
  const saved = window.localStorage.getItem(ROLE_KEY);
  if (
    saved === 'PLATFORM_ADMIN' ||
    saved === 'TENANT_ADMIN' ||
    saved === 'NORMAL_ADMIN'
  ) {
    return saved;
  }
  return 'TENANT_ADMIN';
};

const getCurrentUserId = () => userIdByRole[getPrototypeRole()];

const page = <T>(list: T[]): PageData<T> => ({
  list,
  page: 1,
  pageSize: 10,
  total: list.length,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
});

type AccountRequestRecord = {
  id: string;
  realName: string;
  phone: string;
  company: string | null;
  status: 'PENDING' | 'REVIEWED';
  createdAt: string;
};

type AiAssistantKnowledgeFileRecord = {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  createdAt: string;
  summary: string;
};

type AiAssistantGroupRecord = {
  id: string;
  name: string;
  accountIds: string[];
  autoReplyEnabled: boolean;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  knowledgeFiles: AiAssistantKnowledgeFileRecord[];
};

type AiAssistantMessageRecord = {
  id: string;
  senderType: 'CUSTOMER' | 'OPERATOR' | 'AI';
  senderName: string;
  text: string;
  createdAt: string;
};

type AiAssistantConversationRecord = {
  id: string;
  accountId: string;
  senderName: string;
  senderAvatar?: string | null;
  unreadCount: number;
  messages: AiAssistantMessageRecord[];
};

type AiAssistantWorkspaceState = {
  reviewVersion?: string;
  groups: AiAssistantGroupRecord[];
  conversations: AiAssistantConversationRecord[];
};

const readAccountRequests = (): AccountRequestRecord[] => {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_REQUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AccountRequestRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAccountRequests = (list: AccountRequestRecord[]) => {
  window.localStorage.setItem(
    ACCOUNT_REQUEST_STORAGE_KEY,
    JSON.stringify(list),
  );
};

const createMockId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildKnowledgeSummary = (fileName: string) => {
  const cleaned = fileName.replace(/\.[^.]+$/u, '');
  return `${cleaned}中的产品规则、售后口径与常见问题已同步到当前分组知识库，可直接用于私信回复。`;
};

const isConversationUrgent = (messages: AiAssistantMessageRecord[]) =>
  messages.slice(-3).length === 3 &&
  messages.slice(-3).every((message) => message.senderType === 'CUSTOMER');

const compareDateTimeDesc = (left: string, right: string) =>
  right.localeCompare(left);

const compareReviewPriority = <
  T extends { unreadCount?: number; lastMessageAt?: string; updatedAt?: string },
>(
  left: T,
  right: T,
  options?: { leftUrgent?: boolean; rightUrgent?: boolean },
) => {
  const leftUrgent = options?.leftUrgent ? 1 : 0;
  const rightUrgent = options?.rightUrgent ? 1 : 0;
  if (rightUrgent !== leftUrgent) {
    return rightUrgent - leftUrgent;
  }
  const leftUnread = left.unreadCount ?? 0;
  const rightUnread = right.unreadCount ?? 0;
  if (rightUnread !== leftUnread) {
    return rightUnread - leftUnread;
  }
  const leftTime = left.lastMessageAt ?? left.updatedAt ?? '';
  const rightTime = right.lastMessageAt ?? right.updatedAt ?? '';
  return compareDateTimeDesc(leftTime, rightTime);
};

const createInitialAiAssistantWorkspace = (): AiAssistantWorkspaceState => ({
  reviewVersion: AI_ASSISTANT_WORKSPACE_REVIEW_VERSION,
  groups: [
    {
      id: 'group-001',
      name: '抖音门店咨询',
      accountIds: ['acc-001', 'acc-007'],
      autoReplyEnabled: true,
      unreadCount: 3,
      createdAt: '2026-06-10 09:00:00',
      updatedAt: '2026-06-15 10:00:00',
      knowledgeFiles: [
        {
          id: 'kb-001',
          fileName: '门店客服话术.pdf',
          fileType: 'application/pdf',
          fileSizeBytes: 236000,
          createdAt: '2026-06-12 11:00:00',
          summary: '包含门店营业时间、到店流程、优惠券说明与常见售后口径。',
        },
        {
          id: 'kb-002',
          fileName: '活动商品知识库.docx',
          fileType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSizeBytes: 128000,
          createdAt: '2026-06-13 16:20:00',
          summary: '包含主推商品卖点、适用人群、价格区间与推荐回复模板。',
        },
      ],
    },
    {
      id: 'group-002',
      name: '活动咨询跟进',
      accountIds: ['acc-004'],
      autoReplyEnabled: false,
      unreadCount: 1,
      createdAt: '2026-06-11 14:00:00',
      updatedAt: '2026-06-15 09:50:00',
      knowledgeFiles: [
        {
          id: 'kb-003',
          fileName: '活动咨询FAQ.txt',
          fileType: 'text/plain',
          fileSizeBytes: 3200,
          createdAt: '2026-06-14 10:30:00',
          summary: '包含活动规则、到店路径、核销说明与售后常见问题。',
        },
      ],
    },
  ],
  conversations: [
    {
      id: 'conv-001',
      accountId: 'acc-001',
      senderName: 'Naomi WU',
      senderAvatar: null,
      unreadCount: 2,
      messages: [
        {
          id: 'msg-001',
          senderType: 'AI',
          senderName: 'OrbitHub AI',
          text: '您好，欢迎咨询门店活动与营业时间，我可以先为您整理基础信息。',
          createdAt: '2026-06-15 09:42:00',
        },
        {
          id: 'msg-002',
          senderType: 'CUSTOMER',
          senderName: 'Naomi WU',
          text: '你好，周末到店有没有活动？',
          createdAt: '2026-06-15 09:48:00',
        },
        {
          id: 'msg-003',
          senderType: 'CUSTOMER',
          senderName: 'Naomi WU',
          text: '好的，再告诉我营业时间。',
          createdAt: '2026-06-15 10:05:00',
        },
        {
          id: 'msg-004',
          senderType: 'CUSTOMER',
          senderName: 'Naomi WU',
          text: '我这边现在比较急，麻烦尽快回复。',
          createdAt: '2026-06-15 10:10:00',
        },
      ],
    },
    {
      id: 'conv-002',
      accountId: 'acc-007',
      senderName: 'Alice L',
      senderAvatar: null,
      unreadCount: 1,
      messages: [
        {
          id: 'msg-005',
          senderType: 'CUSTOMER',
          senderName: 'Alice L',
          text: '你们家现在主推哪款套餐？',
          createdAt: '2026-06-15 09:20:00',
        },
        {
          id: 'msg-006',
          senderType: 'AI',
          senderName: 'OrbitHub AI',
          text: '当前主推双人到店套餐和新品体验套餐，可根据预算给您推荐。',
          createdAt: '2026-06-15 09:21:00',
        },
      ],
    },
    {
      id: 'conv-003',
      accountId: 'acc-004',
      senderName: 'Jason Cheng',
      senderAvatar: null,
      unreadCount: 1,
      messages: [
        {
          id: 'msg-007',
          senderType: 'CUSTOMER',
          senderName: 'Jason Cheng',
          text: '今天活动券还能用吗？',
          createdAt: '2026-06-15 09:32:00',
        },
      ],
    },
    {
      id: 'conv-005',
      accountId: 'acc-007',
      senderName: 'Mia Zhou',
      senderAvatar: null,
      unreadCount: 0,
      messages: [
        {
          id: 'msg-009',
          senderType: 'CUSTOMER',
          senderName: 'Mia Zhou',
          text: '我想了解下你们的周末套餐。',
          createdAt: '2026-06-15 09:24:00',
        },
        {
          id: 'msg-010',
          senderType: 'OPERATOR',
          senderName: '租户管理员',
          text: '周末套餐分为双人体验和家庭组合两档，预算不同可以给您细分推荐。',
          createdAt: '2026-06-15 09:28:00',
        },
      ],
    },
    {
      id: 'conv-004',
      accountId: 'acc-004',
      senderName: 'Judy Y.',
      senderAvatar: null,
      unreadCount: 1,
      messages: [
        {
          id: 'msg-008',
          senderType: 'CUSTOMER',
          senderName: 'Judy Y.',
          text: '请问图里的同款还有现货吗？',
          createdAt: '2026-06-15 10:12:00',
        },
      ],
    },
  ],
});

const normalizeAiAssistantWorkspace = (
  workspace: AiAssistantWorkspaceState,
): AiAssistantWorkspaceState => {
  const initial = createInitialAiAssistantWorkspace();
  const normalizedGroups = [...workspace.groups];
  for (const seedGroup of initial.groups) {
    const existingIndex = normalizedGroups.findIndex((group) => group.id === seedGroup.id);
    if (existingIndex >= 0) {
      normalizedGroups[existingIndex] = {
        ...normalizedGroups[existingIndex],
        ...seedGroup,
      };
    } else {
      normalizedGroups.push(seedGroup);
    }
  }

  const normalizedConversations = [...workspace.conversations];
  for (const seedConversation of initial.conversations) {
    const existingIndex = normalizedConversations.findIndex(
      (conversation) => conversation.id === seedConversation.id,
    );
    if (existingIndex >= 0) {
      normalizedConversations[existingIndex] = {
        ...normalizedConversations[existingIndex],
        ...seedConversation,
      };
    } else {
      normalizedConversations.push(seedConversation);
    }
  }

  return {
    reviewVersion: AI_ASSISTANT_WORKSPACE_REVIEW_VERSION,
    groups: normalizedGroups,
    conversations: normalizedConversations,
  };
};

const readAiAssistantWorkspace = (): AiAssistantWorkspaceState => {
  try {
    const raw = window.localStorage.getItem(AI_ASSISTANT_WORKSPACE_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialAiAssistantWorkspace();
      window.localStorage.setItem(
        AI_ASSISTANT_WORKSPACE_STORAGE_KEY,
        JSON.stringify(initial),
      );
      return initial;
    }
    const parsed = JSON.parse(raw) as AiAssistantWorkspaceState;
    if (
      !parsed ||
      !Array.isArray(parsed.groups) ||
      !Array.isArray(parsed.conversations)
    ) {
      throw new Error('invalid workspace');
    }
    if (parsed.reviewVersion !== AI_ASSISTANT_WORKSPACE_REVIEW_VERSION) {
      const normalized = normalizeAiAssistantWorkspace(parsed);
      window.localStorage.setItem(
        AI_ASSISTANT_WORKSPACE_STORAGE_KEY,
        JSON.stringify(normalized),
      );
      return normalized;
    }
    return parsed;
  } catch {
    const initial = createInitialAiAssistantWorkspace();
    window.localStorage.setItem(
      AI_ASSISTANT_WORKSPACE_STORAGE_KEY,
      JSON.stringify(initial),
    );
    return initial;
  }
};

const writeAiAssistantWorkspace = (data: AiAssistantWorkspaceState) => {
  window.localStorage.setItem(
    AI_ASSISTANT_WORKSPACE_STORAGE_KEY,
    JSON.stringify(data),
  );
};

const paginate = <T>(
  list: T[],
  pageNumber: number,
  pageSize: number,
): PageData<T> => {
  const safePage = pageNumber > 0 ? pageNumber : 1;
  const safePageSize = pageSize > 0 ? pageSize : 10;
  const total = list.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / safePageSize);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;
  return {
    list: list.slice(start, end),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrevious: safePage > 1,
  };
};

const uploadSessions = new Map<
  string,
  {
    uploadSessionId: string;
    mediaAssetId: string;
    fileSizeBytes: string;
    mimeType: string;
    fileName: string;
  }
>();

type LoginSessionState = {
  sessionId: string;
  platform: 'douyin' | 'xiaohongshu';
  nextAuthStep: 'NONE' | 'SMS' | 'OTHER';
  requestId: string | null;
  maskedPhone: string | null;
  qrCodeUrl: string;
  expireSeconds: number;
  expiresAt: number;
  pollCount: number;
  accountId?: string;
};

const loginSessions = new Map<string, LoginSessionState>();

const escapeSvgText = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const createPrototypePreviewUrl = (
  mediaAssetId: string,
  mimeType: string,
  fileName: string,
) => {
  const isVideo = mimeType.startsWith('video/');
  const title = isVideo ? '视频素材' : '图片素材';
  const shortName =
    fileName.length > 14 ? `${fileName.slice(0, 11)}...` : fileName;
  const safeTitle = escapeSvgText(title);
  const safeShortName = escapeSvgText(shortName);
  const safeMediaAssetId = escapeSvgText(mediaAssetId);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="320" viewBox="0 0 240 320">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#dbeafe"/>
          <stop offset="100%" stop-color="#93c5fd"/>
        </linearGradient>
      </defs>
      <rect width="240" height="320" rx="18" fill="url(#bg)"/>
      <rect x="28" y="32" width="184" height="184" rx="14" fill="#ffffff" fill-opacity="0.72"/>
      <circle cx="82" cy="86" r="20" fill="#60a5fa"/>
      <path d="M44 190 L96 132 L130 168 L154 142 L204 190 Z" fill="#2563eb" fill-opacity="0.72"/>
      <text x="120" y="248" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#1e3a8a">${safeTitle}</text>
      <text x="120" y="274" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#1d4ed8">${safeShortName}</text>
      <text x="120" y="296" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#3b82f6">${safeMediaAssetId}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const maskPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber.length < 7) return phoneNumber;
  return `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-4)}`;
};

const createPrototypeQrCodeUrl = (platform: string, sessionId: string) => {
  const safePlatform = escapeSvgText(platform);
  const safeSessionId = escapeSvgText(sessionId.slice(-8));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="20" fill="#ffffff"/>
      <rect x="18" y="18" width="204" height="204" rx="16" fill="#eff6ff" stroke="#bfdbfe"/>
      <rect x="42" y="42" width="42" height="42" fill="#0f172a"/>
      <rect x="156" y="42" width="42" height="42" fill="#0f172a"/>
      <rect x="42" y="156" width="42" height="42" fill="#0f172a"/>
      <rect x="108" y="64" width="18" height="18" fill="#1d4ed8"/>
      <rect x="132" y="88" width="18" height="18" fill="#1d4ed8"/>
      <rect x="108" y="112" width="18" height="18" fill="#1d4ed8"/>
      <rect x="132" y="136" width="18" height="18" fill="#1d4ed8"/>
      <text x="120" y="204" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#1e3a8a">${safePlatform}</text>
      <text x="120" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#64748b">${safeSessionId}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const ok = (data: unknown) => ({
  code: 0,
  success: true,
  message: 'prototype mock success',
  ts: new Date().toISOString(),
  data,
});

const accounts = [
  {
    id: 'acc-001',
    accountNo: 'douyin_cd_001',
    platform: 'douyin',
    phoneNumber: '13800000000',
    nickname: '矩阵号-成都探店',
    avatar: '',
    status: 'ONLINE',
    followers: '128000',
    posts: '328',
    likes: '860000',
    ownerUserId: 'user-normal',
    ownerName: '李运营',
    loginRegion: 'CD',
    loginRegionName: '成都',
    tokenExpireAt: '2026-08-01 00:00:00',
    createdAt: '2026-05-01 09:00:00',
  },
  {
    id: 'acc-002',
    accountNo: 'xhs_good_002',
    platform: 'xiaohongshu',
    phoneNumber: '13900000000',
    nickname: '好物种草日记',
    avatar: '',
    status: 'STOPPED',
    followers: '86000',
    posts: '142',
    likes: '320000',
    ownerUserId: 'user-normal-2',
    ownerName: '王运营',
    loginRegion: 'HZ',
    loginRegionName: '杭州',
    tokenExpireAt: '2026-07-01 00:00:00',
    createdAt: '2026-05-08 09:00:00',
  },
  {
    id: 'acc-003',
    accountNo: 'brand_flagship',
    platform: 'douyin',
    phoneNumber: '13700000000',
    nickname: '品牌旗舰号',
    avatar: '',
    status: 'INVALID',
    followers: '253000',
    posts: '519',
    likes: '1640000',
    ownerUserId: 'user-tenant',
    ownerName: '张主管',
    loginRegion: 'BJ',
    loginRegionName: '北京',
    tokenExpireAt: '2026-06-01 00:00:00',
    createdAt: '2026-04-21 09:00:00',
  },
  {
    id: 'acc-004',
    accountNo: 'xhs_cd_life_004',
    platform: 'xiaohongshu',
    phoneNumber: '13500000000',
    nickname: '成都生活方式',
    avatar: '',
    status: 'ONLINE',
    followers: '68000',
    posts: '91',
    likes: '210000',
    ownerUserId: 'user-normal',
    ownerName: '李运营',
    loginRegion: 'CD',
    loginRegionName: '成都',
    tokenExpireAt: '2026-08-10 00:00:00',
    createdAt: '2026-05-18 09:00:00',
  },
  {
    id: 'acc-005',
    accountNo: 'douyin_food_005',
    platform: 'douyin',
    phoneNumber: '13400000000',
    nickname: '川味好店合集',
    avatar: '',
    status: 'STOPPED',
    followers: '43000',
    posts: '76',
    likes: '98000',
    ownerUserId: 'user-normal',
    ownerName: '李运营',
    loginRegion: 'CD',
    loginRegionName: '成都',
    tokenExpireAt: '2026-09-01 00:00:00',
    createdAt: '2026-05-21 09:00:00',
  },
  {
    id: 'acc-006',
    accountNo: 'xhs_beauty_006',
    platform: 'xiaohongshu',
    phoneNumber: '13300000000',
    nickname: '小红书-新品种草',
    avatar: '',
    status: 'ONLINE',
    followers: '52000',
    posts: '118',
    likes: '186000',
    ownerUserId: 'user-normal',
    ownerName: '李运营',
    loginRegion: 'SH',
    loginRegionName: '上海',
    tokenExpireAt: '2026-08-22 00:00:00',
    createdAt: '2026-05-25 09:00:00',
  },
  {
    id: 'acc-007',
    accountNo: 'douyin_store_007',
    platform: 'douyin',
    phoneNumber: '13200000000',
    nickname: '抖音-门店活动',
    avatar: '',
    status: 'ONLINE',
    followers: '91000',
    posts: '205',
    likes: '430000',
    ownerUserId: 'user-normal',
    ownerName: '李运营',
    loginRegion: 'SZ',
    loginRegionName: '深圳',
    tokenExpireAt: '2026-08-28 00:00:00',
    createdAt: '2026-05-27 09:00:00',
  },
];

const users = [
  {
    id: 'user-platform',
    username: '平台超管',
    phoneNumber: '13600000000',
    roles: ['PLATFORM_ADMIN'],
    tenantId: null,
    status: 1,
    personalQuota: null,
    boundCount: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'user-tenant',
    username: '张主管',
    phoneNumber: '13800000000',
    roles: ['TENANT_ADMIN'],
    tenantId: 'tenant-001',
    status: 1,
    personalQuota: 20,
    boundCount: 8,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'user-normal',
    username: '李运营',
    phoneNumber: '13900000000',
    roles: ['NORMAL_ADMIN'],
    tenantId: 'tenant-001',
    status: 1,
    personalQuota: 20,
    boundCount: 12,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'user-normal-2',
    username: '王运营',
    phoneNumber: '13500000000',
    roles: ['NORMAL_ADMIN'],
    tenantId: 'tenant-001',
    status: 1,
    personalQuota: 10,
    boundCount: 6,
    createdAt: now,
    updatedAt: now,
  },
];

const packages = [
  {
    id: 'pkg-standard',
    name: '标准版',
    points: 30000,
    normalAdminLimit: 10,
    socialAccountLimit: 40,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pkg-pro',
    name: '专业版',
    points: 100000,
    normalAdminLimit: 30,
    socialAccountLimit: 120,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pkg-enterprise',
    name: '企业版',
    points: 300000,
    normalAdminLimit: 100,
    socialAccountLimit: 300,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
];

const tenants = [
  {
    id: 'tenant-001',
    name: '成都矩阵科技',
    code: 'cd-matrix',
    status: 'ACTIVE',
    contactName: '张主管',
    contactPhone: '13800000000',
    packageId: 'pkg-pro',
    packageName: '专业版',
    packagePoints: 100000,
    apiKeyMasked: 'mhpk****2026',
    adminCount: 18,
    adminLimit: 30,
    socialPoolAllocated: 80,
    socialPoolLimit: 120,
    socialPoolBound: 42,
    totalRecharge: 50000,
    totalRefund: 800,
    totalPoints: 126800,
    monthConsume: 23600,
    freeVideoUsed: 1,
    freeVideoRemaining: 2,
    balanceStatus: 1,
    createdAt: now,
    updatedAt: now,
  },
];

const operationLogs = [
  {
    id: 'op-v2-001',
    userId: 'user-platform',
    operatorLabel: '平台超管',
    tenantId: 'tenant-001',
    operationType: 'admin.tenant.package-change',
    operationContent: '套餐变更：标准版 → 专业版；管理员上限 10 → 30；社交账号上限 40 → 120；套餐积分 +70000',
    targetId: 'tenant-001',
    targetName: '成都矩阵科技',
    ip: '127.0.0.1',
    userAgent: 'matrixhub-ui-review',
    createdAt: '2026-06-15T10:12:00+08:00',
  },
  {
    id: 'op-v2-002',
    userId: 'user-tenant',
    operatorLabel: '成都矩阵科技 租户管理员',
    tenantId: 'tenant-001',
    operationType: 'account.owner.assign',
    operationContent: '社交账号分配：成都生活方式 分配给 李运营',
    targetId: 'acc-004',
    targetName: '成都生活方式',
    ip: '127.0.0.1',
    userAgent: 'matrixhub-ui-review',
    createdAt: '2026-06-15T10:18:00+08:00',
  },
  {
    id: 'op-v2-003',
    userId: 'user-normal',
    operatorLabel: '李运营',
    tenantId: 'tenant-001',
    operationType: 'account.owner.transfer',
    operationContent: '社交账号移交：川味好店合集 移交给 王运营',
    targetId: 'acc-005',
    targetName: '川味好店合集',
    ip: '127.0.0.1',
    userAgent: 'matrixhub-ui-review',
    createdAt: '2026-06-15T10:24:00+08:00',
  },
  {
    id: 'op-v2-004',
    userId: 'user-normal',
    operatorLabel: '李运营',
    tenantId: 'tenant-001',
    operationType: 'ai-assistant.rule.update',
    operationContent: 'AI助手规则变更：更新评论回复规则「提问」模板',
    targetId: 'comment-rule-002',
    targetName: '提问评论回复规则',
    ip: '127.0.0.1',
    userAgent: 'matrixhub-ui-review',
    createdAt: '2026-06-15T10:28:00+08:00',
  },
];

const contentRecords = [
  {
    recordId: 'record-001',
    jobId: 'job-001',
    coverUrl: '',
    title: '春日探店新品体验',
    captionExcerpt: '今天带大家看一家适合周末打卡的新店。',
    contentMode: 'VIDEO',
    platform: 'douyin',
    accountId: 'acc-001',
    accountNickname: '矩阵号-成都探店',
    status: 'PUBLISH_SUCCESS',
    publishedAt: now,
    statusSyncedAt: now,
    ownerUserId: 'user-normal',
    ownerName: '李运营',
    extensionInfo: {
      type: 'deal',
      targetName: '双人早餐券',
      targetDescription: '门店价 68 元｜有效期 30 天',
      sourceLabel: '抖音团购',
      preMountStatus: 'SUCCESS',
      preMountId: 'pm-history-001',
      preMountedAt: '2026-06-15 10:18:00',
      finalStatus: 'MOUNTED',
      updatedAt: now,
    },
  },
  {
    recordId: 'record-002',
    jobId: 'job-002',
    coverUrl: '',
    title: '好物推荐图文',
    captionExcerpt: '适合办公室和日常通勤的实用好物。',
    contentMode: 'IMAGE',
    platform: 'xiaohongshu',
    accountId: 'acc-002',
    accountNickname: '好物种草日记',
    status: 'PUBLISH_FAILED',
    publishedAt: now,
    statusSyncedAt: now,
    ownerUserId: 'user-normal',
    ownerName: '王运营',
    extensionInfo: {
      finalStatus: 'NONE',
      updatedAt: now,
    },
  },
  {
    recordId: 'record-003',
    jobId: 'job-002',
    coverUrl: '',
    title: '好物推荐图文',
    captionExcerpt: '适合办公室和日常通勤的实用好物。',
    contentMode: 'IMAGE',
    platform: 'douyin',
    accountId: 'acc-001',
    accountNickname: '矩阵号-成都探店',
    status: 'PUBLISH_SUCCESS',
    publishedAt: now,
    statusSyncedAt: now,
    ownerUserId: 'user-normal',
    ownerName: '李运营',
    extensionInfo: {
      type: 'location',
      targetName: '成都矩阵酒店·待认领门店',
      targetDescription: '成都市青羊区蜀都大道 18 号',
      sourceLabel: '抖音 POI',
      preMountStatus: 'SUCCESS',
      preMountId: 'pm-history-003',
      preMountedAt: '2026-06-15 10:20:00',
      finalStatus: 'MOUNT_FAILED',
      failureReason: '平台返回门店未完成企业认领，挂载失败',
      updatedAt: now,
    },
  },
];

const works = [
  {
    id: 'work-001',
    workId: 'work-001',
    type: 'VIDEO',
    title: '夏日新品口播短视频',
    status: 'SUCCEEDED',
    ownerUserId: 'user-normal',
    ownerName: '李运营',
    createdAt: now,
    updatedAt: now,
    costCredits: 300,
    previewUrl: '',
    thumbnailUrl: '',
  },
  {
    id: 'work-002',
    workId: 'work-002',
    type: 'IMAGE',
    title: '小红书探店封面套图',
    status: 'RUNNING',
    ownerUserId: 'user-normal-2',
    ownerName: '王运营',
    createdAt: now,
    updatedAt: now,
    costCredits: 80,
    previewUrl: '',
    thumbnailUrl: '',
  },
];

const accountSnapshots = accounts.map((account) => ({
  accountId: account.id,
  phoneNumber: account.phoneNumber,
  platform: account.platform,
  accountType: '企业号',
  nickname: account.nickname,
  avatar: account.avatar,
  isOnline: account.status === 'ONLINE',
  capabilities: {
    commentReply: {
      supported: account.status === 'ONLINE',
      fallbackHint: account.status === 'ONLINE' ? null : '账号离线，需重新登录',
    },
    messageReply: {
      supported: account.status === 'ONLINE',
      fallbackHint: account.status === 'ONLINE' ? null : '账号离线，需重新登录',
    },
  },
}));

const lowDataContents = [
  {
    contentId: 'low-001',
    accountId: 'acc-001',
    platform: 'douyin',
    accountNickname: '矩阵号-成都探店',
    title: '周末探店新去处',
    viewCount: '428',
    likeRatePercent: 1.2,
    publishedAt: '2026-06-13 18:40:00',
  },
  {
    contentId: 'low-002',
    accountId: 'acc-002',
    platform: 'xiaohongshu',
    accountNickname: '好物种草日记',
    title: '通勤好物清单',
    viewCount: '716',
    likeRatePercent: 1.8,
    publishedAt: '2026-06-12 20:15:00',
  },
];

const commentRecords = [
  {
    commentId: 'comment-001',
    accountId: 'acc-001',
    platform: 'douyin',
    platformCommentId: 'dy-comment-001',
    platformContentId: 'dy-content-001',
    authorName: '成都吃喝玩乐',
    authorAvatar: null,
    text: '这家店人均大概多少？周末需要排队吗？',
    publishedAt: '2026-06-15 09:24:00',
    fetchedAt: now,
    aiCategory: 'question',
    confidence: 0.91,
    status: 'READY_FOR_AUTO_REPLY',
    humanReviewReason: null,
    suggestedReply: '人均大约 80-120 元，周末建议提前预约或错峰到店。',
  },
  {
    commentId: 'comment-002',
    accountId: 'acc-001',
    platform: 'douyin',
    platformCommentId: 'dy-comment-002',
    platformContentId: 'dy-content-001',
    authorName: '本地生活观察',
    authorAvatar: null,
    text: '看起来不错，收藏了。',
    publishedAt: '2026-06-15 09:40:00',
    fetchedAt: now,
    aiCategory: 'positive',
    confidence: 0.87,
    status: 'READY_FOR_AUTO_REPLY',
    humanReviewReason: null,
    suggestedReply: '感谢收藏，后续还会继续分享更多本地好去处。',
  },
  {
    commentId: 'comment-003',
    accountId: 'acc-002',
    platform: 'xiaohongshu',
    platformCommentId: 'xhs-comment-001',
    platformContentId: 'xhs-content-001',
    authorName: '用户_小鹿',
    authorAvatar: null,
    text: '这个价格是不是有点虚高？',
    publishedAt: '2026-06-14 22:10:00',
    fetchedAt: now,
    aiCategory: 'negative',
    confidence: 0.58,
    status: 'HUMAN_REVIEW_PENDING',
    humanReviewReason: 'LOW_CONFIDENCE',
    suggestedReply: '价格会受规格和活动影响，建议以页面实时优惠为准。',
  },
];

const commentRules = [
  {
    ruleId: 'comment-rule-001',
    category: 'positive',
    template: '感谢支持，我们会持续分享更多实用内容。',
    tone: 'friendly',
    requiresHumanReview: false,
    keywords: ['不错', '喜欢', '收藏'],
    createdByUserId: 'user-tenant',
    createdByName: '张主管',
  },
  {
    ruleId: 'comment-rule-002',
    category: 'question',
    template: '您好，这个问题可以参考正文说明，也欢迎私信进一步沟通。',
    tone: 'professional',
    requiresHumanReview: true,
    keywords: ['多少钱', '哪里', '怎么'],
    createdByUserId: 'user-normal',
    createdByName: '李运营',
  },
  {
    ruleId: 'comment-rule-003',
    category: 'negative',
    template: '感谢反馈，我们会认真核实并持续优化体验。',
    tone: 'calm',
    requiresHumanReview: true,
    keywords: ['差', '贵', '不好'],
    createdByUserId: 'user-normal-2',
    createdByName: '王运营',
  },
];

const tags = [
  {
    tagId: 'tag-001',
    category: 'hot',
    name: '本地生活',
    applicablePlatform: 'all',
    status: 'enabled',
    usageCount: 128,
    lastUsedAt: now,
    createdByUserId: 'user-tenant',
    createdByName: '张主管',
  },
  {
    tagId: 'tag-002',
    category: 'content',
    name: '探店',
    applicablePlatform: 'douyin',
    status: 'enabled',
    usageCount: 96,
    lastUsedAt: '2026-06-14 18:20:00',
    createdByUserId: 'user-normal',
    createdByName: '李运营',
  },
  {
    tagId: 'tag-003',
    category: 'emotion',
    name: '真实体验',
    applicablePlatform: 'xiaohongshu',
    status: 'enabled',
    usageCount: 53,
    lastUsedAt: '2026-06-12 11:30:00',
    createdByUserId: 'user-normal-2',
    createdByName: '王运营',
  },
  {
    tagId: 'tag-004',
    category: 'custom',
    name: '过季活动',
    applicablePlatform: 'all',
    status: 'disabled',
    usageCount: 17,
    lastUsedAt: '2026-05-29 10:00:00',
    createdByUserId: 'user-normal',
    createdByName: '李运营',
  },
];

const tagCategories = [
  { code: 'hot', name: '热门标签', isCustom: false },
  { code: 'content', name: '内容类型', isCustom: false },
  { code: 'emotion', name: '情绪标签', isCustom: false },
  { code: 'custom', name: '自定义', isCustom: true },
];

const messageCategories = [
  {
    categoryId: 'msg-cat-001',
    name: '产品咨询',
    keywords: ['价格', '规格', '购买', '怎么用'],
    enabled: true,
  },
  {
    categoryId: 'msg-cat-002',
    name: '合作咨询',
    keywords: ['合作', '商务', '报价'],
    enabled: true,
  },
  {
    categoryId: 'msg-cat-003',
    name: '投诉反馈',
    keywords: ['投诉', '不好', '退款'],
    enabled: true,
  },
];

const messageRules = [
  {
    ruleId: 'msg-rule-001',
    category: '产品咨询',
    template: '您好，产品信息可以参考主页说明，也可以留下具体需求，我们会尽快回复。',
    tone: 'friendly',
    createdByUserId: 'user-tenant',
    createdByName: '张主管',
  },
  {
    ruleId: 'msg-rule-002',
    category: '合作咨询',
    template: '您好，商务合作请留下联系方式和合作方向，我们会安排同事对接。',
    tone: 'professional',
    createdByUserId: 'user-normal',
    createdByName: '李运营',
  },
  {
    ruleId: 'msg-rule-003',
    category: '投诉反馈',
    template: '您好，非常抱歉带来不便，请提供订单或问题细节，我们会优先处理。',
    tone: 'calm',
    createdByUserId: 'user-normal-2',
    createdByName: '王运营',
  },
];

const messageRecords = [
  {
    messageId: 'message-001',
    accountId: 'acc-001',
    platform: 'douyin',
    senderName: '本地团购达人',
    text: '请问这个套餐还能预约本周六吗？',
    receivedAt: '2026-06-15 09:50:00',
    isImportant: false,
    status: 'PENDING',
    category: '产品咨询',
    suggestedReply: '您好，本周六预约情况建议以店铺实时库存为准，可以先锁定可用时段。',
  },
  {
    messageId: 'message-002',
    accountId: 'acc-001',
    platform: 'douyin',
    senderName: '品牌市场部',
    text: '想咨询一下达人合作报价。',
    receivedAt: '2026-06-15 10:05:00',
    isImportant: true,
    status: 'PENDING',
    category: '合作咨询',
    suggestedReply: '您好，商务合作请留下品牌、预算和档期，我们会安排专人对接。',
  },
  {
    messageId: 'message-003',
    accountId: 'acc-002',
    platform: 'xiaohongshu',
    senderName: '小红薯用户',
    text: '上次推荐的产品包装破损了。',
    receivedAt: '2026-06-14 21:30:00',
    isImportant: true,
    status: 'MANUAL_REPLY',
    category: '投诉反馈',
    suggestedReply: '您好，非常抱歉，请提供订单截图，我们会协助联系售后处理。',
  },
];

const getPath = (config: InternalAxiosRequestConfig): string => {
  const raw = `${config.baseURL ?? ''}${config.url ?? ''}`;
  try {
    return new URL(raw, window.location.origin).pathname;
  } catch {
    return raw.split('?')[0] ?? raw;
  }
};

const getBody = <T extends Record<string, unknown>>(
  config: InternalAxiosRequestConfig,
): T => {
  if (!config.data) return {} as T;
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data) as T;
    } catch {
      return {} as T;
    }
  }
  return config.data as T;
};

const getVisibleAccounts = () => {
  const role = getPrototypeRole();
  const userId = getCurrentUserId();
  if (role === 'NORMAL_ADMIN') {
    return accounts.filter((account) => account.ownerUserId === userId);
  }
  return accounts;
};

const getVisibleAccountIds = () => new Set(getVisibleAccounts().map((item) => item.id));

const getVisibleAiAssistantWorkspace = () => {
  const workspace = readAiAssistantWorkspace();
  const visibleAccountIds = getVisibleAccountIds();
  return {
    groups: workspace.groups
      .filter((group) =>
        group.accountIds.some((accountId) => visibleAccountIds.has(accountId)),
      )
      .map((group) => {
        const accountIds = group.accountIds.filter((accountId) =>
          visibleAccountIds.has(accountId),
        );
        return {
          ...group,
          accountIds,
          unreadCount: workspace.conversations
            .filter((conversation) => accountIds.includes(conversation.accountId))
            .reduce((sum, conversation) => sum + conversation.unreadCount, 0),
        };
      }),
    conversations: workspace.conversations.filter((conversation) =>
      visibleAccountIds.has(conversation.accountId),
    ),
  };
};

const getGroupAccountIds = (
  workspace: AiAssistantWorkspaceState,
  groupId: string,
): string[] => {
  if (groupId === 'ungrouped') {
    const visibleAccounts = getVisibleAccounts();
    const assigned = new Set(workspace.groups.flatMap((group) => group.accountIds));
    return visibleAccounts
      .map((account) => account.id)
      .filter((accountId) => !assigned.has(accountId));
  }
  return workspace.groups.find((group) => group.id === groupId)?.accountIds ?? [];
};

const getEditableByCurrentRole = (createdByUserId?: string | null) => {
  const role = getPrototypeRole();
  const userId = getCurrentUserId();
  if (role === 'NORMAL_ADMIN') return createdByUserId === userId;
  if (role === 'TENANT_ADMIN') return createdByUserId === 'user-tenant';
  return false;
};

const withRulePermissions = <T extends { createdByUserId?: string | null }>(
  list: T[],
) =>
  list.map((item) => ({
    ...item,
    editable: getEditableByCurrentRole(item.createdByUserId),
  }));

const matchAccountFilters = (
  account: (typeof accounts)[number],
  params: Record<string, unknown> | undefined,
) => {
  if (!params) return true;
  if (params.platform && account.platform !== params.platform) return false;
  if (
    params.status &&
    account.status !== String(params.status).toUpperCase()
  ) {
    return false;
  }
  const keyword = typeof params.keyword === 'string' ? params.keyword.trim() : '';
  if (!keyword) return true;
  return (
    account.nickname.includes(keyword) ||
    account.phoneNumber.includes(keyword) ||
    account.accountNo.includes(keyword)
  );
};

const matchAccountRequestFilters = (
  record: AccountRequestRecord,
  params: Record<string, unknown> | undefined,
) => {
  const keyword = typeof params?.keyword === 'string' ? params.keyword.trim() : '';
  if (!keyword) return true;
  return (
    record.realName.includes(keyword) ||
    record.phone.includes(keyword) ||
    (record.company ?? '').includes(keyword)
  );
};

const mockData = (config: InternalAxiosRequestConfig): unknown => {
  const path = getPath(config);

  if (path === '/api/v1/auth/login') {
    const role = getPrototypeRole();
    const user = users.find((item) => item.id === getCurrentUserId()) ?? users[1];
    return {
      token: 'prototype-review-token',
      user: {
        id: user.id,
        username: user.username,
        roles: [role],
        tenantId: user.tenantId,
        credits: 126800,
      },
    };
  }

  if (path === '/api/v1/prototype/account-requests' && config.method === 'post') {
    const body = getBody<{
      phone?: string;
      realName?: string;
      company?: string;
    }>(config);
    const nextRecord: AccountRequestRecord = {
      id: `req-${Date.now()}`,
      phone: body.phone?.trim() ?? '',
      realName: body.realName?.trim() ?? '',
      company: body.company?.trim() || null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    const current = readAccountRequests();
    writeAccountRequests([nextRecord, ...current]);
    return nextRecord;
  }

  if (path === '/api/v1/prototype/account-requests' && config.method === 'get') {
    const params = config.params as Record<string, unknown> | undefined;
    const pageNumber =
      typeof params?.page === 'number'
        ? params.page
        : Number(params?.page) || 1;
    const pageSize =
      typeof params?.pageSize === 'number'
        ? params.pageSize
        : Number(params?.pageSize) || 10;
    const filtered = readAccountRequests()
      .filter((item) => matchAccountRequestFilters(item, params))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return paginate(filtered, pageNumber, pageSize);
  }

  if (
    path.startsWith('/api/v1/prototype/account-requests/') &&
    path.endsWith('/review') &&
    config.method === 'post'
  ) {
    const requestId = path
      .replace('/api/v1/prototype/account-requests/', '')
      .replace('/review', '');
    const current = readAccountRequests();
    const nextList = current.map((item) =>
      item.id === requestId ? { ...item, status: 'REVIEWED' as const } : item,
    );
    writeAccountRequests(nextList);
    return nextList.find((item) => item.id === requestId) ?? null;
  }

  if (path === '/api/v1/prototype/accounts/ownership') {
    const body = getBody<{
      accountId?: string;
      targetUserId?: string;
      action?: 'assign' | 'reclaim' | 'transfer';
    }>(config);
    const account = accounts.find((item) => item.id === body.accountId);
    const targetUser = users.find((item) => item.id === body.targetUserId);
    if (account && targetUser) {
      account.ownerUserId = targetUser.id;
      account.ownerName = targetUser.username;
      operationLogs.unshift({
        id: `op-v2-${Date.now()}`,
        userId: getCurrentUserId(),
        operatorLabel:
          users.find((item) => item.id === getCurrentUserId())?.username ?? '评审用户',
        tenantId: 'tenant-001',
        operationType:
          body.action === 'reclaim'
            ? 'account.owner.reclaim'
            : body.action === 'transfer'
              ? 'account.owner.transfer'
              : 'account.owner.assign',
        operationContent: `社交账号归属变更：${account.nickname} → ${targetUser.username}`,
        targetId: account.id,
        targetName: account.nickname,
        ip: '127.0.0.1',
        userAgent: 'matrixhub-ui-review',
        createdAt: new Date().toISOString(),
      });
    }
    return account ?? null;
  }

  if (path === '/api/v1/accounts') {
    const params = config.params as Record<string, unknown> | undefined;
    return page(getVisibleAccounts().filter((account) => matchAccountFilters(account, params)));
  }
  if (path === '/api/v1/accounts/regions') {
    return {
      defaultCityCode: 'CD',
      updatedAt: now,
      provinces: [
        {
          code: 'SC',
          name: '四川省',
          isMunicipality: false,
          enabled: true,
          sortOrder: 1,
          cities: [{ code: 'CD', name: '成都', enabled: true, sortOrder: 1 }],
        },
      ],
    };
  }
  if (path.includes('/api/v1/accounts/') && path.endsWith('/logs')) {
    return page([
      {
        id: 'log-001',
        operation: 'LOGIN',
        description: '二维码确认并刷新登录态',
        operator: '李运营',
        createdAt: now,
      },
    ]);
  }
  if (path === '/api/v1/accounts/login/qr-code/init' && config.method === 'post') {
    const body = getBody<{
      platform?: 'douyin' | 'xiaohongshu';
      accountId?: string;
    }>(config);
    const platform = body.platform ?? 'douyin';
    const sessionId = `login-session-${Date.now()}`;
    const requestId = `verify-${Date.now()}`;
    const nextAuthStep = 'SMS';
    const phoneNumber =
      body.accountId != null
        ? (accounts.find((item) => item.id === body.accountId)?.phoneNumber ??
          '13800138000')
        : '13800138000';
    const qrCodeUrl = createPrototypeQrCodeUrl(platform, sessionId);
    loginSessions.set(sessionId, {
      sessionId,
      platform,
      nextAuthStep,
      requestId,
      maskedPhone: maskPhoneNumber(phoneNumber),
      qrCodeUrl,
      expireSeconds: 40,
      expiresAt: Date.now() + 40 * 1000,
      pollCount: 0,
      accountId: body.accountId,
    });
    return {
      sessionId,
      qrCodeUrl,
      expireSeconds: 40,
      nextAuthStep,
    };
  }
  if (path.includes('/api/v1/accounts/login/') && path.endsWith('/status')) {
    const sessionId = path.split('/').at(-2) ?? '';
    const session = loginSessions.get(sessionId);
    if (!session) {
      return { status: 'EXPIRED', nextAuthStep: 'NONE' };
    }
    const remainSeconds = Math.max(
      Math.ceil((session.expiresAt - Date.now()) / 1000),
      0,
    );
    session.expireSeconds = remainSeconds;
    if (remainSeconds <= 0) {
      return { status: 'EXPIRED', nextAuthStep: 'NONE' };
    }
    session.pollCount += 1;
    if (session.pollCount < 2) {
      return { status: 'WAITING_SCAN', nextAuthStep: session.nextAuthStep };
    }
    return {
      status: 'NEED_AUTH',
      nextAuthStep: session.nextAuthStep,
      maskedPhone: session.maskedPhone,
      requestId: session.requestId,
      authMessage:
        session.nextAuthStep === 'OTHER'
          ? '请在手机端完成额外安全认证'
          : null,
    };
  }
  if (path === '/api/v1/accounts/login/auth/submit' && config.method === 'post') {
    const body = getBody<{
      sessionId?: string;
      authType?: 'SMS' | 'OTHER';
      code?: string;
    }>(config);
    const session = body.sessionId
      ? loginSessions.get(body.sessionId)
      : undefined;
    if (!session) {
      throw new Error('登录会话已失效，请重新扫码');
    }
    if (body.authType === 'SMS' && body.code !== '123456') {
      throw new Error('验证码错误，请重新输入');
    }
    return { status: 'SUCCESS' };
  }
  if (path === '/api/v1/accounts/login/qr-code/refresh' && config.method === 'post') {
    const body = getBody<{ sessionId?: string }>(config);
    const session = body.sessionId
      ? loginSessions.get(body.sessionId)
      : undefined;
    if (!session) {
      throw new Error('二维码会话已失效，请重新生成');
    }
    session.qrCodeUrl = createPrototypeQrCodeUrl(session.platform, session.sessionId);
    session.expireSeconds = 40;
    session.expiresAt = Date.now() + 40 * 1000;
    session.pollCount = 0;
    return {
      sessionId: session.sessionId,
      qrCodeUrl: session.qrCodeUrl,
      expireSeconds: session.expireSeconds,
      flow: 'NEED_QR',
    };
  }
  if (path.includes('/api/v1/accounts/login/')) {
    return { status: 'SUCCESS', account: accounts[0] };
  }
  if (path.includes('/api/v1/accounts/')) {
    const id = path.split('/').at(-1);
    return accounts.find((account) => account.id === id) ?? accounts[0];
  }

  if (path === '/api/v1/media/upload-sessions') {
    const body = getBody<{
      fileName?: string;
      fileSizeBytes?: string;
      mimeType?: string;
    }>(config);
    const uploadSessionId = `upload-session-${Date.now()}`;
    const mediaAssetId = `media-${Date.now()}`;
    uploadSessions.set(uploadSessionId, {
      uploadSessionId,
      mediaAssetId,
      fileName: body.fileName ?? 'prototype-media',
      fileSizeBytes: body.fileSizeBytes ?? '1024',
      mimeType: body.mimeType ?? 'image/png',
    });
    return {
      uploadSessionId,
      partSizeBytes: String(5 * 1024 * 1024),
      totalParts: 1,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      maxConcurrentParts: 1,
    };
  }
  if (path.includes('/api/v1/media/upload-sessions/') && path.includes('/parts/')) {
    const partNumber = Number(path.split('/').at(-1) ?? 1);
    return {
      partNumber,
      receivedSizeBytes: '1024',
      serverPartEtag: `prototype-etag-${partNumber}`,
    };
  }
  if (path.includes('/api/v1/media/upload-sessions/') && path.endsWith('/complete')) {
    const uploadSessionId = path.split('/').at(-2) ?? '';
    const session = uploadSessions.get(uploadSessionId);
    const mediaAssetId = session?.mediaAssetId ?? `media-${Date.now()}`;
    const mimeType = session?.mimeType ?? 'image/png';
    const fileName = session?.fileName ?? 'prototype-media';
    return {
      mediaAssetId,
      fileSizeBytes: session?.fileSizeBytes ?? '1024',
      previewUrl: createPrototypePreviewUrl(mediaAssetId, mimeType, fileName),
      mimeType,
      widthPx: 1080,
      heightPx: 1440,
      durationMs: mimeType.startsWith('video/') ? 12000 : null,
      ratio: mimeType.startsWith('video/') ? '9:16' : '3:4',
      probeError: null,
    };
  }
  if (path.includes('/api/v1/media/upload-sessions/')) {
    const uploadSessionId = path.split('/').at(-1) ?? '';
    const session = uploadSessions.get(uploadSessionId);
    return {
      uploadSessionId,
      status: 'COMPLETED',
      partSizeBytes: String(5 * 1024 * 1024),
      totalParts: 1,
      fileSizeBytes: session?.fileSizeBytes ?? '1024',
      uploadedParts: [
        {
          partNumber: 1,
          sizeBytes: session?.fileSizeBytes ?? '1024',
          uploadedAt: new Date().toISOString(),
        },
      ],
      missingPartNumbers: [],
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      mediaAssetId: session?.mediaAssetId ?? `media-${Date.now()}`,
    };
  }

  if (path === '/api/v1/content/publish/records') {
    const params = config.params as Record<string, unknown> | undefined;
    const extensionStatus = params?.extensionStatus;
    const filteredRecords = extensionStatus
      ? contentRecords.filter(
          (record) => record.extensionInfo?.finalStatus === extensionStatus,
        )
      : contentRecords;
    return { ...page(filteredRecords), total: String(filteredRecords.length) };
  }
  if (path.includes('/api/v1/content/publish/jobs/active')) {
    return { hasActive: false, jobs: [] };
  }
  if (path === '/api/v1/content/publish/submit') {
    return {
      jobId: `prototype-job-${Date.now()}`,
      recordIds: ['prototype-record-001'],
    };
  }
  if (path.includes('/api/v1/content/publish/jobs/')) {
    return { jobId: 'job-001', jobStatus: 'ACTIVE', overallPercent: 66, totalCount: 3, succeededCount: 2, failedCount: 0, records: [], updatedAt: now };
  }
  if (path.includes('/api/v1/content/publish/records/') && path.endsWith('/detail')) {
    const recordId = path.split('/').at(-2);
    const record =
      contentRecords.find((item) => item.recordId === recordId) ??
      contentRecords[0];
    return {
      ...record,
      caption: '今天带大家看一家适合周末打卡的新店。',
      topicTags: ['探店', '本地生活'],
      mentions: [],
      stage: record.status === 'PUBLISH_FAILED' ? 'FAILED' : 'PUBLISHED',
      errorMessage:
        record.status === 'PUBLISH_FAILED' ? '平台返回发布失败' : null,
      canRepublish: true,
      metrics: { recordId: record.recordId, viewCount: '182000', likeCount: '8600', commentCount: '460', shareCount: '310', collectCount: '920', newFollowersCount: '230', engagementRatePercent: '5.6', syncedAt: now, metricsSyncStopped: false },
    };
  }

  if (path === '/api/v1/datacenter/overview') {
    return {
      timeRange: 'last7days',
      platform: 'all',
      metrics: [
        { name: 'playCount', currentValue: '1286000', baselineValue: '1120000' },
        { name: 'likeCount', currentValue: '84200', baselineValue: '76000' },
        { name: 'commentCount', currentValue: '12600', baselineValue: '9900' },
        { name: 'followerDelta', currentValue: '12390', baselineValue: '8600' },
      ],
      warningSummary: { totalPending: '18', unreadPending: '7', abnormalAccountCount: '3' },
      dataAsOf: now,
    };
  }
  if (path === '/api/v1/datacenter/trends/play') {
    return { accountId: 'all', granularity: 'day', points: ['06-09', '06-10', '06-11', '06-12', '06-13', '06-14', '06-15'].map((bucket, index) => ({ bucket, playCount: String([12000, 26000, 18000, 42000, 36000, 52000, 47000][index]) })) };
  }
  if (path === '/api/v1/datacenter/contents') {
    return page([
      { contentId: 'ct-001', title: '夏日新品口播短视频', accountId: 'acc-001', accountName: '矩阵号-成都探店', platform: 'douyin', contentType: 'video', playCount: '182000', likeCount: '8600', commentCount: '460', shareCount: '310', engagementRate: '5.6', coverUrl: null },
      { contentId: 'ct-002', title: '好物推荐图文', accountId: 'acc-002', accountName: '好物种草日记', platform: 'xiaohongshu', contentType: 'image_text', playCount: '21000', likeCount: '620', commentCount: '88', shareCount: '40', engagementRate: '1.2', coverUrl: null },
    ]);
  }
  if (path === '/api/v1/datacenter/accounts/options') {
    return accounts.map((account) => ({ id: account.id, nickname: account.nickname, platform: account.platform, status: account.status }));
  }

  if (path === '/api/v1/ai-assistant/workspace/groups' && config.method === 'get') {
    const workspace = getVisibleAiAssistantWorkspace();
    return {
      groups: workspace.groups
        .map((group) => {
          const hasUrgent = workspace.conversations.some(
            (conversation) =>
              group.accountIds.includes(conversation.accountId) &&
              isConversationUrgent(conversation.messages),
          );
          return {
            id: group.id,
            name: group.name,
            accountIds: group.accountIds,
            accountCount: group.accountIds.length,
            autoReplyEnabled: group.autoReplyEnabled,
            unreadCount: group.unreadCount,
            hasUrgent,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
          };
        })
        .sort((a, b) =>
          compareReviewPriority(a, b, {
            leftUrgent: a.hasUrgent,
            rightUrgent: b.hasUrgent,
          }),
        ),
    };
  }

  if (path === '/api/v1/ai-assistant/workspace/accounts' && config.method === 'get') {
    const workspace = readAiAssistantWorkspace();
    const visible = getVisibleAccounts();
    return {
      accounts: visible.map((account) => {
        const assignedGroup = workspace.groups.find((group) =>
          group.accountIds.includes(account.id),
        );
        return {
          accountId: account.id,
          nickname: account.nickname,
          platform: account.platform,
          ownerName: account.ownerName,
          assignedGroupId: assignedGroup?.id ?? null,
          assignedGroupName: assignedGroup?.name ?? null,
        };
      }),
    };
  }

  if (path === '/api/v1/ai-assistant/workspace/groups' && config.method === 'post') {
    const body = getBody<{ name?: string; accountIds?: string[] }>(config);
    const workspace = readAiAssistantWorkspace();
    const visibleAccountIds = getVisibleAccountIds();
    const group = {
      id: createMockId('group'),
      name: body.name?.trim() || '未命名分组',
      accountIds: (body.accountIds ?? []).filter((accountId) =>
        visibleAccountIds.has(accountId),
      ),
      autoReplyEnabled: false,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      knowledgeFiles: [],
    };
    workspace.groups = workspace.groups.map((item) => ({
      ...item,
      accountIds: item.accountIds.filter(
        (accountId) => !group.accountIds.includes(accountId),
      ),
    }));
    workspace.groups.push(group);
    writeAiAssistantWorkspace(workspace);
    return null;
  }

  if (
    path.includes('/api/v1/ai-assistant/workspace/groups/') &&
    !path.includes('/auto-reply') &&
    !path.includes('/knowledge-files') &&
    config.method === 'put'
  ) {
    const groupId = path.split('/').at(-1) ?? '';
    const body = getBody<{ name?: string; accountIds?: string[] }>(config);
    const workspace = readAiAssistantWorkspace();
    const targetGroup = workspace.groups.find((group) => group.id === groupId);
    if (!targetGroup) {
      throw new Error('账号分组不存在');
    }
    const nextAccountIds = body.accountIds ?? [];
    workspace.groups = workspace.groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          name: body.name?.trim() || group.name,
          accountIds: nextAccountIds,
          updatedAt: new Date().toISOString(),
        };
      }
      return {
        ...group,
        accountIds: group.accountIds.filter(
          (accountId) => !nextAccountIds.includes(accountId),
        ),
      };
    });
    writeAiAssistantWorkspace(workspace);
    return null;
  }

  if (
    path.includes('/api/v1/ai-assistant/workspace/groups/') &&
    !path.includes('/auto-reply') &&
    !path.includes('/knowledge-files') &&
    config.method === 'delete'
  ) {
    const groupId = path.split('/').at(-1) ?? '';
    const workspace = readAiAssistantWorkspace();
    workspace.groups = workspace.groups.filter((group) => group.id !== groupId);
    writeAiAssistantWorkspace(workspace);
    return null;
  }

  if (path === '/api/v1/ai-assistant/workspace/conversations' && config.method === 'get') {
    const params = config.params as Record<string, unknown> | undefined;
    const groupId = typeof params?.groupId === 'string' ? params.groupId : '';
    const keyword = typeof params?.keyword === 'string' ? params.keyword.trim() : '';
    const workspace = readAiAssistantWorkspace();
    const groupAccountIds = getGroupAccountIds(workspace, groupId);
    const list = workspace.conversations
      .filter((conversation) => groupAccountIds.includes(conversation.accountId))
      .map((conversation) => {
        const account = accounts.find((item) => item.id === conversation.accountId);
        const lastMessage = conversation.messages.at(-1);
        return {
          id: conversation.id,
          senderName: conversation.senderName,
          senderAvatar: conversation.senderAvatar ?? null,
          accountId: conversation.accountId,
          accountName: account?.nickname ?? '未知账号',
          platform: account?.platform ?? 'douyin',
          lastMessageText: lastMessage?.text ?? '',
          lastMessageAt: lastMessage?.createdAt ?? now,
          unreadCount: conversation.unreadCount,
          isUrgent: isConversationUrgent(conversation.messages),
        };
      })
      .filter((conversation) => {
        if (!keyword) return true;
        return (
          conversation.senderName.includes(keyword) ||
          conversation.lastMessageText.includes(keyword) ||
          conversation.accountName.includes(keyword)
        );
      })
      .sort((a, b) =>
        compareReviewPriority(a, b, {
          leftUrgent: a.isUrgent,
          rightUrgent: b.isUrgent,
        }),
      );

    return { list };
  }

  if (path === '/api/v1/ai-assistant/workspace/messages' && config.method === 'get') {
    const params = config.params as Record<string, unknown> | undefined;
    const groupId = typeof params?.groupId === 'string' ? params.groupId : '';
    const conversationId =
      typeof params?.conversationId === 'string' ? params.conversationId : '';
    const workspace = readAiAssistantWorkspace();
    const groupAccountIds = getGroupAccountIds(workspace, groupId);
    const conversation = workspace.conversations.find(
      (item) =>
        item.id === conversationId && groupAccountIds.includes(item.accountId),
    );
    return {
      list: (conversation?.messages ?? []).map((item) => ({
        id: item.id,
        conversationId,
        senderType: item.senderType,
        senderName: item.senderName,
        text: item.text,
        createdAt: item.createdAt,
      })),
    };
  }

  if (
    path.includes('/api/v1/ai-assistant/workspace/conversations/') &&
    path.endsWith('/reply') &&
    config.method === 'post'
  ) {
    const conversationId = path.split('/').at(-2) ?? '';
    const body = getBody<{ replyText?: string }>(config);
    const workspace = readAiAssistantWorkspace();
    const conversation = workspace.conversations.find(
      (item) => item.id === conversationId,
    );
    if (!conversation) {
      throw new Error('当前会话不存在');
    }
    conversation.messages.push({
      id: createMockId('msg'),
      senderType: 'OPERATOR',
      senderName: users.find((item) => item.id === getCurrentUserId())?.username ?? '管理员',
      text: body.replyText?.trim() ?? '',
      createdAt: new Date().toISOString(),
    });
    writeAiAssistantWorkspace(workspace);
    return null;
  }

  if (
    path.includes('/api/v1/ai-assistant/workspace/groups/') &&
    path.endsWith('/auto-reply') &&
    config.method === 'put'
  ) {
    const groupId = path.split('/').at(-2) ?? '';
    const body = getBody<{ autoReplyEnabled?: boolean }>(config);
    const workspace = readAiAssistantWorkspace();
    const group = workspace.groups.find((item) => item.id === groupId);
    if (!group) {
      throw new Error('账号分组不存在');
    }
    group.autoReplyEnabled = Boolean(body.autoReplyEnabled);
    group.updatedAt = new Date().toISOString();
    writeAiAssistantWorkspace(workspace);
    return null;
  }

  if (
    path.includes('/api/v1/ai-assistant/workspace/groups/') &&
    path.endsWith('/knowledge-files') &&
    config.method === 'get'
  ) {
    const groupId = path.split('/').at(-2) ?? '';
    const workspace = readAiAssistantWorkspace();
    const group = workspace.groups.find((item) => item.id === groupId);
    return { files: group?.knowledgeFiles ?? [] };
  }

  if (
    path.includes('/api/v1/ai-assistant/workspace/groups/') &&
    path.endsWith('/knowledge-files') &&
    config.method === 'post'
  ) {
    const groupId = path.split('/').at(-2) ?? '';
    const body = getBody<{
      fileName?: string;
      fileType?: string;
      fileSizeBytes?: number;
    }>(config);
    const workspace = readAiAssistantWorkspace();
    const group = workspace.groups.find((item) => item.id === groupId);
    if (!group) {
      throw new Error('账号分组不存在');
    }
    group.knowledgeFiles.unshift({
      id: createMockId('kb'),
      fileName: body.fileName ?? '未命名文件',
      fileType: body.fileType ?? 'text/plain',
      fileSizeBytes: Number(body.fileSizeBytes ?? 0),
      createdAt: new Date().toISOString(),
      summary: buildKnowledgeSummary(body.fileName ?? '知识库文件'),
    });
    group.updatedAt = new Date().toISOString();
    writeAiAssistantWorkspace(workspace);
    return null;
  }

  if (
    path.includes('/api/v1/ai-assistant/workspace/groups/') &&
    path.includes('/knowledge-files/') &&
    config.method === 'delete'
  ) {
    const segments = path.split('/');
    const groupId = segments.at(-3) ?? '';
    const fileId = segments.at(-1) ?? '';
    const workspace = readAiAssistantWorkspace();
    const group = workspace.groups.find((item) => item.id === groupId);
    if (!group) {
      throw new Error('账号分组不存在');
    }
    group.knowledgeFiles = group.knowledgeFiles.filter((file) => file.id !== fileId);
    group.updatedAt = new Date().toISOString();
    writeAiAssistantWorkspace(workspace);
    return null;
  }

  if (path === '/api/v1/ai-assistant/home/summary') {
    return {
      features: [
        { code: 'content_optimize', enabled: true, badge: { type: 'count', value: 2, label: '待优化内容' } },
        { code: 'comment_reply', enabled: true, badge: { type: 'count', value: 8, label: '待处理评论' } },
        { code: 'message_reply', enabled: true, badge: { type: 'count', value: 5, label: '待处理私信' } },
        { code: 'tag_library', enabled: true, badge: { type: 'count', value: tags.length, label: '标签数' } },
      ],
    };
  }

  if (path === '/api/v1/ai-assistant/internal/comment-targets') {
    return {
      targets: [
        {
          platformContentId: 'dy-content-001',
          publishedAt: '2026-06-14 18:40:00',
          publishStatusHint: 'PUBLISH_SUCCESS',
          lastFetchedAt: now,
          lastSeenCommentTime: '2026-06-15 09:40:00',
        },
      ],
      fetchPolicy: { intervalSeconds: 300, maxAgeHours: 72 },
    };
  }

  if (path === '/api/v1/ai-assistant/comment-reply/dashboard/today') {
    return { autoReplyCount: 12, blockedCount: 3, humanReviewCount: 4 };
  }
  if (path === '/api/v1/ai-assistant/comment-reply/accounts') {
    return { ...page(accountSnapshots), total: String(accountSnapshots.length) };
  }
  if (path === '/api/v1/ai-assistant/comment-reply/pending') {
    const list = commentRecords.filter((item) => item.status === 'READY_FOR_AUTO_REPLY');
    return { ...page(list), total: String(list.length) };
  }
  if (path === '/api/v1/ai-assistant/comment-reply/human-review') {
    const list = commentRecords.filter((item) => item.status === 'HUMAN_REVIEW_PENDING');
    return { ...page(list), total: String(list.length) };
  }
  if (path === '/api/v1/ai-assistant/comment-reply/history') {
    const history = commentRecords.map((item) => ({
      ...item,
      status:
        item.status === 'HUMAN_REVIEW_PENDING'
          ? 'HUMAN_REVIEW_PENDING'
          : 'READY_FOR_AUTO_REPLY',
    }));
    return { ...page(history), total: String(history.length) };
  }
  if (path === '/api/v1/ai-assistant/comment-reply/blocked-keywords') {
    return {
      keywords: [
        { keywordId: 'blocked-001', keyword: '辱骂', autoDelete: true, createdAt: now },
        { keywordId: 'blocked-002', keyword: '广告引流', autoDelete: true, createdAt: now },
      ],
    };
  }
  if (path === '/api/v1/ai-assistant/comment-reply/rules') {
    return { rules: withRulePermissions(commentRules) };
  }
  if (path === '/api/v1/ai-assistant/comment-reply/tones') {
    return {
      options: [
        { code: 'friendly', displayName: '友好亲切' },
        { code: 'professional', displayName: '专业克制' },
        { code: 'calm', displayName: '冷静安抚' },
      ],
    };
  }
  if (path.includes('/api/v1/ai-assistant/comment-reply/account-settings/')) {
    return {
      accountId: path.split('/').at(-1) ?? 'acc-001',
      autoReplyEnabled: true,
      scrapeIntervalSeconds: 300,
      humanInterventionForQuestion: true,
      humanInterventionForNegative: true,
    };
  }
  if (
    path === '/api/v1/ai-assistant/comment-reply/scrape' ||
    path.includes('/api/v1/ai-assistant/comment-reply/')
  ) {
    return { batchId: 'comment-batch-001', callbackId: 'comment-callback-001', status: 'ACCEPTED' };
  }

  if (path === '/api/v1/ai-assistant/content-optimize/threshold') {
    return { viewMin: 500, likeRateMinPercent: 2 };
  }
  if (path === '/api/v1/ai-assistant/content-optimize/low-data') {
    return { ...page(lowDataContents), total: String(lowDataContents.length) };
  }
  if (path.includes('/api/v1/ai-assistant/content-optimize/') && path.endsWith('/optimize')) {
    return {
      suggestion: '该内容曝光低于阈值，标题缺少具体利益点，建议补充场景、人群和结果承诺。',
      suggestedTitle: '周末成都探店：人均百元的新品体验路线',
      suggestedTags: ['本地生活', '探店', '周末去哪儿'],
      sensitiveWords: [],
    };
  }
  if (path.includes('/api/v1/ai-assistant/content-optimize/') && path.endsWith('/apply')) {
    return null;
  }
  if (path === '/api/v1/ai-assistant/content-optimize/republish') {
    return { taskId: 'republish-task-001' };
  }
  if (path.includes('/api/v1/ai-assistant/content-optimize/republish-tasks/')) {
    return {
      taskId: path.split('/').at(-1) ?? 'republish-task-001',
      status: 'SUCCESS',
      attempt: 1,
      errorCode: null,
      errorMessage: null,
      publishedPlatformContentIds: ['dy-republish-001'],
    };
  }

  if (path === '/api/v1/ai-assistant/tags/stats') {
    return {
      categories: [
        { code: 'hot', count: 1 },
        { code: 'content', count: 1 },
        { code: 'emotion', count: 1 },
        { code: 'custom', count: 1 },
      ],
      disabled: tags.filter((tag) => tag.status === 'disabled').length,
    };
  }
  if (path === '/api/v1/ai-assistant/tags/categories') {
    return { categories: tagCategories };
  }
  if (path === '/api/v1/ai-assistant/tags') {
    return { ...page(withRulePermissions(tags)), total: String(tags.length) };
  }
  if (path.includes('/api/v1/ai-assistant/tags/')) {
    return null;
  }

  if (path === '/api/v1/ai-assistant/message-reply/accounts') {
    return { ...page(accountSnapshots), total: String(accountSnapshots.length) };
  }
  if (path === '/api/v1/ai-assistant/message-reply/scrape-settings') {
    return {
      autoReplyEnabled: true,
      scrapeIntervalSeconds: 300,
      scrapeTypes: ['ALL'],
    };
  }
  if (path === '/api/v1/ai-assistant/message-reply/categories') {
    return { categories: messageCategories };
  }
  if (path === '/api/v1/ai-assistant/message-reply/rules') {
    return { rules: withRulePermissions(messageRules) };
  }
  if (path === '/api/v1/ai-assistant/message-reply/pending') {
    const list = messageRecords.filter((item) => item.status === 'PENDING');
    return { ...page(list), total: String(list.length) };
  }
  if (path === '/api/v1/ai-assistant/message-reply/history') {
    return { ...page(messageRecords), total: String(messageRecords.length) };
  }
  if (
    path === '/api/v1/ai-assistant/message-reply/scrape' ||
    path.includes('/api/v1/ai-assistant/message-reply/')
  ) {
    return null;
  }

  if (path === '/api/v1/admin/users') {
    const params = config.params as Record<string, unknown> | undefined;
    const role = typeof params?.role === 'string' ? params.role : undefined;
    const tenantId =
      typeof params?.tenantId === 'string' ? params.tenantId : undefined;
    const keyword =
      typeof params?.keyword === 'string' ? params.keyword.trim() : '';
    return page(
      users.filter((user) => {
        if (role && !user.roles.includes(role)) return false;
        if (tenantId && user.tenantId !== tenantId) return false;
        if (
          keyword &&
          !user.username.includes(keyword) &&
          !user.phoneNumber.includes(keyword)
        ) {
          return false;
        }
        return true;
      }),
    );
  }
  if (path === '/api/v1/admin/users/me/quota-status') {
    const currentUser =
      users.find((item) => item.id === getCurrentUserId()) ?? users[1];
    const personalQuota =
      currentUser.personalQuota == null ? -1 : currentUser.personalQuota;
    const currentBoundCount = currentUser.boundCount ?? 0;
    return {
      personalQuota,
      currentBoundCount,
      available:
        personalQuota < 0
          ? null
          : Math.max(personalQuota - currentBoundCount, 0),
      unlimited: personalQuota < 0,
    };
  }
  if (path.includes('/api/v1/admin/users/')) return users[1];
  if (path === '/api/v1/admin/operation-logs') {
    return { ...page(operationLogs), total: operationLogs.length };
  }
  if (path === '/api/v1/prototype/tenants/package-change') {
    const body = getBody<{ tenantId?: string; packageId?: string }>(config);
    const tenant = tenants.find((item) => item.id === body.tenantId);
    const nextPackage = packages.find((item) => item.id === body.packageId);
    if (tenant && nextPackage) {
      const previousName = tenant.packageName ?? '未设置套餐';
      tenant.packageId = nextPackage.id;
      tenant.packageName = nextPackage.name;
      tenant.packagePoints = nextPackage.points;
      tenant.adminLimit = nextPackage.normalAdminLimit;
      tenant.socialPoolLimit = nextPackage.socialAccountLimit;
      operationLogs.unshift({
        id: `op-v2-${Date.now()}`,
        userId: getCurrentUserId(),
        operatorLabel: '平台超管',
        tenantId: tenant.id,
        operationType: 'admin.tenant.package-change',
        operationContent: `套餐变更：${previousName} → ${nextPackage.name}`,
        targetId: tenant.id,
        targetName: tenant.name,
        ip: '127.0.0.1',
        userAgent: 'matrixhub-ui-review',
        createdAt: new Date().toISOString(),
      });
    }
    return tenant ?? null;
  }
  if (path === '/api/v1/admin/tenants') return { ...page(tenants), total: tenants.length };
  if (path.includes('/api/v1/admin/tenants/stats')) return { total: 128, thisMonthCreated: 9, lastMonthCreated: 6, monthDelta: 3 };
  if (path.includes('/api/v1/admin/tenants/')) return tenants[0];
  if (path.includes('/api/v1/admin/packages')) {
    return { ...page(packages), total: packages.length };
  }
  if (path.includes('/api/v1/admin/proxy/balance')) {
    return { packagePoints: 100000, totalPoints: 126800, totalRecharge: 50000, totalRefund: 800, totalConsume: 23200, monthConsume: 23600, freeVideoUsed: 1, freeVideoRemaining: 2, status: 1, apiKeyMasked: 'mhpk****2026' };
  }
  if (path.includes('/api/v1/admin/proxy/tenants/balances')) {
    return page([{ tenantId: 'tenant-001', tenantName: '成都矩阵科技', tenantCode: 'cd-matrix', status: 'ACTIVE', packagePoints: 100000, apiKeyMasked: 'mhpk****2026', totalPoints: 126800, totalRecharge: 50000, totalRefund: 800, totalConsume: 23200, monthConsume: 23600, freeVideoUsed: 1, freeVideoRemaining: 2, adminCount: 18, balanceStatus: 1, balanceError: null }]);
  }
  if (path.includes('/api/v1/admin/proxy/consume') || path.includes('/api/v1/admin/proxy/recharge')) {
    return page([{ id: 'record-001', apiKeyMasked: 'mhpk****2026', changePoints: -300, remark: '视频生成', taskId: 'task-001', createTime: now, operatorName: '李运营' }]);
  }

  if (path.includes('/api/v1/content-generation/works')) return page(works);
  if (path.includes('/api/v1/content-generation/credits')) return page([{ id: 'credit-001', changePoints: -300, type: 'CONSUME', remark: '视频生成', createdAt: now }]);
  if (path.includes('/api/v1/content-generation/balance')) return { balance: 126800, companyKey: 'cd-matrix' };
  if (path.includes('/api/v1/content-generation/trial-quota')) return { total: 3, used: 1, remaining: 2 };
  if (path.includes('/api/v1/content-generation/queue')) return { count: 2 };
  if (path.includes('/api/v1/content-generation/avatars')) return [{ id: 'avatar-001', name: '林晓', costCredits: 100, previewUrl: '' }];

  if (path.includes('/api/v1/alerts') || path.includes('/api/v1/datacenter/warnings')) {
    return page([{ id: 'warn-001', type: 'ACCOUNT_ABNORMAL', level: 'HIGH', title: '账号登录态失效', accountName: '品牌旗舰号', status: 'UNREAD', createdAt: now }]);
  }

  return null;
};

export const installPrototypeMockAdapter = (request: AxiosInstance) => {
  const adapter: AxiosAdapter = async (config) => {
    const response: AxiosResponse = {
      data: ok(mockData(config)),
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    };
    return response;
  };

  request.defaults.adapter = adapter;
};
