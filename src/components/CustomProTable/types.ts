import type { ParamsType, ProTableProps } from '@ant-design/pro-components';
import type { PaginationParams, PaginationResponse } from '@/api/types';

export type CustomProTableRef = {
  /** 重新加载当前页数据 */
  reload: () => void;
  /** 重置搜索条件并回到第一页 */
  reset: () => void;
};

export type CustomProTableProps<
  T extends object = object,
  U extends ParamsType = ParamsType,
> = Omit<
  ProTableProps<T, U>,
  'rowKey' | 'value' | 'onChange' | 'request' | 'dataSource'
> & {
  /**
   * @deprecated
   * 1、AI不可以使用这种方式
   * 2、无OpenAPI内容时，可以使用字段进行mock
   * 2、接入OpenAPI以后，使用此字段视为**错误代码**
   */
  dataSource?:
    | T[]
    | Promise<T[]>
    | ((params?: PaginationParams) => Promise<PaginationResponse<T>>);
  queryOptions?: (params: PaginationParams) => {
    queryKey: unknown[];
    queryFn: () => Promise<{
      list: T[];
      total: string | number;
      [key: string]: unknown;
    }>;
    /**
     * 与 React Query 同义：false 时不触发 queryFn，表格回到空状态（非 "加载失败"）。
     * 用于"未选必要筛选条件时先不查"的常见场景。
     */
    enabled?: boolean;
  };
  rowKey?: string;
  emptyContent?: React.ReactNode;
  errorContent?: React.ReactNode;
};
