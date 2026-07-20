import request from '@/api/request';
import type {
  PageUserResponseData,
  UserListQueryParams,
  UserResponse,
} from './types';

/**
 * 用户列表（分页）。
 *
 * 数据权限：后端按当前 JWT 自动收敛——TENANT_ADMIN 只看本公司、PLATFORM_ADMIN 看全部。
 * PRD §3.4 超管视角：role=TENANT_ADMIN 列出所有公司的租户管理员。
 * PRD §4.1 租户管理员视角：不传 role，列出本公司全部管理员（含自己）。
 */
export const userListQueryOptions = (params: UserListQueryParams) => ({
  queryKey: ['admin-user', 'list', params],
  queryFn: async (): Promise<PageUserResponseData> => {
    const data = await request.get<PageUserResponseData>(
      '/api/v1/admin/users',
      { params },
    );
    return data as unknown as PageUserResponseData;
  },
});

/** 单个用户详情 */
export const userDetailQueryOptions = (id: string) => ({
  queryKey: ['admin-user', 'detail', id],
  queryFn: async (): Promise<UserResponse> => {
    const data = await request.get<UserResponse>(`/api/v1/admin/users/${id}`);
    return data as unknown as UserResponse;
  },
  enabled: !!id,
});
