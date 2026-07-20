import { useMutation, useQuery } from '@tanstack/react-query';
import {
  initQrLogin,
  loginStatusQueryOptions,
  refreshQrCode,
  sendVerifyCode,
  submitLoginAuth,
  submitVerifyCode,
} from './queryOptions';
import type {
  AuthSubmitRequest,
  AuthSubmitResponse,
  InitQrLoginRequest,
  QrLoginInitResponse,
  QrCodeResponse,
  RefreshQrCodeRequest,
  SubmitCodeRequest,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './types';

export const useSendVerifyCode = () =>
  useMutation<VerifyCodeResponse, Error, VerifyCodeRequest>({
    mutationFn: (data: VerifyCodeRequest) => sendVerifyCode(data),
    retry: false,
  });

export const useInitQrLogin = () =>
  useMutation<QrLoginInitResponse, Error, InitQrLoginRequest>({
    mutationFn: (data: InitQrLoginRequest) => initQrLogin(data),
    retry: false,
  });

export const useSubmitVerifyCode = () =>
  useMutation<QrCodeResponse, Error, SubmitCodeRequest>({
    mutationFn: (data: SubmitCodeRequest) => submitVerifyCode(data),
    retry: false,
  });

export const useSubmitLoginAuth = () =>
  useMutation<AuthSubmitResponse, Error, AuthSubmitRequest>({
    mutationFn: (data: AuthSubmitRequest) => submitLoginAuth(data),
    retry: false,
  });

export const useRefreshQrCode = () =>
  useMutation<QrCodeResponse, Error, RefreshQrCodeRequest>({
    mutationFn: (data: RefreshQrCodeRequest) => refreshQrCode(data),
    retry: false,
  });

export const useLoginStatus = (
  sessionId: string,
  options?: { enabled?: boolean },
) => {
  const enabled = options?.enabled ?? !!sessionId;
  return useQuery({
    ...loginStatusQueryOptions(sessionId),
    enabled,
    refetchInterval: (query) => {
      if (!enabled) return false;
      const status = query.state.data?.status as string | undefined;
      return status === 'WAITING_SCAN' ? 2000 : false;
    },
  });
};
