export type MediaPurposeCode = 'DRAFT_VIDEO' | 'DRAFT_IMAGE' | 'ATTACHMENT';

export const MEDIA_PURPOSE_CODE = {
  DRAFT_VIDEO: 'DRAFT_VIDEO',
  DRAFT_IMAGE: 'DRAFT_IMAGE',
  ATTACHMENT: 'ATTACHMENT',
} as const satisfies Record<string, MediaPurposeCode>;

export type UploadSessionStatus =
  | 'CREATED'
  | 'UPLOADING'
  | 'COMPLETED'
  | 'ABORTED'
  | 'EXPIRED';

export const UPLOAD_SESSION_STATUS = {
  CREATED: 'CREATED',
  UPLOADING: 'UPLOADING',
  COMPLETED: 'COMPLETED',
  ABORTED: 'ABORTED',
  EXPIRED: 'EXPIRED',
} as const satisfies Record<string, UploadSessionStatus>;

export type PublishRecordStage =
  | 'PENDING'
  | 'MEDIA_RESOLVING'
  | 'UPLOADING'
  | 'PLATFORM_PROCESSING'
  | 'PUBLISHED'
  | 'UNDER_REVIEW'
  | 'FAILED'
  | 'CANCELLED';

export const PUBLISH_RECORD_STAGE = {
  PENDING: 'PENDING',
  MEDIA_RESOLVING: 'MEDIA_RESOLVING',
  UPLOADING: 'UPLOADING',
  PLATFORM_PROCESSING: 'PLATFORM_PROCESSING',
  PUBLISHED: 'PUBLISHED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const satisfies Record<string, PublishRecordStage>;

export type PlatformCode = 'douyin' | 'xiaohongshu';

export const PLATFORM_CODE = {
  DOUYIN: 'douyin',
  XIAOHONGSHU: 'xiaohongshu',
} as const satisfies Record<string, PlatformCode>;

export type PublishStatusCode =
  | 'PUBLISH_SUCCESS'
  | 'UNDER_REVIEW'
  | 'PUBLISH_FAILED';

export const PUBLISH_STATUS_CODE = {
  PUBLISH_SUCCESS: 'PUBLISH_SUCCESS',
  UNDER_REVIEW: 'UNDER_REVIEW',
  PUBLISH_FAILED: 'PUBLISH_FAILED',
} as const satisfies Record<string, PublishStatusCode>;

export type PublishExtensionTypeCode = 'location' | 'deal';

export type PublishExtensionFinalStatusCode =
  | 'NONE'
  | 'MOUNTED'
  | 'MOUNT_FAILED';

export type PublishExtensionSnapshot = {
  type?: PublishExtensionTypeCode;
  targetName?: string;
  targetDescription?: string;
  sourceLabel?: string;
  preMountStatus?: 'SUCCESS' | 'FAILED' | 'EXPIRED';
  preMountId?: string;
  preMountedAt?: string;
  finalStatus: PublishExtensionFinalStatusCode;
  failureReason?: string;
  updatedAt?: string;
};

export type PublishErrorCode =
  | 'TITLE_TOO_LONG'
  | 'TITLE_MISSING'
  | 'CAPTION_TOO_LONG'
  | 'TOPIC_COUNT_EXCEEDED'
  | 'VIDEO_RATIO_INVALID'
  | 'VIDEO_DURATION_INVALID'
  | 'VIDEO_SIZE_EXCEEDED'
  | 'IMAGE_COUNT_EXCEEDED'
  | 'IMAGE_RATIO_INVALID'
  | 'MULTI_ACCOUNT_SAME_PLATFORM'
  | 'MEDIA_NOT_FOUND'
  | 'MEDIA_METADATA_UNAVAILABLE'
  | 'ACCOUNT_OFFLINE'
  | 'ACCOUNT_TOKEN_EXPIRED'
  | 'DUPLICATE_CONTENT'
  | 'PLATFORM_REJECTED'
  | 'NETWORK_TIMEOUT'
  | 'ORIGINAL_DELETE_FAILED'
  | 'ORIGINAL_DELETE_ABANDONED'
  | 'UNKNOWN';

export const PUBLISH_ERROR_CODE = {
  TITLE_TOO_LONG: 'TITLE_TOO_LONG',
  TITLE_MISSING: 'TITLE_MISSING',
  CAPTION_TOO_LONG: 'CAPTION_TOO_LONG',
  TOPIC_COUNT_EXCEEDED: 'TOPIC_COUNT_EXCEEDED',
  VIDEO_RATIO_INVALID: 'VIDEO_RATIO_INVALID',
  VIDEO_DURATION_INVALID: 'VIDEO_DURATION_INVALID',
  VIDEO_SIZE_EXCEEDED: 'VIDEO_SIZE_EXCEEDED',
  IMAGE_COUNT_EXCEEDED: 'IMAGE_COUNT_EXCEEDED',
  IMAGE_RATIO_INVALID: 'IMAGE_RATIO_INVALID',
  MULTI_ACCOUNT_SAME_PLATFORM: 'MULTI_ACCOUNT_SAME_PLATFORM',
  MEDIA_NOT_FOUND: 'MEDIA_NOT_FOUND',
  MEDIA_METADATA_UNAVAILABLE: 'MEDIA_METADATA_UNAVAILABLE',
  ACCOUNT_OFFLINE: 'ACCOUNT_OFFLINE',
  ACCOUNT_TOKEN_EXPIRED: 'ACCOUNT_TOKEN_EXPIRED',
  DUPLICATE_CONTENT: 'DUPLICATE_CONTENT',
  PLATFORM_REJECTED: 'PLATFORM_REJECTED',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  ORIGINAL_DELETE_FAILED: 'ORIGINAL_DELETE_FAILED',
  ORIGINAL_DELETE_ABANDONED: 'ORIGINAL_DELETE_ABANDONED',
  UNKNOWN: 'UNKNOWN',
} as const satisfies Record<string, PublishErrorCode>;

export type PublishJobStatus = 'ACTIVE' | 'COMPLETED';

export const PUBLISH_JOB_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
} as const satisfies Record<string, PublishJobStatus>;

export type ContentModeCode = 'VIDEO' | 'IMAGE';

export const CONTENT_MODE_CODE = {
  VIDEO: 'VIDEO',
  IMAGE: 'IMAGE',
} as const satisfies Record<string, ContentModeCode>;

export type OriginalDeleteStatusCode =
  | 'PENDING'
  | 'RETRYING'
  | 'SUCCEEDED'
  | 'ABANDONED'
  | 'ABORTED';

export const ORIGINAL_DELETE_STATUS_CODE = {
  PENDING: 'PENDING',
  RETRYING: 'RETRYING',
  SUCCEEDED: 'SUCCEEDED',
  ABANDONED: 'ABANDONED',
  ABORTED: 'ABORTED',
} as const satisfies Record<string, OriginalDeleteStatusCode>;

export type ErrorInfo = {
  field: string;
  message: string;
  errorCode?: PublishErrorCode;
};

export type CreateUploadSessionRequest = {
  fileName: string;
  fileSizeBytes: string;
  mimeType?: string;
  purpose: MediaPurposeCode;
  fileSha256?: string;
};

export type CompleteUploadPartRef = {
  partNumber: number;
  sha256?: string;
  serverPartEtag?: string;
};

export type CompleteUploadSessionRequest = {
  parts: CompleteUploadPartRef[];
};

export type PublishSubmitRequest = {
  accountIds: string[];
  contentMode: ContentModeCode;
  caption?: string;
  titleByPlatform?: Record<string, string>;
  topicTags?: string[];
  mentions?: string[];
  primaryMediaAssetId?: string;
  imageMediaAssetIds?: string[];
  idempotencyKey?: string;
};

export type UploadSessionCreatedData = {
  uploadSessionId: string;
  partSizeBytes: string;
  totalParts: number;
  expiresAt: string;
  maxConcurrentParts?: number;
};

export type UploadedPartInfo = {
  partNumber: number;
  sizeBytes: string;
  sha256?: string;
  uploadedAt: string;
};

export type UploadSessionStatusData = {
  uploadSessionId: string;
  status: UploadSessionStatus;
  partSizeBytes: string;
  totalParts: number;
  fileSizeBytes: string;
  uploadedParts?: UploadedPartInfo[];
  missingPartNumbers: number[];
  expiresAt: string;
  mediaAssetId?: string;
};

export type UploadPartAckData = {
  partNumber: number;
  receivedSizeBytes: string;
  serverPartEtag: string;
};

export type UploadCompleteData = {
  mediaAssetId: string;
  fileSizeBytes: string;
  previewUrl: string;
  mimeType: string;
  widthPx?: number | null;
  heightPx?: number | null;
  durationMs?: number | null;
  ratio?: string | null;
  probeError?: string | null;
};

export type PublishSubmitData = {
  jobId: string;
  recordIds: string[];
};

export type VerifyType = 'sms' | 'qr';

export type PublishRecordProgressData = {
  recordId: string;
  accountId?: string | null;
  accountNickname?: string | null;
  platform?: PlatformCode | null;
  stage: PublishRecordStage;
  percent: number;
  message?: string | null;
  errorCode?: PublishErrorCode | null;
  retryable?: boolean | null;
  retryAttempt?: number | null;
  maxRetries?: number | null;
  nextRetryAt?: string | null;
  updatedAt: string;
  // content-publish-verify-flow
  /** 二次验证类型；仅在 Redis 验证态缓存命中时非空 */
  verifyType?: VerifyType | null;
  /** 二维码图片 src（仅 verifyType=qr 时非空），http URL 或 base64 data URL */
  qrCodeSrc?: string | null;
  /** 验证态相关错误码（典型为 SMS_CODE_ERROR）；与终态 errorCode 分开承载 */
  verifyErrorCode?: string | null;
};

export type SubmitVerifyCodeRequest = {
  code: string;
};

export type SubmitVerifyCodeData = {
  status: 'SMS_VERIFYING';
};

export type RefreshQrCodeData = {
  status: 'QR_VERIFY_REQUIRED' | 'SUCCEEDED';
  qrCodeSrc?: string | null;
};

export type PublishJobProgressData = {
  jobId: string;
  jobStatus: PublishJobStatus;
  overallPercent: number;
  totalCount: number;
  succeededCount: number;
  failedCount: number;
  cancelledCount?: number;
  records: PublishRecordProgressData[];
  updatedAt: string;
};

export type PublishRecordMetricsSnapshotData = {
  recordId: string;
  platformContentId?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  shareCount?: string;
  collectCount?: string;
  newFollowersCount?: string;
  engagementRatePercent?: string;
  syncedAt: string;
  metricsSyncStopped: boolean;
  metricsSyncStopReason?:
    | 'RETENTION_EXPIRED'
    | 'UNDER_REVIEW'
    | 'RECORD_FAILED';
};

export type OriginalDeleteState = {
  status: OriginalDeleteStatusCode;
  attempts: number;
  maxQuickAttempts: number;
  nextAttemptAt?: string;
  lastAttemptAt?: string;
  errorCode?: PublishErrorCode;
  errorMessage?: string;
  userNotifiedAt?: string;
  platformContentIdSnapshot?: string;
};

export type PublishRecordListItem = {
  recordId: string;
  jobId?: string;
  coverUrl?: string;
  title?: string;
  captionExcerpt?: string;
  contentMode: ContentModeCode;
  platform: PlatformCode;
  accountId: string;
  accountNickname?: string;
  status: PublishStatusCode;
  publishedAt: string;
  statusSyncedAt?: string;
  originalDeletePending?: boolean;
  /** 发布人 user id（PRD §1.4.5）。NORMAL_ADMIN 视角下恒等当前登录用户。 */
  ownerUserId?: string;
  /** 发布人展示名（PRD §1.4.5：TENANT_ADMIN 视角列表标注"发布人：xxx"）。 */
  ownerName?: string;
  /** 评审原型字段：商品发布扩展信息，不作为正式接口契约。 */
  extensionInfo?: PublishExtensionSnapshot;
};

export type PublishRecordListData = {
  list: PublishRecordListItem[];
  page: number;
  pageSize: number;
  total: string;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
};

export type PublishRecordDetailData = {
  recordId: string;
  jobId?: string;
  sourceRecordId?: string;
  contentMode: ContentModeCode;
  title?: string;
  caption?: string;
  topicTags?: string[];
  mentions?: string[];
  primaryMediaAssetId?: string;
  imageMediaAssetIds?: string[];
  coverUrl?: string;
  platform: PlatformCode;
  accountId: string;
  accountNickname?: string;
  stage: PublishRecordStage;
  status: PublishStatusCode;
  errorCode?: PublishErrorCode;
  errorMessage?: string;
  retryAttempt?: number;
  maxRetries?: number;
  nextRetryAt?: string;
  publishedAt: string;
  platformPublishedAt?: string;
  platformContentId?: string;
  platformContentUrl?: string;
  metrics?: PublishRecordMetricsSnapshotData;
  originalDelete?: OriginalDeleteState;
  canRepublish: boolean;
  /** 评审原型字段：商品发布扩展信息，不作为正式接口契约。 */
  extensionInfo?: PublishExtensionSnapshot;
};

export type RepublishRequest = {
  targetAccountIds: string[];
  titleByPlatform?: Record<string, string>;
  caption?: string;
  topicTags?: string[];
  mentions?: string[];
  primaryMediaAssetId?: string;
  imageMediaAssetIds?: string[];
  deleteOriginalOnSuccess?: boolean;
  confirmDuplicate?: boolean;
  idempotencyKey?: string;
};

export type ActivePublishJobSummary = {
  jobId: string;
  overallPercent: number;
  totalCount: number;
  succeededCount: number;
  failedCount: number;
  startedAt: string;
};

export type ActivePublishJobsData = {
  hasActive: boolean;
  jobs: ActivePublishJobSummary[];
};

export type ContentResponseUploadSessionCreated = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: UploadSessionCreatedData;
};

export type ContentResponseUploadSessionStatus = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: UploadSessionStatusData;
};

export type ContentResponseUploadPartAck = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: UploadPartAckData;
};

export type ContentResponseUploadComplete = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: UploadCompleteData;
};

export type ContentResponseVoid = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: null;
};

export type ContentResponsePublishSubmit = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: PublishSubmitData;
};

export type ContentResponsePublishJobProgress = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: PublishJobProgressData;
};

export type ContentResponsePublishRecordProgress = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: PublishRecordProgressData;
};

export type ContentResponsePublishRecordList = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: PublishRecordListData;
};

export type ContentResponsePublishRecordDetail = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: PublishRecordDetailData;
};

export type ContentResponsePublishRecordMetricsSnapshot = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: PublishRecordMetricsSnapshotData;
};

export type ContentResponseActivePublishJobs = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: ActivePublishJobsData;
};

export type ContentAiTitleSuggestionsRequest = {
  platform: PlatformCode;
  contentMode: ContentModeCode;
  userPrompt?: string | null;
  systemPrompt?: string | null;
  currentTitle?: string | null;
  captionExcerpt?: string | null;
  maxVariants?: number;
};

export type ContentAiTitleVariant = {
  text: string;
  rationale?: string | null;
};

export type ContentAiTitleSuggestionsData = {
  variants: ContentAiTitleVariant[];
};

export type ContentResponseAiTitleSuggestions = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: ContentAiTitleSuggestionsData;
};

export type ContentAiCaptionSuggestionsRequest = {
  platform: PlatformCode;
  contentMode: ContentModeCode;
  userPrompt?: string | null;
  systemPrompt?: string | null;
  templateCode?: string | null;
  currentTitle?: string | null;
  currentCaption?: string | null;
  currentTopicTags?: string[] | null;
  maxVariants?: number;
};

export type ContentAiCaptionVariant = {
  title: string;
  caption: string;
  topicTags: string[];
  rationale?: string | null;
};

export type ContentAiCaptionSuggestionsData = {
  variants: ContentAiCaptionVariant[];
};

export type ContentResponseAiCaptionSuggestions = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: ContentAiCaptionSuggestionsData;
};

export type ContentAiSuggestionsScope = 'TITLE' | 'CONTENT' | 'ALL';

export const CONTENT_AI_SUGGESTIONS_SCOPE = {
  TITLE: 'TITLE',
  CONTENT: 'CONTENT',
  ALL: 'ALL',
} as const satisfies Record<string, ContentAiSuggestionsScope>;

export type ContentAiSuggestionsRequest = {
  platform: PlatformCode;
  contentMode: ContentModeCode;
  userPrompt?: string | null;
  systemPrompt?: string | null;
  scope: ContentAiSuggestionsScope;
  currentTitle?: string | null;
  captionExcerpt?: string | null;
  templateCode?: string | null;
  currentCaption?: string | null;
  currentTopicTags?: string[] | null;
  maxVariants?: number;
};

export type ContentAiSuggestionsData = {
  titleSuggestions?: ContentAiTitleSuggestionsData | null;
  contentSuggestions?: ContentAiCaptionSuggestionsData | null;
};

export type ContentResponseAiSuggestions = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: ContentAiSuggestionsData;
};

export type ContentAiPromptTemplate = {
  code: string;
  name: string;
  description?: string | null;
  defaultPromptByMode: Record<string, string>;
  enabled: boolean;
  sortOrder: number;
};

export type ContentAiPromptTemplatesData = {
  templates: ContentAiPromptTemplate[];
};

export type ContentResponseAiPromptTemplates = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
  data: ContentAiPromptTemplatesData;
};

export type UploadSessionId = string;
export type JobId = string;
export type RecordId = string;
