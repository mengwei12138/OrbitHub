import request from '@/api/request';

import type {
  AccountLogQueryParams,
  AccountQueryParams,
  AccountResponse,
  AuthSubmitRequest,
  AuthSubmitResponse,
  BatchOperationRequest,
  BatchOperationResponse,
  InitQrLoginRequest,
  LoginStatusResponse,
  PageDataAccountLogResponse,
  PageDataAccountResponse,
  QrLoginInitResponse,
  QrCodeResponse,
  ReactivateInitResponse,
  RefreshQrCodeRequest,
  RegionDictionaryData,
  SubmitCodeRequest,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './types';

export const accountListQueryOptions = (params: AccountQueryParams) => ({
  queryKey: ['account', 'list', params],
  queryFn: async (): Promise<PageDataAccountResponse> => {
    const res = await request.get<PageDataAccountResponse>('/api/v1/accounts', {
      params,
    });
    return res as unknown as PageDataAccountResponse;
  },
});

export const accountDetailQueryOptions = (id: string) => ({
  queryKey: ['account', 'detail', id],
  queryFn: async (): Promise<AccountResponse> => {
    const res = await request.get<AccountResponse>(`/api/v1/accounts/${id}`);
    return res as unknown as AccountResponse;
  },
});

export const accountLogsQueryOptions = (
  id: string,
  params: AccountLogQueryParams,
) => ({
  queryKey: ['account', 'logs', id, params],
  queryFn: async (): Promise<PageDataAccountLogResponse> => {
    const res = await request.get<PageDataAccountLogResponse>(
      `/api/v1/accounts/${id}/logs`,
      {
        params,
      },
    );
    return res as unknown as PageDataAccountLogResponse;
  },
});

export const loginStatusQueryOptions = (sessionId: string) => ({
  queryKey: ['account', 'login', 'status', sessionId],
  queryFn: (): Promise<LoginStatusResponse> =>
    request.get<LoginStatusResponse>(
      `/api/v1/accounts/login/${sessionId}/status`,
    ) as unknown as Promise<LoginStatusResponse>,
});

export const initQrLogin = (data: InitQrLoginRequest) =>
  (request.post<QrLoginInitResponse>(
    '/api/v1/accounts/login/qr-code/init',
    data,
  ) as unknown as Promise<QrLoginInitResponse>);

export const regionDictionaryQueryOptions = () => ({
  queryKey: ['account', 'regions'],
  queryFn: async (): Promise<RegionDictionaryData> => {
    const res = await request.get<RegionDictionaryData>(
      '/api/v1/accounts/regions',
    );
    return res as unknown as RegionDictionaryData;
  },
});

export const sendVerifyCode = (data: VerifyCodeRequest) =>
  request.post<VerifyCodeResponse>(
    '/api/v1/accounts/login/verify-code',
    data,
  ) as unknown as Promise<VerifyCodeResponse>;

export const submitVerifyCode = (data: SubmitCodeRequest) =>
  request.post<QrCodeResponse>(
    '/api/v1/accounts/login/verify-code/submit',
    data,
  ) as unknown as Promise<QrCodeResponse>;

export const refreshQrCode = (data: RefreshQrCodeRequest) =>
  request.post<QrCodeResponse>(
    '/api/v1/accounts/login/qr-code/refresh',
    data,
  ) as unknown as Promise<QrCodeResponse>;

export const submitLoginAuth = (data: AuthSubmitRequest) =>
  request.post<AuthSubmitResponse>(
    '/api/v1/accounts/login/auth/submit',
    data,
  ) as unknown as Promise<AuthSubmitResponse>;

export const startAccount = (id: string) =>
  request.post<void>(`/api/v1/accounts/${id}/start`);

export const stopAccount = (id: string) =>
  request.post<void>(`/api/v1/accounts/${id}/stop`);

export const deleteAccount = (id: string) =>
  request.delete<void>(`/api/v1/accounts/${id}`);

export const batchStartAccounts = (data: BatchOperationRequest) =>
  request.post<BatchOperationResponse>('/api/v1/accounts/batch/start', data);

export const batchStopAccounts = (data: BatchOperationRequest) =>
  request.post<BatchOperationResponse>('/api/v1/accounts/batch/stop', data);

export const batchDeleteAccounts = (data: BatchOperationRequest) =>
  request.post<BatchOperationResponse>('/api/v1/accounts/batch/delete', data);

export const reactivateInit = (id: string) =>
  request.post<ReactivateInitResponse>(
    `/api/v1/accounts/${id}/reactivate-init`,
  ) as unknown as Promise<ReactivateInitResponse>;

// useQuery 通过 queryKey 在 StrictMode 双挂载下天然 dedupe in-flight 请求，
// 因此不再用 useMutation——后者的 onSuccess 会绑定到已卸载的实例。
// 不要再设 staleTime/gcTime: Infinity 或 refetchOnMount: false：
// 一旦缓存错误会"粘住"，用户每次进页面都直接命中错误态。
export const reactivateInitQueryOptions = (id: string) => ({
  queryKey: ['account', 'reactivate-init', id],
  queryFn: (): Promise<ReactivateInitResponse> => reactivateInit(id),
  refetchOnWindowFocus: false as const,
  retry: false as const,
});
