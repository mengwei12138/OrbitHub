import type { ProColumns } from '@ant-design/pro-components';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { CustomProTable } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import { operationLogsQueryOptions } from '@/services/operation-log';
import { formatDateTimeMinute } from '@/utils/date';

import styles from './style.module.css';

/**
 * PRD §3.1 最近动态：3 列 — 时间 / 操作人 / 操作内容（TC-K-007 显式校验）。
 *
 * 由表格自身按 page/pageSize 拉接口，避免父组件预取数组导致分页选项失效。
 */
export interface RecentActivity {
  id: string;
  time: string;
  operator: string;
  content: string;
}

export type RecentActivityTableRef = {
  reload: () => void;
};

const activityColumns: ProColumns<RecentActivity>[] = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 180,
    search: false,
  },
  {
    title: '操作人',
    dataIndex: 'operator',
    key: 'operator',
    width: 160,
    search: false,
  },
  {
    title: '操作内容',
    dataIndex: 'content',
    key: 'content',
    search: false,
    ellipsis: true,
  },
];

const RecentActivityTable = forwardRef<RecentActivityTableRef>(
  function RecentActivityTable(_props, ref) {
    const tableRef = useRef<CustomProTableRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        reload: () => tableRef.current?.reload(),
      }),
      [],
    );

    const queryOptions = useMemo(
      () =>
        ({ page, pageSize }: { page?: number; pageSize?: number }) => {
          const apiParams = { page: page ?? 1, pageSize: pageSize ?? 10 };
          return {
            queryKey: ['operation-log', 'list', 'console-recent', apiParams],
            queryFn: async () => {
              const res = await operationLogsQueryOptions(apiParams).queryFn();
              return {
                list: (res.list ?? []).map((log) => ({
                  id: log.id,
                  time: formatDateTimeMinute(log.createdAt),
                  operator: log.operatorLabel ?? '系统',
                  content:
                    log.operationContent ?? log.targetName ?? log.operationType,
                })),
                total: res.total ?? 0,
              };
            },
          };
        },
      [],
    );

    return (
      <div className={styles.tableCard}>
        <CustomProTable<RecentActivity>
          ref={tableRef}
          rowKey="id"
          columns={activityColumns}
          search={false}
          queryOptions={queryOptions}
        />
      </div>
    );
  },
);

export default RecentActivityTable;
