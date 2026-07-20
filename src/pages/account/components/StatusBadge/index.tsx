import type React from 'react';
import { ACCOUNT_RUN_STATUS } from '@/services/account/types';
import styles from './style.module.css';
import type { StatusBadgeProps } from './types';

const STATUS_CONFIG = {
  [ACCOUNT_RUN_STATUS.ONLINE]: {
    label: '在线',
    bg: 'var(--figma-color-success-light)',
    color: 'var(--figma-color-success)',
  },
  [ACCOUNT_RUN_STATUS.STOPPED]: {
    label: '已停止',
    bg: 'var(--figma-color-gray-2)',
    color: 'var(--figma-color-gray-8)',
  },
  [ACCOUNT_RUN_STATUS.INVALID]: {
    label: '失效',
    bg: 'var(--figma-color-error-light)',
    color: 'var(--figma-color-error)',
  },
} as const;

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG[ACCOUNT_RUN_STATUS.STOPPED];

  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <span className={styles.dot} style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
