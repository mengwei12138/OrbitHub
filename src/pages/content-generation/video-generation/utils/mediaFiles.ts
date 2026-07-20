import type { UploadedMediaFile } from '../types/media';
import { toAbsoluteMediaUrl } from './media';

/** 已完成素材的可访问预览路径（相对或绝对） */
export function resolveMediaPreviewPath(
  file: UploadedMediaFile,
): string | undefined {
  if (file.previewUrl) return file.previewUrl;
  if (file.url) return file.url;
  if (file.mediaAssetId) {
    return `/api/v1/media/${file.mediaAssetId}/preview`;
  }
  return undefined;
}

export function hasUploadingMedia(files: UploadedMediaFile[]): boolean {
  return files.some((f) => f.status === 'uploading');
}

export interface MediaStatusBreakdown {
  done: number;
  uploading: number;
  error: number;
  total: number;
}

/** 按状态拆分文件计数，用于「N 张（X 成功 / Y 上传中 / Z 失败）」类提示 */
export function getMediaStatusBreakdown(
  files: UploadedMediaFile[],
): MediaStatusBreakdown {
  let done = 0;
  let uploading = 0;
  let error = 0;
  for (const f of files) {
    if (f.status === 'done') done++;
    else if (f.status === 'uploading') uploading++;
    else if (f.status === 'error') error++;
  }
  return { done, uploading, error, total: files.length };
}

/** 把状态分布拼成提示词后缀，如「3 成功 · 1 上传中 · 1 失败」；全部成功时返回空串 */
export function formatMediaStatusSuffix(
  breakdown: MediaStatusBreakdown,
): string {
  if (breakdown.total === 0) return '';
  if (breakdown.uploading === 0 && breakdown.error === 0) return '';
  const parts: string[] = [];
  if (breakdown.done > 0) parts.push(`${breakdown.done} 成功`);
  if (breakdown.uploading > 0) parts.push(`${breakdown.uploading} 上传中`);
  if (breakdown.error > 0) parts.push(`${breakdown.error} 失败`);
  return parts.join(' · ');
}

export function hasDoneMedia(files: UploadedMediaFile[]): boolean {
  return files.some((f) => f.status === 'done' && !!resolveMediaPreviewPath(f));
}

export function collectDonePreviewUrls(files: UploadedMediaFile[]): string[] {
  return files
    .filter((f) => f.status === 'done')
    .map((f) => resolveMediaPreviewPath(f))
    .filter((url): url is string => !!url)
    .map((url) => toAbsoluteMediaUrl(url));
}

/**
 * 收集已完成上传素材的外部平台 fileId（由 upload-session complete 阶段后端同步上传到
 * /api/user/upload/coze 拿到，写在 `UploadedMediaFile.cozeFileId` 上）。
 * 仅 done 状态且 cozeFileId 非空的素材被收录。
 */
export function collectDoneCozeFileIds(files: UploadedMediaFile[]): string[] {
  return files
    .filter((f) => f.status === 'done')
    .map((f) => f.cozeFileId)
    .filter((id): id is string => !!id);
}

/** 生成前素材校验提示；通过时返回 null */
export function getMaterialBlockReason(
  images: UploadedMediaFile[],
  videos: UploadedMediaFile[],
  isTrialMode: boolean,
): string | null {
  if (hasUploadingMedia(images) || hasUploadingMedia(videos)) {
    return '素材仍在上传中，请稍候再试';
  }
  const hasImages = hasDoneMedia(images);
  const hasVideos = hasDoneMedia(videos);
  const hasMaterial = isTrialMode ? hasImages : hasImages || hasVideos;
  if (!hasMaterial) {
    const hasAny =
      images.length > 0 ||
      videos.length > 0 ||
      hasUploadingMedia(images) ||
      hasUploadingMedia(videos);
    if (hasAny) {
      return '素材尚未上传完成，请等待上传结束后再试';
    }
    return isTrialMode ? '请先上传图片素材' : '请先上传图片或视频素材';
  }
  return null;
}
