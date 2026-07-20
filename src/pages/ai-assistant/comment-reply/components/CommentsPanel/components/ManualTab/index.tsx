import { useQuery } from '@tanstack/react-query';
import { Button, Input, Pagination, Select, Space } from 'antd';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import type { PaginationParams } from '@/api/types';
import { PLACEHOLDER } from '@/constants';
import type { UiComment } from '@/pages/ai-assistant/comment-reply/types';
import AiIcon from '../../../../images/ai-icon.svg';
import styles from './style.module.css';

export type ManualTabProps = {
  accountFilterOptions: { label: string; value: string }[];
  queryOptions: (params: PaginationParams) => {
    queryKey: unknown[];
    queryFn: () => Promise<{
      list: UiComment[];
      total: string | number;
      [key: string]: any;
    }>;
  };
  onSkip?: (comment: UiComment) => void;
  onDelete?: (comment: UiComment) => void;
  onConfirm?: (
    comment: UiComment,
    chineseCategory: string,
    editedReply?: string,
  ) => void;
};

const aiCategoryConfig = {
  positive: { label: '待确认', color: '#FAAD14', bg: '#FFFBE6' },
  negative: { label: '负面', color: '#FF4D4F', bg: '#FFF2F0' },
  neutral: { label: '中性', color: '#595959', bg: '#F5F5F5' },
  question: { label: '提问', color: '#722ED1', bg: '#F6F0FC' },
};

const categoryOptions = ['正面', '中性', '负面', '提问', '推广'] as const;

const labelFromAiCategory = (c: UiComment['aiCategory']): string => {
  const m: Record<UiComment['aiCategory'], string> = {
    positive: '正面',
    negative: '负面',
    neutral: '中性',
    question: '提问',
  };
  return m[c] ?? '中性';
};

type ManualTabInnerProps = {
  dataSource: UiComment[];
  selectedCategories: Record<string, string>;
  editedReplies: Record<string, string>;
  onCategoryChange: (commentId: string, category: string) => void;
  onReplyChange: (commentId: string, text: string) => void;
  onSkip?: (comment: UiComment) => void;
  onDelete?: (comment: UiComment) => void;
  onConfirm?: (
    comment: UiComment,
    chineseCategory: string,
    editedReply?: string,
  ) => void;
};

const ManualTabInner: FC<ManualTabInnerProps> = ({
  dataSource,
  selectedCategories,
  editedReplies,
  onCategoryChange,
  onReplyChange,
  onSkip,
  onDelete,
  onConfirm,
}) => {
  const renderCard = (record: UiComment) => {
    const config = aiCategoryConfig[record.aiCategory];
    const selectedCategory =
      selectedCategories[record.id] ?? labelFromAiCategory(record.aiCategory);
    const isHighConfidence =
      record.confidence !== undefined && record.confidence >= 70;

    return (
      <div key={record.id} className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              {record.accountName?.charAt(0) ?? PLACEHOLDER}
            </div>
            <span className={styles.accountName}>{record.accountName}</span>
            <div
              className={styles.categoryTag}
              style={{ background: config.bg }}
            >
              <span style={{ color: config.color }}>
                AI 分类：{config.label}
              </span>
            </div>
            <div className={styles.confidenceTag}>
              <span>
                置信度{' '}
                {record.confidence !== undefined
                  ? `${record.confidence}%`
                  : '—'}
              </span>
            </div>
          </div>
          <span className={styles.time}>{record.createdAt}</span>
        </div>

        <div className={styles.commentBox}>
          <span className={styles.commentLabel}>评论内容：</span>
          <span className={styles.commentText}>{record.content}</span>
        </div>

        {!isHighConfidence && (
          <div className={styles.categorySection}>
            <span className={styles.sectionLabel}>请选择分类：</span>
            <div className={styles.categoryOptions}>
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryBtnActive : ''}`}
                  onClick={() => onCategoryChange(record.id, cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {record.suggestedReply && (
          <div className={styles.replySection}>
            <div className={styles.replyHeader}>
              <span className={styles.replyLabel}>回复内容：</span>
              <div className={styles.aiBadge}>
                <img src={AiIcon} alt="" className={styles.aiIcon} />
                <span>AI 建议</span>
              </div>
            </div>
            <Input.TextArea
              className={styles.replyTextarea}
              value={editedReplies[record.id] ?? record.suggestedReply ?? ''}
              onChange={(e) => onReplyChange(record.id, e.target.value)}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </div>
        )}

        <div className={styles.cardActions}>
          <div className={styles.btnGhost} onClick={() => onSkip?.(record)}>
            跳过
          </div>
          <div className={styles.btnDanger} onClick={() => onDelete?.(record)}>
            删除评论
          </div>
          <div
            className={styles.btnPrimary}
            onClick={() =>
              onConfirm?.(record, selectedCategory, editedReplies[record.id])
            }
          >
            确认回复
          </div>
        </div>
      </div>
    );
  };

  return <div className={styles.cardList}>{dataSource.map(renderCard)}</div>;
};

const ManualTab: FC<ManualTabProps> = ({
  accountFilterOptions,
  queryOptions,
  onSkip,
  onDelete,
  onConfirm,
}) => {
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [account, setAccount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, string>
  >({});
  const [editedReplies, setEditedReplies] = useState<Record<string, string>>(
    {},
  );

  const queryParams = useMemo(
    () => ({
      page: current,
      pageSize,
      accountId: account || undefined,
      aiCategory: category || undefined,
      status: status || undefined,
      keyword: searchText || undefined,
    }),
    [current, pageSize, account, category, status, searchText],
  );

  const { data, isLoading } = useQuery(queryOptions(queryParams));

  const list = data?.list ?? [];
  const total = Number(data?.total) || 0;

  const handleCategoryChange = (commentId: string, cat: string) => {
    setSelectedCategories((prev) => ({ ...prev, [commentId]: cat }));
  };

  const handleReplyChange = (commentId: string, text: string) => {
    setEditedReplies((prev) => ({ ...prev, [commentId]: text }));
  };

  const handleReset = () => {
    setAccount('');
    setCategory('');
    setStatus('');
    setSearchText('');
    setCurrent(1);
  };

  return (
    <div className={styles.wrapper}>
      {isLoading ? <div className={styles.loadingHint}>加载中…</div> : null}
      <div className={styles.filterBar}>
        <div className={styles.filterInputs}>
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>账号</span>
            <Select
              placeholder="全部"
              value={account}
              onChange={(v) => {
                setAccount(v);
                setCurrent(1);
              }}
              className={styles.filterSelect}
              options={accountFilterOptions}
            />
          </div>
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>类型</span>
            <Select
              placeholder="全部"
              value={category}
              onChange={(v) => {
                setCategory(v);
                setCurrent(1);
              }}
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
              onChange={(v) => {
                setStatus(v);
                setCurrent(1);
              }}
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
            />
          </div>
        </div>
        <Space size={8} className={styles.filterActions}>
          <Button onClick={handleReset}>重置</Button>
          <Button type="primary" onClick={() => setCurrent(1)}>
            查询
          </Button>
        </Space>
      </div>

      <ManualTabInner
        dataSource={list}
        selectedCategories={selectedCategories}
        editedReplies={editedReplies}
        onCategoryChange={handleCategoryChange}
        onReplyChange={handleReplyChange}
        onSkip={onSkip}
        onDelete={onDelete}
        onConfirm={onConfirm}
      />

      <div className={styles.pagination}>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          onChange={(p) => setCurrent(p)}
          showTotal={(t) => `共 ${t} 条`}
          showSizeChanger={false}
          showQuickJumper
        />
      </div>
    </div>
  );
};

export default ManualTab;
