import type { UploadFile } from 'antd/es/upload/interface';

/** 视频生成页已选/上传中的素材项 */
export interface UploadedMediaFile extends UploadFile {
  previewUrl?: string;
  mediaAssetId?: string;
  mimeType?: string;
  probeError?: string | null;
  /**
   * 外部平台文件 ID。仅在 purpose 为 CONTENT_GEN_* 且 upload-complete 阶段
   * 后端同步上传到 /api/user/upload/coze 成功时非空，供 AI 润色 / 视频生成回传。
   */
  cozeFileId?: string | null;
}
