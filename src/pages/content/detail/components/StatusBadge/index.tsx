import type React from 'react';
import type { PublishStatusCode } from '@/services/content/types';
import { PUBLISH_STATUS_CODE } from '@/services/content/types';

import styles from './style.module.css';

const STATUS_CONFIG = {
  [PUBLISH_STATUS_CODE.UNDER_REVIEW]: {
    label: '审核中',
    bg: '#FFF9E6',
    color: '#FAAB26',
  },
  [PUBLISH_STATUS_CODE.PUBLISH_SUCCESS]: {
    label: '发布成功',
    bg: '#F6FFED',
    color: '#21B859',
  },
  [PUBLISH_STATUS_CODE.PUBLISH_FAILED]: {
    label: '发布失败',
    bg: '#FFF2F0',
    color: '#F24236',
  },
} as const;

const StatusBadge: React.FC<{
  status?: PublishStatusCode | null;
}> = ({ status }) => {
  if (!status) {
    return (
      <span
        className={styles.badge}
        style={{ backgroundColor: '#F5F5F5', color: '#999' }}
      >
        未知
      </span>
    );
  }

  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG[PUBLISH_STATUS_CODE.UNDER_REVIEW];

  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
