import type React from 'react';
import cardStyles from '../../shared/card.module.css';
import styles from './style.module.css';

export interface BaseInfoSectionProps {
  referenceLink: string;
  onReferenceLinkChange: (value: string) => void;
  productName: string;
  onProductNameChange: (value: string) => void;
}

export const BaseInfoSection: React.FC<BaseInfoSectionProps> = ({
  referenceLink,
  onReferenceLinkChange,
  productName,
  onProductNameChange,
}) => {
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTitle}>基础信息</div>
      <div className={styles.formItem}>
        <div className={styles.formLabel}>参考链接</div>
        <input
          type="text"
          className={styles.input}
          placeholder="粘贴参考链接"
          value={referenceLink}
          onChange={(e) => onReferenceLinkChange(e.target.value)}
        />
      </div>
      <div className={styles.formItem}>
        <div className={`${styles.formLabel} ${styles.formLabelRequired}`}>
          产品 / 服务名称
        </div>
        <input
          type="text"
          className={styles.input}
          placeholder="例如：智能保温杯"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default BaseInfoSection;
