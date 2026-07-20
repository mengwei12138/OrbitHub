import type React from 'react';
import type { UploadController } from '@/components/CustomMediaUpload';
import { UploadZoneImage } from '../../../video-generation/components/UploadZoneImage';
import type { UploadedMediaFile } from '../../../video-generation/types/media';
import cardStyles from '../../shared/card.module.css';

export interface ReferenceImagesSectionProps {
  /** 由父组件 useMemo 创建并复用 (createMediaUploadController('CONTENT_GEN_IMAGE'))。 */
  uploadController: UploadController;
  referenceImages: UploadedMediaFile[];
  onReferenceImagesChange: (
    files:
      | UploadedMediaFile[]
      | ((prev: UploadedMediaFile[]) => UploadedMediaFile[]),
  ) => void;
}

export const ReferenceImagesSection: React.FC<ReferenceImagesSectionProps> = ({
  uploadController,
  referenceImages,
  onReferenceImagesChange,
}) => {
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTitleRow}>
        <div className={cardStyles.cardTitle}>参考图片</div>
        <span className={cardStyles.cardTitleOptional}>（可选）</span>
      </div>
      <UploadZoneImage
        uploadController={uploadController}
        value={referenceImages}
        onChange={onReferenceImagesChange}
        maxCount={1}
      />
    </div>
  );
};

export default ReferenceImagesSection;
