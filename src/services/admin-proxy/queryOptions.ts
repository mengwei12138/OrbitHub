import request from '@/api/request';
import type {
  MatrixBalanceResponse,
  MatrixRecordQueryParams,
  MatrixRecordResponse,
  ProxyPageData,
  ProxyPageDataTenantBalance,
  TenantBalanceQueryParams,
} from './types';

/**
 * 公司余额。PLATFORM_ADMIN 必传 tenantId；TENANT_ADMIN / NORMAL_ADMIN 服务端自动用本公司。
 * tenantId 为空时不发请求（避免 PLATFORM_ADMIN 在筛选未选时抛 VALIDATION_ERROR）。
 */
export const balanceQueryOptions = (tenantId: string | undefined) => ({
  queryKey: ['admin-proxy', 'balance', tenantId ?? 'self'],
  queryFn: async (): Promise<MatrixBalanceResponse> => {
    const data = await request.get<MatrixBalanceResponse>(
      '/api/v1/admin/proxy/balance',
      tenantId ? { params: { tenantId } } : undefined,
    );
    return data as unknown as MatrixBalanceResponse;
  },
});

/**
 * 全局积分总览：分页公司列表 + 逐行外部余额聚合。
 * 后端串行调外部 /balance，单行失败回填 null（balanceError 含错误码）。
 */
export const tenantBalanceListQueryOptions = (
  params: TenantBalanceQueryParams,
) => ({
  queryKey: ['admin-proxy', 'tenant-balances', params],
  queryFn: async (): Promise<ProxyPageDataTenantBalance> => {
    const data = await request.get<ProxyPageDataTenantBalance>(
      '/api/v1/admin/proxy/tenants/balances',
      { params },
    );
    return data as unknown as ProxyPageDataTenantBalance;
  },
});

/** 消费流水。PLATFORM_ADMIN 必传 tenantId。 */
export const consumeListQueryOptions = (params: MatrixRecordQueryParams) => ({
  queryKey: ['admin-proxy', 'consume', params],
  queryFn: async (): Promise<ProxyPageData<MatrixRecordResponse>> => {
    const data = await request.get<ProxyPageData<MatrixRecordResponse>>(
      '/api/v1/admin/proxy/points/consume',
      { params },
    );
    return data as unknown as ProxyPageData<MatrixRecordResponse>;
  },
});

/** 充值流水。PLATFORM_ADMIN 必传 tenantId。 */
export const rechargeListQueryOptions = (params: MatrixRecordQueryParams) => ({
  queryKey: ['admin-proxy', 'recharge', params],
  queryFn: async (): Promise<ProxyPageData<MatrixRecordResponse>> => {
    const data = await request.get<ProxyPageData<MatrixRecordResponse>>(
      '/api/v1/admin/proxy/points/recharge',
      { params },
    );
    return data as unknown as ProxyPageData<MatrixRecordResponse>;
  },
});
