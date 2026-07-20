import type React from 'react';
import cardStyles from '../../shared/card.module.css';
import type { AIGeneratedMarkPosition, ImageCount } from '../../types';
import styles from './style.module.css';

const IMAGE_COUNT_OPTIONS: { value: ImageCount; label: string }[] = [
  { value: 0, label: '不生成' },
  { value: 1, label: '1 张' },
];

export interface ImageConfigSectionProps {
  imageCount: ImageCount;
  aiGeneratedMarkPosition: AIGeneratedMarkPosition;
  onImageCountChange: (value: ImageCount) => void;
  onAIGeneratedMarkPositionChange: (value: AIGeneratedMarkPosition) => void;
}

export const ImageConfigSection: React.FC<ImageConfigSectionProps> = ({
  imageCount,
  aiGeneratedMarkPosition,
  onImageCountChange,
  onAIGeneratedMarkPositionChange,
}) => {
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTitle}>配图设置</div>
      <div className={styles.formItem}>
        <div className={styles.formLabel}>生成配图数量</div>
        <div className={styles.radioGroup}>
          {IMAGE_COUNT_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.radioItem} ${imageCount === item.value ? styles.radioItemActive : ''}`}
              onClick={() => onImageCountChange(item.value)}
            >
              <span className={styles.radioCircle} aria-hidden />
              {item.label}
            </button>
          ))}
        </div>
        <p className={styles.hint}>
          配图将根据产品信息和文案风格自动生成，尺寸 1080×1080 像素
        </p>
        {imageCount === 1 && (
          <div className={styles.markPositionRow}>
            <label
              className={styles.markPositionLabel}
              htmlFor="image-ai-mark-position"
            >
              AI生成标记位置
            </label>
            <select
              id="image-ai-mark-position"
              className={styles.markPositionSelect}
              value={aiGeneratedMarkPosition}
              onChange={(event) =>
                onAIGeneratedMarkPositionChange(
                  event.target.value as AIGeneratedMarkPosition,
                )
              }
            >
              <option value="bottom-left">左下</option>
              <option value="bottom-center">中下</option>
              <option value="bottom-right">右下</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageConfigSection;
