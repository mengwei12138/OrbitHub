import { Card } from 'antd';
import type React from 'react';
import { PLACEHOLDER } from '@/constants';
import { CONTENT_MODE_CODE } from '@/services/content/types';
import styles from './style.module.css';
import type { ContentInfoCardProps } from './types';

const CONTENT_MODE_DISPLAY: Record<string, string> = {
  [CONTENT_MODE_CODE.VIDEO]: '视频',
  [CONTENT_MODE_CODE.IMAGE]: '图文',
};

const ContentInfoCard: React.FC<ContentInfoCardProps> = ({ data }) => {
  return (
    <Card title="内容信息" className={styles.card}>
      <div className={styles.infoGrid}>
        <div className={styles.infoRow}>
          <span className={styles.label}>标题：</span>
          <span className={styles.value}>
            {data?.title && data.title.trim().length > 0 ? data.title : '—'}
          </span>
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
        {data?.mentions && data.mentions.length > 0 && (
          <div className={styles.infoRow}>
            <span className={styles.label}>提及：</span>
            <span className={styles.value}>{data.mentions.join('  ')}</span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.label}>内容形式：</span>
          <span className={styles.value}>
            {data?.contentMode
              ? CONTENT_MODE_DISPLAY[data.contentMode]
              : PLACEHOLDER}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ContentInfoCard;
