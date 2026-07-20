/** 数据中心 BDD / 页面测试中复用的接口响应桩数据 */

export const createMockOverviewData = (overrides = {}) => ({
  timeRange: 'today',
  platform: 'all',
  metrics: [
    { name: 'playCount', currentValue: '12582380', baselineValue: '11150000' },
    { name: 'likeCount', currentValue: '89234', baselineValue: '82456' },
    { name: 'commentCount', currentValue: '12456', baselineValue: '11789' },
    { name: 'shareCount', currentValue: '8932', baselineValue: '8745' },
    { name: 'followerDelta', currentValue: '3456', baselineValue: '2987' },
    { name: 'dmCount', currentValue: '2134', baselineValue: '2160' },
  ],
  warningSummary: {
    totalPending: '12',
    unreadPending: '5',
    abnormalAccountCount: '4',
  },
  dataAsOf: '2026-04-22T10:30:00Z',
  ...overrides,
});

export const createMockWarningData = (overrides = {}) => ({
  summary: {
    totalPending: '12',
    unreadPending: '5',
    abnormalAccountCount: '4',
  },
  pageData: {
    list: [
      {
        warningId: '1',
        accountId: 'acc-001',
        accountName: '时尚美妆号',
        platform: 'douyin',
        level: 'HIGH',
        category: 'ACCOUNT_EXCEPTION',
        eventType: 'LOGIN_EXPIRED',
        message: '登录已失效',
        state: 'PENDING_UNREAD',
        createdAt: '2026-04-22T10:00:00Z',
      },
      {
        warningId: '2',
        accountId: 'acc-002',
        contentId: 'content-001',
        accountName: '生活笔记',
        platform: 'xiaohongshu',
        level: 'MEDIUM',
        category: 'CONTENT_EXCEPTION',
        eventType: 'LOW_PLAY_COUNT',
        message: '播放量过低(1.2K<5K)',
        state: 'PENDING_UNREAD',
        createdAt: '2026-04-22T09:30:00Z',
      },
      {
        warningId: '3',
        accountId: 'acc-003',
        accountName: '科技评测',
        platform: 'douyin',
        level: 'NORMAL',
        category: 'ACCOUNT_EXCEPTION',
        eventType: 'ACCOUNT_NORMAL',
        message: '账号状态正常',
        state: 'PENDING_READ',
        createdAt: '2026-04-22T08:00:00Z',
      },
    ],
    page: 1,
    pageSize: 3,
    total: '12',
    totalPages: 4,
    hasNext: true,
    hasPrevious: false,
  },
  ...overrides,
});

export const createMockTrendData = (overrides = {}) => ({
  accountId: 'acc-001',
  granularity: 'hour',
  points: [
    { bucket: '2026-04-22 00:00', playCount: '1200' },
    { bucket: '2026-04-22 01:00', playCount: null },
    { bucket: '2026-04-22 02:00', playCount: '1350' },
    { bucket: '2026-04-22 03:00', playCount: '1100' },
    { bucket: '2026-04-22 04:00', playCount: '1500' },
  ],
  ...overrides,
});

export const createMockContentsData = (overrides = {}) => ({
  list: [
    {
      contentId: '1',
      title: '2024年最火的穿搭技巧',
      accountId: 'acc-001',
      accountName: '时尚美妆号',
      platform: 'douyin',
      contentType: 'video',
      playCount: '125000',
      likeCount: '8900',
      commentCount: '1200',
      shareCount: '560',
      engagementRate: '8.56',
    },
    {
      contentId: '2',
      title: '家常菜做法大全',
      accountId: 'acc-002',
      accountName: '生活笔记',
      platform: 'xiaohongshu',
      contentType: 'image_text',
      playCount: '89000',
      likeCount: '5600',
      commentCount: '890',
      shareCount: '340',
      engagementRate: '7.68',
    },
  ],
  page: 1,
  pageSize: 10,
  total: '24',
  totalPages: 3,
  hasNext: true,
  hasPrevious: false,
  ...overrides,
});

/**
 * 数据中心账号下拉候选池桩数据。
 * 自 `datacenter-account-options-endpoint` 起，前端走专属 SPI 端点 `/api/v1/datacenter/accounts/options`，
 * 响应为 `AccountOption[]`（扁平数组，不再有 `{ list, page, pageSize, ... }` 包装）。
 */
export const createMockAccountData = (
  overrides: { extraItems?: Record<string, unknown>[] } = {},
) => {
  const base = [
    {
      id: 'acc-001',
      nickname: '时尚美妆号',
      platform: 'douyin',
      status: 'ONLINE',
      avatar: null,
    },
    {
      id: 'acc-002',
      nickname: '生活笔记',
      platform: 'xiaohongshu',
      status: 'ONLINE',
      avatar: null,
    },
    {
      id: 'acc-003',
      nickname: '科技评测',
      platform: 'douyin',
      status: 'ONLINE',
      avatar: null,
    },
  ];
  return overrides.extraItems ? [...base, ...overrides.extraItems] : base;
};
