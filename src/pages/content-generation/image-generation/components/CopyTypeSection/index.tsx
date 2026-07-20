import type React from 'react';
import cardStyles from '../../shared/card.module.css';
import {
  type CopyType,
  CUSTOM_COPY_TYPE_MAX_LENGTH,
  CUSTOM_USE_CASE_MAX_LENGTH,
  type UseCase,
} from '../../types';
import styles from './style.module.css';

const COPY_TYPES: { value: CopyType; label: string }[] = [
  { value: '宣传文案', label: '宣传文案' },
  { value: '小红书笔记', label: '小红书笔记' },
  { value: '产品详情页', label: '产品详情页' },
  { value: '邮件营销', label: '邮件营销' },
  { value: '短视频脚本', label: '短视频脚本' },
  { value: '自定义类型', label: '自定义类型' },
];

const USE_CASES: { value: Exclude<UseCase, ''>; label: string }[] = [
  { value: '小红书 / 抖音推文', label: '小红书 / 抖音推文' },
  { value: '电商产品详情图', label: '电商产品详情图' },
  { value: '电商产品主图', label: '电商产品主图' },
  { value: '其他场景', label: '其他场景' },
];

export interface CopyTypeSectionProps {
  copyType: CopyType;
  useCase: UseCase;
  customCopyType: string;
  customUseCase: string;
  onCopyTypeChange: (value: CopyType) => void;
  onCustomCopyTypeChange: (value: string) => void;
  onUseCaseChange: (value: UseCase) => void;
  onCustomUseCaseChange: (value: string) => void;
}

export const CopyTypeSection: React.FC<CopyTypeSectionProps> = ({
  copyType,
  useCase,
  customCopyType,
  customUseCase,
  onCopyTypeChange,
  onCustomCopyTypeChange,
  onUseCaseChange,
  onCustomUseCaseChange,
}) => {
  const showCustomInput = copyType === '自定义类型';
  const showCustomUseCaseInput = useCase === '其他场景';

  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTitle}>文案类型与使用场景</div>
      <div className={`${styles.section} ${styles.sectionZone}`}>
        <div className={styles.sectionLabel}>文案类型</div>
        <div className={styles.segmentChips}>
          {COPY_TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.segmentChip} ${copyType === item.value ? styles.segmentChipActive : ''}`}
              onClick={() => onCopyTypeChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {showCustomInput && (
          <input
            type="text"
            className={styles.customInput}
            placeholder="请输入自定义类型"
            value={customCopyType}
            maxLength={CUSTOM_COPY_TYPE_MAX_LENGTH}
            onChange={(e) => onCustomCopyTypeChange(e.target.value)}
          />
        )}
      </div>
      <div className={`${styles.section} ${styles.sectionZone}`}>
        <div className={styles.sectionLabelRow}>
          <span className={styles.requiredMark}>*</span>
          <span className={styles.sectionLabel}>使用场景</span>
          <span className={styles.requiredHint}>（必选）</span>
        </div>
        <div className={styles.segmentChips}>
          {USE_CASES.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.segmentChip} ${useCase === item.value ? styles.segmentChipActive : ''}`}
              onClick={() => onUseCaseChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {showCustomUseCaseInput && (
          <input
            type="text"
            className={styles.customInput}
            placeholder="请输入自定义使用场景"
            value={customUseCase}
            maxLength={CUSTOM_USE_CASE_MAX_LENGTH}
            onChange={(e) => onCustomUseCaseChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export default CopyTypeSection;
