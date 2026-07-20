import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from '@/api/request';
import type { AssignQuotaRequest } from './types';

/**
 * 给用户分配个人配额（PRD §4.1 新建/编辑普通管理员的「社交账号创建上限」字段提交）。
 *
 * 后端会校验：
 * - personalQuota ≥ 0
 * - 所有个人上限之和 ≤ 公司套餐 limit
 * - 编辑时新值 ≥ 当前已创建的社交账号数
 */
export const useAssignQuota = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      body,
    }: {
      userId: string;
      body: AssignQuotaRequest;
    }) => {
      await request.post(`/api/v1/admin/users/${userId}/quota`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-user', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin-user-quota', 'summary'] });
    },
  });
};
