import request from '@/api/request';

import type {
  BatchWarningOperationResponse,
  WarningListQueryParams,
  WarningListResponse,
  WarningPlatformFilter,
  WarningStateChangeResponse,
} from './types';

export const warningListQueryOptions = (params: WarningListQueryParams) => ({
  queryKey: ['alert', 'warningList', params],
  queryFn: async (): Promise<WarningListResponse> => {
    // platform='all' / undefined 时不下发 query；与后端 "不限平台" 分支保持一致
    const { platform, ...rest } = params;
    const query = platform && platform !== 'all' ? { ...rest, platform } : rest;
    const res = await request.get<WarningListResponse>(
      '/api/v1/datacenter/warnings',
      {
        params: query,
      },
    );
    return res as unknown as WarningListResponse;
  },
});

export const ignoreWarning = (warningId: string) =>
  request.post<WarningStateChangeResponse>(
    `/api/v1/datacenter/warnings/${warningId}/ignore`,
  ) as unknown as Promise<WarningStateChangeResponse>;

/**
 * 批量标记已读；当 platform 为具体平台时，后端仅影响该平台下的可见账号未读预警。
 * 与 /warnings 列表当前过滤态保持「我看到的就是我能操作的」一致。
 */
export const markAllRead = (platform?: WarningPlatformFilter) =>
  request.post<BatchWarningOperationResponse>(
    '/api/v1/datacenter/warnings/mark-all-read',
    undefined,
    platform && platform !== 'all' ? { params: { platform } } : undefined,
  ) as unknown as Promise<BatchWarningOperationResponse>;

/**
 * 清空已忽略；platform 语义同 {@link markAllRead}。
 */
export const clearIgnoredWarnings = (platform?: WarningPlatformFilter) =>
  request.delete<BatchWarningOperationResponse>(
    '/api/v1/datacenter/warnings/ignored',
    platform && platform !== 'all' ? { params: { platform } } : undefined,
  ) as unknown as Promise<BatchWarningOperationResponse>;
