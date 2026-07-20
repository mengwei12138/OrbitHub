// 本期所有私信端点统一返回 HTTP 501（业务码 51001）
// hooks 形态与最终契约保持一致，UI 可基于此提前布局，待 assistant-message-reply 变更解锁。

import { useMutation, useQuery } from '@tanstack/react-query';

import {
  markMessageImportant,
  messageCategoriesQueryOptions,
  messageReplyAccountsQueryOptions,
  messageReplyHistoryQueryOptions,
  messageReplyRulesQueryOptions,
  messageScrapeSettingsQueryOptions,
  pendingMessagesQueryOptions,
  submitManualMessageReply,
  triggerMessageAutoReply,
  triggerMessageScrape,
  updateMessageScrapeSettings,
  upsertMessageCategories,
  upsertMessageReplyRules,
} from './queryOptions';

export const useMessageReplyAccounts = () =>
  useQuery(messageReplyAccountsQueryOptions());

export const useMessageScrapeSettings = () =>
  useQuery(messageScrapeSettingsQueryOptions());

export const useUpdateMessageScrapeSettings = () =>
  useMutation({
    mutationFn: (data: unknown) => updateMessageScrapeSettings(data),
  });

export const useTriggerMessageScrape = () =>
  useMutation({
    mutationFn: (data: unknown) => triggerMessageScrape(data),
  });

export const useMessageCategories = () =>
  useQuery(messageCategoriesQueryOptions());

export const useUpsertMessageCategories = () =>
  useMutation({
    mutationFn: (data: unknown) => upsertMessageCategories(data),
  });

export const useMessageReplyRules = () =>
  useQuery(messageReplyRulesQueryOptions());

export const useUpsertMessageReplyRules = () =>
  useMutation({
    mutationFn: (data: unknown) => upsertMessageReplyRules(data),
  });

export const usePendingMessages = (params?: {
  page?: number;
  pageSize?: number;
  accountId?: string;
}) => useQuery(pendingMessagesQueryOptions(params));

export const useMessageReplyHistory = (params?: {
  page?: number;
  pageSize?: number;
  accountId?: string;
}) => useQuery(messageReplyHistoryQueryOptions(params));

export const useSubmitManualMessageReply = () =>
  useMutation({
    mutationFn: ({ messageId, data }: { messageId: string; data: unknown }) =>
      submitManualMessageReply(messageId, data),
  });

export const useTriggerMessageAutoReply = () =>
  useMutation({
    mutationFn: (messageId: string) => triggerMessageAutoReply(messageId),
  });

export const useMarkMessageImportant = () =>
  useMutation({
    mutationFn: (messageId: string) => markMessageImportant(messageId),
  });
