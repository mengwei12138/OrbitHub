import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadController } from '@/components/CustomMediaUpload';

export interface ImageUploadFile extends UploadFile {
  /** V3 起由后端 UploadCompleteData 返回的素材元数据。 */
  mediaAssetId?: string;
  mimeType?: string;
  widthPx?: number | null;
  heightPx?: number | null;
  ratio?: string | null;
  probeError?: string | null;
}

export interface ImageUploadProps {
  value?: ImageUploadFile[];
  onChange?: (
    files:
      | ImageUploadFile[]
      | ((prevFiles: ImageUploadFile[]) => ImageUploadFile[]),
  ) => void;
  maxCount?: number;
  maxFileSize?: number;
  accept?: string;
  multiple?: boolean;
  uploadController: UploadController;
}
