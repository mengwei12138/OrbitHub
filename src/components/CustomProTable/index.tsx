/**
 * CustomProTable - 基于 ProTable 封装的通用业务表格组件
 *
 * 设计原则：
 * - 信任 ProTable 的 request 模式，不用 state 重复管理 data / loading / pagination
 * - 只用 ref 存储跨渲染需要的值（total、error），避免不必要的重渲染
 * - 通过 ProTable 的 actionRef 控制 reload / reset，不用 key 强制卸载重建
 */

import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import classnames from 'classnames';
import type React from 'react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TableEmpty, TableError } from '@/components';
import styles from './style.module.css';
import type { CustomProTableProps, CustomProTableRef } from './types';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SEARCH = { labelWidth: 0, span: 6 };
const DEFAULT_OPTIONS = false;

/** 根据总数计算 pageSizeOptions */
const getPageSizeOptions = (total: number): string[] => {
  if (total <= 20) return ['5', '10', '20'];
  if (total <= 50) return ['10', '20', '50'];
  return ['10', '20', '50', '100'];
};

const CustomProTable = forwardRef(function CustomProTable<
  T extends object = object,
>(props: CustomProTableProps<T>, ref: React.ForwardedRef<CustomProTableRef>) {
  const {
    dataSource,
    queryOptions,
    rowKey = 'id',
    locale,
    emptyContent,
    errorContent,
    search,
    options = DEFAULT_OPTIONS,
    pagination,
    ...rest
  } = props;

  const actionRef = useRef<ActionType>(null);

  const [total, setTotal] = useState(0);

  // 只有 error 需要 state（影响 locale.emptyText 的渲染）
  const [error, setError] = useState(false);

  const mergedSearch = useMemo(() => {
    if (search === false) return false;
    if (search === undefined) return DEFAULT_SEARCH;
    return { ...DEFAULT_SEARCH, ...search };
  }, [search]);

  /**
   * 统一数据加载逻辑
   * 返回 ProTable request 所需的 { data, success, total } 格式
   */
  const request = useCallback(
    async (params: Record<string, unknown>) => {
      const {
        current = DEFAULT_PAGE,
        pageSize = DEFAULT_PAGE_SIZE,
        ...searchParams
      } = params;
      const page = current as number;
      const size = pageSize as number;

      if (!dataSource && !queryOptions) {
        return { data: [] as T[], success: true, total: 0 };
      }

      try {
        setError(false);
        let list: T[] = [];
        let total = 0;

        if (queryOptions) {
          const opts = queryOptions({
            ...searchParams,
            page,
            pageSize: size,
          });
          // 与 React Query 同义：enabled === false 时不发请求，回空状态而非"加载失败"
          if (opts.enabled === false) {
            setTotal(0);
            return { data: [] as T[], success: true, total: 0 };
          }
          const res = await opts.queryFn();
          list = res.list;
          total = Number(res.total) || 0;
        } else if (Array.isArray(dataSource)) {
          list = dataSource;
          total = dataSource.length;
        } else if (dataSource instanceof Promise) {
          list = await dataSource;
          total = list.length;
          setTotal(total);
        } else if (typeof dataSource === 'function') {
          const res = await dataSource({
            ...searchParams,
            page,
            pageSize: size,
          });
          list = res.list;
          total = Number(res.total) || 0;
        }

        // 空页回退：当前页无数据且非首页时，回退到前一页（保留搜索参数）
        if (
          list.length === 0 &&
          page > 1 &&
          (queryOptions || typeof dataSource === 'function')
        ) {
          return request({
            ...searchParams,
            current: page - 1,
            pageSize: size,
          });
        }

        setTotal(total);
        return { data: list, success: true, total };
      } catch {
        setError(true);
        setTotal(0);
        return { data: [] as T[], success: true, total: 0 };
      }
    },
    [dataSource, queryOptions],
  );

  // ref 方法：直接委托给 ProTable 的 actionRef
  useImperativeHandle(
    ref,
    () => ({
      reload: () => actionRef.current?.reload(),
      reset: () => actionRef.current?.reset?.(),
    }),
    [],
  );

  const mergedLocale = useMemo(
    () => ({
      ...locale,
      emptyText: error
        ? (errorContent ?? (
            <TableError onRetry={() => actionRef.current?.reload()} />
          ))
        : (emptyContent ?? <TableEmpty />),
    }),
    [locale, error, errorContent, emptyContent],
  );

  const paginationConfig = useMemo(
    () => ({
      ...pagination,
      showTotal: (t: number) => `共 ${t} 条`,
      showSizeChanger: true,
      showQuickJumper: true,
      defaultPageSize: DEFAULT_PAGE_SIZE,
      pageSizeOptions: getPageSizeOptions(total),
      locale: {
        items_per_page: '条/页',
        jump_to: '跳至',
        page: '页',
        prev_page: '上一页',
        next_page: '下一页',
      },
    }),
    [total, pagination],
  );

  return (
    <ProTable<T>
      {...rest}
      className={classnames(styles.container, rest.className)}
      rowKey={rowKey}
      actionRef={actionRef}
      request={request}
      locale={mergedLocale}
      pagination={paginationConfig}
      search={mergedSearch}
      options={options}
    />
  );
}) as <T extends object = object>(
  props: CustomProTableProps<T> & { ref?: React.Ref<CustomProTableRef> },
) => React.ReactElement;

export default CustomProTable;
