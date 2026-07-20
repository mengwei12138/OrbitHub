import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { UploadController } from '@/components/CustomMediaUpload';

export interface VideoUploadFile extends UploadFile {
  url?: string;
  thumbUrl?: string;
  localUrl?: string;
  localThumbUrl?: string;
  /** 本地/后端时长，单位秒（方便展示；毫秒转换由装配方处理）。 */
  duration?: number;
  /** V3 起由后端 UploadCompleteData 返回的素材元数据。 */
  mediaAssetId?: string;
  mimeType?: string;
  widthPx?: number | null;
  heightPx?: number | null;
  ratio?: string | null;
  probeError?: string | null;
}

export interface VideoUploadProps {
  value?: VideoUploadFile[];
  onChange?: (files: VideoUploadFile[]) => void;
  accept?: string;
  maxFileSize?: number;
  uploadController: UploadController;
  /** 最小视频时长（秒） */
  minDuration?: number;
  /** 最大视频时长（秒） */
  maxDuration?: number;
  /** 视频时长超出限制时的回调 */
  onDurationError?: (
    file: RcFile,
    duration: number,
    constraint: { min?: number; max?: number },
  ) => void;
  /** 接受的视频比例，如 ['9:16', '16:9'] */
  acceptedRatios?: string[];
  /** 视频比例不符合要求时的回调 */
  onRatioError?: (
    file: RcFile,
    actualRatio: string,
    acceptedRatios: string[],
  ) => void;
}
