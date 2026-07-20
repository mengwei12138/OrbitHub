/**
 * CustomTable - 基于 antd Table 封装的通用业务表格组件
 *
 * 完全继承 antd Table 的默认行为，对以下功能做定制化配置：
 * - 默认启用虚拟化
 * - 默认 rowKey 为 id
 * - 保持 ref 接口但不暴露方法
 * - 使用 CustomEmpty 作为空状态
 *
 * @description 轻量级业务表格组件，适用于简单的列表展示场景
 * @example
 * <CustomTable
 *   dataSource={[{ id: '1', name: 'test' }]}
 *   columns={[{ title: '姓名', dataIndex: 'name' }]}
 * />
 */

import { Table } from 'antd';
import type React from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { CustomEmpty } from '@/components';

import type { CustomTableProps, CustomTableRef } from './types';

const CustomTable = forwardRef(function CustomTable<T extends object>(
  props: CustomTableProps<T>,
  ref: React.ForwardedRef<CustomTableRef>,
) {
  const { rowKey = 'id', locale, ...rest } = props;

  useImperativeHandle(ref, () => ({}));

  const mergedLocale = useMemo(
    () => ({ emptyText: <CustomEmpty />, ...locale }),
    [locale],
  );

  return <Table<T> rowKey={rowKey} virtual locale={mergedLocale} {...rest} />;
}) as <T extends object>(
  props: CustomTableProps<T> & { ref?: React.Ref<CustomTableRef> },
) => React.ReactElement;

export default CustomTable;
