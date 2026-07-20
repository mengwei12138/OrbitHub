import type { DragTableProps, ParamsType } from '@ant-design/pro-components';

export type CustomDragSortTableRef = Record<string, never>;

export type CustomDragSortTableProps<
  T extends object = object,
  U extends ParamsType = ParamsType,
> = Omit<DragTableProps<T, U>, 'rowKey'> & {
  rowKey?: string;
};
