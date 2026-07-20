import type {
  AccountSnapshot,
  MessageRecord as ApiMessageRecord,
  MessageCategory,
  MessageCategoryList,
  MessageHistoryPage,
  MessagePendingPage,
  MessageReplyRule,
  MessageReplyRuleList,
  MessageReplySettings,
} from '@/services/ai-assistant/types';

import type {
  ClassificationType,
  ReplyRule,
} from '../components/ClassificationRulesSettings';
import type {
  PendingMessage,
  MessageRecord as UiHistoryRecord,
} from '../components/MessagePanel/types';

/** OpenAPI total 为字符串数字 */
export const parseMetaTotal = (total: string): number => {
  const n = Number.parseInt(total, 10);
  return Number.isFinite(n) ? n : 0;
};

export const platformLabel = (p: string): 'douyin' | 'xiaohongshu' | 'weibo' =>
  p === 'douyin' ? 'douyin' : p === 'xiaohongshu' ? 'xiaohongshu' : 'weibo';

/** 列表接口原始响应兜底解析（解锁前后结构可能为分页或数组） */
export const parseMessagePendingPage = (
  data: unknown,
): MessagePendingPage | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<MessagePendingPage>;
  if (!Array.isArray(d.list)) return null;
  return d as MessagePendingPage;
};

export const parseMessageHistoryPage = (
  data: unknown,
): MessageHistoryPage | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<MessageHistoryPage>;
  if (!Array.isArray(d.list)) return null;
  return d as MessageHistoryPage;
};

export const parseAccountSnapshots = (data: unknown): AccountSnapshot[] => {
  if (!data || typeof data !== 'object') return [];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.list)) return o.list as AccountSnapshot[];
  if (Array.isArray(data)) return data as AccountSnapshot[];
  return [];
};

export const parseMessageReplySettings = (
  data: unknown,
): MessageReplySettings | null => {
  if (!data || typeof data !== 'object') return null;
  return data as MessageReplySettings;
};

export const parseMessageCategories = (
  data: unknown,
): MessageCategoryList | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<MessageCategoryList>;
  if (!Array.isArray(d.categories)) return null;
  return d as MessageCategoryList;
};

export const parseMessageReplyRules = (
  data: unknown,
): MessageReplyRuleList | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<MessageReplyRuleList>;
  if (!Array.isArray(d.rules)) return null;
  return d as MessageReplyRuleList;
};

/** API category 文案 → 卡片图标用 slug */
export const categoryToVisualType = (category?: string | null): string => {
  if (!category) return 'inquiry';
  const c = category.toLowerCase();
  if (c.includes('合作') || c.includes('cooper')) return 'cooperation';
  if (c.includes('投诉') || c.includes('complaint') || c.includes('负面')) {
    return 'complaint';
  }
  if (c.includes('垃圾') || c.includes('spam') || c.includes('广告')) {
    return 'spam';
  }
  if (c.includes('产品') || c.includes('咨询') || c.includes('question')) {
    return 'inquiry';
  }
  return 'inquiry';
};

/** 设置页四类枚举（与设计组件一致） */
export const categoryToClassificationType = (
  category: string,
): ClassificationType => {
  const t = categoryToVisualType(category);
  if (t === 'cooperation') return 'cooperation';
  if (t === 'complaint') return 'complaint';
  if (t === 'spam') return 'spam';
  return 'product';
};

export const classificationEmoji = (type: string): string => {
  const map: Record<string, string> = {
    cooperation: '🤝',
    complaint: '⚠️',
    product: '💬',
    spam: '🚫',
    inquiry: '💬',
  };
  return map[type] ?? '💬';
};

const findCategoryKeywords = (
  categories: MessageCategory[],
  categoryName: string,
): string[] => {
  const hit = categories.find(
    (c) => c.name === categoryName || c.name?.includes(categoryName),
  );
  return hit?.keywords ?? [];
};

/** 合并分类关键词与回复模板，供「分类与回复规则」表格展示 */
export const mergeCategoriesAndRulesToReplyRules = (
  categoriesData: MessageCategoryList | null | undefined,
  rulesData: MessageReplyRuleList | null | undefined,
): ReplyRule[] => {
  const categories = categoriesData?.categories ?? [];
  const rules = rulesData?.rules ?? [];
  return rules.map((rule: MessageReplyRule, idx: number) => {
    const type = categoryToClassificationType(rule.category);
    const label =
      categories.find((c) => c.name === rule.category)?.name ?? rule.category;
    return {
      id: rule.ruleId ?? `rule-${idx}`,
      type,
      label,
      keywords: findCategoryKeywords(categories, rule.category),
      template: rule.template,
      createdByName: rule.createdByName,
      editable: rule.editable,
    };
  });
};

export const mapPendingRecord = (
  record: ApiMessageRecord,
  accountName: string,
): PendingMessage => ({
  id: record.messageId,
  account: {
    name: accountName,
    platform: platformLabel(record.platform),
  },
  sender: {
    name: record.senderName ?? '—',
  },
  content: record.text,
  classification: {
    type: categoryToVisualType(record.category),
    label: record.category ?? '未分类',
  },
  aiSuggestion: record.suggestedReply ?? undefined,
  isImportant: Boolean(record.isImportant),
});

const historyUiStatus = (raw?: string): UiHistoryRecord['status'] => {
  const s = (raw ?? '').toUpperCase();
  if (s.includes('BLOCK') || s.includes('屏蔽')) return 'blocked';
  if (s.includes('MANUAL') || s.includes('人工')) return 'manual_reply';
  return 'replied';
};

export type MessageFetchFrequency = '5min' | '10min' | '30min' | '1hour';
export type MessageFetchType = 'all' | 'unread' | 'read';

const SECONDS_BY_FREQ: Record<MessageFetchFrequency, number> = {
  '5min': 300,
  '10min': 600,
  '30min': 1800,
  '1hour': 3600,
};

export const fetchFrequencyToSeconds = (f: MessageFetchFrequency): number =>
  SECONDS_BY_FREQ[f];

export const secondsToFetchFrequency = (
  sec?: number,
): MessageFetchFrequency => {
  if (!sec) return '5min';
  const hit = (
    Object.entries(SECONDS_BY_FREQ) as [MessageFetchFrequency, number][]
  ).find(([, v]) => v === sec);
  return hit?.[0] ?? '5min';
};

export const scrapeTypesToFetchType = (
  types?: string[] | null,
): MessageFetchType => {
  if (!types?.length) return 'all';
  const upper = types.join(',').toUpperCase();
  if (upper.includes('UNREAD')) return 'unread';
  if (upper.includes('READ') && !upper.includes('UNREAD')) return 'read';
  return 'all';
};

export const fetchTypeToScrapeTypes = (t: MessageFetchType): string[] => {
  if (t === 'unread') return ['UNREAD'];
  if (t === 'read') return ['READ'];
  return ['ALL'];
};

export const mapHistoryRecord = (
  record: ApiMessageRecord,
  accountName: string,
): UiHistoryRecord => ({
  id: record.messageId,
  time: record.receivedAt ?? '—',
  account: {
    name: accountName,
    platform: platformLabel(record.platform),
  },
  sender: {
    name: record.senderName ?? '—',
  },
  content: record.text,
  status: historyUiStatus(record.status),
  replyContent: record.suggestedReply ?? undefined,
});
