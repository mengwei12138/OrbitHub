import type { ProColumns } from '@ant-design/pro-components';
import { Button, DatePicker, Input, Select, Space, Tag } from 'antd';
import type { Dayjs } from 'dayjs';
import { useRef, useState } from 'react';
import type { PaginationParams } from '@/api/types';
import type { CustomProTableRef } from '@/components';
import { CustomProTable } from '@/components';
import SearchIcon from '../../../../images/search-icon.svg';
import styles from './style.module.css';
import type { MessageHistoryCardProps, MessageRecord } from './types';

const { RangePicker } = DatePicker;

const statusConfig = {
  replied: { label: '✓已回复', color: 'green' },
  manual_reply: { label: '人工回复', color: 'blue' },
  blocked: { label: '已屏蔽', color: 'default' },
};

const DEFAULT_ACCOUNT_OPTIONS = [{ label: '全部', value: '' }];

const DEFAULT_CLASSIFICATION_OPTIONS = [
  { label: '全部', value: '' },
  { label: '合作咨询', value: 'cooperation' },
  { label: '投诉建议', value: 'complaint' },
  { label: '产品咨询', value: 'inquiry' },
  { label: '垃圾信息', value: 'spam' },
];

const MessageHistoryCard = ({
  queryOptions,
  accountSelectOptions,
  classificationFilterOptions,
  onView,
}: MessageHistoryCardProps) => {
  const accountOptions = accountSelectOptions ?? DEFAULT_ACCOUNT_OPTIONS;
  const classificationOptions =
    classificationFilterOptions ?? DEFAULT_CLASSIFICATION_OPTIONS;
  const tableRef = useRef<CustomProTableRef>(null);
  const [account, setAccount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const wrappedQueryOptions = (params: PaginationParams) => {
    return queryOptions({
      ...params,
      accountId: account || undefined,
      classification: category || undefined,
      status: status || undefined,
      keyword,
      startDate: dateRange?.[0]?.format('YYYY-MM-DD') || undefined,
      endDate: dateRange?.[1]?.format('YYYY-MM-DD') || undefined,
    });
  };

  const columns: ProColumns<MessageRecord>[] = [
    {
      title: '时间',
      dataIndex: 'time',
      width: 200,
      render: (_, record) => (
        <div className={styles.timeCell}>
          <span className={styles.timeText}>{record.time}</span>
          <div className={styles.accountRow}>
            <span className={styles.accountIcon} />
            <span className={styles.accountName}>{record.account.name}</span>
          </div>
        </div>
      ),
    },
    {
      title: '发送者',
      dataIndex: ['sender', 'name'],
      width: 120,
      render: (name) => <span className={styles.senderName}>{name}</span>,
    },
    {
      title: '私信内容',
      dataIndex: 'content',
      render: (_, record) => (
        <span className={styles.commentText}>{record.content}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => {
        const config = statusConfig[record.status] ?? statusConfig.replied;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => onView?.(record.id)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <CustomProTable<MessageRecord>
        ref={tableRef}
        queryOptions={wrappedQueryOptions}
        columns={columns}
        rowKey="id"
        search={false}
        options={false}
        toolbar={{
          search: (
            <div className={styles.filterBar}>
              <div className={styles.filterInputs}>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>账号</span>
                  <Select
                    placeholder="全部"
                    value={account}
                    onChange={setAccount}
                    className={styles.filterSelect}
                    options={accountOptions}
                  />
                </div>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>分类</span>
                  <Select
                    placeholder="全部"
                    value={category}
                    onChange={setCategory}
                    className={styles.filterSelect}
                    options={classificationOptions}
                  />
                </div>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>状态</span>
                  <Select
                    placeholder="全部"
                    value={status}
                    onChange={setStatus}
                    className={styles.filterSelect}
                    options={[
                      { label: '全部', value: '' },
                      { label: '已回复', value: 'replied' },
                      { label: '人工回复', value: 'manual_reply' },
                      { label: '已屏蔽', value: 'blocked' },
                    ]}
                  />
                </div>
                <div className={styles.filterItem}>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className={styles.dateRangePicker}
                    placeholder={['开始日期', '结束日期']}
                  />
                </div>
                <div className={styles.filterItem}>
                  <Input
                    placeholder="搜索发送者/内容"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className={styles.searchInput}
                    prefix={
                      <img
                        src={SearchIcon}
                        alt=""
                        className={styles.searchIcon}
                      />
                    }
                  />
                </div>
              </div>
              <Space size={8} className={styles.filterActions}>
                <Button
                  onClick={() => {
                    setAccount('');
                    setCategory('');
                    setStatus('');
                    setKeyword('');
                    setDateRange(null);
                    tableRef.current?.reset();
                  }}
                >
                  重置
                </Button>
                <Button
                  type="primary"
                  onClick={() => tableRef.current?.reload()}
                >
                  查询
                </Button>
              </Space>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default MessageHistoryCard;
