import type React from 'react';
import styles from './style.module.css';

export interface QueueFullModalProps {
  visible: boolean;
  queueCount?: number;
  onClose?: () => void;
}

const HourglassIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect x="12" y="8" width="40" height="48" rx="4" fill="#FFF2F0" />
    <path
      d="M20 16H44V24L32 32L44 40V48H20V40L32 32L20 24V16Z"
      fill="#FAAD14"
    />
  </svg>
);

export const QueueFullModal: React.FC<QueueFullModalProps> = ({
  visible,
  queueCount = 0,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>生成队列已满</span>
          <span className={styles.closeBtn} onClick={onClose}>
            ✕
          </span>
        </div>
        <div className={styles.body}>
          <div className={styles.icon}>
            <HourglassIcon />
          </div>
          <div className={styles.message}>
            当前有 {queueCount} 个任务正在生成中，请稍后再试
          </div>
          <div className={styles.hint}>
            您可以在「我的作品」中查看已完成的任务
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.okBtn} onClick={onClose}>
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueFullModal;
