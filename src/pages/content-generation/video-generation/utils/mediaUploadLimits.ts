import type { UploadedMediaFile } from '../types/media';

export function canAcceptMoreUpload(
  prev: UploadedMediaFile[],
  uid: string,
  maxCount: number,
): boolean {
  if (prev.some((f) => f.uid === uid)) return true;
  return prev.length < maxCount;
}

export function trimToMaxCount(
  files: UploadedMediaFile[],
  maxCount: number,
): UploadedMediaFile[] {
  return files.length <= maxCount ? files : files.slice(0, maxCount);
}
