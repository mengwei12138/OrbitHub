export type TimeRange = 'today' | 'last7days' | 'last30days' | 'thisYear';

export const TIME_RANGE = {
  TODAY: 'today',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  THIS_YEAR: 'thisYear',
} as const satisfies Record<string, TimeRange>;

export type PlatformFilter = 'all' | 'douyin' | 'xiaohongshu';

export const PLATFORM_FILTER = {
  ALL: 'all',
  DOUYIN: 'douyin',
  XIAOHONGSHU: 'xiaohongshu',
} as const satisfies Record<string, PlatformFilter>;

export type TrendGranularity = 'hour' | 'day' | 'week' | 'month';

export const TREND_GRANAULARITY = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const satisfies Record<string, TrendGranularity>;

export type ContentTypeFilter = 'all' | 'video' | 'image_text';

export const CONTENT_TYPE_FILTER = {
  ALL: 'all',
  VIDEO: 'video',
  IMAGE_TEXT: 'image_text',
} as const satisfies Record<string, ContentTypeFilter>;

export type ContentSortBy = 'playCount' | 'likeCount' | 'commentCount';

export const CONTENT_SORT_BY = {
  PLAY_COUNT: 'playCount',
  LIKE_COUNT: 'likeCount',
  COMMENT_COUNT: 'commentCount',
} as const satisfies Record<string, ContentSortBy>;

export type KpiName =
  | 'playCount'
  | 'likeCount'
  | 'commentCount'
  | 'shareCount'
  | 'followerDelta'
  | 'dmCount';

export const KPI_NAME = {
  PLAY_COUNT: 'playCount',
  LIKE_COUNT: 'likeCount',
  COMMENT_COUNT: 'commentCount',
  SHARE_COUNT: 'shareCount',
  FOLLOWER_DELTA: 'followerDelta',
  DM_COUNT: 'dmCount',
} as const satisfies Record<string, KpiName>;

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

export type KpiMetric = {
  name: KpiName;
  currentValue: string;
  baselineValue: string;
};

export type WarningSummary = {
  totalPending: string;
  unreadPending: string;
  abnormalAccountCount: string;
};

export type OverviewResponse = {
  timeRange: TimeRange;
  platform: PlatformFilter;
  metrics: KpiMetric[];
  warningSummary: WarningSummary;
  dataAsOf: string;
};

export type TrendPoint = {
  bucket: string;
  playCount: string | null;
};

export type PlayTrendResponse = {
  accountId: string;
  granularity: TrendGranularity;
  points: TrendPoint[];
};

export type ContentPerformanceItem = {
  contentId: string;
  title: string;
  accountId: string;
  accountName: string;
  platform: 'douyin' | 'xiaohongshu';
  contentType: ContentTypeFilter;
  playCount: string;
  likeCount: string;
  commentCount: string;
  shareCount: string;
  engagementRate: string | null;
  coverUrl: string | null;
};

export type PageContentPerformanceResponse = {
  list: ContentPerformanceItem[];
  page: number;
  pageSize: number;
  total: string;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type AccountBrief = {
  accountId: string;
  nickname: string;
  platform: 'douyin' | 'xiaohongshu';
  followers: string;
  status: string;
  lastSyncTime: string;
};

/** 数据中心账号下拉候选池一项；与后端 DatacenterDtos.AccountOptionDto 对齐 */
export type AccountOption = {
  id: string;
  nickname: string;
  platform: 'douyin' | 'xiaohongshu';
  status: 'ONLINE' | 'STOPPED' | 'INVALID';
  avatar: string | null;
};

export type AccountDetailResponse = {
  account: AccountBrief;
  todayMetrics: KpiMetric[];
  last7DayPlayTrend: TrendPoint[];
  recentContents: PageContentPerformanceResponse;
};

export type ResultOverviewResponse = ResultBase & {
  data: OverviewResponse;
};

export type ResultPlayTrendResponse = ResultBase & {
  data: PlayTrendResponse;
};

export type ResultPageContentPerformanceResponse = ResultBase & {
  data: PageContentPerformanceResponse;
};

export type ResultAccountDetailResponse = ResultBase & {
  data: AccountDetailResponse;
};
