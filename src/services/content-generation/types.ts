import type { PaginationResponse } from '@/api/types';

export type WorkTypeCode = 'video' | 'image';

export type WorkStatusCode = 'processing' | 'completed' | 'failed';

export type WorkSummaryDto = {
  id: string;
  type: WorkTypeCode;
  title: string;
  createdAt: string;
  status?: WorkStatusCode;
  paramsSummary?: string;
  credits?: number;
  remainingHours?: number;
  thumbnailUrl?: string;
  /**
   * 视频 mp4 直链——24h 外链。
   * @deprecated 「去发布」入口已切到 {@link videoMediaAssetId}（content-generation-publish-bridge）。
   * 当前仍保留：列表/详情下载按钮使用；不再用于发布预填。
   */
  videoUrl?: string;
  /**
   * 图文产物图片直链——24h 外链。
   * @deprecated 同 {@link videoUrl}：已切到 {@link imageMediaAssetIds}。
   */
  imageUrl?: string;
  /** 生成完成后的正文：图文为 AI 文案，视频为创意描述 prompt */
  content?: string;
  expiringSoon?: boolean;
  failureReason?: string;
  /**
   * 提交时原始 SubmitVideoGenerationRequest / SubmitImageGenerationRequest JSON 字符串。
   * 「重新生成」回填表单使用。后端无原始入参时为 undefined。
   */
  paramsRaw?: string;
  /**
   * 图文任务的「配图数量」（提交时 imageCount）：`0`=纯文案，`1`=含 1 张配图。
   * 视频任务恒为 `undefined`。「去发布」决策：`0` 时不要求 mediaAssetIds，允许纯文案发布；
   * `>=1` 时必须有 mediaAssetIds，否则提示「素材尚未就绪」。
   */
  imageCount?: number;
  /**
   * 已 ingest 的视频本地 mediaAssetId（视频任务通常只产一个）。
   * 由 OpenSpec change `content-generation-publish-bridge` 引入：
   * 「我的作品 / 作品详情 → 去发布」入口拿这个 id 直接走发布链路。
   * `undefined` 表示 ingest 还没跑到/失败，前端应该禁掉「去发布」按钮 + 提示用户稍后重试。
   *
   * 类型为 string：后端 Jackson 全局把 Long 序列化成字符串（防 JS Number 失精度），
   * 与项目内 `id`、`PublishSubmitRequest.imageMediaAssetIds` 等字段一致。
   */
  videoMediaAssetId?: string;
  /** 已 ingest 的图文配图 mediaAssetId 列表（已过滤 null 失败位）。`undefined` 同 {@link videoMediaAssetId}。 */
  imageMediaAssetIds?: string[];
  /** 与 mediaAssetIds 配套的本系统预览路径，可直接用作 `<img src>` / `<video src>`，免 24h 过期问题。 */
  previewUrls?: string[];
  /**
   * 作品归属用户 id（generation_log.user_id）。
   * 由 OpenSpec change `content-generation-my-works-data-isolation` 引入。
   * USER 视角下恒等当前用户；TENANT 视角下可能是同租户其他普通管理员。
   * 后端 Long 经 Jackson 字符串化；undefined 表示历史行 / 后端旧版本。
   */
  ownerUserId?: string;
  /**
   * 作品归属用户的展示名。后端从 UserDisplayNamePort 解析；
   * 用户已删除时回退为 `—`。前端按 isTenantAdmin 决定是否展示。
   */
  ownerName?: string;
};

export type WorkDetailDto = WorkSummaryDto & {
  content?: string;
  tags?: string[];
  videoUrl?: string;
  imageUrls?: string[];
};

export type WorksListQuery = {
  page?: number;
  pageSize?: number;
  type?: 'all' | WorkTypeCode;
};

export type PageDataWorks = PaginationResponse<WorkSummaryDto>;

export type TrialQuotaDto = {
  remaining: number;
  total: number;
};

export type CreditsBalanceDto = {
  totalPoints: number;
};

/**
 * 视频 / 文案排队状态：进入生成页时调用对应 queue-count 接口拿到，
 * canCreate=false 时把「生成视频」/「生成文案」按钮置灰。
 * 后端字段未来扩展（queueCount / queueLimit 等）时新增可选字段即可，无需破坏现有调用。
 */
export type QueueCountDto = {
  canCreate: boolean;
};

export type CreditsLogItemDto = {
  id: string;
  createdAt: string;
  companyName?: string;
  accountName: string;
  contentType: 'video' | 'image' | 'other';
  quality: string;
  virtualHuman: string;
  credits: number;
  trial: boolean;
  contentTitle: string;
  afterPoints?: number;
};

export type CreditsLogQuery = {
  page?: number;
  pageSize?: number;
  /** 上游平台口径：VIDEO / COPYWRITING / RECHARGE / REFUND；不传或为空表示全部 */
  type?: string;
  /** 起始日期，格式 yyyy-MM-dd */
  startTime?: string;
  /** 结束日期，格式 yyyy-MM-dd */
  endTime?: string;
};

export type PageDataCreditsLog = PaginationResponse<CreditsLogItemDto>;

export type SubmitVideoGenerationRequest = {
  trial: boolean;
  /** 付费模式必填；试用模式由后端映射为外部 free 档位，可不传。 */
  quality?: 'standard' | 'premium';
  prompt?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  avatarId?: string;
  videoLength: number;
  videoAspectRatio?: string;
};

export type VideoGenerationTaskDto = {
  taskId: string;
  message?: string;
};

export type VideoTaskStatusDto = {
  status: string;
  progress: number;
  videoUrl?: string;
  videoUrls?: string[];
  message?: string;
  /** FAILED 时后端已翻译过的用户友好失败原因。 */
  errorMessage?: string;
  /**
   * COMPLETED 后已 ingest 为本地 MediaAsset 的 id 列表，与 {@link videoUrls} 索引对齐；
   * 某位为 null 表示该位 ingest 失败（具体 reason 见 ingestErrors，下一次轮询会自动重试）。
   * 由 OpenSpec change `content-generation-publish-bridge` 引入：
   * 「视频生成结果回填 → 去发布」入口直接拿这个 id 走发布流程，不再走 url-proxy。
   *
   * 类型为 string：后端 Long 经 Jackson 字符串化序列化，与 `WorkSummaryDto.videoMediaAssetId` 一致。
   */
  mediaAssetIds?: (string | null)[];
  /** 与 mediaAssetIds 索引对齐的预览 URL（/api/v1/media/{id}/preview）；失败位为 null。 */
  previewUrls?: (string | null)[];
  /** 仅含失败位的 {index, reason}；全部成功时为 null/空。 */
  ingestErrors?: { index: number; reason: string }[];
};

export type PromptRefineRequest = {
  prompt: string;
  /**
   * 外部平台文件 ID 列表（/api/user/upload/coze 返回的 data.id）。
   * 由前端从 `UploadedMediaFile.cozeFileId` 收集（仅 done 状态、cozeFileId 非空者）。
   */
  imageFileIds?: string[];
  videoFileIds?: string[];
  videoLength?: number;
  /** 档位：standard / premium，前端按 generationMode 派生。 */
  quality?: 'standard' | 'premium';
};

export type PromptRefineResult = {
  refinedText: string;
};

export type AvatarAssetDto = {
  assetId: string;
  imageUrl?: string;
  sortOrder?: number;
};

/**
 * 图文生成提交入参。后端 ({@code POST /api/v1/content-generation/images/tasks})
 * 透传给外部 shixi-open copywriting 接口；中文字面值字段直接落地，零映射层。
 */
export type SubmitImageGenerationRequest = {
  productServiceName: string;
  coreSellingPoints: string;
  targetAudience: string;
  productDesc?: string;
  usageScenario?: string;
  copyType?: string;
  toneStyle?: string;
  wordCountLimit?: string;
  structurePreference?: string;
  keywords?: string;
  forbiddenWords?: string;
  referenceLink?: string;
  /** 外部 cozeFileId 列表（由 upload-session complete 阶段后端写回）。 */
  fileIds?: string[];
  /** 0 = 不生成配图，1 = 生成 1 张配图。 */
  imageCount: 0 | 1;
};

export type ImageGenerationTaskDto = {
  taskId: string;
  message?: string;
};

export type ImageGenerationTaskStatusDto = {
  /** PENDING / PROCESSING / COMPLETED / FAILED */
  status: string;
  progress: number;
  message?: string;
  /** COMPLETED 时的整段文案文本，本期不做结构化拆解。 */
  content?: string;
  /** 本期固定为空字符串，预留给后续结构化升级。 */
  title?: string;
  /** 本期固定为空数组，预留给后续结构化升级。 */
  tags?: string[];
  /** COMPLETED 时的配图 URL 列表，24 小时内有效。 */
  images?: string[];
  /** FAILED 时的具体原因。 */
  errorMessage?: string;
  /**
   * COMPLETED 后已 ingest 为本地 MediaAsset 的 id 列表，与 {@link images} 索引对齐；
   * 某位为 null 表示该位 ingest 失败。由 OpenSpec change `content-generation-publish-bridge` 引入。
   *
   * 类型为 string：后端 Long 经 Jackson 字符串化序列化（防 JS Number 失精度）。
   */
  mediaAssetIds?: (string | null)[];
  /** 与 mediaAssetIds 索引对齐的预览 URL（/api/v1/media/{id}/preview）；失败位为 null。 */
  previewUrls?: (string | null)[];
  /** 仅含失败位的 {index, reason}；全部成功时为 null/空。 */
  ingestErrors?: { index: number; reason: string }[];
};
