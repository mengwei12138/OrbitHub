/**
 * CustomEditableProTable - 基于 EditableProTable 封装的通用可编辑表格组件
 *
 * 完全继承 EditableProTable 的默认行为：
 * - 支持行编辑、单元格编辑
 * - 保持 ref 接口但不暴露方法
 * - 使用 CustomEmpty 作为空状态
 *
 * @description 可编辑业务表格组件，适用于需要编辑功能的列表页场景
 * @example
 * <CustomEditableProTable
 *   value={data}
 *   onChange={setData}
 *   rowKey="id"
 * />
 */

import { EditableProTable } from '@ant-design/pro-components';
import type React from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { CustomEmpty } from '@/components';

import type {
  CustomEditableProTableProps,
  CustomEditableProTableRef,
} from './types';

const CustomEditableProTable = forwardRef(function CustomEditableProTable<
  T extends object = object,
>(
  props: CustomEditableProTableProps<T>,
  ref: React.ForwardedRef<CustomEditableProTableRef>,
) {
  const { rowKey = 'id', locale, ...rest } = props;

  useImperativeHandle(ref, () => ({}));

  const mergedLocale = useMemo(
    () => ({ emptyText: <CustomEmpty />, ...locale }),
    [locale],
  );

  return (
    <EditableProTable<T>
      {...rest}
      rowKey={rowKey}
      virtual
      locale={mergedLocale}
    />
  );
}) as <T extends object = object>(
  props: CustomEditableProTableProps<T> & {
    ref?: React.Ref<CustomEditableProTableRef>;
  },
) => React.ReactElement;

export default CustomEditableProTable;
