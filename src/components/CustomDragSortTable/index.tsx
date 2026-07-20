/**
 * CustomDragSortTable - 基于 DragSortTable 封装的通用拖拽排序表格组件
 *
 * 完全继承 DragSortTable 的默认行为：
 * - 支持拖拽排序
 * - 保持 ref 接口但不暴露方法
 * - 使用 CustomEmpty 作为空状态
 *
 * @description 拖拽排序业务表格组件，适用于需要拖拽排序功能的列表页场景
 * @example
 * <CustomDragSortTable
 *   request={fetchList}
 *   rowKey="id"
 *   dragSortKey="sort"
 *   onDragSortEnd={handleSort}
 * />
 */

import { DragSortTable } from '@ant-design/pro-components';
import type React from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { CustomEmpty } from '@/components';

import type { CustomDragSortTableProps, CustomDragSortTableRef } from './types';

const CustomDragSortTable = forwardRef(function CustomDragSortTable<
  T extends object = object,
>(
  props: CustomDragSortTableProps<T>,
  ref: React.ForwardedRef<CustomDragSortTableRef>,
) {
  const { rowKey = 'id', locale, ...rest } = props;

  useImperativeHandle(ref, () => ({}));

  const mergedLocale = useMemo(
    () => ({ emptyText: <CustomEmpty />, ...locale }),
    [locale],
  );

  return (
    <DragSortTable<T> {...rest} rowKey={rowKey} virtual locale={mergedLocale} />
  );
}) as <T extends object = object>(
  props: CustomDragSortTableProps<T> & {
    ref?: React.Ref<CustomDragSortTableRef>;
  },
) => React.ReactElement;

export default CustomDragSortTable;
