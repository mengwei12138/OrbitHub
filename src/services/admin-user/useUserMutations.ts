import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from '@/api/request';
import type {
  CreateUserRequest,
  ResetPasswordRequest,
  UpdateUserRequest,
  UserResponse,
} from './types';

const INVALIDATE_KEYS = [
  ['admin-user', 'list'],
  ['admin-user-quota', 'summary'],
] as const;

const invalidate = (qc: ReturnType<typeof useQueryClient>, userId?: string) => {
  for (const queryKey of INVALIDATE_KEYS) {
    qc.invalidateQueries({ queryKey });
  }
  if (userId) {
    qc.invalidateQueries({ queryKey: ['admin-user', 'detail', userId] });
  }
};

/** 创建用户（含 TENANT_ADMIN / NORMAL_ADMIN / PLATFORM_ADMIN） */
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateUserRequest) => {
      const data = await request.post<UserResponse>(
        '/api/v1/admin/users',
        body,
      );
      return data as unknown as UserResponse;
    },
    onSuccess: () => invalidate(qc),
  });
};

/** 编辑用户（姓名/手机号；状态走 disable/enable 独立接口） */
export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: UpdateUserRequest;
    }) => {
      const data = await request.put<UserResponse>(
        `/api/v1/admin/users/${id}`,
        body,
      );
      return data as unknown as UserResponse;
    },
    onSuccess: (_, { id }) => invalidate(qc, id),
  });
};

export const useDisableUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await request.post(`/api/v1/admin/users/${id}/disable`);
    },
    onSuccess: (_, id) => invalidate(qc, id),
  });
};

export const useEnableUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await request.post(`/api/v1/admin/users/${id}/enable`);
    },
    onSuccess: (_, id) => invalidate(qc, id),
  });
};

/**
 * 重置用户密码。
 * 前端按 PRD §3.4 生成 8 位字母+数字明文，POST 后给运维展示并提供复制按钮。
 */
export const useResetPassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: ResetPasswordRequest;
    }) => {
      await request.post(`/api/v1/admin/users/${id}/reset-password`, body);
    },
    onSuccess: (_, { id }) => invalidate(qc, id),
  });
};
