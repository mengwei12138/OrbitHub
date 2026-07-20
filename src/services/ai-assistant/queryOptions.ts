import request from '@/api/request';

import type {
  AccountCommentReplySettings,
  AccountCommentReplySettingsParam,
  AiAssistantConversationList,
  AiAssistantGroupAccountOptionList,
  AiAssistantGroupFormPayload,
  AiAssistantGroupList,
  AiAssistantKnowledgeFileList,
  AiAssistantKnowledgeUploadPayload,
  AiAssistantMessageList,
  AiAssistantSendMessagePayload,
  AccountSnapshotPage,
  ApplyOptimizationParam,
  BlockedKeywordListData,
  BlockedKeywordParam,
  CommentFetchTargets,
  CommentFetchTargetsQueryParams,
  CommentRecordPage,
  CommentReplyAccountsQueryParams,
  CommentReplyHistoryQueryParams,
  CommentReplyRuleList,
  CommentReplyRulesUpsertParam,
  CommentReplyTodayDashboard,
  CommentScrapeParam,
  CommentScrapeResult,
  CreateTagCategoryParam,
  CreateTagParam,
  HomeSummary,
  HumanClassifyParam,
  HumanReviewCommentsQueryParams,
  LowDataContentPage,
  LowDataContentQueryParams,
  ManualReplyParam,
  OptimizeContentResponse,
  OptimizeThreshold,
  OptimizeThresholdParam,
  PendingCommentsQueryParams,
  RepublishParam,
  RepublishTaskAccept,
  RepublishTaskDetail,
  Tag,
  TagCategoryListData,
  TagListQueryParams,
  TagPage,
  TagStats,
  ToneOptionListData,
  UpdateTagParam,
} from './types';

// ============================================================
// 主页
// ============================================================

export const homeSummaryQueryOptions = () => ({
  queryKey: ['ai-assistant', 'home', 'summary'] as const,
  queryFn: async (): Promise<HomeSummary> => {
    const res = await request.get<HomeSummary>(
      '/api/v1/ai-assistant/home/summary',
    );
    return res as unknown as HomeSummary;
  },
});

// ============================================================
// 评论域 · 内部接口（爬虫调用）
// ============================================================

export const commentFetchTargetsQueryOptions = (
  params: CommentFetchTargetsQueryParams,
) => ({
  queryKey: [
    'ai-assistant',
    'comment-internal',
    'fetch-targets',
    params,
  ] as const,
  queryFn: async (): Promise<CommentFetchTargets> => {
    const res = await request.get<CommentFetchTargets>(
      '/api/v1/ai-assistant/internal/comment-targets',
      { params },
    );
    return res as unknown as CommentFetchTargets;
  },
});

// ============================================================
// 评论域 · 前端读侧
// ============================================================

export const commentReplyTodayDashboardQueryOptions = () => ({
  queryKey: ['ai-assistant', 'comment-reply', 'dashboard', 'today'] as const,
  queryFn: async (): Promise<CommentReplyTodayDashboard> => {
    const res = await request.get<CommentReplyTodayDashboard>(
      '/api/v1/ai-assistant/comment-reply/dashboard/today',
    );
    return res as unknown as CommentReplyTodayDashboard;
  },
});

export const commentReplyAccountsQueryOptions = (
  params: CommentReplyAccountsQueryParams,
) => ({
  queryKey: ['ai-assistant', 'comment-reply', 'accounts', params] as const,
  queryFn: async (): Promise<AccountSnapshotPage> => {
    const res = await request.get<AccountSnapshotPage>(
      '/api/v1/ai-assistant/comment-reply/accounts',
      { params },
    );
    return res as unknown as AccountSnapshotPage;
  },
});

export const pendingCommentsQueryOptions = (
  params: PendingCommentsQueryParams,
) => ({
  queryKey: ['ai-assistant', 'comment-reply', 'pending', params] as const,
  queryFn: async (): Promise<CommentRecordPage> => {
    const res = await request.get<CommentRecordPage>(
      '/api/v1/ai-assistant/comment-reply/pending',
      { params },
    );
    return res as unknown as CommentRecordPage;
  },
});

export const humanReviewCommentsQueryOptions = (
  params: HumanReviewCommentsQueryParams,
) => ({
  queryKey: ['ai-assistant', 'comment-reply', 'human-review', params] as const,
  queryFn: async (): Promise<CommentRecordPage> => {
    const res = await request.get<CommentRecordPage>(
      '/api/v1/ai-assistant/comment-reply/human-review',
      { params },
    );
    return res as unknown as CommentRecordPage;
  },
});

export const commentReplyHistoryQueryOptions = (
  params: CommentReplyHistoryQueryParams,
) => ({
  queryKey: ['ai-assistant', 'comment-reply', 'history', params] as const,
  queryFn: async (): Promise<CommentRecordPage> => {
    const res = await request.get<CommentRecordPage>(
      '/api/v1/ai-assistant/comment-reply/history',
      { params },
    );
    return res as unknown as CommentRecordPage;
  },
});

// ============================================================
// 评论域 · 立即抓取
// ============================================================

export const triggerCommentScrape = (data: CommentScrapeParam) =>
  request.post<CommentScrapeResult>(
    '/api/v1/ai-assistant/comment-reply/scrape',
    data,
  ) as unknown as Promise<CommentScrapeResult>;

// ============================================================
// 评论域 · 配置 CRUD
// ============================================================

export const blockedKeywordsQueryOptions = () => ({
  queryKey: ['ai-assistant', 'comment-reply', 'blocked-keywords'] as const,
  queryFn: async (): Promise<BlockedKeywordListData> => {
    const res = await request.get<BlockedKeywordListData>(
      '/api/v1/ai-assistant/comment-reply/blocked-keywords',
    );
    return res as unknown as BlockedKeywordListData;
  },
});

export const addBlockedKeyword = (data: BlockedKeywordParam) =>
  request.post<void>(
    '/api/v1/ai-assistant/comment-reply/blocked-keywords',
    data,
  ) as unknown as Promise<void>;

export const deleteBlockedKeyword = (keywordId: string) =>
  request.delete<void>(
    `/api/v1/ai-assistant/comment-reply/blocked-keywords/${keywordId}`,
  ) as unknown as Promise<void>;

export const commentReplyRulesQueryOptions = () => ({
  queryKey: ['ai-assistant', 'comment-reply', 'rules'] as const,
  queryFn: async (): Promise<CommentReplyRuleList> => {
    const res = await request.get<CommentReplyRuleList>(
      '/api/v1/ai-assistant/comment-reply/rules',
    );
    return res as unknown as CommentReplyRuleList;
  },
});

export const toneOptionsQueryOptions = () => ({
  queryKey: ['ai-assistant', 'comment-reply', 'tones'] as const,
  staleTime: Infinity,
  queryFn: async (): Promise<ToneOptionListData> => {
    const res = await request.get<ToneOptionListData>(
      '/api/v1/ai-assistant/comment-reply/tones',
    );
    return res as unknown as ToneOptionListData;
  },
});

export const upsertCommentReplyRules = (data: CommentReplyRulesUpsertParam) =>
  request.put<void>(
    '/api/v1/ai-assistant/comment-reply/rules',
    data,
  ) as unknown as Promise<void>;

export const deleteCommentReplyRule = (ruleId: string) =>
  request.delete<void>(
    `/api/v1/ai-assistant/comment-reply/rules/${ruleId}`,
  ) as unknown as Promise<void>;

export const accountCommentReplySettingsQueryOptions = (accountId: string) => ({
  queryKey: [
    'ai-assistant',
    'comment-reply',
    'account-settings',
    accountId,
  ] as const,
  queryFn: async (): Promise<AccountCommentReplySettings> => {
    const res = await request.get<AccountCommentReplySettings>(
      `/api/v1/ai-assistant/comment-reply/account-settings/${accountId}`,
    );
    return res as unknown as AccountCommentReplySettings;
  },
});

export const updateAccountCommentReplySettings = (
  accountId: string,
  data: AccountCommentReplySettingsParam,
) =>
  request.put<void>(
    `/api/v1/ai-assistant/comment-reply/account-settings/${accountId}`,
    data,
  ) as unknown as Promise<void>;

// ============================================================
// 评论域 · 写操作
// ============================================================

export const triggerCommentAutoReply = (commentId: string) =>
  request.post<void>(
    `/api/v1/ai-assistant/comment-reply/${commentId}/auto-reply`,
  ) as unknown as Promise<void>;

export const submitManualCommentReply = (
  commentId: string,
  data: ManualReplyParam,
) =>
  request.post<void>(
    `/api/v1/ai-assistant/comment-reply/${commentId}/reply`,
    data,
  ) as unknown as Promise<void>;

export const deleteComment = (commentId: string) =>
  request.delete<void>(
    `/api/v1/ai-assistant/comment-reply/${commentId}`,
  ) as unknown as Promise<void>;

export const humanClassifyComment = (
  commentId: string,
  data: HumanClassifyParam,
) =>
  request.post<void>(
    `/api/v1/ai-assistant/comment-reply/human-review/${commentId}/classify`,
    data,
  ) as unknown as Promise<void>;

// ============================================================
// 内容优化与重发布
// ============================================================

export const optimizeThresholdQueryOptions = () => ({
  queryKey: ['ai-assistant', 'content-optimize', 'threshold'] as const,
  queryFn: async (): Promise<OptimizeThreshold> => {
    const res = await request.get<OptimizeThreshold>(
      '/api/v1/ai-assistant/content-optimize/threshold',
    );
    return res as unknown as OptimizeThreshold;
  },
});

export const updateOptimizeThreshold = (data: OptimizeThresholdParam) =>
  request.put<void>(
    '/api/v1/ai-assistant/content-optimize/threshold',
    data,
  ) as unknown as Promise<void>;

export const lowDataContentsQueryOptions = (
  params: LowDataContentQueryParams,
) => ({
  queryKey: [
    'ai-assistant',
    'content-optimize',
    'low-data',
    params.page,
    params.pageSize,
    params.platform,
    params.accountId,
    params.viewMin,
    params.likeRateMinPercent,
    params.keyword,
  ] as const,
  queryFn: async (): Promise<LowDataContentPage> => {
    const res = await request.get<LowDataContentPage>(
      '/api/v1/ai-assistant/content-optimize/low-data',
      { params },
    );
    return res as unknown as LowDataContentPage;
  },
});

export const optimizeContent = (contentId: string) =>
  request.post<OptimizeContentResponse>(
    `/api/v1/ai-assistant/content-optimize/${contentId}/optimize`,
  ) as unknown as Promise<OptimizeContentResponse>;

export const applyOptimization = (
  contentId: string,
  data: ApplyOptimizationParam,
) =>
  request.post<void>(
    `/api/v1/ai-assistant/content-optimize/${contentId}/apply`,
    data,
  ) as unknown as Promise<void>;

export const submitRepublish = (data: RepublishParam) =>
  request.post<RepublishTaskAccept>(
    '/api/v1/ai-assistant/content-optimize/republish',
    data,
  ) as unknown as Promise<RepublishTaskAccept>;

const REPUBLISH_TASK_TERMINAL: ReadonlySet<RepublishTaskDetail['status']> =
  new Set(['SUCCESS', 'FAILED']);

export const republishTaskQueryOptions = (taskId: string) => ({
  queryKey: [
    'ai-assistant',
    'content-optimize',
    'republish-task',
    taskId,
  ] as const,
  queryFn: async (): Promise<RepublishTaskDetail> => {
    const res = await request.get<RepublishTaskDetail>(
      `/api/v1/ai-assistant/content-optimize/republish-tasks/${taskId}`,
    );
    return res as unknown as RepublishTaskDetail;
  },
  refetchInterval: (query: { state: { data?: RepublishTaskDetail } }) =>
    query.state.data && REPUBLISH_TASK_TERMINAL.has(query.state.data.status)
      ? false
      : 3000,
  refetchIntervalInBackground: false,
  retry: 1,
});

// ============================================================
// 标签库
// ============================================================

export const tagsQueryOptions = (params: TagListQueryParams) => ({
  queryKey: ['ai-assistant', 'tags', 'list', params] as const,
  queryFn: async (): Promise<TagPage> => {
    const res = await request.get<TagPage>('/api/v1/ai-assistant/tags', {
      params,
    });
    return res as unknown as TagPage;
  },
});

export const tagStatsQueryOptions = () => ({
  queryKey: ['ai-assistant', 'tags', 'stats'] as const,
  queryFn: async (): Promise<TagStats> => {
    const res = await request.get<TagStats>('/api/v1/ai-assistant/tags/stats');
    return res as unknown as TagStats;
  },
});

export const createTag = (data: CreateTagParam) =>
  request.post<Tag>(
    '/api/v1/ai-assistant/tags',
    data,
  ) as unknown as Promise<Tag>;

export const updateTag = (tagId: string, data: UpdateTagParam) =>
  request.put<void>(
    `/api/v1/ai-assistant/tags/${tagId}`,
    data,
  ) as unknown as Promise<void>;

export const disableTag = (tagId: string) =>
  request.post<void>(
    `/api/v1/ai-assistant/tags/${tagId}/disable`,
  ) as unknown as Promise<void>;

export const enableTag = (tagId: string) =>
  request.post<void>(
    `/api/v1/ai-assistant/tags/${tagId}/enable`,
  ) as unknown as Promise<void>;

export const tagCategoriesQueryOptions = () => ({
  queryKey: ['ai-assistant', 'tags', 'categories'] as const,
  queryFn: async (): Promise<TagCategoryListData> => {
    const res = await request.get<TagCategoryListData>(
      '/api/v1/ai-assistant/tags/categories',
    );
    return res as unknown as TagCategoryListData;
  },
});

export const createTagCategory = (data: CreateTagCategoryParam) =>
  request.post<void>(
    '/api/v1/ai-assistant/tags/categories',
    data,
  ) as unknown as Promise<void>;

// ============================================================
// 私信回复（本期 501，路径与 Hook 提前给出便于 UI 接入）
// ============================================================

export const messageReplyAccountsQueryOptions = () => ({
  queryKey: ['ai-assistant', 'message-reply', 'accounts'] as const,
  queryFn: async (): Promise<unknown> => {
    const res = await request.get<unknown>(
      '/api/v1/ai-assistant/message-reply/accounts',
    );
    return res;
  },
});

export const messageScrapeSettingsQueryOptions = () => ({
  queryKey: ['ai-assistant', 'message-reply', 'scrape-settings'] as const,
  queryFn: async (): Promise<unknown> => {
    const res = await request.get<unknown>(
      '/api/v1/ai-assistant/message-reply/scrape-settings',
    );
    return res;
  },
});

export const updateMessageScrapeSettings = (data: unknown) =>
  request.put<void>(
    '/api/v1/ai-assistant/message-reply/scrape-settings',
    data,
  ) as unknown as Promise<void>;

export const triggerMessageScrape = (data: unknown) =>
  request.post<void>(
    '/api/v1/ai-assistant/message-reply/scrape',
    data,
  ) as unknown as Promise<void>;

export const messageCategoriesQueryOptions = () => ({
  queryKey: ['ai-assistant', 'message-reply', 'categories'] as const,
  queryFn: async (): Promise<unknown> => {
    const res = await request.get<unknown>(
      '/api/v1/ai-assistant/message-reply/categories',
    );
    return res;
  },
});

export const upsertMessageCategories = (data: unknown) =>
  request.put<void>(
    '/api/v1/ai-assistant/message-reply/categories',
    data,
  ) as unknown as Promise<void>;

export const messageReplyRulesQueryOptions = () => ({
  queryKey: ['ai-assistant', 'message-reply', 'rules'] as const,
  queryFn: async (): Promise<unknown> => {
    const res = await request.get<unknown>(
      '/api/v1/ai-assistant/message-reply/rules',
    );
    return res;
  },
});

export const upsertMessageReplyRules = (data: unknown) =>
  request.put<void>(
    '/api/v1/ai-assistant/message-reply/rules',
    data,
  ) as unknown as Promise<void>;

export const pendingMessagesQueryOptions = (params?: {
  page?: number;
  pageSize?: number;
  accountId?: string;
  classification?: string;
  status?: string;
  keyword?: string;
}) => ({
  queryKey: ['ai-assistant', 'message-reply', 'pending', params] as const,
  queryFn: async (): Promise<unknown> => {
    const res = await request.get<unknown>(
      '/api/v1/ai-assistant/message-reply/pending',
      { params },
    );
    return res;
  },
});

export const messageReplyHistoryQueryOptions = (params?: {
  page?: number;
  pageSize?: number;
  accountId?: string;
  classification?: string;
  status?: string;
  keyword?: string;
}) => ({
  queryKey: ['ai-assistant', 'message-reply', 'history', params] as const,
  queryFn: async (): Promise<unknown> => {
    const res = await request.get<unknown>(
      '/api/v1/ai-assistant/message-reply/history',
      { params },
    );
    return res;
  },
});

export const submitManualMessageReply = (messageId: string, data: unknown) =>
  request.post<void>(
    `/api/v1/ai-assistant/message-reply/${messageId}/reply`,
    data,
  ) as unknown as Promise<void>;

export const triggerMessageAutoReply = (messageId: string) =>
  request.post<void>(
    `/api/v1/ai-assistant/message-reply/${messageId}/auto-reply`,
  ) as unknown as Promise<void>;

export const markMessageImportant = (messageId: string) =>
  request.post<void>(
    `/api/v1/ai-assistant/message-reply/${messageId}/mark-important`,
  ) as unknown as Promise<void>;

// ============================================================
// AI 助手首页工作台
// ============================================================

export const aiAssistantGroupsQueryOptions = () => ({
  queryKey: ['ai-assistant', 'workspace', 'groups'] as const,
  queryFn: async (): Promise<AiAssistantGroupList> => {
    const res = await request.get<AiAssistantGroupList>(
      '/api/v1/ai-assistant/workspace/groups',
    );
    return res as unknown as AiAssistantGroupList;
  },
});

export const aiAssistantGroupAccountsQueryOptions = () => ({
  queryKey: ['ai-assistant', 'workspace', 'accounts'] as const,
  queryFn: async (): Promise<AiAssistantGroupAccountOptionList> => {
    const res = await request.get<AiAssistantGroupAccountOptionList>(
      '/api/v1/ai-assistant/workspace/accounts',
    );
    return res as unknown as AiAssistantGroupAccountOptionList;
  },
});

export const createAiAssistantGroup = (data: AiAssistantGroupFormPayload) =>
  request.post<void>(
    '/api/v1/ai-assistant/workspace/groups',
    data,
  ) as unknown as Promise<void>;

export const updateAiAssistantGroup = (
  groupId: string,
  data: AiAssistantGroupFormPayload,
) =>
  request.put<void>(
    `/api/v1/ai-assistant/workspace/groups/${groupId}`,
    data,
  ) as unknown as Promise<void>;

export const deleteAiAssistantGroup = (groupId: string) =>
  request.delete<void>(
    `/api/v1/ai-assistant/workspace/groups/${groupId}`,
  ) as unknown as Promise<void>;

export const aiAssistantConversationsQueryOptions = (params: {
  groupId?: string;
  keyword?: string;
}) => ({
  queryKey: ['ai-assistant', 'workspace', 'conversations', params] as const,
  queryFn: async (): Promise<AiAssistantConversationList> => {
    const res = await request.get<AiAssistantConversationList>(
      '/api/v1/ai-assistant/workspace/conversations',
      { params },
    );
    return res as unknown as AiAssistantConversationList;
  },
  enabled: Boolean(params.groupId),
});

export const aiAssistantMessagesQueryOptions = (params: {
  groupId?: string;
  conversationId?: string;
}) => ({
  queryKey: ['ai-assistant', 'workspace', 'messages', params] as const,
  queryFn: async (): Promise<AiAssistantMessageList> => {
    const res = await request.get<AiAssistantMessageList>(
      '/api/v1/ai-assistant/workspace/messages',
      { params },
    );
    return res as unknown as AiAssistantMessageList;
  },
  enabled: Boolean(params.groupId && params.conversationId),
});

export const sendAiAssistantMessage = (
  conversationId: string,
  data: AiAssistantSendMessagePayload,
) =>
  request.post<void>(
    `/api/v1/ai-assistant/workspace/conversations/${conversationId}/reply`,
    data,
  ) as unknown as Promise<void>;

export const updateAiAssistantGroupAutoReply = (
  groupId: string,
  data: { autoReplyEnabled: boolean },
) =>
  request.put<void>(
    `/api/v1/ai-assistant/workspace/groups/${groupId}/auto-reply`,
    data,
  ) as unknown as Promise<void>;

export const aiAssistantKnowledgeFilesQueryOptions = (groupId?: string) => ({
  queryKey: ['ai-assistant', 'workspace', 'knowledge-files', groupId] as const,
  queryFn: async (): Promise<AiAssistantKnowledgeFileList> => {
    const res = await request.get<AiAssistantKnowledgeFileList>(
      `/api/v1/ai-assistant/workspace/groups/${groupId}/knowledge-files`,
    );
    return res as unknown as AiAssistantKnowledgeFileList;
  },
  enabled: Boolean(groupId),
});

export const uploadAiAssistantKnowledgeFile = (
  groupId: string,
  data: AiAssistantKnowledgeUploadPayload,
) =>
  request.post<void>(
    `/api/v1/ai-assistant/workspace/groups/${groupId}/knowledge-files`,
    data,
  ) as unknown as Promise<void>;

export const deleteAiAssistantKnowledgeFile = (
  groupId: string,
  fileId: string,
) =>
  request.delete<void>(
    `/api/v1/ai-assistant/workspace/groups/${groupId}/knowledge-files/${fileId}`,
  ) as unknown as Promise<void>;
