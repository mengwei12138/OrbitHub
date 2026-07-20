import type { ProColumns } from '@ant-design/pro-components';
import { Button, Input, Select, Space, Tag } from 'antd';
import type { FC } from 'react';
import { useRef, useState } from 'react';
import type { PaginationParams } from '@/api/types';
import type { CustomProTableRef } from '@/components';
import { CustomProTable } from '@/components';
import type { UiHistoryRecord } from '@/pages/ai-assistant/comment-reply/types';
import SearchIcon from '../../../../images/search-icon.svg';
import styles from './style.module.css';

export type HistoryTabProps = {
  accountFilterOptions: { label: string; value: string }[];
  queryOptions: (params: PaginationParams) => {
    queryKey: unknown[];
    queryFn: () => Promise<{
      list: UiHistoryRecord[];
      total: string | number;
      [key: string]: any;
    }>;
  };
  onViewDetail?: (record: UiHistoryRecord) => void;
};

const statusConfig = {
  auto: { label: '自动回复', color: 'green' },
  manual: { label: '人工回复', color: 'blue' },
  blocked: { label: '已屏蔽', color: 'default' },
};

const HistoryTab: FC<HistoryTabProps> = ({
  accountFilterOptions,
  queryOptions,
  onViewDetail,
}) => {
  const [account, setAccount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const tableRef = useRef<CustomProTableRef>(null);

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const columns: ProColumns<UiHistoryRecord>[] = [
    {
      title: '时间',
      dataIndex: 'repliedAt',
      width: 160,
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      render: (_, record) => (
        <span className={styles.commentText}>{record.content}</span>
      ),
    },
    {
      title: '回复内容',
      dataIndex: 'replyContent',
      render: (_, record) => (
        <span className={styles.replyText}>{record.replyContent}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => {
        const config = statusConfig[record.status] ?? statusConfig.auto;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => onViewDetail?.(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <CustomProTable<UiHistoryRecord>
        ref={tableRef}
        queryOptions={queryOptions}
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
                    options={accountFilterOptions}
                  />
                </div>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>类型</span>
                  <Select
                    placeholder="全部"
                    value={category}
                    onChange={setCategory}
                    className={styles.filterSelect}
                    options={[
                      { label: '全部', value: '' },
                      { label: '自动回复', value: 'auto' },
                      { label: '人工回复', value: 'manual' },
                      { label: '已屏蔽', value: 'blocked' },
                    ]}
                  />
                </div>
                <div className={styles.filterItem}>
                  <span className={styles.filterLabel}>处理状态</span>
                  <Select
                    placeholder="全部"
                    value={status}
                    onChange={setStatus}
                    className={styles.filterSelect}
                    options={[
                      { label: '全部', value: '' },
                      { label: '待回复', value: 'pending' },
                      { label: '待人工处理', value: 'human_review' },
                    ]}
                  />
                </div>
                <div className={styles.filterItem}>
                  <Input
                    placeholder="搜索评论内容"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
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
                    setSearchText('');
                  }}
                >
                  重置
                </Button>
                <Button type="primary" onClick={handleSearch}>
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

export default HistoryTab;
