import type React from 'react';

import { PLACEHOLDER } from '@/constants';
import type { PublishStatusCode } from '@/services/content/types';
import { PUBLISH_STATUS_CODE } from '@/services/content/types';

import styles from './style.module.css';

const PUBLISH_STATUS_CONFIG = {
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

const ACCOUNT_STATUS_CONFIG = {
  ONLINE: {
    label: '在线',
    bg: '#F6FFED',
    color: '#52C41A',
  },
  STOPPED: {
    label: '已停止',
    bg: '#F5F5F5',
    color: '#999',
  },
  INVALID: {
    label: '失效',
    bg: '#FFF2F0',
    color: '#F24236',
  },
} as const;

type StatusType =
  | PublishStatusCode
  | keyof typeof ACCOUNT_STATUS_CONFIG
  | typeof PLACEHOLDER;

const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  if (status === PLACEHOLDER) {
    return (
      <span
        className={styles.badge}
        style={{ backgroundColor: '#F5F5F5', color: '#999' }}
      >
        {PLACEHOLDER}
      </span>
    );
  }

  const publishConfig =
    PUBLISH_STATUS_CONFIG[status as keyof typeof PUBLISH_STATUS_CONFIG];
  const accountConfig =
    ACCOUNT_STATUS_CONFIG[status as keyof typeof ACCOUNT_STATUS_CONFIG];

  if (publishConfig) {
    return (
      <span
        className={styles.badge}
        style={{
          backgroundColor: publishConfig.bg,
          color: publishConfig.color,
        }}
      >
        {publishConfig.label}
      </span>
    );
  }

  if (accountConfig) {
    return (
      <span
        className={styles.badge}
        style={{
          backgroundColor: accountConfig.bg,
          color: accountConfig.color,
        }}
      >
        <span
          className={styles.dot}
          style={{ backgroundColor: accountConfig.color }}
        />
        {accountConfig.label}
      </span>
    );
  }

  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: '#F5F5F5', color: '#999' }}
    >
      {PLACEHOLDER}
    </span>
  );
};

export default StatusBadge;
