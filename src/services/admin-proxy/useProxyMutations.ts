import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from '@/api/request';
import type { RechargeTenantRequest } from './types';

/** 平台给公司充值积分（PLATFORM_ADMIN 专用，后端 @PreAuthorize 校验） */
export const useRechargeTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tenantId,
      body,
    }: {
      tenantId: string;
      body: RechargeTenantRequest;
    }) => {
      await request.post(
        `/api/v1/admin/proxy/tenants/${tenantId}/recharge`,
        body,
      );
    },
    onSuccess: (_, { tenantId }) => {
      // 充值会影响外部余额：刷新公司详情、单公司余额、全局总览（各公司积分总览表）、
      // 以及该公司的充值流水。total-balances 和 recharge 流水都按 params 分桶，
      // 这里按前缀失效以覆盖所有分页/筛选组合。
      qc.invalidateQueries({ queryKey: ['admin-tenant', 'detail', tenantId] });
      qc.invalidateQueries({ queryKey: ['admin-proxy', 'balance', tenantId] });
      qc.invalidateQueries({ queryKey: ['admin-proxy', 'tenant-balances'] });
      qc.invalidateQueries({ queryKey: ['admin-proxy', 'recharge'] });
    },
  });
};
