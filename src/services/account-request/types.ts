export type AccountRequestStatus = 'PENDING' | 'REVIEWED';

export type AccountRequestRecord = {
  id: string;
  realName: string;
  phone: string;
  company: string | null;
  status: AccountRequestStatus;
  createdAt: string;
};

export type CreateAccountRequestPayload = {
  phone: string;
  realName: string;
  company?: string;
};

export type ReviewAccountRequestPayload = {
  id: string;
};

export type AccountRequestListQueryParams = {
  keyword?: string;
  page?: number;
  pageSize?: number;
};

export type PageAccountRequestResponseData = {
  list: AccountRequestRecord[];
  total: number;
  page: number;
  pageSize: number;
};
