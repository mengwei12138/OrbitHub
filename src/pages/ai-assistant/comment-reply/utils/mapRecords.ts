import type {
  UiComment,
  UiHistoryRecord,
} from '@/pages/ai-assistant/comment-reply/types';
import type {
  CommentCategory,
  CommentRecord,
  PlatformCode,
} from '@/services/ai-assistant/types';

/** 平台展示名（与设计稿一致） */
export const platformLabel = (p: PlatformCode): string =>
  p === 'douyin' ? '抖音' : '小红书';

/** OpenAPI total 为字符串数字 */
export const parseMetaTotal = (total: string): number => {
  const n = Number.parseInt(total, 10);
  return Number.isFinite(n) ? n : 0;
};

const uiCategories = ['positive', 'negative', 'neutral', 'question'] as const;

/** Pending / Manual Tab 使用的 AI 分类；promotion 归入中性展示 */
export const normalizeAiCategory = (
  c?: CommentCategory,
): (typeof uiCategories)[number] => {
  if (!c) return 'neutral';
  if (c === 'promotion') return 'neutral';
  if (uiCategories.includes(c as (typeof uiCategories)[number]))
    return c as (typeof uiCategories)[number];
  return 'neutral';
};

export const confidencePercent = (confidence?: number): number | undefined => {
  if (confidence === undefined || confidence === null) return undefined;
  return Math.round(Math.min(1, Math.max(0, confidence)) * 100);
};

export const mapRecordToComment = (
  record: CommentRecord,
  accountName: string,
): UiComment => ({
  id: record.commentId,
  accountName,
  platform: record.platform,
  aiCategory: normalizeAiCategory(record.aiCategory),
  confidence: confidencePercent(record.confidence),
  content: record.text,
  suggestedReply: record.suggestedReply ?? undefined,
  createdAt: record.publishedAt ?? record.fetchedAt,
});

/** 人工确认 Tab 中单选的中文分类 → OpenAPI CommentCategory */
export const chineseCategoryToApi = (label: string): CommentCategory => {
  const map: Record<string, CommentCategory> = {
    正面: 'positive',
    负面: 'negative',
    中性: 'neutral',
    提问: 'question',
    推广: 'promotion',
  };
  return map[label] ?? 'neutral';
};

/** 历史列表展示用回复文案（契约暂无独立 reply 字段） */
export const historyReplyPreview = (record: CommentRecord): string =>
  record.suggestedReply?.trim() ? record.suggestedReply : '—';

/** 历史 Tab 状态标签（启发式，契约未区分人工/自动回复结果字段） */
export const historyRowStatus = (
  record: CommentRecord,
): UiHistoryRecord['status'] => {
  if (record.status === 'BLOCKED_AUTO_DELETE') return 'blocked';
  if (
    record.status === 'HUMAN_REVIEW_PENDING' ||
    record.humanReviewReason === 'HUMAN_INTERVENTION_RULE'
  ) {
    return 'manual';
  }
  return 'auto';
};

export const mapRecordToHistory = (
  record: CommentRecord,
  accountName: string,
): UiHistoryRecord => ({
  id: record.commentId,
  accountName,
  platform: platformLabel(record.platform),
  content: record.text,
  replyContent: historyReplyPreview(record),
  status: historyRowStatus(record),
  repliedAt: record.publishedAt ?? record.fetchedAt,
});
