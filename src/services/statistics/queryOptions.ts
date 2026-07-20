import request from '@/api/request';

import type {
  AccountDetailResponse,
  AccountOption,
  ContentSortBy,
  ContentTypeFilter,
  OverviewResponse,
  PageContentPerformanceResponse,
  PlatformFilter,
  PlayTrendResponse,
  TimeRange,
  TrendGranularity,
} from './types';

export type ContentItem = {
  id: string;
  cover: string;
  title: string;
  playCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
};

export type OverviewQueryParams = {
  timeRange: TimeRange;
  platform?: PlatformFilter;
};

export type PlayTrendQueryParams = {
  accountId: string;
  timeRange: TimeRange;
  granularity: TrendGranularity;
};

export type ContentsQueryParams = {
  accountId?: string;
  timeRange: TimeRange;
  platform?: PlatformFilter;
  contentType?: ContentTypeFilter;
  sortBy?: ContentSortBy;
  page?: number;
  pageSize?: number;
};

export const overviewQueryOptions = (params: OverviewQueryParams) => ({
  queryKey: ['statistics', 'overview', params],
  queryFn: async (): Promise<OverviewResponse> => {
    const res = await request.get<OverviewResponse>(
      '/api/v1/datacenter/overview',
      {
        params,
      },
    );
    return res as unknown as OverviewResponse;
  },
});

export const playTrendQueryOptions = (params: PlayTrendQueryParams) => ({
  queryKey: ['statistics', 'playTrend', params],
  queryFn: async (): Promise<PlayTrendResponse> => {
    const res = await request.get<PlayTrendResponse>(
      '/api/v1/datacenter/trends/play',
      {
        params,
      },
    );
    return res as unknown as PlayTrendResponse;
  },
});

export const contentsQueryOptions = (params: ContentsQueryParams) => ({
  queryKey: ['statistics', 'contents', params],
  queryFn: async (): Promise<PageContentPerformanceResponse> => {
    const res = await request.get<PageContentPerformanceResponse>(
      '/api/v1/datacenter/contents',
      {
        params,
      },
    );
    return res as unknown as PageContentPerformanceResponse;
  },
});

export type AccountOptionsQueryParams = {
  /** 平台过滤：'all' / undefined 时不限平台；'douyin' / 'xiaohongshu' 等值过滤 */
  platform?: PlatformFilter;
};

/**
 * 数据中心账号下拉候选池：按 scope + 平台过滤。
 * 与同主页其他读接口同语义（account.tenant_id = ? / user_id = ?），
 * 不复用通用 `/api/v1/accounts`（其 TENANT scope 走 user_relation 展开，在数据中心场景下会漏账号）。
 */
export const accountOptionsQueryOptions = (
  params: AccountOptionsQueryParams = {},
) => ({
  queryKey: ['statistics', 'accountOptions', params],
  queryFn: async (): Promise<AccountOption[]> => {
    // 'all' 不传 platform，让后端走"不限平台"分支
    const query =
      params.platform && params.platform !== 'all'
        ? { platform: params.platform }
        : undefined;
    const res = await request.get<AccountOption[]>(
      '/api/v1/datacenter/accounts/options',
      { params: query },
    );
    return res as unknown as AccountOption[];
  },
});

export const accountDetailQueryOptions = (accountId: string) => ({
  queryKey: ['statistics', 'accountDetail', accountId],
  queryFn: async (): Promise<AccountDetailResponse> => {
    const res = await request.get<AccountDetailResponse>(
      `/api/v1/datacenter/accounts/${accountId}`,
    );
    return res as unknown as AccountDetailResponse;
  },
});
