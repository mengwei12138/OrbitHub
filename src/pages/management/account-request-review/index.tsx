import type { ProColumns } from '@ant-design/pro-components';
import { message } from 'antd';
import { useRef } from 'react';
import { CustomProTable } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import PageHeader from '@/components/PageHeader';
import {
  accountRequestListQueryOptions,
  type AccountRequestRecord,
  type AccountRequestListQueryParams,
  useReviewAccountRequest,
} from '@/services/account-request';
import { formatDateTimeMinute } from '@/utils/date';
import styles from './style.module.css';

const STATUS_TEXT: Record<AccountRequestRecord['status'], string> = {
  PENDING: '待审核',
  REVIEWED: '已审核',
};

const AccountRequestReviewPage: React.FC = () => {
  const tableRef = useRef<CustomProTableRef>(null);
  const { mutate: reviewAccountRequest, isPending } = useReviewAccountRequest({
    onSuccess: () => {
      message.success('已标记为已审核');
      tableRef.current?.reload();
    },
    onError: (error) => {
      message.error(error.message || '审核失败');
    },
  });

  const columns: ProColumns<AccountRequestRecord>[] = [
    {
      title: '申请人姓名',
      dataIndex: 'realName',
      key: 'realName',
      ellipsis: true,
      fieldProps: {
        placeholder: '请输入姓名/手机号/企业',
        allowClear: true,
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '企业',
      dataIndex: 'company',
      key: 'company',
      width: 220,
      hideInSearch: true,
      render: (_: unknown, record: AccountRequestRecord) =>
        record.company ?? '-',
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      hideInSearch: true,
      render: (_: unknown, record: AccountRequestRecord) =>
        formatDateTimeMinute(record.createdAt),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      hideInSearch: true,
      render: (_: unknown, record: AccountRequestRecord) => {
        if (record.status === 'REVIEWED') {
          return (
            <span className={`${styles.statusTag} ${styles.reviewedTag}`}>
              {STATUS_TEXT[record.status]}
            </span>
          );
        }

        return (
          <button
            type="button"
            className={`${styles.statusTag} ${styles.pendingTag}`}
            disabled={isPending}
            onClick={() => reviewAccountRequest({ id: record.id })}
          >
            {STATUS_TEXT[record.status]}
          </button>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="账号申请审核" />

      <CustomProTable<AccountRequestRecord>
        ref={tableRef}
        rowKey="id"
        columns={columns}
        queryOptions={(params) => {
          const { realName, page, pageSize } = params as {
            realName?: string;
            page?: number;
            pageSize?: number;
          };
          const apiParams: AccountRequestListQueryParams = {
            keyword: realName?.trim() || undefined,
            page,
            pageSize,
          };
          return accountRequestListQueryOptions(apiParams);
        }}
      />
    </div>
  );
};

export default AccountRequestReviewPage;
