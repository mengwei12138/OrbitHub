import { Card } from 'antd';
import type React from 'react';
import { PLACEHOLDER } from '@/constants';
import type { PublishRecordDetailData } from '@/services/content/types';

import StatusBadge from '../StatusBadge';
import styles from './style.module.css';

type OriginalInfoCardProps = {
  data?: PublishRecordDetailData;
};

const OriginalInfoCard: React.FC<OriginalInfoCardProps> = ({ data }) => {
  return (
    <Card title="原内容信息" className={styles.card}>
      <div className={styles.infoGrid}>
        <div className={styles.infoRow}>
          <span className={styles.label}>标题：</span>
          <span className={styles.value}>{data?.title ?? PLACEHOLDER}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>文案：</span>
          <span className={styles.value}>{data?.caption ?? PLACEHOLDER}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>标签：</span>
          <span className={styles.value}>
            {data?.topicTags?.length ? data.topicTags.join('  ') : PLACEHOLDER}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>原发布状态：</span>
          <StatusBadge status={data?.status ?? PLACEHOLDER} />
        </div>
      </div>
    </Card>
  );
};

export default OriginalInfoCard;
