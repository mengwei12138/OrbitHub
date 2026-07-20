import type React from 'react';
import cardStyles from '../../shared/card.module.css';
import styles from './style.module.css';

export interface ContentConfigSectionProps {
  coreSellingPoint: string;
  targetAudience: string;
  onCoreSellingPointChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
}

export const ContentConfigSection: React.FC<ContentConfigSectionProps> = ({
  coreSellingPoint,
  targetAudience,
  onCoreSellingPointChange,
  onTargetAudienceChange,
}) => {
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTitle}>内容配置</div>
      <div className={styles.formItem}>
        <div className={`${styles.formLabel} ${styles.formLabelRequired}`}>
          核心卖点
        </div>
        <input
          type="text"
          className={styles.input}
          placeholder="例如：长效保温 2 小时、智能温度显示"
          value={coreSellingPoint}
          onChange={(e) => onCoreSellingPointChange(e.target.value)}
        />
      </div>
      <div className={styles.formItem}>
        <div className={`${styles.formLabel} ${styles.formLabelRequired}`}>
          目标受众
        </div>
        <input
          type="text"
          className={styles.input}
          placeholder="例如：25-35 岁上班族，关注健康"
          value={targetAudience}
          onChange={(e) => onTargetAudienceChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ContentConfigSection;
