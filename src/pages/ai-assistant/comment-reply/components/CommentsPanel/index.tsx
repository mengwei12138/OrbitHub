import type { Ref } from 'react';
import { forwardRef, useState } from 'react';
import type { PaginationParams } from '@/api/types';
import type {
  UiComment,
  UiHistoryRecord,
} from '@/pages/ai-assistant/comment-reply/types';
import ManualReplyModal from '../ManualReplyModal';
import HistoryTab from './components/HistoryTab';
import ManualTab from './components/ManualTab';
import PendingTab from './components/PendingTab';
import styles from './style.module.css';

export type Comment = UiComment;
export type HistoryRecord = UiHistoryRecord;

type TabKey = 'pending' | 'human_review' | 'history';

type QueryOptions<T> = {
  queryKey: unknown[];
  queryFn: () => Promise<{
    list: T[];
    total: string | number;
    [key: string]: any;
  }>;
};

type Props = {
  tab: TabKey;
  onTabChange: (key: TabKey) => void;
  stats: {
    pending: number;
    humanReview: number;
  };
  pendingQueryOptions: (params: PaginationParams) => QueryOptions<UiComment>;
  humanQueryOptions: (params: PaginationParams) => QueryOptions<UiComment>;
  historyQueryOptions: (
    params: PaginationParams,
  ) => QueryOptions<UiHistoryRecord>;
  accountFilterOptions: { label: string; value: string }[];
  onAutoReply: (comment: UiComment) => void;
  onManualReplySubmit: (comment: UiComment, text: string) => void;
  onDelete: (comment: UiComment) => void;
  onHumanConfirm: (
    comment: UiComment,
    chineseCategory: string,
    editedReply?: string,
  ) => void;
  onHumanSkip: () => void;
  onViewDetail?: (record: UiHistoryRecord) => void;
  manualReplyPending?: boolean;
};

const CommentsPanel = forwardRef(function CommentsPanel(
  {
    tab,
    onTabChange,
    stats,
    pendingQueryOptions,
    humanQueryOptions,
    historyQueryOptions,
    accountFilterOptions,
    onAutoReply,
    onManualReplySubmit,
    onDelete,
    onHumanConfirm,
    onHumanSkip,
    onViewDetail,
    manualReplyPending,
  }: Props,
  ref: Ref<HTMLDivElement>,
) {
  const [manualReplyComment, setManualReplyComment] =
    useState<UiComment | null>(null);

  const tabs = [
    { key: 'pending' as const, name: '待回复评论', badge: stats.pending },
    {
      key: 'human_review' as const,
      name: '待人工处理',
      badge: stats.humanReview,
    },
    { key: 'history' as const, name: '回复记录', badge: 0 },
  ] as const;

  return (
    <div ref={ref} className={styles.wrapper}>
      <div className={styles.tabBar}>
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.tabItem} ${tab === item.key ? styles.tabItemActive : ''}`}
            onClick={() => {
              onTabChange(item.key);
            }}
          >
            <span>{item.name}</span>
            {item.badge > 0 && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </button>
        ))}
        <div
          className={styles.indicator}
          style={{
            left: tabs.findIndex((t) => t.key === tab) * 120,
            width: 120,
          }}
        />
      </div>

      <div className={styles.content}>
        {tab === 'pending' && (
          <PendingTab
            accountFilterOptions={accountFilterOptions}
            queryOptions={pendingQueryOptions}
            onAutoReply={onAutoReply}
            onManualReply={(comment) => setManualReplyComment(comment)}
            onDelete={onDelete}
          />
        )}
        {tab === 'human_review' && (
          <ManualTab
            accountFilterOptions={accountFilterOptions}
            queryOptions={humanQueryOptions}
            onSkip={onHumanSkip}
            onDelete={onDelete}
            onConfirm={(comment, cat, editedReply) => {
              onHumanConfirm(comment, cat, editedReply);
            }}
          />
        )}
        {tab === 'history' && (
          <HistoryTab
            accountFilterOptions={accountFilterOptions}
            queryOptions={historyQueryOptions}
            onViewDetail={onViewDetail}
          />
        )}
      </div>

      <ManualReplyModal
        open={manualReplyComment !== null}
        comment={
          manualReplyComment
            ? {
                userName: manualReplyComment.accountName,
                content: manualReplyComment.content,
                time: manualReplyComment.createdAt,
              }
            : undefined
        }
        suggestedReply={manualReplyComment?.suggestedReply}
        submitLoading={manualReplyPending}
        onClose={() => setManualReplyComment(null)}
        onSubmit={(content) => {
          if (manualReplyComment) {
            onManualReplySubmit(manualReplyComment, content);
          }
          setManualReplyComment(null);
        }}
      />
    </div>
  );
});

export default CommentsPanel;
