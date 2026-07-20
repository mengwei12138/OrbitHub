import type React from 'react';
import cardStyles from '../../shared/card.module.css';
import {
  CUSTOM_WORD_LIMIT_MAX,
  CUSTOM_WORD_LIMIT_MIN,
  type ToneStyle,
  type WordLimit,
} from '../../types';
import styles from './style.module.css';

const TONE_STYLES: { value: ToneStyle; label: string }[] = [
  { value: '正式', label: '正式' },
  { value: '幽默', label: '幽默' },
  { value: '亲切', label: '亲切' },
  { value: '紧迫', label: '紧迫' },
  { value: '文艺', label: '文艺' },
  { value: '专业', label: '专业' },
  { value: '种草', label: '种草' },
  { value: '促销', label: '促销' },
  { value: '自定义风格', label: '自定义风格' },
];

const WORD_LIMITS: { value: WordLimit; label: string }[] = [
  { value: 50, label: '50 字以内' },
  { value: 100, label: '100 字以内' },
  { value: 150, label: '150-200 字' },
  { value: 300, label: '300 字以内' },
  { value: 0, label: '不限' },
  { value: -1, label: '自定义' },
];

export interface StyleConfigSectionProps {
  toneStyle: ToneStyle;
  customToneStyle: string;
  wordLimit: WordLimit;
  customWordLimit: string;
  prohibitedWords: string;
  onToneStyleChange: (value: ToneStyle) => void;
  onCustomToneStyleChange: (value: string) => void;
  onWordLimitChange: (value: WordLimit) => void;
  onCustomWordLimitChange: (value: string) => void;
  onProhibitedWordsChange: (value: string) => void;
}

export const StyleConfigSection: React.FC<StyleConfigSectionProps> = ({
  toneStyle,
  customToneStyle,
  wordLimit,
  customWordLimit,
  prohibitedWords,
  onToneStyleChange,
  onCustomToneStyleChange,
  onWordLimitChange,
  onCustomWordLimitChange,
  onProhibitedWordsChange,
}) => {
  const showCustomToneInput = toneStyle === '自定义风格';
  const showCustomWordLimitInput = wordLimit === -1;

  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTitle}>内容与风格</div>
      <div className={styles.formItem}>
        <div className={styles.formLabel}>语气 / 风格</div>
        <div className={styles.segmentChips}>
          {TONE_STYLES.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.segmentChip} ${toneStyle === item.value ? styles.segmentChipActive : ''}`}
              onClick={() => onToneStyleChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {showCustomToneInput && (
          <input
            type="text"
            className={styles.customInput}
            placeholder="请输入自定义风格"
            value={customToneStyle}
            onChange={(e) => onCustomToneStyleChange(e.target.value)}
          />
        )}
      </div>
      <div className={styles.formItem}>
        <div className={styles.formLabel}>字数限制</div>
        <div className={styles.radioGroup}>
          {WORD_LIMITS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.radioItem} ${wordLimit === item.value ? styles.radioItemActive : ''}`}
              onClick={() => onWordLimitChange(item.value)}
            >
              <span className={styles.radioCircle} aria-hidden />
              {item.label}
            </button>
          ))}
        </div>
        {showCustomWordLimitInput && (
          <input
            type="number"
            className={styles.customInput}
            placeholder={`请输入 ${CUSTOM_WORD_LIMIT_MIN}–${CUSTOM_WORD_LIMIT_MAX} 之间的字数`}
            min={CUSTOM_WORD_LIMIT_MIN}
            max={CUSTOM_WORD_LIMIT_MAX}
            step={1}
            value={customWordLimit}
            onChange={(e) => onCustomWordLimitChange(e.target.value)}
          />
        )}
      </div>
      <div className={styles.formItem}>
        <div className={styles.formLabelRow}>
          <span>违禁词</span>
          <span className={styles.optional}>（可选）</span>
        </div>
        <textarea
          className={styles.textarea}
          placeholder="填写禁止使用的词语或表达方式，多个用逗号分隔"
          value={prohibitedWords}
          onChange={(e) => onProhibitedWordsChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StyleConfigSection;
