/**
 * 媒体用途。
 *
 * - `DRAFT_VIDEO / DRAFT_IMAGE`: 内容发布素材；upload-complete 不会触发外部平台同步上传
 * - `ATTACHMENT`: 通用附件
 * - `CONTENT_GEN_IMAGE / CONTENT_GEN_VIDEO`: 内容生成（视频生成）专用；
 *    upload-complete 时后端会同步上传到外部平台 /api/user/upload/coze 并在响应里携带 cozeFileId
 */
export type MediaPurposeCode =
  | 'DRAFT_VIDEO'
  | 'DRAFT_IMAGE'
  | 'ATTACHMENT'
  | 'CONTENT_GEN_IMAGE'
  | 'CONTENT_GEN_VIDEO';

export const MEDIA_PURPOSE_CODE = {
  DRAFT_VIDEO: 'DRAFT_VIDEO',
  DRAFT_IMAGE: 'DRAFT_IMAGE',
  ATTACHMENT: 'ATTACHMENT',
  CONTENT_GEN_IMAGE: 'CONTENT_GEN_IMAGE',
  CONTENT_GEN_VIDEO: 'CONTENT_GEN_VIDEO',
} as const satisfies Record<string, MediaPurposeCode>;

/** 上传会话状态 */
export type UploadSessionStatus =
  | 'CREATED'
  | 'UPLOADING'
  | 'COMPLETED'
  | 'ABORTED'
  | 'EXPIRED';

/** 错误信息 */
export type ErrorInfo = {
  field: string;
  message: string;
};

/** 创建上传会话请求 */
export type CreateUploadSessionRequest = {
  fileName: string;
  fileSizeBytes: string;
  mimeType?: string;
  purpose: MediaPurposeCode;
  fileSha256?: string;
};

/** 分片引用 */
export type CompleteUploadPartRef = {
  partNumber: number;
  sha256?: string;
  serverPartEtag?: string;
};

/** 完成上传请求 */
export type CompleteUploadSessionRequest = {
  parts: CompleteUploadPartRef[];
};

/** 创建会话响应数据 */
export type UploadSessionCreatedData = {
  uploadSessionId: string;
  partSizeBytes: string;
  totalParts: number;
  expiresAt: string;
  maxConcurrentParts?: number;
};

/** 已上传分片信息 */
export type UploadedPartInfo = {
  partNumber: number;
  sizeBytes: string;
  sha256?: string | null;
  uploadedAt: string;
};

/** 会话状态响应数据 */
export type UploadSessionStatusData = {
  uploadSessionId: string;
  status: UploadSessionStatus;
  partSizeBytes: string;
  totalParts: number;
  fileSizeBytes: string;
  uploadedParts: UploadedPartInfo[];
  missingPartNumbers: number[];
  expiresAt: string;
  mediaAssetId?: string | null;
};

/** 分片确认响应数据 */
export type UploadPartAckData = {
  partNumber: number;
  receivedSizeBytes: string;
  serverPartEtag: string;
};

/** 上传完成响应数据 */
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
  /**
   * 外部平台文件 ID。仅 `purpose=CONTENT_GEN_IMAGE / CONTENT_GEN_VIDEO`
   * 且后端 complete 阶段同步上传到 /api/user/upload/coze 成功时非空。
   * 前端需在 AI 润色 / 视频生成提交时回传。
   */
  cozeFileId?: string | null;
};

/** 统一响应基础 */
type ResponseBase = {
  code: number;
  success: boolean;
  message: string;
  errors?: ErrorInfo[];
  detail?: string;
  ts: string;
};

/** 统一响应 - 无数据 */
export type MediaResponseVoid = ResponseBase & {
  data: null;
};

/** 统一响应 - 创建会话 */
export type MediaResponseUploadSessionCreated = ResponseBase & {
  data: UploadSessionCreatedData;
};

/** 统一响应 - 会话状态 */
export type MediaResponseUploadSessionStatus = ResponseBase & {
  data: UploadSessionStatusData;
};

/** 统一响应 - 分片确认 */
export type MediaResponseUploadPartAck = ResponseBase & {
  data: UploadPartAckData;
};

/** 统一响应 - 上传完成 */
export type MediaResponseUploadComplete = ResponseBase & {
  data: UploadCompleteData;
};

/** 上传会话 ID 类型 */
export type UploadSessionId = string;
