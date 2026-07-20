import type { TableProps } from 'antd';

export type CustomTableRef = Record<string, never>;

export type CustomTableProps<T> = Omit<TableProps<T>, 'rowKey'> & {
  rowKey?: string;
};
