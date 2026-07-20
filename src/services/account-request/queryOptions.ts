import request from '@/api/request';
import type {
  AccountRequestListQueryParams,
  AccountRequestRecord,
  CreateAccountRequestPayload,
  PageAccountRequestResponseData,
  ReviewAccountRequestPayload,
} from './types';

export const createAccountRequest = (data: CreateAccountRequestPayload) =>
  request.post<AccountRequestRecord>('/api/v1/prototype/account-requests', {
    phone: data.phone,
    realName: data.realName,
    company: data.company?.trim() || undefined,
  }) as unknown as Promise<AccountRequestRecord>;

export const accountRequestListQueryOptions = (
  params: AccountRequestListQueryParams,
) => ({
  queryKey: ['account-request', 'list', params],
  queryFn: async (): Promise<PageAccountRequestResponseData> => {
    const data = await request.get<PageAccountRequestResponseData>(
      '/api/v1/prototype/account-requests',
      { params },
    );
    return data as unknown as PageAccountRequestResponseData;
  },
});

export const reviewAccountRequest = (data: ReviewAccountRequestPayload) =>
  request.post<AccountRequestRecord>(
    `/api/v1/prototype/account-requests/${data.id}/review`,
  ) as unknown as Promise<AccountRequestRecord>;
