import request from '@/api/request';
import type { PersonalQuotaStatus, QuotaSummary } from './types';

/**
 * 公司配额汇总。
 * PRD §4.1 列表底部「公司总社交账号数上限：已使用 11 / 30」即由此提供。
 * 数据权限：TENANT_ADMIN 只能查本公司、PLATFORM_ADMIN 可查任意公司。
 */
export const quotaSummaryQueryOptions = (tenantId: string) => ({
  queryKey: ['admin-user-quota', 'summary', tenantId],
  queryFn: async (): Promise<QuotaSummary> => {
    const data = await request.get<QuotaSummary>(
      `/api/v1/admin/tenants/${tenantId}/quota-summary`,
    );
    return data as unknown as QuotaSummary;
  },
  enabled: !!tenantId,
});

/**
 * 当前登录用户的个人配额状态。
 * 「添加账号」页加载时调用，用于在弹出表单前提示「已达上限」并禁用提交。
 * 后端 /api/v1/accounts/login/verify-code 处会兜底拦截绕过 UI 的请求。
 */
export const myQuotaStatusQueryOptions = () => ({
  queryKey: ['admin-user-quota', 'me', 'status'],
  queryFn: async (): Promise<PersonalQuotaStatus> => {
    const data = await request.get<PersonalQuotaStatus>(
      '/api/v1/admin/users/me/quota-status',
    );
    return data as unknown as PersonalQuotaStatus;
  },
});
