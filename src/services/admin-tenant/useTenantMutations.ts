import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from '@/api/request';
import type {
  CreateTenantRequest,
  TenantResponse,
  UpdateTenantRequest,
} from './types';

/** 创建公司（仅创建公司本身；TENANT_ADMIN 由调用方串调 users API 单独创建） */
export const useCreateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTenantRequest) => {
      const data = await request.post<TenantResponse>(
        '/api/v1/admin/tenants',
        body,
      );
      return data as unknown as TenantResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenant', 'list'] });
    },
  });
};

export const useUpdateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: UpdateTenantRequest;
    }) => {
      const data = await request.put<TenantResponse>(
        `/api/v1/admin/tenants/${id}`,
        body,
      );
      return data as unknown as TenantResponse;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-tenant', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin-tenant', 'detail', id] });
    },
  });
};

export const useDisableTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await request.post(`/api/v1/admin/tenants/${id}/disable`);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-tenant', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin-tenant', 'detail', id] });
    },
  });
};

export const useEnableTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await request.post(`/api/v1/admin/tenants/${id}/enable`);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-tenant', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin-tenant', 'detail', id] });
    },
  });
};
