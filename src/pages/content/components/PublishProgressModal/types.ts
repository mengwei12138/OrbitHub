import type {
  PublishErrorCode,
  PublishJobProgressData,
  PublishRecordProgressData,
  PublishRecordStage,
  VerifyType,
} from '@/services/content/types';

export type UIStatus = 'success' | 'publishing' | 'queued' | 'failed';

export interface PublishRecord {
  id: string;
  accountName: string;
  status: UIStatus;
  detail: string;
  extensionStatus?: string;
  extensionDetail?: string;
  retryable?: boolean | null;
  errorCode?: PublishErrorCode | null;
  // content-publish-verify-flow
  verifyType?: VerifyType | null;
  qrCodeSrc?: string | null;
  verifyErrorCode?: string | null;
}

export interface PublishProgressModalProps {
  open: boolean;
  jobId: string | null;
  demoRecords?: PublishRecord[];
  onClose: () => void;
  onBackgroundRun: () => void;
  /** 检测到二次验证态且弹窗已关闭时回调，用于自动重新打开弹窗 */
  onVerifyRequired?: () => void;
  onComplete?: (data: PublishJobProgressData) => void;
}

export function mapStageToUIStatus(stage: PublishRecordStage): UIStatus {
  switch (stage) {
    case 'PUBLISHED':
    case 'UNDER_REVIEW':
      return 'success';
    case 'PENDING':
    case 'MEDIA_RESOLVING':
    case 'UPLOADING':
    case 'PLATFORM_PROCESSING':
      return 'publishing';
    case 'FAILED':
      return 'failed';
    case 'CANCELLED':
      return 'failed';
    default:
      return 'publishing';
  }
}

export function buildPublishRecord(
  data: PublishRecordProgressData,
  accountNickname?: string,
): PublishRecord {
  const status = mapStageToUIStatus(data.stage);
  let detail = data.message ?? '';

  if (data.errorCode) {
    detail = formatErrorMessage(data.errorCode, detail);
  }

  if (
    status === 'publishing' &&
    data.retryable &&
    data.retryAttempt !== undefined &&
    data.nextRetryAt !== null
  ) {
    detail = `正在重试 (${data.retryAttempt}/${data.maxRetries ?? 3})`;
  }

  if (data.verifyType && data.message) {
    detail = data.message;
  }

  return {
    id: data.recordId,
    accountName:
      accountNickname ?? data.accountNickname ?? data.accountId ?? '未知账号',
    status,
    detail,
    retryable: data.retryable,
    errorCode: data.errorCode,
    verifyType: data.verifyType,
    qrCodeSrc: data.qrCodeSrc,
    verifyErrorCode: data.verifyErrorCode,
  };
}

function formatErrorMessage(
  errorCode: PublishErrorCode,
  message?: string,
): string {
  const errorMessages: Partial<Record<PublishErrorCode, string>> = {
    ACCOUNT_OFFLINE: '账号已离线，请前往账号管理检查',
    ACCOUNT_TOKEN_EXPIRED: '账号已失效，请前往账号管理重新扫码',
    DUPLICATE_CONTENT: '检测到重复内容',
    VIDEO_RATIO_INVALID: '视频比例不符合要求',
    VIDEO_DURATION_INVALID: '视频时长不符合要求',
    VIDEO_SIZE_EXCEEDED: '视频大小超限',
    IMAGE_COUNT_EXCEEDED: '图片数量超限',
    IMAGE_RATIO_INVALID: '图片比例不符合要求',
    TITLE_TOO_LONG: '标题字数超限',
    CAPTION_TOO_LONG: '文案字数超限',
    TOPIC_COUNT_EXCEEDED: '话题数量超限',
    PLATFORM_REJECTED: '平台拒绝发布',
    NETWORK_TIMEOUT: '网络超时，已重试3次失败',
    MEDIA_NOT_FOUND: '素材不存在',
    MEDIA_METADATA_UNAVAILABLE: '素材元数据不可用',
    ORIGINAL_DELETE_FAILED: '删除原内容失败',
    UNKNOWN: message || '发布失败',
  };

  return errorMessages[errorCode] || message || '发布失败';
}
