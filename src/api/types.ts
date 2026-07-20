export type Result<T = unknown> = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: T | null;
};

export type ErrorInfo = {
  field: string;
  message: string;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
  [key: string]: unknown;
};

export type PaginationResponse<T = unknown> = {
  list: T[];
  total: number;
};
