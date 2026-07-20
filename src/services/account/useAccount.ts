import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  accountDetailQueryOptions,
  accountListQueryOptions,
  accountLogsQueryOptions,
  batchDeleteAccounts,
  batchStartAccounts,
  batchStopAccounts,
  deleteAccount,
  reactivateInit,
  startAccount,
  stopAccount,
} from './queryOptions';
import type {
  AccountLogQueryParams,
  AccountQueryParams,
  BatchOperationRequest,
  ReactivateInitResponse,
} from './types';

const accountListQueryKey = ['account', 'list'];

export const useAccountList = (params: AccountQueryParams) =>
  useQuery(accountListQueryOptions(params));

export const useAccount = (id: string) =>
  useQuery(accountDetailQueryOptions(id));

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountListQueryKey });
    },
  });
};

export const useStartAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => startAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountListQueryKey });
    },
  });
};

export const useStopAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stopAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountListQueryKey });
    },
  });
};

export const useBatchStartAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchOperationRequest) => batchStartAccounts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountListQueryKey });
    },
  });
};

export const useBatchStopAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchOperationRequest) => batchStopAccounts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountListQueryKey });
    },
  });
};

export const useBatchDeleteAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchOperationRequest) => batchDeleteAccounts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountListQueryKey });
    },
  });
};

export const useAccountLogs = (id: string, params: AccountLogQueryParams) =>
  useQuery(accountLogsQueryOptions(id, params));

/**
 * 失效账号"重新登录"流程的发起接口：
 * 调用后返回账号的平台/手机号/昵称用于预填添加页表单。
 * 仅对 status==INVALID 的账号成功；其他状态后端返回业务错误，前端弹错。
 */
export const useReactivateInit = () =>
  useMutation<ReactivateInitResponse, Error, string>({
    mutationFn: (id: string) => reactivateInit(id),
    retry: false,
  });
