import { Button } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomEmpty, CustomProTable } from '@/components';
import { PLACEHOLDER } from '@/constants';
import { useAccount } from '@/services/account';
import { accountLogsQueryOptions } from '@/services/account/queryOptions';
import type { AccountLogResponse } from '@/services/account/types';
import { formatDate, formatDateTime } from '@/utils/date';

import StatusBadge from '../components/StatusBadge';
import styles from './style.module.css';

const DATE_PRESET_ENUM = {
  today: '今天',
  yesterday: '昨天',
  last7days: '最近 7 天',
  last30days: '最近 30 天',
  thisMonth: '本月',
  lastMonth: '上月',
};

const OPERATION_DISPLAY_MAP: Record<string, string> = {
  LOGIN: '登录',
  START: '启动',
  STOP: '停止',
  DELETE: '删除',
  EXPIRED: '登录失效',
};

const LOG_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  登录: { bg: '#E6F4FF', color: '#1677FF' },
  LOGIN: { bg: '#E6F4FF', color: '#1677FF' },
  启动: { bg: '#F9F0FF', color: '#722ED1' },
  START: { bg: '#F9F0FF', color: '#722ED1' },
  停止: { bg: '#FFF0F6', color: '#EB2F96' },
  STOP: { bg: '#FFF0F6', color: '#EB2F96' },
  删除: { bg: '#FFF2E6', color: '#FA8C16' },
  DELETE: { bg: '#FFF2E6', color: '#FA8C16' },
  登录失效: { bg: '#FFF2F0', color: '#FF4D4F' },
  EXPIRED: { bg: '#FFF2F0', color: '#FF4D4F' },
};

const getDateRange = (
  preset: string,
): { startDate?: string; endDate?: string } => {
  const today = dayjs();
  switch (preset) {
    case 'today':
      return {
        startDate: formatDate(),
        endDate: formatDate(),
      };
    case 'yesterday': {
      const yesterday = today.subtract(1, 'day');
      return {
        startDate: formatDate(yesterday),
        endDate: formatDate(yesterday),
      };
    }
    case 'last7days':
      return {
        startDate: formatDate(today.subtract(6, 'day')),
        endDate: formatDate(),
      };
    case 'last30days':
      return {
        startDate: formatDate(today.subtract(29, 'day')),
        endDate: formatDate(),
      };
    case 'thisMonth':
      return {
        startDate: formatDate(today.startOf('month')),
        endDate: formatDate(),
      };
    case 'lastMonth': {
      const lastMonth = today.subtract(1, 'month');
      return {
        startDate: formatDate(lastMonth.startOf('month')),
        endDate: formatDate(lastMonth.endOf('month')),
      };
    }
    default:
      return {
        startDate: formatDate(today.subtract(6, 'day')),
        endDate: formatDate(),
      };
  }
};

const LogTypeTag: React.FC<{ type: string }> = ({ type }) => {
  const colorScheme = useMemo(
    () =>
      LOG_TYPE_COLORS[type] || {
        bg: '#F5F5F5',
        color: '#595959',
      },
    [type],
  );
  const displayText = useMemo(
    () => OPERATION_DISPLAY_MAP[type] || type,
    [type],
  );
  return (
    <span
      className={styles.logTypeTag}
      style={{ backgroundColor: colorScheme.bg, color: colorScheme.color }}
    >
      {displayText}
    </span>
  );
};

const AccountLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('accountId') || '';
  const accountQuery = useAccount(accountId);
  const { data: accountData, isLoading, error } = accountQuery;

  const renderAccountInfo = () => {
    if (isLoading) {
      return (
        <div className={styles.accountInfoCard}>
          <div className={styles.loading}>加载中...</div>
        </div>
      );
    }

    if (error || accountData == null) {
      return (
        <div className={styles.accountInfoCard}>
          <div className={styles.error}>加载失败</div>
          <Button size="small" onClick={() => accountQuery.refetch()}>
            重试
          </Button>
        </div>
      );
    }

    const account = accountData;
    const nickname = account.nickname || PLACEHOLDER;
    const firstChar = nickname?.charAt(0) ?? PLACEHOLDER;

    return (
      <div className={styles.accountInfoCard}>
        <div className={styles.avatar}>
          <span className={styles.avatarText}>{firstChar}</span>
        </div>
        <div className={styles.accountDetails}>
          <div className={styles.accountName}>{nickname}</div>
          <div className={styles.accountMeta}>
            <span>{account.platform}</span>
            <span className={styles.metaDivider}>|</span>
            <span>{account.phoneNumber}</span>
          </div>
        </div>
        <div className={styles.statusBadge}>
          <StatusBadge status={account.status} />
        </div>
        <div className={styles.followers}>
          粉丝数：{Number(account.followers).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>操作日志</h1>
        <Button
          className={styles.backButton}
          onClick={() => navigate('/account')}
        >
          返回账号列表
        </Button>
      </div>

      {renderAccountInfo()}

      <CustomProTable<AccountLogResponse>
        rowKey="id"
        queryOptions={(params: Record<string, unknown>) => {
          const datePreset = params.datePreset as string;
          const { startDate, endDate } = getDateRange(datePreset);
          return accountLogsQueryOptions(accountId, {
            startDate,
            endDate,
            keyword: (params.keyword as string) || undefined,
            page: params.page as number | undefined,
            pageSize: params.pageSize as number | undefined,
          });
        }}
        columns={[
          {
            title: '时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            hideInSearch: true,
            render: (_: unknown, record: AccountLogResponse) => (
              <span className={styles.timeText}>
                {formatDateTime(record.createdAt)}
              </span>
            ),
          },
          {
            title: '类型',
            dataIndex: 'operation',
            key: 'operation',
            width: 100,
            hideInSearch: true,
            render: (_: unknown, record: AccountLogResponse) => (
              <LogTypeTag type={record.operation} />
            ),
          },
          {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            hideInSearch: true,
            render: (_: unknown, record: AccountLogResponse) => (
              <span className={styles.descriptionText}>
                {record.description}
              </span>
            ),
          },
          {
            title: '日期范围',
            dataIndex: 'datePreset',
            valueType: 'select',
            valueEnum: DATE_PRESET_ENUM,
            initialValue: 'last7days',
            hideInTable: true,
            search: { transform: (value) => value },
          },
          {
            title: '关键词',
            dataIndex: 'keyword',
            hideInTable: true,
            fieldProps: { placeholder: '搜索日志描述关键词…' },
          },
        ]}
        emptyContent={<CustomEmpty description="暂无日志记录" />}
        tableAlertOptionRender={false}
        toolBarRender={false}
      />
    </div>
  );
};

export default AccountLogsPage;
