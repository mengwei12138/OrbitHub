import type {
  EditableProTableProps,
  ParamsType,
} from '@ant-design/pro-components';

export type CustomEditableProTableRef = Record<string, never>;

export type CustomEditableProTableProps<
  T extends object = object,
  U extends ParamsType = ParamsType,
> = Omit<EditableProTableProps<T, U>, 'rowKey'> & {
  rowKey?: string;
};
