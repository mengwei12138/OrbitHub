import request from '@/api/request';
import type {
  PageTenantResponseData,
  TenantListQueryParams,
  TenantResponse,
  TenantStatsResponse,
} from './types';

/**
 * 公司列表（分页）。
 *
 * 数据权限：后端根据当前 JWT 自动过滤——TENANT_ADMIN 仅能看本公司、PLATFORM_ADMIN 看全部。
 */
export const tenantListQueryOptions = (params: TenantListQueryParams) => ({
  queryKey: ['admin-tenant', 'list', params],
  queryFn: async (): Promise<PageTenantResponseData> => {
    const data = await request.get<PageTenantResponseData>(
      '/api/v1/admin/tenants',
      { params },
    );
    return data as unknown as PageTenantResponseData;
  },
});

/**
 * 公司统计（控制台运营看板用）：总数 + 本月/上月按 created_at 创建数 + 月环比差值。
 * PRD §3.1 控制台 "总租户数" 卡片右下角 "较上月 +N" 来源。
 */
export const tenantStatsQueryOptions = () => ({
  queryKey: ['admin-tenant', 'stats'] as const,
  queryFn: async (): Promise<TenantStatsResponse> => {
    const data = await request.get<TenantStatsResponse>(
      '/api/v1/admin/tenants/stats',
    );
    return data as unknown as TenantStatsResponse;
  },
});

/** 单个公司详情 */
export const tenantDetailQueryOptions = (id: string) => ({
  queryKey: ['admin-tenant', 'detail', id],
  queryFn: async (): Promise<TenantResponse> => {
    const data = await request.get<TenantResponse>(
      `/api/v1/admin/tenants/${id}`,
    );
    return data as unknown as TenantResponse;
  },
  enabled: !!id,
});
