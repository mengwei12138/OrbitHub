import type { ProColumns } from '@ant-design/pro-components';
import { Button, message, Select } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PaginationParams } from '@/api/types';
import {
  CustomEmpty,
  CustomProTable,
  type CustomProTableRef,
  PageHeader,
} from '@/components';
import type { CreditsLogItemDto } from '@/services/content-generation';
import { creditsLogQueryOptions } from '@/services/content-generation';
import { formatDate, formatDateTime } from '@/utils/date';
import { BackButton } from '../content-generation/video-generation/components/BackButton';

import styles from './style.module.css';

type ContentTypeFilter = 'all' | 'video' | 'image';
type DateRangeFilter = 'today' | 'last7days' | 'last30days';

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'video', label: '视频生成' },
  { value: 'image', label: '图文生成' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: '今天' },
  { value: 'last7days', label: '最近7天' },
  { value: 'last30days', label: '最近30天' },
];

/** 与 Figma / PRD 分页默认一致 */
const DEFAULT_PAGE_SIZE = 10;

/** 前端筛选值 → 上游平台 type 值；'all' 与未知值都返回 undefined（不传给后端） */
function mapTypeFilter(value: ContentTypeFilter): string | undefined {
  if (value === 'video') return 'VIDEO';
  if (value === 'image') return 'COPYWRITING';
  return undefined;
}

/** 把日期范围下拉值转换为后端要求的 yyyy-MM-dd 字符串区间 */
function resolveDateRange(value: DateRangeFilter): {
  startTime: string;
  endTime: string;
} {
  const today = dayjs().startOf('day');
  if (value === 'today') {
    const day = formatDate(today);
    return { startTime: day, endTime: day };
  }
  const days = value === 'last7days' ? 6 : 29;
  return {
    startTime: formatDate(today.subtract(days, 'day')),
    endTime: formatDate(today),
  };
}

function formatCreditsConsumed(record: CreditsLogItemDto): string {
  if (record.trial) {
    return '0';
  }
  const value = record.credits;
  if (value === 0) {
    return '0';
  }
  // 透传上游 changePoints 原始符号：消耗为负、退款/返还为正，正数显式带 + 以区分
  return value > 0 ? `+${value}` : String(value);
}

function renderContentType(type: CreditsLogItemDto['contentType']) {
  if (type === 'video') {
    return <span className={styles.typeVideo}>视频生成</span>;
  }
  if (type === 'image') {
    return <span className={styles.typeImage}>图文生成</span>;
  }
  return <span className={styles.typeOther}>其他</span>;
}

const columns: ProColumns<CreditsLogItemDto>[] = [
  {
    title: '时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 176,
    search: false,
    render: (_, record) => (
      <span className={styles.timeText}>
        {record.createdAt ? formatDateTime(record.createdAt) : '—'}
      </span>
    ),
  },
  {
    title: '所属公司',
    dataIndex: 'companyName',
    key: 'companyName',
    width: 120,
    search: false,
    render: (_, record) => (
      <span className={styles.cellText}>{record.companyName ?? '—'}</span>
    ),
  },
  {
    title: '操作账号',
    dataIndex: 'accountName',
    key: 'accountName',
    width: 140,
    search: false,
    render: (_, record) => (
      <span className={styles.cellText}>{record.accountName}</span>
    ),
  },
  {
    title: '内容类型',
    dataIndex: 'contentType',
    key: 'contentType',
    width: 96,
    search: false,
    render: (_, record) => renderContentType(record.contentType),
  },
  {
    title: '质量/时长',
    dataIndex: 'quality',
    key: 'quality',
    width: 120,
    search: false,
    render: (_, record) => (
      <span className={record.quality === '—' ? styles.cellMuted : undefined}>
        {record.quality || '—'}
      </span>
    ),
  },
  {
    title: '虚拟人物',
    dataIndex: 'virtualHuman',
    key: 'virtualHuman',
    width: 88,
    search: false,
    render: (_, record) => (
      <span
        className={record.virtualHuman === '—' ? styles.cellMuted : undefined}
      >
        {record.virtualHuman || '—'}
      </span>
    ),
  },
  {
    title: '消耗',
    dataIndex: 'credits',
    key: 'credits',
    width: 72,
    search: false,
    render: (_, record) => {
      const text = formatCreditsConsumed(record);
      return (
        <span
          className={text === '0' ? styles.creditsTrial : styles.creditsValue}
        >
          {text}
        </span>
      );
    },
  },
  {
    title: '是否试用',
    dataIndex: 'trial',
    key: 'trial',
    width: 88,
    search: false,
    render: (_, record) => (
      <span className={record.trial ? styles.trialYes : styles.trialNo}>
        {record.trial ? '是' : '否'}
      </span>
    ),
  },
  {
    title: '内容标题',
    dataIndex: 'contentTitle',
    key: 'contentTitle',
    search: false,
    ellipsis: true,
    render: (_, record) => (
      <span className={styles.titleCell}>{record.contentTitle}</span>
    ),
  },
];

const CreditsRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const tableRef = useRef<CustomProTableRef>(null);
  const [typeFilter, setTypeFilter] = useState<ContentTypeFilter>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('last30days');

  const tableQueryOptions = useMemo(
    () => (params: PaginationParams) => {
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
      const { startTime, endTime } = resolveDateRange(dateRange);
      const base = creditsLogQueryOptions({
        page,
        pageSize,
        type: mapTypeFilter(typeFilter),
        startTime,
        endTime,
      });
      return {
        ...base,
        // @tanstack/react-query 的 queryOptions() 返回 readonly tuple，
        // 这里 spread 成 mutable 数组以符合 CustomProTable 的入参类型
        queryKey: [...base.queryKey],
        queryFn: async () => {
          try {
            // 类型/时间过滤已交给后端透传上游 /api/open/points/consume，
            // 前端不再对当前页二次过滤，保证总数/页数与筛选一致
            return await base.queryFn();
          } catch (err) {
            // 40108/60301 由 axios 拦截器统一跳登录，这里不再弹错误 toast，
            // 否则用户会先看到一闪而过的"认证失败"再跳转，体验混乱
            const code = (err as { code?: number } | null)?.code;
            if (code !== 40108 && code !== 60301) {
              message.error(
                err instanceof Error ? err.message : '积分流水加载失败',
              );
            }
            throw err;
          }
        },
      };
    },
    [dateRange, typeFilter],
  );

  const handleSearch = useCallback(() => {
    tableRef.current?.reload();
  }, []);

  return (
    <div className={styles.page}>
      <PageHeader
        title="积分使用记录"
        toolbar={<BackButton onClick={() => navigate(-1)} />}
      />

      <div className={styles.panel}>
        <div className={styles.filterBar}>
          <div className={styles.filterLeft}>
            <span className={styles.filterLabel}>筛选：</span>
            <Select
              className={styles.filterSelect}
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as ContentTypeFilter)}
            />
            <Select
              className={styles.filterSelect}
              options={DATE_RANGE_OPTIONS}
              value={dateRange}
              onChange={(v) => setDateRange(v as DateRangeFilter)}
            />
          </div>
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
        </div>

        <div className={styles.tableWrap}>
          <CustomProTable<CreditsLogItemDto>
            ref={tableRef}
            rowKey="id"
            columns={columns}
            queryOptions={tableQueryOptions}
            emptyContent={<CustomEmpty description="暂无积分使用记录" />}
            search={false}
            options={false}
            pagination={{
              // 仅作为初始值；不传 pageSize 受控，否则用户切换「20/50 条/页」会失效
              defaultPageSize: DEFAULT_PAGE_SIZE,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreditsRecordPage;
