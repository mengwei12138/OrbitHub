import request from '@/api/request';

import type {
  OperationLogQueryParams,
  PageOperationLogResponseData,
} from './types';

/**
 * 操作日志列表。
 * 数据权限：后端按 JWT 自动收敛——TENANT_ADMIN 只看本公司、PLATFORM_ADMIN 看全部。
 */
export const operationLogsQueryOptions = (params: OperationLogQueryParams) => ({
  queryKey: ['operation-log', 'list', params],
  queryFn: async (): Promise<PageOperationLogResponseData> => {
    const data = await request.get<PageOperationLogResponseData>(
      '/api/v1/admin/operation-logs',
      { params },
    );
    return data as unknown as PageOperationLogResponseData;
  },
});
