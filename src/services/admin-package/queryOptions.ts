import request from '@/api/request';
import type { PackageResponse, PagePackageResponseData } from './types';

/**
 * 拉取所有套餐（PRD §1.3 固定 3 档），用于公司管理"新增公司"弹窗的套餐下拉。
 *
 * 由于套餐固定，前端实际只需 page=1, pageSize=10 即可拿到全部。
 */
export const packageListQueryOptions = () => ({
  queryKey: ['admin-package', 'list'],
  queryFn: async (): Promise<PackageResponse[]> => {
    const data = await request.get<PagePackageResponseData>(
      '/api/v1/admin/packages',
      { params: { page: 1, pageSize: 10 } },
    );
    return (data as unknown as PagePackageResponseData).list ?? [];
  },
});
