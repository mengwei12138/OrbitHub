import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';

export type { RcFile };

export type ChunkProgress = {
  index: number;
  percent: number;
  status: 'pending' | 'uploading' | 'done' | 'error' | 'cancelled';
  retries: number;
  serverPartEtag?: string;
};

export type UploadProgress = {
  percent: number;
  uploadedChunks: number;
  totalChunks: number;
  chunks: ChunkProgress[];
};

export type UploadError = {
  message: string;
  chunkIndex?: number;
  retries?: number;
  error: Error;
};

export type CancelInfo = {
  file: File;
  fileId: string;
  uploadSessionId: string;
  uploadedChunks: number[];
};

export type UploadSessionCreatedData = {
  uploadSessionId: string;
  partSizeBytes: string;
  totalParts: number;
  expiresAt: string;
  maxConcurrentParts?: number;
};

export type UploadPartAckData = {
  partNumber: number;
  receivedSizeBytes: string;
  serverPartEtag: string;
};

export type UploadSessionStatusData = {
  uploadSessionId: string;
  partSizeBytes: string;
  totalParts: number;
  fileSizeBytes: string;
  missingPartNumbers: number[];
  expiresAt: string;
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
  /**
   * 外部平台文件 ID。仅 `purpose=CONTENT_GEN_*` 且后端 complete 阶段同步上传成功时非空。
   * 供 AI 润色 / 视频生成提交时回传给后端。
   */
  cozeFileId?: string | null;
};

export type CompleteUploadPartRef = {
  partNumber: number;
  sha256?: string;
  serverPartEtag?: string;
};

export type UploadController = {
  createSession: (file: File) => Promise<UploadSessionCreatedData>;
  uploadPart: (
    uploadSessionId: string,
    partNumber: number,
    blob: Blob,
    sha256?: string,
  ) => Promise<UploadPartAckData>;
  getSessionStatus: (
    uploadSessionId: string,
  ) => Promise<UploadSessionStatusData>;
  cancelSession: (uploadSessionId: string) => Promise<void>;
  completeSession: (
    uploadSessionId: string,
    parts: CompleteUploadPartRef[],
  ) => Promise<UploadCompleteData>;
};

export type ChunkConfig = {
  maxRetries?: number;
};

export type ResumeConfig = {
  enabled?: boolean;
  storage?: 'indexedDB';
};

export type CustomMediaUploadProps = Pick<
  UploadProps,
  | 'accept'
  | 'beforeUpload'
  | 'children'
  | 'className'
  | 'disabled'
  | 'fileList'
  | 'listType'
  | 'maxCount'
  | 'multiple'
  | 'name'
  | 'showUploadList'
  | 'onChange'
> & {
  uploadController: UploadController;
  chunk?: ChunkConfig;
  resume?: ResumeConfig;
  dragger?: boolean;
  /** 并行上传上限，超出部分排队；不设则不限制 */
  maxConcurrentUploads?: number;
  /** 多实例共享同一上传队列（如页面内多个 Upload 按钮） */
  uploadSlot?: {
    acquire: () => Promise<void>;
    release: () => void;
  };
  onProgress?: (progress: UploadProgress, file: RcFile) => void;
  onChunkSuccess?: (partNumber: number, result: UploadPartAckData) => void;
  onComplete?: (result: UploadCompleteData, file: RcFile) => void;
  onError?: (error: UploadError, file: RcFile) => void;
  onCancel?: (info: CancelInfo) => void;
  /** 文件大小限制（MB），默认不限制 */
  maxFileSize?: number;
  /** 文件类型不匹配时的回调，默认使用 message.error 提示 */
  onFileTypeError?: (file: RcFile) => void;
  /** 文件大小超出限制时的回调，默认使用 message.error 提示 */
  onFileSizeError?: (file: RcFile) => void;
};

export type CustomMediaUploadRef = {
  nativeElement: HTMLDivElement | null;
  fileList: RcFile[];
  upload: () => void;
  onBatchStart: (files: RcFile[]) => void;
  onSuccess: (response: UploadCompleteData, file: RcFile) => void;
  onProgress: (event: { percent: number }, file: RcFile) => void;
  onError: (error: Error, response: unknown, file: RcFile) => void;
  onAbort: (file: File) => void;
  onAbortAll: () => void;
};
