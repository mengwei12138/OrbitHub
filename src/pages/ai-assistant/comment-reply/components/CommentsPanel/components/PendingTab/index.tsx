import type { ProColumns } from '@ant-design/pro-components';
import { Button, Input, Select, Space } from 'antd';
import type { FC } from 'react';
import { useMemo, useRef, useState } from 'react';
import type { PaginationParams } from '@/api/types';
import type { CustomProTableRef } from '@/components';
import { CustomProTable } from '@/components';
import { PLACEHOLDER } from '@/constants';
import type { UiComment } from '@/pages/ai-assistant/comment-reply/types';
import AiIcon from '../../../../images/ai-icon.svg';
import IconNegative from '../../../../images/icon-negative.svg';
import IconNeutral from '../../../../images/icon-neutral.svg';
import IconPositive from '../../../../images/icon-positive.svg';
import IconQuestion from '../../../../images/icon-question.svg';
import SearchIcon from '../../../../images/search-icon.svg';
import styles from './style.module.css';

export type PendingTabProps = {
  accountFilterOptions: { label: string; value: string }[];
  queryOptions: (params: PaginationParams) => {
    queryKey: unknown[];
    queryFn: () => Promise<{
      list: UiComment[];
      total: string | number;
      [key: string]: any;
    }>;
  };
  onAutoReply?: (comment: UiComment) => void;
  onManualReply?: (comment: UiComment) => void;
  onDelete?: (comment: UiComment) => void;
};

const aiCategoryConfig = {
  positive: {
    label: '正面',
    bg: '#F6FFED',
    color: '#52C41A',
    Icon: IconPositive,
  },
  negative: {
    label: '负面',
    bg: '#FFF2F0',
    color: '#FF4D4F',
    Icon: IconNegative,
  },
  neutral: {
    label: '中性',
    bg: '#F5F5F5',
    color: '#595959',
    Icon: IconNeutral,
  },
  question: {
    label: '提问',
    bg: '#F6F0FC',
    color: '#722ED1',
    Icon: IconQuestion,
  },
};

const platformColors = {
  douyin: '#fe2c55',
  xiaohongshu: '#fe2c55',
};

const PendingTab: FC<PendingTabProps> = ({
  accountFilterOptions,
  queryOptions,
  onAutoReply,
  onManualReply,
  onDelete,
}) => {
  const [account, setAccount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const tableRef = useRef<CustomProTableRef>(null);

  const queryParams = useMemo(
    () => ({
      accountId: account || undefined,
      keyword: searchText || undefined,
    }),
    [account, searchText],
  );

  const wrappedQueryOptions = useMemo(
    () => (params: PaginationParams) =>
      queryOptions({ ...params, ...queryParams }),
    [queryOptions, queryParams],
  );

  const handleSearch = () => {
    tableRef.current?.reload();
  };

  const columns: ProColumns<UiComment>[] = [
    {
      title: '账号',
      dataIndex: 'accountName',
      width: 140,
      render: (_, record) => (
        <div className={styles.accountCell}>
          <div
            className={styles.avatar}
            style={{ background: platformColors[record.platform] }}
          >
            {record.accountName?.charAt(0) ?? PLACEHOLDER}
          </div>
          <span>{record.accountName}</span>
        </div>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      render: (_, record) => (
        <div className={styles.commentBadge}>{record.content}</div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'aiCategory',
      width: 100,
      render: (_, record) => {
        const config = aiCategoryConfig[record.aiCategory];
        return (
          <div className={styles.typeTag} style={{ background: config.bg }}>
            <img src={config.Icon} alt="" className={styles.typeIcon} />
            <span className={styles.typeText} style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <div className={styles.actionCell}>
          <div className={styles.aiSuggestion}>
            <div className={styles.aiBadge}>
              <img src={AiIcon} alt="" className={styles.aiIcon} />
              <span>AI 建议</span>
            </div>
            <span className={styles.aiText}>
              {record.suggestedReply ?? '暂无 AI 建议'}
            </span>
          </div>
          <Space size={8} className={styles.buttonGroup}>
            <Button
              type="primary"
              size="small"
              className={styles.btnPrimary}
              onClick={() => onAutoReply?.(record)}
            >
              自动回复
            </Button>
            <Button
              size="small"
              className={styles.btnGhost}
              onClick={() => onManualReply?.(record)}
            >
              手动回复
            </Button>
            <Button
              size="small"
              danger
              className={styles.btnDanger}
              onClick={() => onDelete?.(record)}
            >
              删除评论
            </Button>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <CustomProTable<UiComment>
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
                      { label: '正面', value: 'positive' },
                      { label: '负面', value: 'negative' },
                      { label: '中性', value: 'neutral' },
                      { label: '提问', value: 'question' },
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

export default PendingTab;
