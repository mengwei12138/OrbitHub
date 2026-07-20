import type { UploadController } from '@/components/CustomMediaUpload';
import type { MediaPurposeCode } from '@/services/media-upload';
import {
  cancelUploadSession,
  completeUploadSession,
  createUploadSession,
  getUploadSession,
  uploadPart,
} from '@/services/media-upload';

export function createMediaUploadController(
  purpose: MediaPurposeCode,
): UploadController {
  return {
    createSession: async (file: File) =>
      createUploadSession({
        fileName: file.name,
        fileSizeBytes: String(file.size),
        mimeType: file.type,
        purpose,
      }),
    uploadPart: async (uploadSessionId, partNumber, blob, sha256) =>
      uploadPart(uploadSessionId, partNumber, blob, sha256),
    getSessionStatus: async (uploadSessionId) =>
      getUploadSession(uploadSessionId),
    cancelSession: async (uploadSessionId) => {
      await cancelUploadSession(uploadSessionId);
    },
    completeSession: async (uploadSessionId, parts) =>
      completeUploadSession(uploadSessionId, { parts }),
  };
}

/** 将媒体预览相对路径转为外部平台可访问的绝对 URL */
export function toAbsoluteMediaUrl(previewUrl: string): string {
  if (/^https?:\/\//iu.test(previewUrl)) {
    return previewUrl;
  }
  return new URL(previewUrl, window.location.origin).href;
}
