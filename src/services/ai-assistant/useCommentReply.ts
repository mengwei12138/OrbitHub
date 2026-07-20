import { useMutation, useQuery } from '@tanstack/react-query';

import {
  accountCommentReplySettingsQueryOptions,
  addBlockedKeyword,
  blockedKeywordsQueryOptions,
  commentReplyAccountsQueryOptions,
  commentReplyHistoryQueryOptions,
  commentReplyRulesQueryOptions,
  commentReplyTodayDashboardQueryOptions,
  deleteBlockedKeyword,
  deleteComment,
  deleteCommentReplyRule,
  humanClassifyComment,
  humanReviewCommentsQueryOptions,
  pendingCommentsQueryOptions,
  submitManualCommentReply,
  toneOptionsQueryOptions,
  triggerCommentAutoReply,
  triggerCommentScrape,
  updateAccountCommentReplySettings,
  upsertCommentReplyRules,
} from './queryOptions';
import type {
  AccountCommentReplySettingsParam,
  CommentReplyAccountsQueryParams,
  CommentReplyHistoryQueryParams,
  CommentReplyRulesUpsertParam,
  HumanClassifyParam,
  HumanReviewCommentsQueryParams,
  ManualReplyParam,
  PendingCommentsQueryParams,
} from './types';

// ────────── 读 ──────────

export const useCommentReplyTodayDashboard = (options?: {
  enabled?: boolean;
}) =>
  useQuery({
    ...commentReplyTodayDashboardQueryOptions(),
    enabled: options?.enabled ?? true,
  });

export const useCommentReplyAccounts = (
  params: CommentReplyAccountsQueryParams,
) => useQuery(commentReplyAccountsQueryOptions(params));

export const usePendingComments = (params: PendingCommentsQueryParams) =>
  useQuery(pendingCommentsQueryOptions(params));

export const useHumanReviewComments = (
  params: HumanReviewCommentsQueryParams,
) => useQuery(humanReviewCommentsQueryOptions(params));

export const useCommentReplyHistory = (
  params: CommentReplyHistoryQueryParams,
) => useQuery(commentReplyHistoryQueryOptions(params));

// ────────── 立即抓取 ──────────

export const useTriggerCommentScrape = () =>
  useMutation({
    mutationFn: triggerCommentScrape,
  });

// ────────── 配置 CRUD ──────────

export const useBlockedKeywords = () => useQuery(blockedKeywordsQueryOptions());

export const useAddBlockedKeyword = () =>
  useMutation({
    mutationFn: addBlockedKeyword,
  });

export const useDeleteBlockedKeyword = () =>
  useMutation({
    mutationFn: (keywordId: string) => deleteBlockedKeyword(keywordId),
  });

export const useCommentReplyRules = () =>
  useQuery(commentReplyRulesQueryOptions());

export const useToneOptions = () => useQuery(toneOptionsQueryOptions());

export const useUpsertCommentReplyRules = () =>
  useMutation({
    mutationFn: (data: CommentReplyRulesUpsertParam) =>
      upsertCommentReplyRules(data),
  });

export const useDeleteCommentReplyRule = () =>
  useMutation({
    mutationFn: (ruleId: string) => deleteCommentReplyRule(ruleId),
  });

export const useAccountCommentReplySettings = (
  accountId: string | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    ...accountCommentReplySettingsQueryOptions(accountId ?? ''),
    enabled: Boolean(accountId) && (options?.enabled ?? true),
  });

export const useUpdateAccountCommentReplySettings = () =>
  useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: AccountCommentReplySettingsParam;
    }) => updateAccountCommentReplySettings(accountId, data),
  });

// ────────── 写操作 ──────────

export const useTriggerCommentAutoReply = () =>
  useMutation({
    mutationFn: (commentId: string) => triggerCommentAutoReply(commentId),
  });

export const useSubmitManualCommentReply = () =>
  useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: ManualReplyParam;
    }) => submitManualCommentReply(commentId, data),
  });

export const useDeleteComment = () =>
  useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
  });

export const useHumanClassifyComment = () =>
  useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: HumanClassifyParam;
    }) => humanClassifyComment(commentId, data),
  });
