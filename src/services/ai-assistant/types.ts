// AI 助手模块 OpenAPI 类型
// 与 contract/openapi/assistant/assistant-api.yaml 中的 schemas 一一对齐

// ────────── 通用 ──────────

export type PlatformCode = 'douyin' | 'xiaohongshu';

export type OperationType =
  | 'FETCH_COMMENT'
  | 'AUTO_REPLY_COMMENT'
  | 'DELETE_COMMENT'
  | 'FETCH_MESSAGE'
  | 'AUTO_REPLY_MESSAGE'
  | 'REPUBLISH_CONTENT';

export type Capability = {
  supported: boolean;
  fallbackHint?: string | null;
};

export type HumanReviewReason =
  | 'BLOCKED_KEYWORD'
  | 'LOW_CONFIDENCE'
  | 'HUMAN_INTERVENTION_RULE'
  | 'CLASSIFY_FAILED'
  | 'SEND_FAILED';

export type CommentRecordStatus =
  | 'RAW_FETCHED'
  | 'CLASSIFYING'
  | 'HUMAN_REVIEW_PENDING'
  | 'READY_FOR_AUTO_REPLY'
  | 'BLOCKED_AUTO_DELETE'
  | 'SILENT_SKIPPED_OFFLINE'
  | 'SILENT_SKIPPED_CAPABILITY';

export type CommentCategory =
  | 'positive'
  | 'negative'
  | 'question'
  | 'neutral'
  | 'promotion';

export type PageMeta = {
  page: number;
  pageSize: number;
  total: string;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

// ────────── 主页 ──────────

export type FeatureCode =
  | 'content_optimize'
  | 'comment_reply'
  | 'message_reply'
  | 'tag_library';

export type HomeFeatureBadgeType = 'count';

export type HomeFeatureBadge = {
  type: HomeFeatureBadgeType;
  value: number;
  label: string;
};

export type HomeFeature = {
  code: FeatureCode;
  enabled: boolean;
  badge?: HomeFeatureBadge | null;
};

export type HomeSummary = {
  features: HomeFeature[];
};

// ────────── 评论目标查询（爬虫域内部接口） ──────────

export type CommentFetchTargetPublishStatusHint =
  | 'PUBLISH_SUCCESS'
  | 'UNDER_REVIEW'
  | 'PUBLISH_FAILED';

export type CommentFetchTarget = {
  platformContentId: string;
  publishedAt: string;
  publishStatusHint: CommentFetchTargetPublishStatusHint;
  lastFetchedAt?: string | null;
  lastSeenCommentTime?: string | null;
};

export type CommentFetchTargetsFetchPolicy = {
  intervalSeconds?: number;
  maxAgeHours?: number;
};

export type CommentFetchTargets = {
  targets: CommentFetchTarget[];
  fetchPolicy?: CommentFetchTargetsFetchPolicy | null;
};

export type CommentFetchTargetsQueryParams = {
  phoneNumber: string;
  platform: PlatformCode;
};

// ────────── 评论看板 / 列表 ──────────

export type CommentReplyTodayDashboard = {
  autoReplyCount: number;
  blockedCount: number;
  humanReviewCount: number;
};

export type AccountSnapshot = {
  accountId: string;
  phoneNumber: string;
  platform: PlatformCode;
  accountType: string;
  nickname?: string;
  avatar?: string | null;
  isOnline: boolean;
  capabilities: Record<string, Capability>;
};

export type AccountSnapshotPage = PageMeta & {
  list: AccountSnapshot[];
};

export type CommentReplyAccountsQueryParams = {
  page?: number;
  pageSize?: number;
  platform?: PlatformCode;
  keyword?: string;
  status?: 'online' | 'offline';
};

export type CommentRecord = {
  commentId: string;
  accountId: string;
  platform: PlatformCode;
  platformCommentId?: string;
  platformContentId?: string;
  authorName?: string;
  authorAvatar?: string | null;
  text: string;
  publishedAt?: string | null;
  fetchedAt: string;
  aiCategory?: CommentCategory;
  confidence?: number;
  status: CommentRecordStatus;
  humanReviewReason?: HumanReviewReason | null;
  suggestedReply?: string | null;
};

export type CommentRecordPage = PageMeta & {
  list: CommentRecord[];
};

export type PendingCommentsQueryParams = {
  page?: number;
  pageSize?: number;
  accountId?: string;
  keyword?: string;
};

export type HumanReviewCommentsQueryParams = {
  page?: number;
  pageSize?: number;
  accountId?: string;
  keyword?: string;
  aiCategory?: string;
  status?: string;
  reason?: HumanReviewReason;
};

export type CommentReplyHistoryQueryParams = {
  page?: number;
  pageSize?: number;
  accountId?: string;
  status?: CommentRecordStatus;
};

// ────────── 评论域 · 立即抓取 ──────────

export type CommentScrapeParam = {
  accountId: string;
};

export type CommentScrapeResultStatus = 'ACCEPTED' | 'REJECTED';

export type CommentScrapeResult = {
  batchId: string;
  callbackId: string;
  status: CommentScrapeResultStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
};

// ────────── 评论域 · 配置 CRUD ──────────

export type BlockedKeywordParam = {
  keyword: string;
  autoDelete?: boolean;
};

export type BlockedKeyword = {
  keywordId: string;
  keyword: string;
  autoDelete: boolean;
  createdAt: string;
};

export type BlockedKeywordListData = {
  keywords: BlockedKeyword[];
};

export type CommentReplyTone = string;

export type ToneOption = {
  code: string;
  displayName: string;
};

export type ToneOptionListData = {
  options: ToneOption[];
};

export type CommentReplyRule = {
  ruleId?: string | null;
  category: string;
  template: string;
  tone: CommentReplyTone;
  requiresHumanReview?: boolean;
  keywords?: string[];
  createdByUserId?: string | null;
  createdByName?: string | null;
  editable?: boolean;
};

export type CommentReplyRuleList = {
  rules: CommentReplyRule[];
};

export type CommentReplyRulesUpsertParam = CommentReplyRuleList;

export type AccountCommentReplySettings = {
  accountId: string;
  autoReplyEnabled: boolean;
  scrapeIntervalSeconds: number;
  humanInterventionForQuestion?: boolean;
  humanInterventionForNegative?: boolean;
};

export type AccountCommentReplySettingsParam = {
  autoReplyEnabled?: boolean;
  scrapeIntervalSeconds?: number;
  humanInterventionForQuestion?: boolean;
  humanInterventionForNegative?: boolean;
};

// ────────── 评论域 · 写操作 ──────────

export type ManualReplyParam = {
  replyText: string;
};

export type HumanClassifyParam = {
  category: CommentCategory;
  replyText?: string;
};

// ────────── 内容优化与重发布 ──────────

export type OptimizeThreshold = {
  viewMin: number;
  likeRateMinPercent: number;
};

export type OptimizeThresholdParam = OptimizeThreshold;

export type OptimizeContentResponse = {
  suggestion: string;
  suggestedTitle: string;
  suggestedTags: string[];
  sensitiveWords?: string[];
};

export type LowDataContent = {
  contentId: string;
  accountId: string;
  platform: PlatformCode;
  accountNickname?: string;
  title: string;
  viewCount: string;
  likeRatePercent: number;
  publishedAt?: string;
};

export type LowDataContentPage = PageMeta & {
  list: LowDataContent[];
};

export type LowDataContentQueryParams = {
  page?: number;
  pageSize?: number;
  platform?: PlatformCode;
  accountId?: string;
  viewMin?: number;
  likeRateMinPercent?: number;
  keyword?: string;
};

export type ApplyOptimizationParam = {
  title?: string;
  description?: string;
  tags?: string[];
};

export type RepublishParam = {
  contentId: string;
  targetAccountIds: string[];
  deleteOriginal?: boolean;
};

export type RepublishTaskAccept = {
  taskId: string;
};

export type RepublishTaskStatus =
  | 'PENDING'
  | 'PUBLISHING'
  | 'SUCCESS'
  | 'FAILED'
  | 'RETRYING';

export type RepublishTaskDetail = {
  taskId: string;
  status: RepublishTaskStatus;
  attempt?: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  publishedPlatformContentIds?: string[];
};

// ────────── 标签库 ──────────

export type TagApplicablePlatform = 'all' | 'douyin' | 'xiaohongshu';
export type TagStatus = 'enabled' | 'disabled';

export type Tag = {
  tagId: string;
  category?: string;
  name: string;
  applicablePlatform: TagApplicablePlatform;
  status: TagStatus;
  usageCount?: number;
  lastUsedAt?: string | null;
  createdByUserId?: string | null;
  createdByName?: string | null;
  editable?: boolean;
};

export type TagPage = PageMeta & {
  list: Tag[];
};

export type TagListQueryParams = {
  page?: number;
  pageSize?: number;
  category?: string;
  status?: TagStatus;
  keyword?: string;
};

export type CreateTagParam = {
  category: string;
  name: string;
  applicablePlatform: TagApplicablePlatform;
};

export type UpdateTagParam = {
  category?: string;
  name?: string;
  applicablePlatform?: TagApplicablePlatform;
};

export type TagCategory = {
  code: string;
  name: string;
  isCustom: boolean;
};

export type TagCategoryListData = {
  categories: TagCategory[];
};

export type TagStats = {
  categories: { code: string; count: number }[];
  disabled: number;
};

export type CreateTagCategoryParam = {
  name: string;
};

// ────────── 私信回复（本期 501，schema 提前给出便于 UI 布局） ──────────
// OpenAPI 中私信端点本期统一返回 ResultEmpty（HTTP 501，业务码 51001），
// 这里仅声明前端可选数据契约，便于将来 assistant-message-reply 变更解锁后无缝接入。

export type MessageReplySettings = {
  autoReplyEnabled?: boolean;
  scrapeIntervalSeconds?: number;
  scrapeTypes?: string[];
};

export type MessageCategory = {
  categoryId?: string;
  name: string;
  keywords?: string[];
  enabled?: boolean;
};

export type MessageCategoryList = {
  categories: MessageCategory[];
};

export type MessageReplyRule = {
  ruleId?: string;
  category: string;
  template: string;
  tone?: string;
  createdByUserId?: string | null;
  createdByName?: string | null;
  editable?: boolean;
};

export type MessageReplyRuleList = {
  rules: MessageReplyRule[];
};

export type MessageRecord = {
  messageId: string;
  accountId: string;
  platform: PlatformCode;
  senderName?: string;
  text: string;
  receivedAt?: string;
  isImportant?: boolean;
  status?: string;
  category?: string;
  suggestedReply?: string | null;
};

export type MessagePendingPage = PageMeta & {
  list: MessageRecord[];
};

export type MessageHistoryPage = PageMeta & {
  list: MessageRecord[];
};

export type MessageManualReplyParam = {
  replyText: string;
};

// ────────── AI 助手首页工作台 ──────────

export type AiAssistantGroup = {
  id: string;
  name: string;
  accountIds: string[];
  accountCount: number;
  autoReplyEnabled: boolean;
  unreadCount: number;
  hasUrgent?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AiAssistantGroupList = {
  groups: AiAssistantGroup[];
};

export type AiAssistantGroupFormPayload = {
  name: string;
  accountIds: string[];
};

export type AiAssistantGroupAccountOption = {
  accountId: string;
  nickname: string;
  platform: PlatformCode;
  ownerName: string;
  assignedGroupId?: string | null;
  assignedGroupName?: string | null;
};

export type AiAssistantGroupAccountOptionList = {
  accounts: AiAssistantGroupAccountOption[];
};

export type AiAssistantConversation = {
  id: string;
  senderName: string;
  senderAvatar?: string | null;
  accountId: string;
  accountName: string;
  platform: PlatformCode;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  isUrgent?: boolean;
};

export type AiAssistantConversationList = {
  list: AiAssistantConversation[];
};

export type AiAssistantMessageSender = 'CUSTOMER' | 'OPERATOR' | 'AI';

export type AiAssistantMessage = {
  id: string;
  conversationId: string;
  senderType: AiAssistantMessageSender;
  senderName: string;
  text: string;
  createdAt: string;
};

export type AiAssistantMessageList = {
  list: AiAssistantMessage[];
};

export type AiAssistantSendMessagePayload = {
  replyText: string;
};

export type AiAssistantKnowledgeFile = {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  createdAt: string;
  summary: string;
};

export type AiAssistantKnowledgeFileList = {
  files: AiAssistantKnowledgeFile[];
};

export type AiAssistantKnowledgeUploadPayload = {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
};
