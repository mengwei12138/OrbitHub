import type React from 'react';
import styles from './style.module.css';
import type { StatusBadgeProps } from './types';

const STATUS_CONFIG = {
  online: {
    label: '在线',
    bg: 'var(--figma-color-success-light)',
    color: 'var(--figma-color-success)',
  },
  stopped: {
    label: '已停止',
    bg: 'var(--figma-color-gray-2)',
    color: 'var(--figma-color-gray-8)',
  },
} as const;

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.stopped;

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
