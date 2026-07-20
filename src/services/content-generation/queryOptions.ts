import request from '@/api/request';

import { fetchAvatarAssets, fetchCreditsBalance, fetchCreditsLog } from './api';
import type {
  AvatarAssetDto,
  CreditsLogQuery,
  PageDataWorks,
  WorkDetailDto,
  WorksListQuery,
} from './types';

const API_PREFIX = '/api/v1/content-generation';

export const worksListQueryOptions = (params: WorksListQuery = {}) => ({
  queryKey: ['content-generation', 'works', params],
  queryFn: async (): Promise<PageDataWorks> => {
    const res = await request.get<PageDataWorks>(`${API_PREFIX}/works`, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        ...(params.type && params.type !== 'all' ? { type: params.type } : {}),
      },
    });
    return res as unknown as PageDataWorks;
  },
});

export const workDetailQueryOptions = (workId: string | null) => ({
  queryKey: ['content-generation', 'works', 'detail', workId],
  queryFn: async (): Promise<WorkDetailDto> => {
    const res = await request.get<WorkDetailDto>(
      `${API_PREFIX}/works/${workId}`,
    );
    return res as unknown as WorkDetailDto;
  },
  enabled: !!workId,
});

export const avatarAssetsQueryOptions = () => ({
  queryKey: ['content-generation', 'avatars'],
  queryFn: (): Promise<AvatarAssetDto[]> => fetchAvatarAssets(),
  staleTime: 5 * 60 * 1000,
});

/** 顶部栏积分展示；代理外部 GET /api/open/points/balance */
export const creditsBalanceQueryKey = [
  'content-generation',
  'credits-balance',
] as const;

export const creditsBalanceQueryOptions = () => ({
  queryKey: creditsBalanceQueryKey,
  queryFn: fetchCreditsBalance,
  staleTime: 30_000,
});

export const creditsLogQueryOptions = (params: CreditsLogQuery = {}) => ({
  queryKey: ['content-generation', 'credits-log', params] as const,
  queryFn: () => fetchCreditsLog(params),
});
